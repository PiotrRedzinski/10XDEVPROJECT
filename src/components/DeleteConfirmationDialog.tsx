import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  flashcardId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
}

export default function DeleteConfirmationDialog({
  flashcardId,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error state when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setError(null);
    }
  };

  // Handle confirm button click
  const handleConfirm = async () => {
    if (!flashcardId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const success = await onConfirm(flashcardId);

      if (!success) {
        setError("Failed to delete flashcard. Please try again.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen && flashcardId !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-white shadow-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-airbnb-hof">Delete Flashcard</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 my-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="border-gray-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="bg-airbnb-rausch hover:bg-[#FF385C] focus:ring-airbnb-rausch"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
