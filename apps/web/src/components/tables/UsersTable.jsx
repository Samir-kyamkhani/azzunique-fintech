"use client";

import { Users, Download, Shield, User } from "lucide-react";
import Image from "next/image";

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

/* ===================== COLUMNS ===================== */
const getColumns = (onImagePreview) => [
  {
    key: "profilePictureUrl",
    label: "Photo",
    render: (row) =>
      row.profilePictureUrl ? (
        <img
          src={row.profilePictureUrl}
          alt={row.fullName}
          width={40}
          height={40}
          className="rounded-full object-cover cursor-pointer border"
          onClick={() => onImagePreview(row.profilePictureUrl)}
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <User size={16} />
        </div>
      ),
  },
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
export default function UsersTable({
  users,
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
        title="All Users"
        subtitle={`${total} users found`}
        search={search}
        setSearch={onSearch}
        searchPlaceholder="Search by name, email, user no. or mobile…"
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Status"
        filterOptions={options}
        onAdd={onAddUser}
        addLabel="Add User"
        addIcon={Users}
        onExport={() => console.log("Export users")}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={users}
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
