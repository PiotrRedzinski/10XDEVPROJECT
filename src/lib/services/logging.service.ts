import type { SupabaseClient } from "@supabase/supabase-js";

export enum LogLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  user_id?: string;
  session_id?: string;
}

export class LoggingService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Logs an entry to the database
   */
  async log(entry: LogEntry): Promise<void> {
    try {
      const { error } = await this.supabase.from("system_logs").insert({
        level: entry.level,
        message: entry.message,
        metadata: entry.metadata,
        user_id: entry.user_id,
        session_id: entry.session_id,
      });

      if (error) {
        // Fallback to console if DB logging fails
        console.error("Failed to write log to database:", error);
        this.logToConsole(entry);
      }
    } catch (error) {
      // Ensure we at least log to console if something goes wrong
      console.error("Error in logging service:", error);
      this.logToConsole(entry);
    }
  }

  /**
   * Logs an info level message
   */
  async info(message: string, metadata?: Record<string, unknown>, userId?: string, sessionId?: string): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      message,
      metadata,
      user_id: userId,
      session_id: sessionId,
    });
  }

  /**
   * Logs a warning level message
   */
  async warn(message: string, metadata?: Record<string, unknown>, userId?: string, sessionId?: string): Promise<void> {
    await this.log({
      level: LogLevel.WARNING,
      message,
      metadata,
      user_id: userId,
      session_id: sessionId,
    });
  }

  /**
   * Logs an error level message
   */
  async error(message: string, metadata?: Record<string, unknown>, userId?: string, sessionId?: string): Promise<void> {
    await this.log({
      level: LogLevel.ERROR,
      message,
      metadata,
      user_id: userId,
      session_id: sessionId,
    });
  }

  /**
   * Fallback logging to console when database logging fails
   */
  private logToConsole(entry: LogEntry): void {
    const meta = entry.metadata ? ` | Metadata: ${JSON.stringify(entry.metadata)}` : "";
    const user = entry.user_id ? ` | User: ${entry.user_id}` : "";
    const session = entry.session_id ? ` | Session: ${entry.session_id}` : "";

    const message = `[${entry.level.toUpperCase()}] ${entry.message}${meta}${user}${session}`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARNING:
        console.warn(message);
        break;
      default:
        console.info(message);
    }
  }

  /**
   * Logs flashcard operation errors
   * @param error The error object
   * @param operation The operation being performed (e.g., "create", "update", "delete")
   * @param userId The ID of the user performing the operation
   * @param flashcardId The ID of the flashcard (if applicable)
   */
  logFlashcardError(error: Error, operation: string, userId: string, flashcardId?: string): void {
    console.error(
      `[Flashcard ${operation} Error] User: ${userId}, Flashcard: ${flashcardId || "N/A"} - ${error.message}`
    );

    // Additional logic for storing errors in the database can be added here
    // For example, inserting into generation_error_log table if it's related to AI operations
  }
}
