"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TablePagination({ page, setPage, total, perPage }) {
  if (total === 0) return null;

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)}{" "}
        of {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 border border-input rounded-border hover:bg-accent disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded-border text-sm
              ${
                page === i + 1
                  ? "bg-primary text-primary-foreground"
                  : "border border-input hover:bg-accent"
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="p-2 border border-input rounded-border hover:bg-accent disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
