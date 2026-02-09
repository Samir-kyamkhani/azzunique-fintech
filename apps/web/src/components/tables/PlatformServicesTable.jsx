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
    render: (row) => (row.isActive ? "Active" : "Inactive"),
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
  data,
  onAdd,
  onEdit,
  onView,
  onDelete,
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
        onExport={() => {}}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={data}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onExtraActions={extraActions}
      />
    </TableShell>
  );
}
