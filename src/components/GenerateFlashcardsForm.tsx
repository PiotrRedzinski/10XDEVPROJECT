import { useState } from "react";
import { Loader2 } from "lucide-react";

interface GenerateFormState {
  text: string;
  isLoading: boolean;
  error: string | null;
  characterCount: number;
}

const MIN_CHARS = 1000;
const MAX_CHARS = 10000;

export default function GenerateFlashcardsForm() {
  const [state, setState] = useState<GenerateFormState>({
    text: "",
    isLoading: false,
    error: null,
    characterCount: 0,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setState((prev) => ({
      ...prev,
      text,
      characterCount: text.length,
      error: validateText(text),
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
      // Handle successful response
      console.log(data);
      window.location.href = "/flashcards";
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

      <div className="text-center pt-2">
        <p className="text-airbnb-foggy text-sm">Your flashcards will be ready in a few seconds</p>
      </div>
    </form>
  );
}
