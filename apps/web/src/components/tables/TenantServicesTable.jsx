"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import { Layers } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const columns = [
  { key: "tenantName", label: "Tenant" },

  { key: "platformServiceName", label: "Service" },

  {
    key: "isEnabled",
    label: "Status",
    render: (row) =>
      row.isEnabled ? (
        <span className="text-green-600 font-medium">Enabled</span>
      ) : (
        <span className="text-red-600 font-medium">Disabled</span>
      ),
  },

  {
    key: "createdAt",
    label: "Created",
    render: (row) => formatDateTime(row.createdAt),
  },

  {
    key: "updatedAt",
    label: "Updated",
    render: (row) => formatDateTime(row.updatedAt),
  },

  { key: "actions", label: "Actions" },
];

export default function TenantServicesTable({
  data,
  loading,
  onAdd,
  extraActions,
}) {
  return (
    <TableShell>
      <TableHeader
        title="Tenant Services"
        subtitle={`${data.length} records`}
        onAdd={onAdd}
        addLabel="Enable Service"
        addIcon={Layers}
      />

      <TableBody
        columns={columns}
        data={data}
        loading={loading}
        onExtraActions={extraActions}
      />
    </TableShell>
  );
}
