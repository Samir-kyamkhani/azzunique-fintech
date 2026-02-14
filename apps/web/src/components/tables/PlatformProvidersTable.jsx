"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import { Server, Download } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const columns = [
  { key: "id", label: "ID" },
  { key: "platformServiceId", label: "Service ID" },
  { key: "code", label: "Code" },
  { key: "providerName", label: "Provider Name" },
  {
    key: "isActive",
    label: "Status",
    render: (row) =>
      row.isActive ? <span>Active</span> : <span>Inactive</span>,
  },
  {
    key: "createdAt",
    label: "Created At",
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    key: "updatedAt",
    label: "Updated At",
    render: (row) => formatDateTime(row.updatedAt),
  },

  {
    key: "handler",
    label: "Handler",
    render: (row) => (
      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
        {row.handler}
      </code>
    ),
  },

  { key: "actions", label: "Actions" },
];

export default function PlatformProvidersTable({
  data = [],
  onAdd,
  onEdit,
  onDelete,
  extraActions,
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
        onDelete={onDelete}
        onExtraActions={extraActions}
      />
    </TableShell>
  );
}
