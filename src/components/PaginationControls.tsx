import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationDTO } from "@/types";

interface PaginationControlsProps {
  pagination: PaginationDTO;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate range of pages to show (always show 5 pages if possible, centered around current page)
  const createPageRange = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];

    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);

    // Adjust start and end to always show 5 pages if possible
    if (end - start + 1 < 5 && totalPages >= 5) {
      if (start === 1) {
        end = Math.min(5, totalPages);
      } else if (end === totalPages) {
        start = Math.max(1, totalPages - 4);
      }
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const pageRange = createPageRange();

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="h-9 w-9 p-0"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page 1 and ellipsis if necessary */}
      {pageRange[0] > 1 && (
        <>
          <Button
            variant={page === 1 ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(1)}
            className="h-9 w-9 p-0"
          >
            1
          </Button>
          {pageRange[0] > 2 && <span className="mx-1 text-gray-500">...</span>}
        </>
      )}

      {/* Page numbers */}
      {pageRange.map((pageNum) => (
        <Button
          key={pageNum}
          variant={page === pageNum ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(pageNum)}
          className={`h-9 w-9 p-0 ${page === pageNum ? "bg-airbnb-rausch hover:bg-airbnb-rausch/90" : ""}`}
        >
          {pageNum}
        </Button>
      ))}

      {/* Last page and ellipsis if necessary */}
      {pageRange[pageRange.length - 1] < totalPages && (
        <>
          {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="mx-1 text-gray-500">...</span>}
          <Button
            variant={page === totalPages ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-9 w-9 p-0"
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="h-9 w-9 p-0"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Page info */}
      <div className="text-sm text-airbnb-foggy ml-4">
        <span>
          {total > 0 ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)} of ${total}` : "No results"}
        </span>
      </div>
    </div>
  );
}
