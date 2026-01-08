"use client";

import { Search } from "lucide-react";

export default function SearchField({
  value,
  onChange,
  placeholder = "Search...",
  width = "md:w-64",
}) {
  return (
    <div className={`relative w-full ${width}`}>
      <Search className="absolute left-3 top-3   h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-border
          focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
