import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type {
  FlashcardDTO,
  CreateFlashcardCommand,
  UpdateFlashcardCommand,
  UpdateFlashcardStatusCommand,
  PaginationDTO,
} from "@/types";
import type { LoggingService } from "./logging.service";

// Schema for validating flashcard creation
export const createFlashcardSchema = z.object({
  front: z.string().max(220, "Front text must be 220 characters or less"),
  back: z.string().max(500, "Back text must be 500 characters or less"),
  generation_id: z.string().uuid().nullable().optional(),
  status: z.string().optional(),
});

// Schema for validating flashcard updates
export const updateFlashcardSchema = z.object({
  front: z.string().max(220, "Front text must be 220 characters or less"),
  back: z.string().max(500, "Back text must be 500 characters or less"),
  status: z.string().optional(),
});

// Schema for validating status updates
export const updateFlashcardStatusSchema = z.object({
  action: z.enum(["accept", "reject"], {
    errorMap: () => ({ message: "Action must be either 'accept' or 'reject'" }),
  }),
});

// Schema for pagination parameters
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["pending", "accepted-original", "accepted-edited", "rejected"]).optional(),
  sortBy: z.string().default("created_at"),
  order: z.enum(["asc", "desc"]).nullable().default("desc"),
});

/**
 * Flashcards service for handling CRUD operations
 */
export const flashcardsService = {
  /**
   * Get flashcards with pagination, filtering and sorting
   */
  async getFlashcards(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      sortBy?: string;
      order?: "asc" | "desc" | null;
    },
    logger?: LoggingService
  ): Promise<{ flashcards: FlashcardDTO[]; pagination: PaginationDTO }> {
    // Validate params
    const validation = paginationSchema.safeParse(params);
    if (!validation.success) {
      const errorMsg = `Invalid pagination parameters: ${JSON.stringify(validation.error.errors)}`;
      logger?.logFlashcardError(new Error(errorMsg), "list", userId);
      throw new Error(errorMsg);
    }

    const { page, limit, status, sortBy, order } = validation.data;
    const offset = (page - 1) * limit;

    // Start query builder
    let query = supabase
      .from("flashcards")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order(sortBy, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      const errorMsg = `Error fetching flashcards: ${error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "list", userId);
      throw new Error(errorMsg);
    }

    return {
      flashcards: data as FlashcardDTO[],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    };
  },

  /**
   * Get a single flashcard by ID
   */
  async getFlashcardById(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    flashcardId: string,
    logger?: LoggingService
  ): Promise<FlashcardDTO> {
    // Validate flashcard ID format
    if (!flashcardId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(flashcardId)) {
      const errorMsg = "Invalid flashcard ID format";
      logger?.logFlashcardError(new Error(errorMsg), "get", userId, flashcardId);
      throw new Error(errorMsg);
    }

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const errorMsg = "Flashcard not found";
        logger?.logFlashcardError(new Error(errorMsg), "get", userId, flashcardId);
        throw new Error(errorMsg);
      }
      const errorMsg = `Error fetching flashcard: ${error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "get", userId, flashcardId);
      throw new Error(errorMsg);
    }

    return data as FlashcardDTO;
  },

  /**
   * Create a new flashcard
   */
  async createFlashcard(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    command: CreateFlashcardCommand,
    logger?: LoggingService
  ): Promise<FlashcardDTO> {
    // Validate flashcard data
    const validation = createFlashcardSchema.safeParse(command);
    if (!validation.success) {
      const errorMsg = `Invalid flashcard data: ${validation.error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "create", userId);
      throw new Error(errorMsg);
    }

    const { front, back, generation_id, status } = validation.data;

    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        front,
        back,
        generation_id,
        status: status || "pending", // Use provided status or default to "pending"
        source: generation_id ? "ai" : "self",
      })
      .select()
      .single();

    if (error) {
      const errorMsg = `Error creating flashcard: ${error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "create", userId);
      throw new Error(errorMsg);
    }

    return data as FlashcardDTO;
  },

  /**
   * Update an existing flashcard
   */
  async updateFlashcard(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    flashcardId: string,
    command: UpdateFlashcardCommand,
    logger?: LoggingService
  ): Promise<FlashcardDTO> {
    // Validate flashcard data
    const validation = updateFlashcardSchema.safeParse(command);
    if (!validation.success) {
      const errorMsg = `Invalid flashcard data: ${validation.error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "update", userId, flashcardId);
      throw new Error(errorMsg);
    }

    // Check if flashcard exists and belongs to the user
    // try {
    await this.getFlashcardById(supabase, userId, flashcardId, logger);
    // } catch (error) {
    //   // Re-throw the error from getFlashcardById
    //   throw error;
    // }

    const { front, back, status } = validation.data;

    // Create update object with required fields
    const updateData: unknown = {
      front,
      back,
      updated_at: new Date().toISOString(),
    };

    // Add status if provided
    if (status) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      const errorMsg = `Error updating flashcard: ${error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "update", userId, flashcardId);
      throw new Error(errorMsg);
    }

    return data as FlashcardDTO;
  },

  /**
   * Update flashcard status (accept or reject)
   */
  async updateFlashcardStatus(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    flashcardId: string,
    command: UpdateFlashcardStatusCommand,
    logger?: LoggingService
  ): Promise<FlashcardDTO> {
    // Validate command
    const validation = updateFlashcardStatusSchema.safeParse(command);
    if (!validation.success) {
      const errorMsg = `Invalid status update command: ${validation.error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "status-update", userId, flashcardId);
      throw new Error(errorMsg);
    }

    // Check if flashcard exists and belongs to the user
    //const flashcard;
    // try {
    const flashcard = await this.getFlashcardById(supabase, userId, flashcardId, logger);
    // } catch (error) {
    //   // Re-throw the error from getFlashcardById
    //   throw error;
    // }

    const { action } = validation.data;
    let status = flashcard.status;

    // Determine new status based on action and current status
    if (action === "accept") {
      // If the flashcard has been edited (front or back is different from original), mark as edited
      // Note: This is a simplified check and would need to be expanded based on actual requirements
      status = "accepted-original";
    } else if (action === "reject") {
      status = "rejected";
    }

    const { data, error } = await supabase
      .from("flashcards")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      const errorMsg = `Error updating flashcard status: ${error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "status-update", userId, flashcardId);
      throw new Error(errorMsg);
    }

    return data as FlashcardDTO;
  },

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    flashcardId: string,
    logger?: LoggingService
  ): Promise<void> {
    // Check if flashcard exists and belongs to the user
    // try {
    await this.getFlashcardById(supabase, userId, flashcardId, logger);
    // } catch (error) {
    //   // Re-throw the error from getFlashcardById
    //   throw error;
    // }

    const { error } = await supabase.from("flashcards").delete().eq("id", flashcardId).eq("user_id", userId);

    if (error) {
      const errorMsg = `Error deleting flashcard: ${error.message}`;
      logger?.logFlashcardError(new Error(errorMsg), "delete", userId, flashcardId);
      throw new Error(errorMsg);
    }
  },
};
