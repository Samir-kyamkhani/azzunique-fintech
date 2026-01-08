"use client";

import MemberForm from "../forms/MemberForm";
import Button from "../ui/Button";

export default function MemberModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card w-full max-w-2xl rounded-lg-border shadow-lg-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-semibold">Add User</h3>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Form */}
        <div className="p-6">
          <MemberForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}
