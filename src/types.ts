// src/types.ts

// Import our database types from the db folder
import type { Database } from "./db/database.types";

/**
 * User Data Transfer Object.
 * Represents the public user details used in responses.
 */
export interface UserDTO {
  id: string;
  username: string;
  email: string;
}

/**
 * Command model for user registration.
 */
export interface RegisterUserCommand {
  username: string;
  email: string;
  password: string;
}

/**
 * Command model for user login.
 */
export interface LoginCommand {
  username: string;
  password: string;
}

/**
 * DTO for login response.
 */
export interface LoginResponseDTO {
  token: string;
  user: UserDTO;
}

/**
 * Flashcard Data Transfer Object.
 * Derived from the database flashcards table.
 */
export type FlashcardDTO = Database["public"]["Tables"]["flashcards"]["Row"];

/**
 * Command model for creating a new flashcard manually.
 * 'front' is limited to 220 characters and 'back' to 500 characters.
 * 'generation_id' is optional and links to an AI generation session, or null for manual creation.
 */
export interface CreateFlashcardCommand {
  front: string;
  back: string;
  generation_id?: string | null;
  status?: "accepted-original" | string;
}

/**
 * Command model for updating an existing flashcard.
 * Only the 'front' and 'back' fields are updatable; the 'generation_id' remains unchanged.
 */
export interface UpdateFlashcardCommand {
  front: string;
  back: string;
  status?: string;
}

/**
 * Command model for updating the status of a flashcard.
 * Used to accept (either as original or edited) or reject an AI-generated flashcard.
 */
export interface UpdateFlashcardStatusCommand {
  action: "accept" | "reject";
}

/**
 * Command model for requesting AI generation of flashcards.
 * The input text must be between 1000 and 10000 characters.
 */
export interface AIGenerateRequestDTO {
  text: string;
}

/**
 * DTO for AI generation session metrics.
 */
export interface AIGenerationSessionMetricsDTO {
  generation_duration: number;
  generated: number;
  accepted_original: number;
  accepted_edited: number;
  rejected: number;
}

/**
 * DTO for the response of an AI flashcard generation request.
 * Contains an array of generated flashcards and session metrics.
 */
export interface AIGenerateResponseDTO {
  flashcards: FlashcardDTO[];
  sessionMetrics: AIGenerationSessionMetricsDTO;
}

/**
 * AI Generation Session DTO.
 * Derived from the database ai_generation_sessions table.
 */
export type AISessionDTO = Database["public"]["Tables"]["ai_generation_sessions"]["Row"];

/**
 * Pagination DTO used for list endpoints, e.g., for flashcards or sessions.
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

/**
 * Generation Error Log DTO.
 * Derived from the database generation_error_log table.
 */
export type GenerationErrorLogDTO = Database["public"]["Tables"]["generation_error_log"]["Row"];
