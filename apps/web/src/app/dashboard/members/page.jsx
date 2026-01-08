"use client";

import UsersTable from "@/components/tables/UsersTable";

export default function UsersPage() {
  return (
    <div className="p-6">
      {/* PAGE TITLE */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all users in your organization
        </p>
      </div>

      <UsersTable />
    </div>
  );
}
