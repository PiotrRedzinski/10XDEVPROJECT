import { useState } from "react";
import { Loader2, Check, X, Edit2, AlertCircle } from "lucide-react";
import EditFlashcardDialog from "./EditFlashcardDialog";
import type { UpdateFlashcardCommand } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// Define the GeneratedFlashcard type to fix type errors
interface GeneratedFlashcard {
  id: string;
  front: string;
  back: string;
  source: "self" | "ai";
  status: "pending" | "accepted-original" | "accepted-edited" | "rejected";
  generation_id: string | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

interface GenerateFormState {
  text: string;
  isLoading: boolean;
  error: {
    message: string;
    details?: string;
    code?: string;
    technical?: string;
  } | null;
  characterCount: number;
  success?: boolean;
  generatedFlashcards: GeneratedFlashcard[] | null;
  editingFlashcardId: string | null;
  editingFlashcard: { front: string; back: string } | null;
}

interface ErrorResponse {
  message?: string;
  details?: string;
  code?: string;
  stack?: string;
}

interface APIError {
  message: string;
  details?: string;
  code?: string;
  technical?: string;
}

const MIN_CHARS = 1000;
const MAX_CHARS = 10000;

export default function GenerateFlashcardsForm() {
  const [state, setState] = useState<GenerateFormState>({
    text: "",
    isLoading: false,
    error: null,
    characterCount: 0,
    generatedFlashcards: null,
    editingFlashcardId: null,
    editingFlashcard: null,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const validationError = validateText(text);
    setState((prev) => ({
      ...prev,
      text,
      characterCount: text.length,
      error: validationError ? { message: validationError } : null,
      generatedFlashcards: null, // Reset generated cards when text changes
    }));
  };

  const validateText = (text: string): string | null => {
    if (text.length < MIN_CHARS) {
      return `Please enter at least ${MIN_CHARS} characters`;
    }
    if (text.length > MAX_CHARS) {
      return `Text cannot exceed ${MAX_CHARS} characters`;
    }
    return null;
  };

  const parseErrorResponse = async (response: Response): Promise<APIError> => {
    try {
      const contentType = response.headers.get("content-type");
      let errorData: ErrorResponse | null = null;

      try {
        errorData = await response.json();
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError);
        return {
          message: "Failed to parse server response",
          technical: `Status: ${response.status} ${response.statusText}\nContent-Type: ${contentType}`,
          code: String(response.status),
        };
      }

      if (contentType?.includes("application/json") && errorData) {
        // Enhanced error details
        const baseMessage = getErrorMessage(response.status, errorData);
        return {
          message: baseMessage,
          details: errorData.details || errorData.message || "No additional details provided",
          code: errorData.code || String(response.status),
          technical: JSON.stringify(
            {
              status: response.status,
              error: errorData,
              timestamp: new Date().toISOString(),
              endpoint: "/api/ai/generate",
            },
            null,
            2
          ),
        };
      }

      return {
        message: getErrorMessage(response.status),
        details: "Server returned an unexpected response format",
        technical: `Status: ${response.status} ${response.statusText}\nContent-Type: ${contentType}`,
        code: String(response.status),
      };
    } catch (error) {
      console.error("Error parsing response:", error);
      return {
        message: "Failed to process server response",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        technical: `Status: ${response.status} ${response.statusText}`,
        code: String(response.status),
      };
    }
  };

  const getErrorMessage = (status: number, errorData?: ErrorResponse): string => {
    const baseMessage = (() => {
      switch (status) {
        case 401:
          return "OpenAI API key is missing or invalid. Please check your environment configuration.";
        case 429:
          return "Rate limit exceeded. Please try again in a few moments.";
        case 500:
          if (errorData?.message?.includes("OpenAI")) {
            return "There was an error communicating with OpenAI. Please try again.";
          }
          if (errorData?.message?.includes("API key")) {
            return "OpenAI API key is not properly configured. Please contact support.";
          }
          return "An unexpected server error occurred.";
        case 502:
          return "The server encountered an error while communicating with OpenAI.";
        case 504:
          return "The request timed out. Please try again.";
        default:
          return errorData?.message || "An unexpected error occurred.";
      }
    })();

    return `${baseMessage} (Status: ${status})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateText(state.text);
    if (validationError) {
      setState((prev) => ({
        ...prev,
        error: { message: validationError },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: state.text }),
      });

      if (!response.ok) {
        const error = await parseErrorResponse(response);
        throw error;
      }

      const data = await response.json();
      console.log("Generated flashcards with IDs:", data.flashcards);

      if (data.flashcards?.length > 0 && !data.flashcards[0].generation_id) {
        console.error("Flashcards are missing generation_id");
      }

      setState((prev) => ({
        ...prev,
        generatedFlashcards: data.flashcards,
      }));
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setState((prev) => ({
        ...prev,
        error: (error as APIError) || { message: "An unexpected error occurred" },
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleAcceptAll = async () => {
    if (!state.generatedFlashcards) return;

    try {
      // First update all flashcards to accepted status
      const response = await fetch("/api/flashcards/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: state.generatedFlashcards.map((card) => ({
            id: String(card.id),
            front: card.front,
            back: card.back,
            source: "ai",
            status: "accepted-original",
            isAIGenerated: true,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to accept flashcards");
      }

      // Group flashcards by generation_id and count them
      const generationCounts = new Map<string, number>();

      // Count cards per generation_id
      state.generatedFlashcards.forEach((card) => {
        if (card.generation_id) {
          const count = generationCounts.get(card.generation_id) || 0;
          generationCounts.set(card.generation_id, count + 1);
        } else {
          console.error("Flashcard missing generation_id:", card);
        }
      });

      if (generationCounts.size === 0) {
        console.error("No valid generation IDs found in flashcards");
      } else {
        console.log("Bulk increment counts:", Array.from(generationCounts.entries()));

        // Update counters for each generation session in a single operation per generation
        const bulkUpdatePromises = Array.from(generationCounts.entries()).map(([generationId, count]) => {
          return fetch("/api/generation-sessions/bulk-increment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              generationId,
              counterType: "accepted_original",
              incrementBy: count,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                console.warn(
                  `Failed to bulk update counter for generation ${generationId}:`,
                  response.status,
                  response.statusText
                );
              }
              return response;
            })
            .catch((error) => {
              console.error(`Error incrementing counter for generation ${generationId}:`, error);
              return null;
            });
        });

        // Wait for all updates to complete
        await Promise.all(bulkUpdatePromises);
      }

      window.location.href = "/flashcards";
    } catch (err) {
      console.error("Error accepting all flashcards:", err);
      setState((prev) => ({
        ...prev,
        error: { message: "Failed to accept flashcards. Please try again." },
      }));
    }
  };

  const handleRejectAll = async () => {
    if (!state.generatedFlashcards) return;

    try {
      // Group flashcards by generation_id and count them
      const generationCounts = new Map<string, number>();

      // Count cards per generation_id
      state.generatedFlashcards.forEach((card) => {
        if (card.generation_id) {
          const count = generationCounts.get(card.generation_id) || 0;
          generationCounts.set(card.generation_id, count + 1);
        } else {
          console.error("Flashcard missing generation_id:", card);
        }
      });

      // Delete all flashcards
      const response = await fetch("/api/flashcards/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcardIds: state.generatedFlashcards.map((card) => String(card.id)),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to reject flashcards");
      }

      // Update counters for rejected flashcards
      if (generationCounts.size > 0) {
        console.log("Bulk increment counts for rejected cards:", Array.from(generationCounts.entries()));

        // Update rejected counters for each generation session
        const bulkUpdatePromises = Array.from(generationCounts.entries()).map(([generationId, count]) => {
          return fetch("/api/generation-sessions/bulk-increment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              generationId,
              counterType: "rejected",
              incrementBy: count,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                console.warn(
                  `Failed to bulk update rejected counter for generation ${generationId}:`,
                  response.status,
                  response.statusText
                );
              }
              return response;
            })
            .catch((error) => {
              console.error(`Error incrementing rejected counter for generation ${generationId}:`, error);
              return null;
            });
        });

        // Wait for all updates to complete
        await Promise.all(bulkUpdatePromises);
      }

      setState((prev) => ({ ...prev, generatedFlashcards: null }));
    } catch (err) {
      console.error("Error rejecting all flashcards:", err);
      setState((prev) => ({
        ...prev,
        error: { message: "Failed to reject flashcards. Please try again." },
      }));
    }
  };

  const handleCardAction = async (action: "accept" | "reject" | "edit", card: GeneratedFlashcard) => {
    try {
      // For edit action, just set the editing state and return
      if (action === "edit") {
        setState((prev) => ({
          ...prev,
          editingFlashcardId: card.id,
          editingFlashcard: { front: card.front, back: card.back },
        }));
        return;
      }

      // For accept and reject actions, proceed as before
      let counterType: "accepted_original" | "accepted_edited" | "rejected";

      if (action === "accept") {
        counterType = "accepted_original";

        // Accept the flashcard by updating it
        const response = await fetch("/api/flashcards/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: String(card.id),
            front: card.front,
            back: card.back,
            source: "ai",
            status: "accepted-original",
            isAIGenerated: true,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update flashcard");
        }
      } else {
        // Reject the flashcard by deleting it
        counterType = "rejected";

        const response = await fetch("/api/flashcards/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: String(card.id),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete flashcard");
        }
      }

      // Update the counter for this generation session
      if (card.generation_id) {
        console.log(`Incrementing ${counterType} counter for generation ${card.generation_id}`);

        const updateSessionResponse = await fetch("/api/generation-sessions/bulk-increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationId: card.generation_id,
            counterType,
            incrementBy: 1,
          }),
        });

        if (!updateSessionResponse.ok) {
          console.warn(
            "Failed to update generation session counter:",
            updateSessionResponse.status,
            updateSessionResponse.statusText
          );
        }
      } else {
        console.error("Cannot increment counter - card missing generation_id:", card);
      }

      // Remove the card from the UI
      setState((prev) => ({
        ...prev,
        generatedFlashcards: prev.generatedFlashcards?.filter((c) => c.id !== card.id) || null,
      }));
    } catch (err) {
      console.error("Error handling card action:", err);
      setState((prev) => ({
        ...prev,
        error: { message: "Failed to process action. Please try again." },
      }));
    }
  };

  const getCharacterCountColor = () => {
    if (state.characterCount < MIN_CHARS) return "text-airbnb-rausch";
    if (state.characterCount > MAX_CHARS) return "text-airbnb-rausch";
    return "text-airbnb-babu";
  };

  const getProgressColor = () => {
    if (state.characterCount < MIN_CHARS) return "bg-gray-400";
    if (state.characterCount > MAX_CHARS) return "bg-airbnb-rausch";
    return "bg-airbnb-babu";
  };

  // Get the flashcard being edited (if any)
  const flashcardBeingEdited =
    state.editingFlashcardId && state.generatedFlashcards
      ? state.generatedFlashcards.find((f) => f.id === state.editingFlashcardId) || null
      : null;

  // Handle canceling edit
  const handleCancelEdit = () => {
    setState((prev) => ({ ...prev, editingFlashcardId: null }));
  };

  // Handle saving edited flashcard
  const handleSaveEdit = async (id: string, data: UpdateFlashcardCommand): Promise<boolean> => {
    try {
      // Get the original flashcard
      const flashcard = state.generatedFlashcards?.find((f) => f.id === id);
      if (!flashcard) {
        throw new Error("Flashcard not found");
      }

      // Check if there are actual changes
      const hasChanges = data.front !== flashcard.front || data.back !== flashcard.back;

      if (!hasChanges) {
        // No changes, just close the dialog
        setState((prev) => ({ ...prev, editingFlashcardId: null }));
        return true;
      }

      // Now update the flashcard with edited values
      const response = await fetch(`/api/flashcards/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          front: data.front,
          back: data.back,
          source: "ai",
          status: "accepted-edited",
          isAIGenerated: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }

      // Update counter for edited card
      if (flashcard.generation_id) {
        const counterResponse = await fetch("/api/generation-sessions/bulk-increment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationId: flashcard.generation_id,
            counterType: "accepted_edited",
            incrementBy: 1,
          }),
        });

        if (!counterResponse.ok) {
          console.warn("Failed to update counter for edited card");
        }
      }

      // Remove the card from UI as it's now been accepted with edits
      setState((prev) => ({
        ...prev,
        generatedFlashcards: prev.generatedFlashcards?.filter((f) => f.id !== id) || null,
        editingFlashcardId: null,
      }));

      return true;
    } catch (err) {
      console.error("Failed to update flashcard:", err);
      return false;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-airbnb-hof">Enter your text</h3>
            <p className={`text-right ${getCharacterCountColor()}`}>
              {state.characterCount} / {MAX_CHARS}
            </p>
          </div>

          <textarea
            value={state.text}
            onChange={handleTextChange}
            placeholder="Paste or type your text here..."
            data-testid="flashcard-text-input"
            className="w-full min-h-[250px] border-2 rounded-xl resize-none shadow-sm placeholder:text-gray-400 p-4 focus:border-airbnb-babu focus:ring-airbnb-babu"
            disabled={state.isLoading}
          />

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(100, (state.characterCount / MAX_CHARS) * 100)}%` }}
            />
          </div>
        </div>

        {state.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="font-medium">{state.error.message}</div>
              {state.error.details && (
                <div className="mt-2 text-sm opacity-90">
                  <strong>Details:</strong> {state.error.details}
                </div>
              )}
              {state.error.code && (
                <div className="mt-2 text-sm opacity-90">
                  <strong>Error Code:</strong> {state.error.code}
                </div>
              )}
              {state.error.technical && (
                <div className="mt-2">
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-2">Technical Details</summary>
                    <pre className="bg-destructive/10 rounded p-2 overflow-x-auto">{state.error.technical}</pre>
                  </details>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={!!state.error || state.isLoading || state.characterCount < MIN_CHARS}
          data-testid="generate-flashcards-button"
          className="w-full bg-airbnb-rausch text-white font-medium py-4 px-6 rounded-xl shadow-sm hover:bg-[#FF385C] transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 inline animate-spin" />
              Generating Flashcards...
            </>
          ) : (
            "Generate Flashcards"
          )}
        </button>

        {state.isLoading && (
          <div className="text-center pt-2">
            <p className="text-airbnb-foggy text-sm">Your flashcards will be ready in a few seconds</p>
          </div>
        )}
      </form>

      {state.generatedFlashcards && state.generatedFlashcards.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Generated Flashcards</h2>
            <div className="flex gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {state.generatedFlashcards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{card.front}</h3>
                    <p className="text-gray-600">{card.back}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCardAction("accept", card)}
                      data-testid={`accept-flashcard-${card.id}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="Accept"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCardAction("edit", card)}
                      data-testid={`edit-flashcard-${card.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCardAction("reject", card)}
                      data-testid={`reject-flashcard-${card.id}`}
                      className="p-2 text-airbnb-rausch hover:bg-red-50 rounded-full transition-colors"
                      title="Reject"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <EditFlashcardDialog
        flashcard={flashcardBeingEdited}
        isOpen={state.editingFlashcardId !== null}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
