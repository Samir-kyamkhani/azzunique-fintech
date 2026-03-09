"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";

import { Layers, Download } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const columns = [
  { key: "id", label: "ID" },
  { key: "code", label: "Code" },
  { key: "name", label: "Name" },
  {
    key: "isActive",
    label: "Active",
    render: (row) => (
      <span
        className={`px-2 py-1 text-xs rounded ${
          row.isActive
            ? "bg-green-500/10 text-green-400"
            : "bg-red-500/10 text-red-400"
        }`}
      >
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
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
  { key: "actions", label: "Actions" },
];

export default function PlatformServicesTable({
  data = [],
  loading = false,
  onAdd,
  onEdit,
  onView,
  onDelete,
  onExport,
  extraActions,
}) {
  return (
    <TableShell>
      <TableHeader
        title="Platform Services"
        subtitle={`${data.length} services`}
        onAdd={onAdd}
        addLabel="Add Service"
        addIcon={Layers}
        onExport={onExport}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={data}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onExtraActions={extraActions}
      />
    </TableShell>
  );
}
