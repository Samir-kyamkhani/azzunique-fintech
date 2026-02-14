"use client";

export default function AdminServicesLayout({ children }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Admin Services</h1>
        <p className="text-sm text-muted-foreground">
          Manage platform level services
        </p>
      </div>

      <div>{children}</div>
    </div>
  );
}
