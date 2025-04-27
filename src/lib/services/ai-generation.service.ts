import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIGenerateResponseDTO, AIGenerationSessionMetricsDTO, FlashcardDTO } from "@/types";
import { AI_CONFIG } from "../config/ai.config";
import { RateLimiterService } from "./rate-limiter.service";
import { CacheService } from "./cache.service";
import { LoggingService } from "./logging.service";

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
    finish_reason: string;
  }[];
}

export class AIGenerationService {
  private rateLimiter: RateLimiterService;
  private cache: CacheService;
  private logger: LoggingService;

  constructor(private readonly supabase: SupabaseClient) {
    this.rateLimiter = new RateLimiterService(supabase);
    this.cache = new CacheService(supabase);
    this.logger = new LoggingService(supabase);
  }

  /**
   * Generates flashcards from the provided text using AI and saves them to the database.
   * @param text The input text to generate flashcards from
   * @param userId The ID of the user requesting the generation
   * @returns Generated flashcards and session metrics
   */
  async generateFlashcards(text: string, userId: string): Promise<AIGenerateResponseDTO> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cached = await this.cache.getCachedGeneration(text, userId);
      if (cached) {
        await this.logger.info("Using cached generation", { userId, generationId: cached.generation_id });
        return {
          flashcards: cached.flashcards,
          sessionMetrics: {
            generation_duration: 0,
            generated: cached.flashcards.length,
            accepted_original: 0,
            accepted_edited: 0,
            rejected: 0,
          },
        };
      }

      // Check rate limit
      const canProceed = await this.rateLimiter.canMakeRequest(userId);
      if (!canProceed) {
        const remaining = await this.rateLimiter.getRemainingRequests(userId);
        await this.logger.warn("Rate limit exceeded", { userId, remaining });
        throw new Error(`Rate limit exceeded. Try again later. Remaining requests: ${remaining}`);
      }

      // Create generation session
      const { data: session, error: sessionError } = await this.supabase
        .from("ai_generation_sessions")
        .insert({
          user_id: userId,
          input_text_length: text.length,
          generation_duration: 0,
          generated: 0,
          accepted_original: 0,
          accepted_edited: 0,
          rejected: 0,
        })
        .select()
        .single();

      if (sessionError) {
        await this.logger.error("Failed to create generation session", { userId, error: sessionError });
        throw new Error(`Failed to create generation session: ${sessionError.message}`);
      }

      // Generate flashcards using AI
      await this.logger.info("Starting AI generation", { userId, sessionId: session.id });
      const generatedFlashcards = await this.callAIService(text);

      // Save text hash for caching
      await this.cache.saveTextHash(text, session.id);

      // Insert flashcards in bulk
      const { data: insertedFlashcards, error: insertError } = await this.supabase
        .from("flashcards")
        .insert(
          generatedFlashcards.map((card) => ({
            front: card.front,
            back: card.back,
            generation_id: session.id,
            user_id: userId,
            status: "pending",
            source: "ai",
          }))
        )
        .select();

      if (insertError) {
        await this.logger.error("Failed to insert flashcards", { userId, sessionId: session.id, error: insertError });
        throw new Error(`Failed to insert flashcards: ${insertError.message}`);
      }

      // Make sure we have the flashcards with their IDs
      if (!insertedFlashcards || insertedFlashcards.length === 0) {
        await this.logger.error("Flashcards were inserted but not returned", { userId, sessionId: session.id });
        throw new Error("Flashcards were inserted but not returned by the database");
      }

      // Calculate metrics
      const generationDuration = Math.round(Date.now() - startTime); // Duration in milliseconds
      const metrics: AIGenerationSessionMetricsDTO = {
        generation_duration: generationDuration,
        generated: generatedFlashcards.length,
        accepted_original: 0,
        accepted_edited: 0,
        rejected: 0,
      };

      // Update session with final metrics
      const { error: updateError } = await this.supabase
        .from("ai_generation_sessions")
        .update({
          generation_duration: metrics.generation_duration,
          generated: metrics.generated,
        })
        .eq("id", session.id);

      if (updateError) {
        await this.logger.error("Failed to update generation session", {
          userId,
          sessionId: session.id,
          error: updateError,
        });
        throw new Error(`Failed to update generation session: ${updateError.message}`);
      }

      await this.logger.info("Generation completed successfully", {
        userId,
        sessionId: session.id,
        metrics,
      });

      return {
        flashcards: insertedFlashcards,
        sessionMetrics: metrics,
      };
    } catch (error) {
      // Log error details
      await this.logger.error("Generation error", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      const { error: logError } = await this.supabase.from("generation_error_log").insert({
        error_message: error instanceof Error ? error.message : "Unknown error",
        error_stack: error instanceof Error ? error.stack : null,
        input_text_length: text.length,
      });

      if (logError) {
        console.error("Failed to log generation error:", logError);
      }

      throw error;
    }
  }

  /**
   * Calls the OpenAI service to generate flashcards from the input text
   * @param text The input text to generate flashcards from
   * @returns Array of generated flashcards
   */
  private async callAIService(text: string): Promise<FlashcardDTO[]> {
    const apiKey = import.meta.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch(AI_CONFIG.OPENAI.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.OPENAI.MODEL,
        messages: [
          {
            role: "system",
            content: AI_CONFIG.GENERATION.SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: text,
          },
        ],
        max_tokens: AI_CONFIG.OPENAI.MAX_TOKENS,
        temperature: AI_CONFIG.OPENAI.TEMPERATURE,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.statusText}${errorData.error?.message ? ` - ${errorData.error.message}` : ""}`
      );
    }

    const result: OpenAIResponse = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    try {
      // Log the raw response for debugging
      await this.logger.info("Raw AI response", { content });

      // Try to parse the response as JSON
      let flashcards: FlashcardDTO[];
      try {
        flashcards = JSON.parse(content);
      } catch (parseError) {
        await this.logger.error("JSON parse error", {
          error: parseError instanceof Error ? parseError.message : "Unknown error",
          content,
        });
        throw new Error("Failed to parse AI response as JSON. The response must be a valid JSON array.");
      }

      // Validate the parsed response
      if (!Array.isArray(flashcards)) {
        await this.logger.error("Invalid response format", {
          error: "Response is not an array",
          content,
        });
        throw new Error("AI response is not an array of flashcards");
      }

      // Validate each flashcard
      const invalidCards = flashcards.filter(
        (card) => !card.front || !card.back || typeof card.front !== "string" || typeof card.back !== "string"
      );

      if (invalidCards.length > 0) {
        await this.logger.error("Invalid flashcard format", {
          error: "Some flashcards are missing front/back or have invalid types",
          invalidCards,
        });
        throw new Error("Some flashcards have invalid format. Each flashcard must have 'front' and 'back' strings.");
      }

      return flashcards.slice(0, AI_CONFIG.GENERATION.MAX_FLASHCARDS);
    } catch (error) {
      // Log the error with context
      await this.logger.error("Flashcard generation error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        rawResponse: content,
      });

      throw error;
    }
  }
}
