"use client";

import { Users, Download } from "lucide-react";
import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";

const options = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Admins", value: "admin" },
];

export const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "joinDate", label: "Join Date" },
  { key: "actions", label: "Actions" },
];

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
}) {
  return (
    <TableShell>
      <TableHeader
        title="All Users"
        subtitle={`${total} users found`}
        search={search}
        setSearch={onSearch}
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Status"
        filterOptions={options}
        onAdd={onAddUser}
        addLabel="Add User"
        addIcon={Users}
        onExport={() => console.log("Export")}
        exportIcon={Download}
      />

      <TableBody columns={columns} data={users} />

      <TablePagination
        page={page}
        setPage={onPageChange}
        total={total}
        perPage={perPage}
      />
    </TableShell>
  );
}
