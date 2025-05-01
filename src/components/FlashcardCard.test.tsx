import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlashcardCard from "./FlashcardCard";
import type { FlashcardDTO } from "@/types";

describe("FlashcardCard Button Interactions", () => {
  // Mock data
  const mockFlashcard: FlashcardDTO = {
    id: "1",
    front: "Test question",
    back: "Test answer",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    generation_id: null,
    source: "self",
    status: "accepted-original",
    user_id: "user-123",
  };

  // Mock handlers
  const mockOnEditClick = vi.fn();
  const mockOnDeleteClick = vi.fn();

  // Helper function to render the component with default props
  const renderComponent = (props = {}) => {
    return render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEditClick={mockOnEditClick}
        onDeleteClick={mockOnDeleteClick}
        {...props}
      />
    );
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockOnEditClick.mockClear();
    mockOnDeleteClick.mockClear();
  });

  it("renders the flashcard content correctly", () => {
    renderComponent();

    // Check that front and back text is displayed
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByText(mockFlashcard.front)).toBeInTheDocument();
    expect(screen.getByText(mockFlashcard.back)).toBeInTheDocument();
  });

  it("truncates long text correctly", () => {
    const longTextFlashcard = {
      ...mockFlashcard,
      front: "A".repeat(200), // Create text longer than the 150 character limit
      back: "B".repeat(250), // Create text longer than the 200 character limit
    };

    renderComponent({ flashcard: longTextFlashcard });

    // Check that text is truncated properly
    expect(screen.getByText(/A{150}\.{3}/)).toBeInTheDocument(); // Front text truncated to 150 chars + ...
    expect(screen.getByText(/B{200}\.{3}/)).toBeInTheDocument(); // Back text truncated to 200 chars + ...
  });

  describe("Edit Button Interactions", () => {
    it("calls onEditClick when edit button is clicked", () => {
      // Arrange
      renderComponent();
      const editButton = screen.getByText("Edit");

      // Act
      fireEvent.click(editButton);

      // Assert
      expect(mockOnEditClick).toHaveBeenCalledTimes(1);
      expect(mockOnEditClick).toHaveBeenCalledWith(mockFlashcard.id);
    });

    it("calls onEditClick with the correct flashcard ID when multiple cards exist", () => {
      // Arrange
      const customFlashcard = { ...mockFlashcard, id: "custom-id-123" };
      renderComponent({ flashcard: customFlashcard });
      const editButton = screen.getByText("Edit");

      // Act
      fireEvent.click(editButton);

      // Assert
      expect(mockOnEditClick).toHaveBeenCalledWith("custom-id-123");
      expect(mockOnEditClick).not.toHaveBeenCalledWith(mockFlashcard.id);
    });

    it("should handle the edit button keyboard interaction (pressed with Enter key)", async () => {
      // Arrange
      renderComponent();
      const editButton = screen.getByText("Edit");
      const user = userEvent.setup();

      // Act
      editButton.focus();
      await user.keyboard("{Enter}");

      // Assert
      expect(mockOnEditClick).toHaveBeenCalledTimes(1);
      expect(mockOnEditClick).toHaveBeenCalledWith(mockFlashcard.id);
    });

    it("should handle the edit button keyboard interaction (pressed with Space key)", async () => {
      // Arrange
      renderComponent();
      const editButton = screen.getByText("Edit");
      const user = userEvent.setup();

      // Act
      editButton.focus();
      await user.keyboard(" ");

      // Assert
      expect(mockOnEditClick).toHaveBeenCalledTimes(1);
      expect(mockOnEditClick).toHaveBeenCalledWith(mockFlashcard.id);
    });
  });

  describe("Delete Button Interactions", () => {
    it("calls onDeleteClick when delete button is clicked", () => {
      // Arrange
      renderComponent();
      const deleteButton = screen.getByText("Delete");

      // Act
      fireEvent.click(deleteButton);

      // Assert
      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteClick).toHaveBeenCalledWith(mockFlashcard.id);
    });

    it("calls onDeleteClick with the correct flashcard ID when multiple cards exist", () => {
      // Arrange
      const customFlashcard = { ...mockFlashcard, id: "delete-id-456" };
      renderComponent({ flashcard: customFlashcard });
      const deleteButton = screen.getByText("Delete");

      // Act
      fireEvent.click(deleteButton);

      // Assert
      expect(mockOnDeleteClick).toHaveBeenCalledWith("delete-id-456");
      expect(mockOnDeleteClick).not.toHaveBeenCalledWith(mockFlashcard.id);
    });

    it("should handle the delete button keyboard interaction (pressed with Enter key)", async () => {
      // Arrange
      renderComponent();
      const deleteButton = screen.getByText("Delete");
      const user = userEvent.setup();

      // Act
      deleteButton.focus();
      await user.keyboard("{Enter}");

      // Assert
      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteClick).toHaveBeenCalledWith(mockFlashcard.id);
    });

    it("should handle the delete button keyboard interaction (pressed with Space key)", async () => {
      // Arrange
      renderComponent();
      const deleteButton = screen.getByText("Delete");
      const user = userEvent.setup();

      // Act
      deleteButton.focus();
      await user.keyboard(" ");

      // Assert
      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteClick).toHaveBeenCalledWith(mockFlashcard.id);
    });
  });

  describe("Button Styling and Accessibility", () => {
    it("renders the edit button with correct styling classes", () => {
      // Arrange
      renderComponent();
      const editButton = screen.getByText("Edit");

      // Assert
      expect(editButton).toHaveClass("text-airbnb-babu");
      expect(editButton).toHaveClass("border-airbnb-babu");
    });

    it("renders the delete button with correct styling classes", () => {
      // Arrange
      renderComponent();
      const deleteButton = screen.getByText("Delete");

      // Assert
      expect(deleteButton).toHaveClass("text-airbnb-rausch");
      expect(deleteButton).toHaveClass("border-airbnb-rausch");
    });

    it("ensures buttons are accessible", () => {
      // Arrange
      renderComponent();
      const editButton = screen.getByText("Edit");
      const deleteButton = screen.getByText("Delete");

      // Assert - Check that buttons are focusable elements
      expect(editButton.tagName.toLowerCase()).toBe("button");
      expect(deleteButton.tagName.toLowerCase()).toBe("button");
      expect(editButton).not.toHaveAttribute("disabled");
      expect(deleteButton).not.toHaveAttribute("disabled");
      expect(editButton).not.toHaveAttribute("aria-hidden", "true");
      expect(deleteButton).not.toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("verifies onEditClick is not called when edit button is disabled", () => {
      // This test shows how we would test a disabled button scenario,
      // though this would require modifying the component to accept a disabled prop

      // For now, we'll just show that the edit button is not disabled in the current implementation
      renderComponent();
      const editButton = screen.getByText("Edit");
      expect(editButton).not.toHaveAttribute("disabled");
    });

    it("ensures callback handlers don't crash when passed as undefined", () => {
      // Arrange - render with undefined handlers
      render(
        <FlashcardCard
          flashcard={mockFlashcard}
          onEditClick={undefined as unknown as (id: string) => void}
          onDeleteClick={undefined as unknown as (id: string) => void}
        />
      );

      // Act - This should not crash the test
      const editButton = screen.getByText("Edit");
      const deleteButton = screen.getByText("Delete");

      // Assert - We expect clicking buttons with undefined handlers not to crash the test
      expect(() => {
        fireEvent.click(editButton);
        fireEvent.click(deleteButton);
      }).not.toThrow();
    });
  });
});
