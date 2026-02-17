"use client";

import { Download } from "lucide-react";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";
import { BanknoteArrowDown } from "lucide-react";

/* ---------------- FILTER OPTIONS ---------------- */
const options = [
  { label: "All", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

/* ===================== COLUMNS ===================== */
const getColumns = (onImagePreview) => [
  { key: "userNumber", label: "User No" },
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "tenantNumber", label: "Tenant Number" },
  { key: "tenantName", label: "Tenant Name" },
  { key: "mobileNumber", label: "Mobile" },
  { key: "userStatus", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

/* ===================== COMPONENT ===================== */
export default function FundRequestTable({
  requestFundData,
  total,
  page,
  perPage,
  onPageChange,
  search,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  onAddUser,
  onEdit,
  onView,
  onDelete,
  onImagePreview,
  extraActions,
}) {
  const columns = getColumns(onImagePreview);

  return (
    <TableShell>
      <TableHeader
        title="Fund Request"
        subtitle={`${total} Fund Request found`}
        search={search}
        setSearch={onSearch}
        searchPlaceholder="Search by name, email, user no. or mobile…"
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Status"
        filterOptions={options}
        onAdd={onAddUser}
        addLabel="Add Fund"
        addIcon={BanknoteArrowDown}
        onExport={() => console.log("Export fund request  ")}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={requestFundData}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
        onExtraActions={extraActions}
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
