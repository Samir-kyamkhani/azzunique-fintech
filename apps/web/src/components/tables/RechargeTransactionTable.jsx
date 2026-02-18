"use client";

import TableShell from "@/components/tables/core/TableShell";
import TableHeader from "@/components/tables/core/TableHeader";
import TableBody from "@/components/tables/core/TableBody";
import { formatDateTime } from "@/lib/utils";
import { Plus } from "lucide-react";

const columns = [
  { key: "id", label: "Transaction ID" },
  { key: "mobileNumber", label: "Mobile" },
  { key: "operatorCode", label: "Operator" },
  {
    key: "amount",
    label: "Amount",
    render: (row) => `₹${row.amount}`,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className={`status-${row.status.toLowerCase()}`}>{row.status}</span>
    ),
  },
  {
    key: "createdAt",
    label: "Created At",
    render: (row) => formatDateTime(row.createdAt),
  },
  { key: "actions", label: "Actions" },
];

export default function RechargeTransactionTable({
  onAdd,
  data = [],
  onExtraActions,
}) {
  return (
    <TableShell>
      <TableHeader
        title="Recharge Transactions"
        subtitle={`${data.length} transactions`}
        onAdd={onAdd}
        addLabel="New Recharge"
        addIcon={Plus}
      />

      <TableBody
        columns={columns}
        data={data}
        onExtraActions={onExtraActions}
      />
    </TableShell>
  );
}
