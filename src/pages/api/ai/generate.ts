import type { APIRoute } from "astro";
import { generateRequestSchema } from "@/lib/validation/generate.schema";
import { AIGenerationService } from "@/lib/services/ai-generation.service";
import { RateLimiterService } from "@/lib/services/rate-limiter.service";
import { LoggingService } from "@/lib/services/logging.service";
import { validateEnv } from "@/lib/config/env.validation";

// Prevent static generation of this endpoint
export const prerender = false;

// Create service instances lazily
let logger: LoggingService;
let rateLimiter: RateLimiterService;
let generationService: AIGenerationService;

export const POST: APIRoute = async ({ request, locals }) => {
  // Validate environment variables only on first request
  validateEnv();

  // Initialize services lazily
  if (!logger) logger = new LoggingService(locals.supabase);
  if (!rateLimiter) rateLimiter = new RateLimiterService(locals.supabase);
  if (!generationService) generationService = new AIGenerationService(locals.supabase);

  try {
    // Ensure user is authenticated
    const { supabase } = locals;
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      await logger.warn("Unauthorized access attempt", { ip: request.headers.get("x-forwarded-for") });
      return new Response(
        JSON.stringify({
          error: "Unauthorized - valid authentication required",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get rate limit info
    const remaining = await rateLimiter.getRemainingRequests(session.user.id);
    const headers = {
      "Content-Type": "application/json",
      "X-RateLimit-Remaining": remaining.toString(),
    };

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validationResult = generateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      await logger.warn("Invalid request data", {
        userId: session.user.id,
        errors: validationResult.error.errors,
      });
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers,
        }
      );
    }

    // Extract validated data
    const { text } = validationResult.data;

    // Generate flashcards
    const result = await generationService.generateFlashcards(text, session.user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error processing AI generation request:", error);

    // Handle environment validation errors specifically
    if (error instanceof Error && error.message.includes("Environment validation failed")) {
      await logger.error("Environment validation failed", {
        error: error.message,
      });
      return new Response(
        JSON.stringify({
          error: "Service configuration error",
          message: "The service is not properly configured. Please contact support.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle rate limit errors
    if (error instanceof Error && error.message.includes("Rate limit exceeded")) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: error.message,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
