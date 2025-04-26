import { useState } from "react";
import { Loader2, Check, X, Edit2 } from "lucide-react";
import type { FlashcardDTO } from "@/types";

interface GenerateFormState {
  text: string;
  isLoading: boolean;
  error: string | null;
  characterCount: number;
  generatedFlashcards: FlashcardDTO[] | null;
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
      const response = await fetch("/api/flashcards/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: state.generatedFlashcards.map((card) => ({
            id: String(card.id),
            front: card.front,
            back: card.back,
            source: card.source,
            status: "accepted-original",
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to accept flashcards");
      window.location.href = "/flashcards";
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to accept flashcards. Please try again.",
      }));
    }
  };

  const handleRejectAll = async () => {
    if (!state.generatedFlashcards) return;

    try {
      const response = await fetch("/api/flashcards/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcards: state.generatedFlashcards.map((card) => ({
            id: String(card.id),
            front: card.front,
            back: card.back,
            source: card.source,
            status: "rejected",
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to reject flashcards");
      setState((prev) => ({ ...prev, generatedFlashcards: null }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to reject flashcards. Please try again.",
      }));
    }
  };

  const handleCardAction = async (index: number, action: "accept" | "reject" | "edit") => {
    if (!state.generatedFlashcards) return;

    const card = state.generatedFlashcards[index];
    if (!card) return;

    try {
      if (action === "edit") {
        // TODO: Implement edit modal
        return;
      }

      const response = await fetch("/api/flashcards/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: card.id,
          front: card.front,
          back: card.back,
          source: card.source,
          status: action === "accept" ? "accepted-original" : "rejected",
        }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} flashcard`);

      // Update local state
      setState((prev) => ({
        ...prev,
        generatedFlashcards: prev.generatedFlashcards?.filter((_, i) => i !== index) || null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to ${action} flashcard. Please try again.`,
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
                    onClick={() => handleCardAction(index, "accept")}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Accept"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCardAction(index, "edit")}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleCardAction(index, "reject")}
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
    </div>
  );
}
