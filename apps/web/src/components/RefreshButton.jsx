"use client";

import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RefreshButton({
  onClick,
  loading = false,
  label = "Refresh",
  size = "sm",
  variant = "outline",
  className,
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={loading}
      className={className}
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {label}
    </Button>
  );
}
