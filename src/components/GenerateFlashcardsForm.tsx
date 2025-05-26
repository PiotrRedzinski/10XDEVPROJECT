import { useCallback } from "react";
import type { GeneratedFlashcard, UpdateFlashcardCommand } from "@/types";
import { useFlashcardGeneration } from "./hooks/useFlashcardGeneration";
import { FlashcardGenerationService } from "@/lib/services/flashcardGeneration";
import { FlashcardGenerationForm } from "./flashcard-generation/FlashcardGenerationForm";
import { FlashcardList } from "./flashcard-generation/FlashcardList";
import EditFlashcardDialog from "./EditFlashcardDialog";

export default function GenerateFlashcardsForm() {
  const {
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
  } = useFlashcardGeneration();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateText(state.text);
      if (validationError) {
        setError({ message: validationError });
        return;
      }

      setLoading(true);

      const result = await FlashcardGenerationService.generateFlashcards(state.text);

      if (result.error) {
        setError(result.error);
      } else {
        setFlashcards(result.flashcards);
      }
    },
    [state.text, setError, setLoading, setFlashcards, validateText]
  );

  const handleAcceptCard = useCallback(
    async (card: GeneratedFlashcard) => {
      const updatedCard = { ...card, status: "accepted-original" as const };
      updateFlashcard(card.id, updatedCard);
    },
    [updateFlashcard]
  );

  const handleRejectCard = useCallback(
    async (card: GeneratedFlashcard) => {
      const updatedCard = { ...card, status: "rejected" as const };
      updateFlashcard(card.id, updatedCard);
    },
    [updateFlashcard]
  );

  const handleEditCard = useCallback(
    (card: GeneratedFlashcard) => {
      startEditing(card.id, card.front, card.back);
    },
    [startEditing]
  );

  const handleSaveEdit = useCallback(
    async (id: string, data: UpdateFlashcardCommand) => {
      const result = await FlashcardGenerationService.updateFlashcard(id, data);

      if (result.error) {
        setError(result.error);
        return false;
      }

      if (result.flashcard) {
        const updatedCard = {
          ...result.flashcard,
          status: "accepted-edited" as const,
        };
        updateFlashcard(id, updatedCard);
      }

      return true;
    },
    [setError, updateFlashcard]
  );

  return (
    <div className="space-y-8">
      <FlashcardGenerationForm
        text={state.text}
        characterCount={state.characterCount}
        error={state.error}
        isLoading={state.isLoading}
        onTextChange={handleTextChange}
        onSubmit={handleSubmit}
        getCharacterCountColor={getCharacterCountColor}
      />

      {state.generatedFlashcards && (
        <FlashcardList
          flashcards={state.generatedFlashcards}
          onAccept={handleAcceptCard}
          onReject={handleRejectCard}
          onEdit={handleEditCard}
        />
      )}

      {state.editingFlashcardId && state.editingFlashcard && (
        <EditFlashcardDialog
          id={state.editingFlashcardId}
          initialData={state.editingFlashcard}
          onCancel={cancelEditing}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
