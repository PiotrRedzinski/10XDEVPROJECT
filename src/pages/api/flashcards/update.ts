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

    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate request body
    const body = await request.json();

    // First validate the input with more permissive schema
    const validatedInput = inputSchema.parse(body);

    // Prepare complete data
    const completeData = {
      ...validatedInput,
      id: validatedInput.id || crypto.randomUUID(),
      source: validatedInput.isAIGenerated ? "ai" : validatedInput.source || "self",
      status: validatedInput.status || "pending",
    };

    // Now validate with strict schema
    const validatedData = updateFlashcardSchema.parse(completeData);

    // Update flashcard
    const { error } = await supabase
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

    if (error) {
      console.error("Error updating flashcard:", error);
      return new Response(JSON.stringify({ message: "Failed to update flashcard" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Flashcard updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in flashcard update endpoint:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
