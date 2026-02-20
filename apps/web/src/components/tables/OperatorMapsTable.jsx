"use client";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import { Wrench } from "lucide-react";

const columns = [
  { key: "id", label: "Mapping ID" },
  { key: "internalOperatorCode", label: "Internal Operator Code" },
  { key: "providerName", label: "Provider" },
  { key: "providerOperatorCode", label: "Provider Code" },
  { key: "actions", label: "Actions" },
];

export default function OperatorMapsTable({ data = [], onAdd, onEdit }) {
  return (
    <TableShell>
      <TableHeader
        title="Operator Maps"
        subtitle={`${data.length} mappings`}
        onAdd={onAdd}
        addLabel="Add Mapping"
        addIcon={Wrench}
      />

      <TableBody columns={columns} data={data} onEdit={onEdit} />
    </TableShell>
  );
}
