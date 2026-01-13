"use client";

import { Users, Download, Shield } from "lucide-react";
import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";
import Image from "next/image";
import { User } from "lucide-react";

/* ---------------- FILTER OPTIONS ---------------- */
const options = [
  { label: "All", value: "all" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

/* ---------------- EXTRA ACTIONS ---------------- */
const extraActions = [
  {
    icon: Shield,
    label: "Permissions",
    onClick: (employee) => {
      console.log("Employee ID:", employee.id);
      console.log("Department ID:", employee.departmentId);
    },
  },
];

/* ===================== COLUMNS ===================== */
const getColumns = (onImagePreview) => [
  { key: "employeeNumber", label: "Emp No" },
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobileNumber", label: "Mobile" },
  { key: "employeeStatus", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "actions", label: "Actions" },
];

/* ===================== COMPONENT ===================== */
export default function EmployeesTable({
  employees,
  total,
  page,
  perPage,
  onPageChange,
  search,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  onAddEmployee,
  onEdit,
  onView,
  onDelete,
  onImagePreview,
}) {
  const columns = getColumns(onImagePreview);

  return (
    <TableShell>
      <TableHeader
        title="All Employees"
        subtitle={`${total} employees found`}
        search={search}
        setSearch={onSearch}
        searchPlaceholder="Search by name, email, emp no. or mobile…"
        filterValue={statusFilter}
        onFilterChange={onStatusFilterChange}
        filterPlaceholder="Status"
        filterOptions={options}
        onAdd={onAddEmployee}
        addLabel="Add Employee"
        addIcon={Users}
        onExport={() => console.log("Export employees")}
        exportIcon={Download}
      />

      <TableBody
        columns={columns}
        data={employees}
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
