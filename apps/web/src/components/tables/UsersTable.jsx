"use client";

import { useDispatch, useSelector } from "react-redux";
import TableShell from "./core/TableShell.jsx";
import TableHeader from "./core/TableHeader.jsx";
import TableBody from "./core/TableBody.jsx";
import TablePagination from "./core/TablePagination.jsx";

import {
  setSearch,
  setStatusFilter,
  setPage,
  openCreate,
  selectMembers,
  selectPagination,
} from "@/store/memberSlice";
import { formatDateTime, statusColor } from "@/lib/utils";

export const columns = [
  { key: "id", label: "ID" },

  { key: "firstName", label: "First Name" },

  { key: "lastName", label: "Last Name" },

  { key: "email", label: "Email" },

  {
    key: "userStatus",
    label: "Status",
    render: (row) => {
      const status = statusColor[row.userStatus] ?? {
        label: row.userStatus,
        className: "bg-muted text-muted-foreground border border-border",
      };

      return (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      );
    },
  },

  {
    key: "createdAt",
    label: "Created At",
    render: (row) => formatDateTime(row.createdAt),
  },

  { key: "actions", label: "Actions" },
];

export default function UsersTable() {
  const dispatch = useDispatch();

  const users = useSelector(selectMembers);
  const { page, perPage, total } = useSelector(selectPagination);
  const { search, statusFilter } = useSelector((state) => state.member);

  return (
    <TableShell>
      <TableHeader
        search={search}
        setSearch={(v) => dispatch(setSearch(v))}
        filterValue={statusFilter}
        onFilterChange={(v) => dispatch(setStatusFilter(v))}
        onAdd={() => dispatch(openCreate())}
      />

      <TableBody columns={columns} data={users} />

      <TablePagination
        page={page}
        setPage={(p) => dispatch(setPage(p))}
        total={total}
        perPage={perPage}
      />
    </TableShell>
  );
}
