"use client";

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
}) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label} {required && "*"}
        </label>
      )}

      <input
        {...register(name)}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-input bg-background text-foreground rounded-border
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
          transition-colors placeholder:text-muted-foreground
          ${rightIcon ? "pr-10" : ""}`}
      />

      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          disabled={disabled}
          className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
        >
          {rightIcon}
        </button>
      )}
    </div>
  );
}
