"use client";

import { Building2, Download } from "lucide-react";
import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";

/* ---------------- FILTER OPTIONS ---------------- */
const options = [
  { label: "All", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

/* ---------------- TABLE COLUMNS ---------------- */
export const columns = [
  { key: "tenantNumber", label: "Tenant No" },
  { key: "tenantName", label: "Tenant Name" },
  { key: "tenantLegalName", label: "Legal Name" },
  { key: "tenantType", label: "Type" },
  { key: "userType", label: "User Type" },
  { key: "tenantEmail", label: "Email" },
  { key: "tenantStatus", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

export default function TenantsTable({
  tenants,
  total,
  page,
  perPage,
  onPageChange,
  search,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  onAddTenant,
  onViewTenant,
  onEditTenant,
  onDeleteTenant,
}) {
  return (
    <TableShell>
      <TableHeader
        title="All Tenants"
        subtitle={`${total} tenants found`}
        search={search}
        setSearch={onSearch}
        searchPlaceholder={"Search by tenant name, email or tenant number…"}
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Status"
        filterOptions={options}
        onAdd={onAddTenant}
        addLabel="Add Tenant"
        addIcon={Building2}
        onExport={() => console.log("Export tenants")}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={tenants}
        onView={onViewTenant}
        onEdit={onEditTenant}
        onDelete={onDeleteTenant}
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
