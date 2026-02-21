"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import { Globe } from "lucide-react";

const columns = [
  { key: "internalCircleCode", label: "Internal Circle Code" },
  { key: "providerCircleCode", label: "Provider Circle Code" },
  { key: "platformServiceId", label: "Service ID" },
  { key: "serviceProviderId", label: "Provider ID" },
  { key: "actions", label: "Actions" },
];

export default function CircleMapsTable({ data = [], onAdd, onEdit }) {
  return (
    <TableShell>
      <TableHeader
        title="Circle Maps"
        subtitle={`${data.length} mappings`}
        onAdd={onAdd}
        addLabel="Add Mapping"
        addIcon={Globe}
      />

      <TableBody columns={columns} data={data} onEdit={onEdit} />
    </TableShell>
  );
}
