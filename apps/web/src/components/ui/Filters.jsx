"use client";

export default function TableFilters({ value, onChange, options = [] }) {
  if (!options.length) return null;

  return (
    <div className="px-6 py-3 border-b border-border flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-border text-sm transition-colors
            ${
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "border border-input hover:bg-accent"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
