import { memo } from "react";
import { Check, X, Edit2 } from "lucide-react";
import type { GeneratedFlashcard } from "@/types";

interface FlashcardListProps {
  flashcards: GeneratedFlashcard[];
  onAccept: (card: GeneratedFlashcard) => void;
  onReject: (card: GeneratedFlashcard) => void;
  onEdit: (card: GeneratedFlashcard) => void;
}

function FlashcardListComponent({ flashcards, onAccept, onReject, onEdit }: FlashcardListProps) {
  if (!flashcards?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Generated Flashcards</h2>
      <div className="grid gap-4">
        {flashcards.map((card) => (
          <div key={card.id} className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="space-y-2">
              <div>
                <h3 className="font-medium">Front</h3>
                <p className="mt-1">{card.front}</p>
              </div>
              <div>
                <h3 className="font-medium">Back</h3>
                <p className="mt-1">{card.back}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => onAccept(card)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </button>

              <button
                onClick={() => onEdit(card)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <Edit2 className="mr-1 h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => onReject(card)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const FlashcardList = memo(FlashcardListComponent);
