import { useState } from "react";
import type { GeneratedFlashcard, UpdateFlashcardCommand } from "@/types";

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

const MIN_CHARS = 1000;
const MAX_CHARS = 10000;

export function useFlashcardGeneration() {
  const [state, setState] = useState<GenerateFormState>({
    text: "",
    isLoading: false,
    error: null,
    characterCount: 0,
    generatedFlashcards: null,
    editingFlashcardId: null,
    editingFlashcard: null,
  });

  const validateText = (text: string): string | null => {
    if (text.length < MIN_CHARS) {
      return `Please enter at least ${MIN_CHARS} characters`;
    }
    if (text.length > MAX_CHARS) {
      return `Text cannot exceed ${MAX_CHARS} characters`;
    }
    return null;
  };

  const handleTextChange = (text: string) => {
    const validationError = validateText(text);
    setState((prev) => ({
      ...prev,
      text,
      characterCount: text.length,
      error: validationError ? { message: validationError } : null,
      generatedFlashcards: null, // Reset generated cards when text changes
    }));
  };

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setError = (error: GenerateFormState["error"]) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  };

  const setFlashcards = (flashcards: GeneratedFlashcard[] | null) => {
    setState((prev) => ({
      ...prev,
      generatedFlashcards: flashcards,
      isLoading: false,
      success: true,
    }));
  };

  const startEditing = (cardId: string, front: string, back: string) => {
    setState((prev) => ({
      ...prev,
      editingFlashcardId: cardId,
      editingFlashcard: { front, back },
    }));
  };

  const cancelEditing = () => {
    setState((prev) => ({
      ...prev,
      editingFlashcardId: null,
      editingFlashcard: null,
    }));
  };

  const updateFlashcard = (cardId: string, updatedCard: GeneratedFlashcard) => {
    setState((prev) => ({
      ...prev,
      generatedFlashcards: prev.generatedFlashcards?.map((card) => (card.id === cardId ? updatedCard : card)) ?? null,
      editingFlashcardId: null,
      editingFlashcard: null,
    }));
  };

  const getCharacterCountColor = () => {
    if (state.characterCount < MIN_CHARS) return "text-red-500";
    if (state.characterCount > MAX_CHARS) return "text-red-500";
    return "text-green-500";
  };

  return {
    state,
    handleTextChange,
    setLoading,
    setError,
    setFlashcards,
    startEditing,
    cancelEditing,
    updateFlashcard,
    getCharacterCountColor,
    validateText,
  };
}
