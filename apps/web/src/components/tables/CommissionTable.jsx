"use client";

import { Percent } from "lucide-react";
import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";

const columns = [
  { key: "type", label: "Type" },
  { key: "name", label: "User / Role" },
  { key: "tenantNumber", label: "Tenant Number" },
  { key: "userNumber", label: "User Number" },
  { key: "tenantName", label: "Tenant" },
  { key: "commission", label: "Commission" },
  { key: "surcharge", label: "Surcharge" },
  { key: "gst", label: "GST" },
  { key: "maxCommissionValue", label: "Max Cap" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

const formatRows = (rows = []) =>
  rows.map((r) => ({
    ...r,
    name:
      r.type === "USER"
        ? `${r.firstName || ""} ${r.lastName || ""}`
        : r.roleCode || "-",
    tenantNumber: r.tenantNumber || "-",
    userNumber: r.userNumber || "-",
    commission:
      r.commissionType === "PERCENTAGE"
        ? `${r.commissionValue}%`
        : `₹${r.commissionValue}`,
    surcharge:
      r.surchargeType === "PERCENTAGE"
        ? `${r.surchargeValue}%`
        : `₹${r.surchargeValue}`,
    gst: r.gstApplicable ? `${r.gstRate}%` : "No GST",
    maxCommissionValue: r.maxCommissionValue ? `₹${r.maxCommissionValue}` : "-",
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
