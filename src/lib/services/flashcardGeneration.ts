import type { GeneratedFlashcard } from "@/types";

interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
}

interface APIError {
  message: string;
  details?: string;
  code?: string;
  technical?: string;
}

interface RequestDetails {
  timestamp: string;
  endpoint: string;
  method: string;
  payload: {
    text: string;
    textLength: number;
    fullRequest?: {
      text: string;
      metadata?: {
        textStats: TextStats;
        processingOptions?: {
          maxTokens?: number;
          temperature?: number;
          model?: string;
        };
        configuration?: {
          apiUrl?: string;
          apiKeyValid?: boolean;
          apiKeyPrefix?: string;
        };
      };
    };
  };
  headers: Record<string, string>;
  executionDetails: {
    startTime: string;
    endTime?: string;
    duration?: number;
    stages: {
      name: string;
      timestamp: string;
      status: "started" | "completed" | "error";
      details?: string;
    }[];
  };
}

export class FlashcardGenerationService {
  private static getTextStats(text: string): TextStats {
    return {
      characters: text.length,
      words: text.trim().split(/\s+/).length,
      sentences: text.split(/[.!?]+/).filter(Boolean).length,
      paragraphs: text.split(/\n\s*\n/).filter(Boolean).length,
    };
  }

  private static async verifyApiConfiguration(): Promise<{
    isValid: boolean;
    apiUrl: string | null;
    apiKeyValid: boolean;
    apiKeyPrefix: string | null;
    error: string | null;
  }> {
    try {
      const response = await fetch("/api/ai/verify-config");
      const data = await response.json();

      return {
        isValid: data.apiKeyValid && !data.error,
        apiUrl: data.apiUrl,
        apiKeyValid: data.apiKeyValid,
        apiKeyPrefix: data.apiKeyPrefix,
        error: data.error || null,
      };
    } catch (error) {
      return {
        isValid: false,
        apiUrl: null,
        apiKeyValid: false,
        apiKeyPrefix: null,
        error: error instanceof Error ? error.message : "Failed to verify API configuration",
      };
    }
  }

  private static async parseErrorResponse(response: Response): Promise<APIError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || "An unexpected error occurred",
        details: errorData.details,
        code: errorData.code,
        technical: errorData.stack,
      };
    } catch {
      return {
        message: "Failed to parse error response",
        technical: `Status: ${response.status} ${response.statusText}`,
      };
    }
  }

  private static getErrorMessage(status: number, errorData?: APIError): string {
    const defaultMessage = "An unexpected error occurred while generating flashcards";

    if (errorData?.message) {
      return errorData.message;
    }

    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication failed. Please check your API key.";
      case 403:
        return "Access denied. Please check your permissions.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return defaultMessage;
    }
  }

  public static async generateFlashcards(text: string): Promise<{
    flashcards: GeneratedFlashcard[] | null;
    error: APIError | null;
  }> {
    const startTime = new Date();
    const executionStages: RequestDetails["executionDetails"]["stages"] = [];
    const textStats = this.getTextStats(text);

    try {
      // Verify API configuration first
      const config = await this.verifyApiConfiguration();
      if (!config.isValid) {
        throw new Error(config.error || "Invalid API configuration");
      }

      // Prepare request details
      const requestDetails: RequestDetails = {
        timestamp: startTime.toISOString(),
        endpoint: "/api/ai/generate",
        method: "POST",
        payload: {
          text: `${text.slice(0, 100)}${text.length > 100 ? "..." : ""}`,
          textLength: text.length,
          fullRequest: {
            text,
            metadata: {
              textStats,
              processingOptions: {
                maxTokens: 2000,
                temperature: 0.7,
              },
            },
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
        executionDetails: {
          startTime: startTime.toISOString(),
          stages: executionStages,
        },
      };

      // Make the API call
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          requestDetails,
        }),
      });

      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        return {
          flashcards: null,
          error: {
            ...error,
            message: this.getErrorMessage(response.status, error),
          },
        };
      }

      const data = await response.json();
      return {
        flashcards: data.flashcards,
        error: null,
      };
    } catch (error) {
      return {
        flashcards: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to generate flashcards",
          technical: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  }

  public static async updateFlashcard(
    id: string,
    data: { front: string; back: string }
  ): Promise<{
    flashcard: GeneratedFlashcard | null;
    error: APIError | null;
  }> {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await this.parseErrorResponse(response);
        return {
          flashcard: null,
          error: {
            ...error,
            message: this.getErrorMessage(response.status, error),
          },
        };
      }

      const updatedCard = await response.json();
      return {
        flashcard: updatedCard,
        error: null,
      };
    } catch (error) {
      return {
        flashcard: null,
        error: {
          message: error instanceof Error ? error.message : "Failed to update flashcard",
          technical: error instanceof Error ? error.stack : undefined,
        },
      };
    }
  }
}
