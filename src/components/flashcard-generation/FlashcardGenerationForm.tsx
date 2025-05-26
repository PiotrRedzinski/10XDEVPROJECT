import { memo } from "react";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

interface FlashcardGenerationFormProps {
  text: string;
  characterCount: number;
  error: {
    message: string;
    details?: string;
  } | null;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  getCharacterCountColor: () => string;
}

function FlashcardGenerationFormComponent({
  text,
  characterCount,
  error,
  isLoading,
  onTextChange,
  onSubmit,
  getCharacterCountColor,
}: FlashcardGenerationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Enter your text here..."
          className="min-h-[200px]"
          disabled={isLoading}
        />
        <div className={`text-sm ${getCharacterCountColor()}`}>Characters: {characterCount}</div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
            {error.details && <span className="block text-sm opacity-75">{error.details}</span>}
          </AlertDescription>
        </Alert>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !!error}
      >
        {isLoading ? "Generating..." : "Generate Flashcards"}
      </button>
    </form>
  );
}

export const FlashcardGenerationForm = memo(FlashcardGenerationFormComponent);
