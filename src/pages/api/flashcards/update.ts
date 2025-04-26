import type { APIRoute } from "astro";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase.server";

export const prerender = false;

const updateFlashcardSchema = z.object({
  id: z.string(),
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
    const validatedData = updateFlashcardSchema.parse(body);

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
