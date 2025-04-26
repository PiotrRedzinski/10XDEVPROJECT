import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlashcardDTO } from "@/types";
import { createHash } from "crypto";

interface CachedGeneration {
  flashcards: FlashcardDTO[];
  generation_id: string;
  created_at: string;
}

export class CacheService {
  private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Generates a unique hash for the input text
   */
  private generateHash(text: string): string {
    return createHash("sha256").update(text).digest("hex");
  }

  /**
   * Checks if there's a cached generation for the given text
   */
  async getCachedGeneration(text: string, userId: string): Promise<CachedGeneration | null> {
    const textHash = this.generateHash(text);
    const cacheExpiry = new Date(Date.now() - this.CACHE_DURATION_MS).toISOString();

    // Check for existing generation with the same hash
    const { data: session, error: sessionError } = await this.supabase
      .from("ai_generation_sessions")
      .select("id, created_at")
      .eq("text_hash", textHash)
      .eq("user_id", userId)
      .gte("created_at", cacheExpiry)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      return null;
    }

    // Get flashcards for the cached session
    const { data: flashcards, error: flashcardsError } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("generation_id", session.id)
      .order("created_at", { ascending: true });

    if (flashcardsError || !flashcards.length) {
      return null;
    }

    return {
      flashcards,
      generation_id: session.id,
      created_at: session.created_at,
    };
  }

  /**
   * Saves the text hash in the generation session for future cache lookups
   */
  async saveTextHash(text: string, sessionId: string): Promise<void> {
    const textHash = this.generateHash(text);
    const { error } = await this.supabase
      .from("ai_generation_sessions")
      .update({ text_hash: textHash })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to save text hash:", error);
    }
  }
}
