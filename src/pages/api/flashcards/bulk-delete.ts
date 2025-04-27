import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase.server";

export const prerender = false;

// Create schema for validation
const bulkDeleteSchema = z.object({
  flashcardIds: z.array(z.string().uuid("ID must be a valid UUID")),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServer(cookies);
    console.log("Bulk delete flashcards API called");

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

    const validationResult = bulkDeleteSchema.safeParse(body);
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

    const { flashcardIds } = validationResult.data;
    console.log("Validated data:", { flashcardIds });

    if (flashcardIds.length === 0) {
      return new Response(JSON.stringify({ message: "No flashcards to delete" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Attempting to delete ${flashcardIds.length} flashcards...`);

    // Delete the flashcards
    const { data, error } = await supabase
      .from("flashcards")
      .delete()
      .in("id", flashcardIds)
      .eq("user_id", session.user.id);

    console.log("Deletion result:", { data, error });

    if (error) {
      console.error("Error bulk deleting flashcards:", error);
      return new Response(
        JSON.stringify({
          message: "Failed to delete flashcards",
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
        message: "Flashcards deleted successfully",
        count: flashcardIds.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in flashcard bulk delete endpoint:", error);
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
