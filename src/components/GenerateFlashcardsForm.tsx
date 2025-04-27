import { useState } from "react";
import { Loader2, Check, X, Edit2 } from "lucide-react";
import EditFlashcardDialog from "./EditFlashcardDialog";
import type { UpdateFlashcardCommand } from "@/types";

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
  error: string | null;
  characterCount: number;
  success?: boolean;
  generatedFlashcards: GeneratedFlashcard[] | null;
  editingFlashcardId: string | null;
  editingFlashcard: { front: string; back: string } | null;
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
    setState((prev) => ({
      ...prev,
      text,
      characterCount: text.length,
      error: validateText(text),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateText(state.text);
    if (error) {
      setState((prev) => ({ ...prev, error }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: state.text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Generated flashcards with IDs:", data.flashcards);

      // Ensure each flashcard has a generation_id for later use
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
        error: error instanceof Error ? error.message : "An unexpected error occurred",
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
        error: "Failed to accept flashcards. Please try again.",
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
        error: "Failed to reject flashcards. Please try again.",
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
        error: "Failed to process action. Please try again.",
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
    <div className="space-y-8">
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
          <div className="bg-airbnb-rausch-light border border-airbnb-rausch-border text-airbnb-rausch rounded-xl p-4">
            <p>{state.error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!!state.error || state.isLoading || state.characterCount < MIN_CHARS}
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-airbnb-hof">Generated Flashcards</h3>
            <div className="space-x-4">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 bg-airbnb-rausch text-white rounded-lg hover:bg-[#FF385C] transition-colors"
              >
                Reject All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.generatedFlashcards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-airbnb-hof">Front</h4>
                  <p className="text-airbnb-foggy">{card.front}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-airbnb-hof">Back</h4>
                  <p className="text-airbnb-foggy">{card.back}</p>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => handleCardAction("accept", card)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Accept"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCardAction("edit", card)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCardAction("reject", card)}
                    className="p-2 text-airbnb-rausch hover:bg-red-50 rounded-full transition-colors"
                    title="Reject"
                  >
                    <X className="h-5 w-5" />
                  </button>
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
