import React from "react";

export default function InputField({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              h-4 w-4 text-muted-foreground
              pointer-events-none
            "
          />
        )}

        {React.isValidElement(children) &&
          React.cloneElement(children, {
            className: [
              "input",
              Icon ? "pl-10" : "",
              "h-10", // 🔥 consistent height
            ]
              .filter(Boolean)
              .join(" "),
          })}
      </div>

      {error && (
        <p className="text-xs text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}
