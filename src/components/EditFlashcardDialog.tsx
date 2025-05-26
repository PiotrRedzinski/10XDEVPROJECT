import { useState, useEffect } from "react";
import type { FlashcardDTO, UpdateFlashcardCommand } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

/**
 * Props for the EditFlashcardDialog component
 */
interface EditFlashcardDialogProps {
  flashcard: FlashcardDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateFlashcardCommand) => Promise<boolean>;
}

/**
 * ViewModel for the edit flashcard form
 */
interface EditFlashcardFormViewModel {
  id: string;
  front: string;
  back: string;
  originalFront: string;
  originalBack: string;
  isSubmitting: boolean;
  errors: {
    front?: string;
    back?: string;
    api?: string;
  };
}

/**
 * Dialog component for editing flashcards
 */
export default function EditFlashcardDialog({ flashcard, isOpen, onClose, onSave }: EditFlashcardDialogProps) {
  // Initialize form state from flashcard or empty values
  const [formState, setFormState] = useState<EditFlashcardFormViewModel>({
    id: flashcard?.id || "",
    front: flashcard?.front || "",
    back: flashcard?.back || "",
    originalFront: flashcard?.front || "",
    originalBack: flashcard?.back || "",
    isSubmitting: false,
    errors: {},
  });

  // Update form state when flashcard changes
  useEffect(() => {
    if (flashcard) {
      setFormState({
        id: flashcard.id,
        front: flashcard.front,
        back: flashcard.back,
        originalFront: flashcard.front,
        originalBack: flashcard.back,
        isSubmitting: false,
        errors: {},
      });
    }
  }, [flashcard]);

  // Check if form has been modified
  const hasChanges = formState.front !== formState.originalFront || formState.back !== formState.originalBack;

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      errors: {
        ...prev.errors,
        [name]: undefined, // Clear field-specific error when user types
        api: undefined, // Clear API errors when user makes changes
      },
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: EditFlashcardFormViewModel["errors"] = {};

    // Validate front side (required, max 220 chars)
    if (!formState.front.trim()) {
      errors.front = "Front side is required";
    } else if (formState.front.length > 220) {
      errors.front = "Front side must be less than 220 characters";
    }

    // Validate back side (required, max 500 chars)
    if (!formState.back.trim()) {
      errors.back = "Back side is required";
    } else if (formState.back.length > 500) {
      errors.back = "Back side must be less than 500 characters";
    }

    // Update errors state and return whether form is valid
    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if nothing has changed
    if (!hasChanges) {
      onClose();
      return;
    }

    // Validate form first
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Call the onSave prop with updated data
      const success = await onSave(formState.id, {
        front: formState.front,
        back: formState.back,
      });

      if (success) {
        // If save was successful, close the dialog
        onClose();
      } else {
        // If save failed with no specific error, show generic message
        setFormState((prev) => ({
          ...prev,
          isSubmitting: false,
          errors: {
            ...prev.errors,
            api: "Failed to save changes. Please try again.",
          },
        }));
      }
    } catch (error) {
      // Handle unexpected errors
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        errors: {
          ...prev.errors,
          api: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-airbnb-hof">Edit Flashcard</DialogTitle>
        </DialogHeader>

        {/* API Error Message */}
        {formState.errors.api && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start gap-2 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{formState.errors.api}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Front side input */}
            <div className="space-y-2">
              <Label htmlFor="front" className="font-medium text-airbnb-hof">
                Front
              </Label>
              <Input
                id="front"
                name="front"
                value={formState.front}
                onChange={handleChange}
                placeholder="Front side content"
                className={formState.errors.front ? "border-red-500" : ""}
                disabled={formState.isSubmitting}
              />
              {formState.errors.front && <p className="text-xs text-red-500">{formState.errors.front}</p>}
              <div className="text-xs text-gray-500 flex justify-end">{formState.front.length}/220</div>
            </div>

            {/* Back side textarea */}
            <div className="space-y-2">
              <Label htmlFor="back" className="font-medium text-airbnb-hof">
                Back
              </Label>
              <Textarea
                id="back"
                name="back"
                value={formState.back}
                onChange={handleChange}
                placeholder="Back side content"
                className={`min-h-[150px] resize-none ${formState.errors.back ? "border-red-500" : ""}`}
                disabled={formState.isSubmitting}
              />
              {formState.errors.back && <p className="text-xs text-red-500">{formState.errors.back}</p>}
              <div className="text-xs text-gray-500 flex justify-end">{formState.back.length}/500</div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={formState.isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formState.isSubmitting || !hasChanges}
              className={`${hasChanges ? "bg-airbnb-rausch hover:bg-[#FF385C]" : "bg-gray-300 cursor-not-allowed"}`}
            >
              {formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
