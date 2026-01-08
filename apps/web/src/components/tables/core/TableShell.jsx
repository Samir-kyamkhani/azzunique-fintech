"use client";

export default function TableShell({ children }) {
  return (
    <div className="bg-card border border-border rounded-lg-border shadow-border">
      {children}
    </div>
  );
}
