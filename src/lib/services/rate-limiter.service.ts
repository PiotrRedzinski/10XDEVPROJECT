import type { SupabaseClient } from "@supabase/supabase-js";

type RateLimitCache = Record<
  string,
  {
    count: number;
    resetTime: number;
  }
>;

export class RateLimiterService {
  private static readonly RATE_LIMIT = 10; // requests per window
  private static readonly WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
  private static cache: RateLimitCache = {};

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Checks if the user has exceeded their rate limit for AI generations
   * @param userId The ID of the user to check
   * @returns True if the user can make another request, false if they've hit the limit
   */
  async canMakeRequest(userId: string): Promise<boolean> {
    const now = Date.now();
    const cached = RateLimiterService.cache[userId];

    // Check cache first
    if (cached) {
      if (now < cached.resetTime) {
        return cached.count < RateLimiterService.RATE_LIMIT;
      }
      // Cache expired, remove it
      delete RateLimiterService.cache[userId];
    }

    // Get count from database
    const startOfWindow = new Date(now - RateLimiterService.WINDOW_MS).toISOString();
    const { count } = await this.supabase
      .from("ai_generation_sessions")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", startOfWindow)
      .single();

    // Cache the result
    RateLimiterService.cache[userId] = {
      count: count || 0,
      resetTime: now + RateLimiterService.WINDOW_MS,
    };

    return (count || 0) < RateLimiterService.RATE_LIMIT;
  }

  /**
   * Gets the number of remaining requests allowed in the current window
   * @param userId The ID of the user to check
   * @returns The number of remaining requests allowed
   */
  async getRemainingRequests(userId: string): Promise<number> {
    const now = Date.now();
    const cached = RateLimiterService.cache[userId];

    // Check cache first
    if (cached && now < cached.resetTime) {
      return Math.max(0, RateLimiterService.RATE_LIMIT - cached.count);
    }

    // Get count from database
    const startOfWindow = new Date(now - RateLimiterService.WINDOW_MS).toISOString();
    const { count } = await this.supabase
      .from("ai_generation_sessions")
      .select("id", { count: "exact" })
      .eq("user_id", userId)
      .gte("created_at", startOfWindow)
      .single();

    // Cache the result
    RateLimiterService.cache[userId] = {
      count: count || 0,
      resetTime: now + RateLimiterService.WINDOW_MS,
    };

    return Math.max(0, RateLimiterService.RATE_LIMIT - (count || 0));
  }
}
