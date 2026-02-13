"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import { Server, Download } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const columns = [
  { key: "id", label: "ID" },
  { key: "code", label: "Code" },
  { key: "providerName", label: "Provider Name" },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (row.isActive ? "Active" : "Inactive"),
  },
  {
    key: "createdAt",
    label: "Created At",
    render: (row) => formatDateTime(row.createdAt),
  },
  { key: "actions", label: "Actions" },
];

export default function PlatformProvidersTable({
  data,
  onAdd,
  onEdit,
  onView,
  onDelete,
}) {
  return (
    <TableShell>
      <TableHeader
        title="Platform Providers"
        subtitle={`${data.length} providers`}
        onAdd={onAdd}
        addLabel="Add Provider"
        addIcon={Server}
        onExport={() => {}}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={data}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
      />
    </TableShell>
  );
}
