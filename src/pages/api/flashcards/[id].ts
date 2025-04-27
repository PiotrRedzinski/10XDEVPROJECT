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
    user: { id: string; [key: string]: any };
    supabase: SupabaseClient<Database>;
  }
}

/**
 * GET /api/flashcards/:id
 *
 * Gets a single flashcard by ID.
 *
 * URL Parameters:
 * - id: The UUID of the flashcard to retrieve
 *
 * Response:
 * - 200 OK: Returns the flashcard data
 * - 400 Bad Request: Invalid flashcard ID format
 * - 401 Unauthorized: User not authenticated
 * - 404 Not Found: Flashcard not found or doesn't belong to the user
 * - 500 Internal Server Error: Unexpected error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Ensure user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the flashcard ID from params
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the SupabaseClient from locals (added by middleware)
    const supabase = locals.supabase;
    const logger = new LoggingService(supabase);

    // Get flashcard by ID
    try {
      const flashcard = await flashcardsService.getFlashcardById(supabase, user.id, flashcardId, logger);

      // Return response with flashcard data
      return new Response(JSON.stringify(flashcard), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
      if (error instanceof Error && error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error in GET /api/flashcards/:id:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("Invalid flashcard ID format")) {
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
 * PUT /api/flashcards/:id
 *
 * Updates an existing flashcard.
 *
 * URL Parameters:
 * - id: The UUID of the flashcard to update
 *
 * Request Body:
 * - front: New front side text (maximum 220 characters)
 * - back: New back side text (maximum 500 characters)
 *
 * Response:
 * - 200 OK: Returns the updated flashcard
 * - 400 Bad Request: Invalid flashcard ID format or invalid request body
 * - 401 Unauthorized: User not authenticated
 * - 404 Not Found: Flashcard not found or doesn't belong to the user
 * - 500 Internal Server Error: Unexpected error
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // Ensure user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the flashcard ID from params
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
        status: 400,
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
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update flashcard
    try {
      const flashcard = await flashcardsService.updateFlashcard(supabase, user.id, flashcardId, body, logger);

      // Return updated flashcard
      return new Response(JSON.stringify(flashcard), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Flashcard not found") {
          return new Response(JSON.stringify({ error: "Flashcard not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        } else if (error.message.includes("Invalid flashcard data")) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error in PUT /api/flashcards/:id:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("Invalid flashcard ID format")) {
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
 * DELETE /api/flashcards/:id
 *
 * Deletes a flashcard.
 *
 * URL Parameters:
 * - id: The UUID of the flashcard to delete
 *
 * Response:
 * - 200 OK: Flashcard successfully deleted
 * - 400 Bad Request: Invalid flashcard ID format
 * - 401 Unauthorized: User not authenticated
 * - 404 Not Found: Flashcard not found or doesn't belong to the user
 * - 500 Internal Server Error: Unexpected error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Ensure user is authenticated
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the flashcard ID from params
    const flashcardId = params.id;
    if (!flashcardId) {
      return new Response(JSON.stringify({ error: "Flashcard ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the SupabaseClient from locals (added by middleware)
    const supabase = locals.supabase;
    const logger = new LoggingService(supabase);

    // Delete flashcard
    try {
      await flashcardsService.deleteFlashcard(supabase, user.id, flashcardId, logger);

      // Return success message
      return new Response(JSON.stringify({ message: "Flashcard deleted successfully." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Flashcard not found") {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error in DELETE /api/flashcards/:id:", error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes("Invalid flashcard ID format")) {
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
