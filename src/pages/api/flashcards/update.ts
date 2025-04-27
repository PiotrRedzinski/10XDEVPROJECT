import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase.server";

export const prerender = false;

// Create separate schema for validation of input and transformed data
const inputSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID").optional(),
  front: z.string(),
  back: z.string(),
  status: z.enum(["pending", "accepted-original", "accepted-edited", "rejected"]).optional().default("pending"),
  source: z.enum(["ai", "self"]).optional(),
  isAIGenerated: z.boolean().optional(),
});

const updateFlashcardSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  front: z.string(),
  back: z.string(),
  status: z.enum(["pending", "accepted-original", "accepted-edited", "rejected"]),
  source: z.enum(["ai", "self"]),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServer(cookies);
    console.log("Flashcard update API called");

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

    // First validate the input with more permissive schema
    const validatedInput = inputSchema.parse(body);
    console.log("Validated input:", validatedInput);

    // Prepare complete data
    const completeData = {
      ...validatedInput,
      id: validatedInput.id || crypto.randomUUID(),
      source: validatedInput.isAIGenerated === true ? "ai" : validatedInput.source || "self",
      status: validatedInput.status || "pending",
    };
    console.log("Complete data:", completeData);

    // Now validate with strict schema
    const validatedData = updateFlashcardSchema.parse(completeData);
    console.log("Validated data for update:", validatedData);

    // Update flashcard
    const { data: updateData, error } = await supabase
      .from("flashcards")
      .update({
        front: validatedData.front,
        back: validatedData.back,
        source: validatedData.source,
        status: validatedData.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.id)
      .eq("user_id", session.user.id);

    console.log("Update result:", { data: updateData, error });

    if (error) {
      console.error("Error updating flashcard:", error);
      return new Response(JSON.stringify({ message: "Failed to update flashcard", error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the updated flashcard to verify status
    const { data: updatedFlashcard, error: getError } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", validatedData.id)
      .eq("user_id", session.user.id)
      .single();

    console.log("Verification fetch:", { flashcard: updatedFlashcard, error: getError });

    return new Response(
      JSON.stringify({
        message: "Flashcard updated successfully",
        flashcard: updatedFlashcard,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in flashcard update endpoint:", error);
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
