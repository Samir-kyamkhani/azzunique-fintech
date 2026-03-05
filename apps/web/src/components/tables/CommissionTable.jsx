"use client";

import { Percent } from "lucide-react";
import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";

const columns = [
  { key: "scope", label: "Scope" },
  { key: "name", label: "User / Role" },
  { key: "service", label: "Service" },
  { key: "feature", label: "Feature" },
  { key: "mode", label: "Mode" },
  { key: "calculation", label: "Calculation" },
  { key: "range", label: "Amount Range" },
  { key: "tax", label: "Tax" },
  { key: "value", label: "Value" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

const formatRows = (rows = []) =>
  rows.map((r) => ({
    ...r,

    scope: r.scope,

    name:
      r.scope === "USER"
        ? `${r.firstName || ""} ${r.lastName || ""}`
        : r.roleCode || "ROLE",

    service: r.platformServiceName || "-",

    feature: r.platformServiceFeatureName || "-",

    mode: r.mode,

    calculation: r.type === "PERCENTAGE" ? `${r.value}%` : `₹${r.value}`,

    range: `₹${r.minAmount} - ₹${r.maxAmount}`,

    tax:
      r.mode === "COMMISSION"
        ? r.applyTDS
          ? `TDS ${r.tdsPercent}%`
          : "No TDS"
        : r.applyGST
          ? `GST ${r.gstPercent}%`
          : "No GST",

    value: r.type === "PERCENTAGE" ? `${r.value}%` : `₹${r.value}`,

    isActive: r.isActive ? "ACTIVE" : "INACTIVE",

    createdAt: new Date(r.createdAt).toLocaleDateString(),
  }));

export default function CommissionTable({
  commissions,
  total,
  page,
  perPage,
  onPageChange,
  search,
  onSearch,
  typeFilter,
  onTypeFilterChange,
  onAdd,
  onEdit,
}) {
  return (
    <TableShell>
      <TableHeader
        title="Commission Rules"
        subtitle={`${total} rules found`}
        search={search}
        setSearch={onSearch}
        filterValue={typeFilter}
        onFilterChange={onTypeFilterChange}
        filterOptions={[
          { label: "All", value: "ALL" },
          { label: "User", value: "USER" },
          { label: "Role", value: "ROLE" },
        ]}
        addLabel="Add Rule"
        addIcon={Percent}
        onAdd={onAdd}
      />

      <TableBody
        columns={columns}
        data={formatRows(commissions)}
        onEdit={onEdit}
      />

      <TablePagination
        page={page}
        setPage={onPageChange}
        total={total}
        perPage={perPage}
      />
    </TableShell>
  );
}
