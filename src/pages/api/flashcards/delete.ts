import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase.server";

export const prerender = false;

// Validation schema for input
const deleteFlashcardSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServer(cookies);
    console.log("Flashcard delete API called");

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.log("Unauthorized: No session found");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("Request body:", body);

    const validationResult = deleteFlashcardSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          message: "Invalid input",
          errors: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;
    console.log("Validated data:", { id });

    // Delete the flashcard
    const { error } = await supabase.from("flashcards").delete().eq("id", id).eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting flashcard:", error);
      return new Response(
        JSON.stringify({
          message: "Failed to delete flashcard",
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Flashcard deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in flashcard delete endpoint:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
