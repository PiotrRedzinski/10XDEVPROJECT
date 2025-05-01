import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { FlashcardDTO } from "@/types";

interface FlashcardCardProps {
  flashcard: FlashcardDTO;
  onEditClick: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

export default function FlashcardCard({ flashcard, onEditClick, onDeleteClick }: FlashcardCardProps) {
  // Truncate text if it's too long for display
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Bezpieczne handlery, które sprawdzają czy funkcje zwrotne istnieją
  const handleEditClick = () => {
    if (typeof onEditClick === "function") {
      onEditClick(flashcard.id);
    }
  };

  const handleDeleteClick = () => {
    if (typeof onDeleteClick === "function") {
      onDeleteClick(flashcard.id);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <div className="font-medium text-airbnb-hof">Front</div>
      </CardHeader>
      <CardContent className="pt-4 pb-6 flex-grow">
        <p className="text-airbnb-hof break-words">{truncateText(flashcard.front, 150)}</p>
      </CardContent>

      <CardHeader className="bg-gray-50 border-y pb-3">
        <div className="font-medium text-airbnb-hof">Back</div>
      </CardHeader>
      <CardContent className="pt-4 pb-6 flex-grow">
        <p className="text-airbnb-foggy break-words">{truncateText(flashcard.back, 200)}</p>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between bg-gray-50">
        <Button
          variant="outline"
          onClick={handleEditClick}
          className="text-airbnb-babu border-airbnb-babu hover:bg-airbnb-babu hover:text-white"
        >
          Edit
        </Button>
        <Button
          variant="outline"
          onClick={handleDeleteClick}
          className="text-airbnb-rausch border-airbnb-rausch hover:bg-airbnb-rausch hover:text-white"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
