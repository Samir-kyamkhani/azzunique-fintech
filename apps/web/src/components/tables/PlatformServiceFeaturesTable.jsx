"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";

import { formatDateTime } from "@/lib/utils";
import { Layers, Download } from "lucide-react";

const columns = [
  {
    key: "code",
    label: "Code",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "isActive",
    label: "Status",
    render: (row) => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium `}
      >
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "platformServiceId",
    label: "Service ID",
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
    key: "actions",
    label: "Actions",
  },
];

export default function PlatformServiceFeaturesTable({
  data = [],
  service,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <TableShell>
      <TableHeader
        title={`Features (${service?.name || ""})`}
        subtitle={`${data.length} features`}
        onAdd={onAdd}
        addLabel="Add Feature"
        addIcon={Layers}
        onExport={() => {}}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={data}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </TableShell>
  );
}
