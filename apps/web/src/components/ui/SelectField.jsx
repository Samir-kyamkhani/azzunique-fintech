"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import Button from "@/components/ui/Button.jsx";
import { cn } from "@/lib/utils";

export default function SelectField({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  error,
}) {
  const [open, setOpen] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        icon={ChevronDown}
        iconPosition="right"
        className="w-full justify-between"
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-border border border-border bg-card shadow-lg-border">
          {options.map((opt) => {
            const isActive = opt.value === value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "group relative flex w-full items-center justify-between px-4 py-2 text-sm text-left",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:bg-accent",
                  isActive
                    ? "bg-theme/10 text-theme font-medium"
                    : "hover:bg-accent"
                )}
              >
                {/* Left theme indicator */}
                <span
                  className={cn(
                    "absolute left-0 top-0 h-full w-1 bg-theme transition-opacity",
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                />

                <span className="truncate">{opt.label}</span>

                {isActive && <Check className="h-4 w-4 text-theme shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
