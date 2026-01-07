"use client";

import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="relative glass rounded-lg-border shadow-lg-border p-10 max-w-md w-full text-center border border-border/60">
        {/* Decorative glow */}
        <div className="absolute -top-6 -left-6 h-24 w-24 bg-primary/20 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-theme/20 rounded-full blur-3xl opacity-40" />

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-18 w-18 rounded-full bg-destructive/10 flex items-center justify-center shadow-inner">
            <AlertTriangle className="h-9 w-9 text-destructive" />
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold text-gradient-theme mb-3">
          404
        </h1>

        <p className="text-xl font-semibold text-foreground mb-2">
          Page Not Found
        </p>

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re trying to access doesn&apos;t exist, was removed,
          or you don&apos;t have permission to view it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-theme text-primary-foreground rounded-border hover:opacity-90 transition-all font-medium shadow-border"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-border hover:bg-accent transition-all font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
