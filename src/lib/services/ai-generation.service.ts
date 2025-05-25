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

class AIGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AIGenerationError";
  }
}

interface APIConfigValidation extends Record<string, unknown> {
  isValid: boolean;
  apiUrl: string;
  apiKeyValid: boolean;
  error?: string;
}

export class AIGenerationService {
  private _rateLimiter?: RateLimiterService;
  private _cache?: CacheService;
  private _logger?: LoggingService;

  constructor(private readonly supabase: SupabaseClient) {}

  private get rateLimiter(): RateLimiterService {
    if (!this._rateLimiter) {
      this._rateLimiter = new RateLimiterService(this.supabase);
    }
    return this._rateLimiter;
  }

  private get cache(): CacheService {
    if (!this._cache) {
      this._cache = new CacheService(this.supabase);
    }
    return this._cache;
  }

  private get logger(): LoggingService {
    if (!this._logger) {
      this._logger = new LoggingService(this.supabase);
    }
    return this._logger;
  }

  /**
   * Validates the OpenAI API configuration
   * @returns Validation result
   */
  private async validateAPIConfig(): Promise<APIConfigValidation> {
    const apiKey = import.meta.env.OPENAI_API_KEY;
    const apiUrl = import.meta.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      return {
        isValid: false,
        apiUrl,
        apiKeyValid: false,
        error: "OpenAI API key not configured",
      };
    }

    try {
      // Test API key with a minimal request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.OPENAI.MODEL,
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5,
        }),
      });

      // Check if we got HTML instead of JSON
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        await this.logger.error("API URL returned HTML instead of JSON", {
          apiUrl,
          status: response.status,
          contentType,
        });
        return {
          isValid: false,
          apiUrl,
          apiKeyValid: false,
          error: `Invalid API URL: Endpoint returned HTML instead of JSON. Please check if the API URL (${apiUrl}) is correct.`,
        };
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        await this.logger.error("Failed to parse API response", {
          apiUrl,
          status: response.status,
          contentType,
          error: parseError instanceof Error ? parseError.message : "Unknown error",
        });
        return {
          isValid: false,
          apiUrl,
          apiKeyValid: false,
          error: `Failed to parse API response: ${parseError instanceof Error ? parseError.message : "Unknown error"}. Please check if the API URL (${apiUrl}) is correct.`,
        };
      }

      if (!response.ok) {
        await this.logger.error("API key validation failed", {
          apiUrl,
          status: response.status,
          error: responseData.error,
        });
        return {
          isValid: false,
          apiUrl,
          apiKeyValid: false,
          error: `API key validation failed: ${responseData.error?.message || "Unknown error"}`,
        };
      }

      await this.logger.info("API configuration validated successfully", {
        apiUrl,
        model: AI_CONFIG.OPENAI.MODEL,
      });

      return {
        isValid: true,
        apiUrl,
        apiKeyValid: true,
      };
    } catch (error) {
      await this.logger.error("API validation failed", {
        apiUrl,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          isValid: false,
          apiUrl,
          apiKeyValid: false,
          error: `Failed to connect to API: ${error.message}. Please check your internet connection and if the API URL (${apiUrl}) is accessible.`,
        };
      }

      return {
        isValid: false,
        apiUrl,
        apiKeyValid: false,
        error: `API validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
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
      // Validate API configuration first
      const apiConfig = await this.validateAPIConfig();
      if (!apiConfig.isValid) {
        throw new AIGenerationError("OpenAI API configuration is invalid", "INVALID_API_CONFIG", apiConfig);
      }

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
        throw new AIGenerationError(
          `Rate limit exceeded. Try again later. Remaining requests: ${remaining}`,
          "RATE_LIMIT_EXCEEDED",
          { remaining }
        );
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
      // Enhanced error logging
      const errorDetails = {
        userId,
        errorType: error instanceof AIGenerationError ? error.code : "UNKNOWN_ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        details: error instanceof AIGenerationError ? error.details : undefined,
      };

      // Log error details
      await this.logger.error("Generation error", errorDetails);

      const { error: logError } = await this.supabase.from("generation_error_log").insert({
        error_message: errorDetails.errorMessage,
        error_stack: errorDetails.errorStack,
        error_type: errorDetails.errorType,
        error_details: errorDetails.details,
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
    const apiUrl = import.meta.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      throw new AIGenerationError("OpenAI API key not configured", "MISSING_API_KEY");
    }

    try {
      const response = await fetch(apiUrl, {
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
          temperature: AI_CONFIG.OPENAI.TEMPERATURE,
          max_tokens: AI_CONFIG.OPENAI.MAX_TOKENS,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AIGenerationError(
          `OpenAI API request failed: ${error.error?.message || "Unknown error"}`,
          "API_REQUEST_FAILED",
          {
            status: response.status,
            statusText: response.statusText,
            error: error.error,
          }
        );
      }

      const result: OpenAIResponse = await response.json();
      return this.parseAIResponse(result);
    } catch (error) {
      if (error instanceof AIGenerationError) {
        throw error;
      }
      throw new AIGenerationError(
        `Failed to call OpenAI API: ${error instanceof Error ? error.message : "Unknown error"}`,
        "API_CALL_FAILED",
        { originalError: error }
      );
    }
  }

  /**
   * Parses the OpenAI response into flashcards
   * @param result The raw OpenAI response
   * @returns Array of parsed flashcards
   */
  private async parseAIResponse(result: OpenAIResponse): Promise<FlashcardDTO[]> {
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
