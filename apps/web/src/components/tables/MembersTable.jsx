"use client";

import { Users, Download } from "lucide-react";
import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";
import { formatDateTime } from "@/lib/utils";

/* ---------------- FILTER OPTIONS ---------------- */
const options = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

/* ---------------- TABLE COLUMNS ---------------- */
export const columns = [
  { key: "userNumber", label: "Member No" },
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobileNumber", label: "Mobile" },
  { key: "tenantName", label: "Tenant" },
  { key: "tenantNumber", label: "Tenant Number" },
  { key: "tenantType", label: "Tenant Type" },
  { key: "userStatus", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

export default function MembersTable({
  rawData, // 👈 original API response data
  total,
  page,
  perPage,
  onPageChange,
  search,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  onAddMember,
  onViewMember,
  onEditMember,
  onDeleteMember,
}) {
  /* ---------------- FLATTEN API DATA ---------------- */
  const members =
    rawData?.flatMap((entry) =>
      entry.users.map((u) => ({
        id: u.id,
        userNumber: u.userNumber,
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        mobileNumber: u.mobileNumber,
        userStatus: u.userStatus,
        createdAt: formatDateTime(u.createdAt),
        // Tenant info
        tenantId: entry.tenant.id,
        tenantName: entry.tenant.tenantName,
        tenantType: entry.tenant.tenantType,
        tenantNumber: entry.tenant.tenantNumber,
      })),
    ) || [];

  return (
    <TableShell>
      <TableHeader
        title="All Members"
        subtitle={`${total} members found`}
        search={search}
        setSearch={onSearch}
        searchPlaceholder="Search by name, email, member no, tenant name or tenant number…"
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Filter by status"
        filterOptions={options}
        onAdd={onAddMember}
        addLabel="Add Member"
        addIcon={Users}
        onExport={() => console.log("Export members")}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={members}
        onView={onViewMember}
        onEdit={onEditMember}
        onDelete={onDeleteMember}
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
