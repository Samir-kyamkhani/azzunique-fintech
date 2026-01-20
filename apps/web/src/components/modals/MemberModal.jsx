"use client";

import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import MemberForm from "../forms/MemberForm.jsx";
import Button from "../ui/Button.jsx";
import { User, X } from "lucide-react";

export default function MemberModal({
  open,
  onClose,
  onSubmit,
  isEditing = false,
  initialData,
}) {
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="relative bg-gradient-theme px-6 py-8 border-b border-border">
          {/* Close button */}
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close modal"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary-foreground/20 rounded-full">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-primary-foreground mb-2">
              {isEditing ? "Update Member" : "Create Member"}
            </h2>

            <p className="text-primary-foreground/90 text-sm">
              {isEditing
                ? "Manage member account and permissions"
                : "Add a new member to your organization"}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6">
          <MemberForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
}
