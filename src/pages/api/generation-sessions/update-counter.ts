import type { APIRoute } from "astro";
import { createSupabaseServer } from "@/lib/supabase.server";
import { z } from "zod";

// Disable static generation for API routes
export const prerender = false;

// Validation schema for input
const updateCounterSchema = z.object({
  generationId: z.string().uuid(),
  counterType: z.enum(["generated", "accepted_original", "accepted_edited", "rejected"]),
});

// Type for session data
interface CounterFields {
  generated: number;
  accepted_original: number;
  accepted_edited: number;
  rejected: number;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log("Generation session update counter API called");

    // Parse and validate the input
    const body = await request.json();
    console.log("Request body:", body);

    const validationResult = updateCounterSchema.safeParse(body);

    if (!validationResult.success) {
      console.log("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          message: "Invalid input",
          errors: validationResult.error.errors,
        }),
        { status: 400 }
      );
    }

    const { generationId, counterType } = validationResult.data;
    console.log("Validated data:", { generationId, counterType });

    // Initialize Supabase client
    const supabase = createSupabaseServer(cookies);

    // Get user information
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("Unauthorized: No user found");
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    console.log("User authenticated:", user.id);

    // First, get the current value of the counter
    const { data: sessionData, error: sessionError } = await supabase
      .from("ai_generation_sessions")
      .select("generated, accepted_original, accepted_edited, rejected")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single<CounterFields>();

    console.log("Session data lookup result:", { sessionData, error: sessionError });

    if (sessionError) {
      console.error("Error getting session data:", sessionError);
      return new Response(
        JSON.stringify({
          message: "Failed to retrieve session data",
          error: sessionError.message,
        }),
        { status: 500 }
      );
    }

    // Increment the counter in the generation session
    const currentValue = sessionData ? sessionData[counterType] || 0 : 0;
    const newValue = currentValue + 1;
    console.log(`Updating counter: ${counterType} from ${currentValue} to ${newValue}`);

    // Prepare the update data with explicit fields instead of dynamic property
    let updateData = {};
    if (counterType === "accepted_original") {
      updateData = { accepted_original: newValue };
    } else if (counterType === "accepted_edited") {
      updateData = { accepted_edited: newValue };
    } else if (counterType === "rejected") {
      updateData = { rejected: newValue };
    } else if (counterType === "generated") {
      updateData = { generated: newValue };
    }

    console.log("Update data:", updateData);

    const { data: updateResult, error: updateError } = await supabase
      .from("ai_generation_sessions")
      .update(updateData)
      .eq("id", generationId)
      .eq("user_id", user.id);

    console.log("Update result:", { data: updateResult, error: updateError });

    if (updateError) {
      console.error("Error updating counter:", updateError);
      return new Response(
        JSON.stringify({
          message: "Failed to update counter",
          error: updateError.message,
        }),
        { status: 500 }
      );
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from("ai_generation_sessions")
      .select("*")
      .eq("id", generationId)
      .eq("user_id", user.id)
      .single();

    console.log("Verification fetch:", { sessionData: verifyData, error: verifyError });

    return new Response(
      JSON.stringify({
        success: true,
        updated: verifyData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in update-counter endpoint:", error);
    return new Response(
      JSON.stringify({
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500 }
    );
  }
};
