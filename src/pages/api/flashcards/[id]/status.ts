import type { APIRoute } from "astro";
import { flashcardsService } from "@/lib/services/flashcards.service";
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
 * PATCH /api/flashcards/:id/status
 *
 * Updates the status of a flashcard (accept or reject).
 *
 * URL Parameters:
 * - id: The UUID of the flashcard to update
 *
 * Request Body:
 * - action: Must be either "accept" or "reject"
 *
 * Response:
 * - 200 OK: Returns the updated flashcard
 * - 400 Bad Request: Invalid flashcard ID format or invalid action
 * - 401 Unauthorized: User not authenticated
 * - 404 Not Found: Flashcard not found or doesn't belong to the user
 * - 500 Internal Server Error: Unexpected error
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
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
      console.error("Error in PATCH /api/flashcards/:id/status:", error);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate body has the required 'action' field
    if (!body.action || !["accept", "reject"].includes(body.action)) {
      return new Response(JSON.stringify({ error: "Action must be either 'accept' or 'reject'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update flashcard status
    try {
      const flashcard = await flashcardsService.updateFlashcardStatus(
        supabase,
        user.id,
        flashcardId,
        { action: body.action },
        logger
      );

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
        } else if (error.message.includes("Invalid status update command")) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error in PATCH /api/flashcards/:id/status:", error);

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
