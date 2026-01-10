"use client";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">General Settings</h2>

      <div className="rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">
          Tenant name, domain, branding, timezone, etc.
        </p>
      </div>
    </div>
  );
}
