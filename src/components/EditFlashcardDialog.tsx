import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import type { UpdateFlashcardCommand } from "@/types";

export interface EditFlashcardDialogProps {
  id: string;
  initialData: {
    front: string;
    back: string;
  };
  onCancel: () => void;
  onSave: (id: string, data: UpdateFlashcardCommand) => Promise<boolean>;
}

export default function EditFlashcardDialog({ id, initialData, onCancel, onSave }: EditFlashcardDialogProps) {
  const [data, setData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await onSave(id, data);
      if (success) {
        onCancel();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="front">Front</Label>
            <Textarea
              id="front"
              value={data.front}
              onChange={(e) => setData((prev) => ({ ...prev, front: e.target.value }))}
              placeholder="Front side of the flashcard"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">Back</Label>
            <Textarea
              id="back"
              value={data.back}
              onChange={(e) => setData((prev) => ({ ...prev, back: e.target.value }))}
              placeholder="Back side of the flashcard"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
