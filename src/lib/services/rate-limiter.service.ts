import type { SupabaseClient } from "@supabase/supabase-js";
import { AI_CONFIG } from "../config/ai.config";

export class RateLimiterService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Checks if the user has exceeded their rate limit for AI generations
   * @param userId The ID of the user to check
   * @returns True if the user can make another request, false if they've hit the limit
   */
  async canMakeRequest(userId: string): Promise<boolean> {
    const windowStart = new Date(Date.now() - AI_CONFIG.RATE_LIMIT.WINDOW_MS);

    // Count generations in the current window
    const { count, error } = await this.supabase
      .from("ai_generation_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", windowStart.toISOString());

    if (error) {
      console.error("Error checking rate limit:", error);
      return false;
    }

    return (count ?? 0) < AI_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_HOUR;
  }

  /**
   * Gets the number of remaining requests allowed in the current window
   * @param userId The ID of the user to check
   * @returns The number of remaining requests allowed
   */
  async getRemainingRequests(userId: string): Promise<number> {
    const windowStart = new Date(Date.now() - AI_CONFIG.RATE_LIMIT.WINDOW_MS);

    const { count, error } = await this.supabase
      .from("ai_generation_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", windowStart.toISOString());

    if (error) {
      console.error("Error checking rate limit:", error);
      return 0;
    }

    return Math.max(0, AI_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_HOUR - (count ?? 0));
  }
}
