import { useState, useEffect } from "react";
import type { FlashcardDTO, PaginationDTO, UpdateFlashcardCommand } from "@/types";
import FlashcardCard from "./FlashcardCard";
import EditFlashcardDialog from "./EditFlashcardDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import PaginationControls from "./PaginationControls";

/**
 * ViewModel for the flashcard list component
 */
interface FlashcardListViewModel {
  flashcards: FlashcardDTO[];
  pagination: PaginationDTO | null;
  isLoading: boolean;
  error: string | null;
  editingFlashcardId: string | null;
  deletingFlashcardId: string | null;
}

/**
 * Component that displays a list of flashcards in a grid
 */
export default function FlashcardList() {
  // Component state using the FlashcardListViewModel
  const [state, setState] = useState<FlashcardListViewModel>({
    flashcards: [],
    pagination: null,
    isLoading: true,
    error: null,
    editingFlashcardId: null,
    deletingFlashcardId: null,
  });

  // Get the flashcard being edited (if any)
  const flashcardBeingEdited = state.editingFlashcardId
    ? state.flashcards.find((f) => f.id === state.editingFlashcardId) || null
    : null;

  // Default pagination values
  const defaultPage = 1;
  const defaultLimit = 9; // 3 x 3 grid

  // Fetch flashcards from the API
  const fetchFlashcards = async (page = defaultPage, limit = defaultLimit) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/flashcards?page=${page}&limit=${limit}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        flashcards: data.flashcards,
        pagination: data.pagination,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const limit = state.pagination?.limit || defaultLimit;
    fetchFlashcards(newPage, limit);

    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle editing a flashcard
  const handleEditClick = (id: string) => {
    setState((prev) => ({ ...prev, editingFlashcardId: id }));
  };

  // Handle saving edited flashcard
  const handleSaveEdit = async (id: string, data: UpdateFlashcardCommand): Promise<boolean> => {
    try {
      // Add accepted-edited status to the update data
      const updateData: UpdateFlashcardCommand = {
        ...data,
        status: "accepted-edited",
      };

      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }

      const updatedFlashcard = await response.json();

      // Update the flashcard in the local state
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((f) => (f.id === id ? updatedFlashcard : f)),
        editingFlashcardId: null,
      }));

      return true;
    } catch (error) {
      console.error("Failed to update flashcard:", error);
      return false;
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setState((prev) => ({ ...prev, editingFlashcardId: null }));
  };

  // Handle deleting a flashcard
  const handleDeleteClick = (id: string) => {
    setState((prev) => ({ ...prev, deletingFlashcardId: id }));
  };

  // Handle confirming delete
  const handleConfirmDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error: ${response.status}`);
      }

      // Clear the deleting flashcard ID
      setState((prev) => ({
        ...prev,
        deletingFlashcardId: null,
      }));

      // Refresh the flashcard list with current pagination
      const currentPage = state.pagination?.page || defaultPage;
      const limit = state.pagination?.limit || defaultLimit;

      // Fetch updated flashcards from the server
      await fetchFlashcards(currentPage, limit);

      return true;
    } catch (error) {
      console.error("Failed to delete flashcard:", error);
      return false;
    }
  };

  // Handle canceling delete
  const handleCancelDelete = () => {
    setState((prev) => ({ ...prev, deletingFlashcardId: null }));
  };

  // Fetch flashcards on component mount
  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Handle error state
  if (state.error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center border border-red-100 mb-4">
        <div className="text-red-600 font-medium">Failed to load flashcards</div>
        <p className="text-red-500 text-sm">{state.error}</p>
        <button
          onClick={() => fetchFlashcards()}
          className="mt-2 text-white bg-airbnb-rausch px-3 py-1 text-sm rounded-lg hover:bg-[#FF385C]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle loading state
  if (state.isLoading) {
    return (
      <div className="w-full py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (state.flashcards.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center border border-gray-100">
        <h2 className="font-medium text-airbnb-hof">No flashcards yet</h2>
        <a
          href="/addCard"
          className="mt-2 inline-block bg-airbnb-rausch text-white px-3 py-1 text-sm rounded-lg hover:bg-[#FF385C]"
        >
          Add New Flashcard
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Flashcard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* Pagination */}
      {state.pagination && <PaginationControls pagination={state.pagination} onPageChange={handlePageChange} />}

      {/* Edit dialog */}
      <EditFlashcardDialog
        flashcard={flashcardBeingEdited}
        isOpen={state.editingFlashcardId !== null}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        flashcardId={state.deletingFlashcardId}
        isOpen={state.deletingFlashcardId !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
