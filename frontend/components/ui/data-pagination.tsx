'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit?: number;
}

interface DataPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showLimitSelector?: boolean;
  limitOptions?: number[];
  className?: string;
}

export function DataPagination({
  pagination,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  limitOptions = [5, 10, 20, 50],
  className = ''
}: DataPaginationProps) {
  const { current, pages, total, limit: paginationLimit } = pagination;
  
  // Use limit from pagination object or calculate from total and current page
  const limit = paginationLimit || Math.ceil(total / pages) || 10;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(pages - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < pages - 1) {
      rangeWithDots.push('...', pages);
    } else if (pages > 1) {
      rangeWithDots.push(pages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pages && page !== current) {
      onPageChange(page);
    }
  };

  const handleLimitChange = (newLimit: string) => {
    if (onLimitChange) {
      onLimitChange(parseInt(newLimit));
    }
  };

  if (pages <= 1 && !showLimitSelector) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Hiển thị {Math.min((current - 1) * limit + 1, total)} - {Math.min(current * limit, total)} của {total} kết quả
      </div>

      <div className="flex items-center gap-4">
        {/* Limit selector */}
        {showLimitSelector && onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hiển thị:</span>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pagination controls */}
        {pages > 1 && (
          <div className="flex items-center gap-1">
            {/* First page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={current === 1}
              className="h-8 w-8 p-0"
              title="Trang đầu"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(current - 1)}
              disabled={current === 1}
              className="h-8 w-8 p-0"
              title="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {visiblePages.map((page, index) => (
              <Button
                key={index}
                variant={page === current ? "default" : "outline"}
                size="sm"
                onClick={() => typeof page === 'number' && handlePageChange(page)}
                disabled={page === '...'}
                className="h-8 w-8 p-0"
                title={typeof page === 'number' ? `Trang ${page}` : undefined}
              >
                {page}
              </Button>
            ))}

            {/* Next page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(current + 1)}
              disabled={current === pages}
              className="h-8 w-8 p-0"
              title="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pages)}
              disabled={current === pages}
              className="h-8 w-8 p-0"
              title="Trang cuối"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}