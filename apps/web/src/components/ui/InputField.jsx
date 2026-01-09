"use client";

import { cn } from "@/lib/utils";

export default function InputField({
  label,
  type = "text",
  placeholder,
  register,
  name,
  required = false,
  disabled = false,
  rightIcon,
  onRightIconClick,
  autoComplete,
  inputMode,
  pattern,
  maxLength,
  onInput,
  error,
}) {
  return (
    <div className="space-y-1.5">
      {/* LABEL */}
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      {/* INPUT */}
      <div className="relative">
        <input
          {...(register ? register(name) : {})}
          type={type}
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          onInput={onInput}
          className={cn(
            `
            w-full h-10 px-3 pr-10
            rounded-border border bg-background text-foreground
            transition focus:outline-none focus:ring-2
            placeholder:text-muted-foreground
            disabled:opacity-60 disabled:cursor-not-allowed
          `,
            error
              ? "border-destructive focus:ring-destructive/30"
              : "border-input focus:ring-ring"
          )}
        />

        {/* RIGHT ICON */}
        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {/* FIELD ERROR */}
      {error && (
        <p className="text-xs text-red-500 leading-tight">{error.message}</p>
      )}
    </div>
  );
}
