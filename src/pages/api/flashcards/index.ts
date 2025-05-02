import type { APIRoute } from "astro";
import { flashcardsService } from "@/lib/services/flashcards.service";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { LoggingService } from "@/lib/services/logging.service";

export const prerender = false;

// Extend Astro's APIContext.locals to include our custom properties
declare global {
  interface Locals {
    user: { id: string; [key: string]: unknown };
    supabase: SupabaseClient<Database>;
  }
}

/**
 * GET /api/flashcards
 *
 * Gets a paginated list of the user's flashcards with optional filtering and sorting.
 *
 * Query Parameters:
 * - page: The page number (default: 1)
 * - limit: Number of flashcards per page (default: 10)
 * - status: Filter by flashcard status (e.g., pending, accepted-original, accepted-edited, rejected)
 * - sortBy: Field to sort by (default: created_at)
 * - order: Sort order (asc or desc, default: desc)
 *
 * Response:
 * - 200 OK: Returns flashcards and pagination info
 * - 400 Bad Request: Invalid query parameters
 * - 401 Unauthorized: User not authenticated
 * - 500 Internal Server Error: Unexpected error
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the SupabaseClient from locals (added by middleware)
    const supabase = locals.supabase;
    const logger = new LoggingService(supabase);

    // Parse query parameters from URL
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy");
    const order = url.searchParams.get("order");

    // Get flashcards with pagination, filtering and sorting
    const result = await flashcardsService.getFlashcards(
      supabase,
      user.id,
      {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        status: status || undefined,
        sortBy: sortBy || undefined,
        order: order as "asc" | "desc" | undefined,
      },
      logger
    );

    // Return response with flashcards and pagination data
    return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in GET /api/flashcards:", error);

    // Handle validation errors
    if (
      error instanceof z.ZodError ||
      (error instanceof Error && error.message.includes("Invalid pagination parameters"))
    ) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle all other errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * POST /api/flashcards
 *
 * Creates a new flashcard.
 *
 * Request Body:
 * - front: Front side text (maximum 220 characters)
 * - back: Back side text (maximum 500 characters)
 * - generation_id: Optional UUID linking to an AI generation session
 *
 * Response:
 * - 201 Created: Returns the created flashcard
 * - 400 Bad Request: Invalid flashcard data
 * - 401 Unauthorized: User not authenticated
 * - 500 Internal Server Error: Unexpected error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Ensure user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the SupabaseClient from locals (added by middleware)
    const supabase = locals.supabase;
    const logger = new LoggingService(supabase);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Error in POST /api/flashcards:", error);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create flashcard
    try {
      const flashcard = await flashcardsService.createFlashcard(supabase, user.id, body, logger);

      // Return created flashcard with 201 status
      return new Response(JSON.stringify(flashcard), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid flashcard data")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error in POST /api/flashcards:", error);

    // Handle all other errors
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
