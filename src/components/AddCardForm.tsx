import { useState } from "react";
import type { CreateFlashcardCommand } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

/**
 * ViewModel for the add card form
 */
interface AddCardFormViewModel {
  front: string;
  back: string;
  isSubmitting: boolean;
  errors: {
    front?: string;
    back?: string;
    api?: string;
  };
  success: boolean;
}

/**
 * Component for adding new flashcards manually
 */
export default function AddCardForm() {
  // Form state
  const [formState, setFormState] = useState<AddCardFormViewModel>({
    front: "",
    back: "",
    isSubmitting: false,
    errors: {},
    success: false,
  });

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
      success: false, // Reset success state if user starts editing again
    }));
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: AddCardFormViewModel["errors"] = {};

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

    // Validate form first
    if (!validateForm()) return;

    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      success: false,
      errors: {},
    }));

    try {
      // Prepare flashcard data
      const flashcardData: CreateFlashcardCommand = {
        front: formState.front.trim(),
        back: formState.back.trim(),
        generation_id: null, // Manual creation
        status: "accepted-original", // Set default status for manually created cards
      };

      // Send POST request to create flashcard
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flashcardData),
      });

      if (!response.ok) {
        // Handle error responses from API
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error: ${response.status}`);
      }

      // Reset form and show success message on successful creation
      setFormState({
        front: "",
        back: "",
        isSubmitting: false,
        errors: {},
        success: true,
      });
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
    <div>
      {/* Success message */}
      {formState.success && (
        <div className="bg-green-50 text-green-700 p-3 mb-4 rounded-md flex items-center gap-2 text-sm">
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">Flashcard created successfully!</span>
        </div>
      )}

      {/* API Error Message */}
      {formState.errors.api && (
        <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{formState.errors.api}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Front side input */}
        <div className="space-y-1">
          <Label htmlFor="front" className="font-medium text-airbnb-hof">
            Front
          </Label>
          <Input
            id="front"
            name="front"
            value={formState.front}
            onChange={handleChange}
            placeholder="Question or term"
            className={`text-base ${formState.errors.front ? "border-red-500" : ""}`}
            disabled={formState.isSubmitting}
          />
          {formState.errors.front && <p className="text-sm text-red-500">{formState.errors.front}</p>}
          <div className="text-xs text-gray-500 flex justify-end">{formState.front.length}/220</div>
        </div>

        {/* Back side textarea */}
        <div className="space-y-1">
          <Label htmlFor="back" className="font-medium text-airbnb-hof">
            Back
          </Label>
          <Textarea
            id="back"
            name="back"
            value={formState.back}
            onChange={handleChange}
            placeholder="Answer or definition"
            className={`min-h-[150px] ${formState.errors.back ? "border-red-500" : ""}`}
            disabled={formState.isSubmitting}
          />
          {formState.errors.back && <p className="text-sm text-red-500">{formState.errors.back}</p>}
          <div className="text-xs text-gray-500 flex justify-end">{formState.back.length}/500</div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="bg-airbnb-rausch hover:bg-[#FF385C] text-white px-6 py-2 text-base"
          >
            {formState.isSubmitting ? "Creating..." : "Add Flashcard"}
          </Button>
        </div>
      </form>
    </div>
  );
}
