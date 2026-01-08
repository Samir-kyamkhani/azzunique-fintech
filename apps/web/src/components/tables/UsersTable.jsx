"use client";

import { useMemo, useState } from "react";
import { Users, Filter, Download } from "lucide-react";

import TableShell from "./core/TableShell";
import TableHeader from "./core/TableHeader";
import TableBody from "./core/TableBody";
import TablePagination from "./core/TablePagination";
import RowActions from "./core/RowActions";
import QuickStats from "../QuickStats";
import { UserX } from "lucide-react";
import { UserCheck } from "lucide-react";
import { ShieldCheck } from "lucide-react";

export default function UsersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  // -----------------------------
  // MOCK DATA (API later)
  // -----------------------------
  const users = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
    status: i % 4 === 0 ? "Active" : "Inactive",
    joinDate: `2024-01-${String(i + 1).padStart(2, "0")}`,
  }));

  // -----------------------------
  // SEARCH
  // -----------------------------
  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  // reset page on search
  if ((page - 1) * perPage >= filtered.length && page !== 1) {
    setPage(1);
  }

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // -----------------------------
  // STATS
  // -----------------------------

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      isPositive: true,
      footer: "From last month",
    },
    {
      title: "Active Users",
      value: users.filter((u) => u.status === "Active").length,
      icon: UserCheck,
      iconColor: "text-success",
      bgColor: "bg-success/10",
      change: "+6%",
      isPositive: true,
      // footer: "From last month",
    },
    {
      title: "Admins",
      value: users.filter((u) => u.role === "Admin").length,
      icon: ShieldCheck,
      iconColor: "text-info",
      bgColor: "bg-info/10",
      // footer: "Role based",
    },
    {
      title: "Inactive Users",
      value: users.filter((u) => u.status === "Inactive").length,
      icon: UserX,
      iconColor: "text-warning",
      bgColor: "bg-primary/10",
      change: "-3%",
      isPositive: false,
      // footer: "From last month",
    },
  ];
  // -----------------------------
  // COLUMNS
  // -----------------------------
  const columns = [
    { key: "id", label: "ID" },

    {
      key: "name",
      label: "Name",
      render: (u) => (
        <div className="flex items-center">
          <div className="h-8 w-8 mr-3 rounded-full bg-gradient-theme flex items-center justify-center text-primary-foreground font-semibold">
            {u.name.charAt(0)}
          </div>
          <span className="font-medium">{u.name}</span>
        </div>
      ),
    },

    {
      key: "email",
      label: "Email",
      render: (u) => <span className="text-muted-foreground">{u.email}</span>,
    },

    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            u.role === "Admin"
              ? "bg-primary/10 text-primary"
              : u.role === "Editor"
                ? "bg-info/10 text-info"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {u.role}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (u) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            u.status === "Active"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {u.status}
        </span>
      ),
    },

    {
      key: "joinDate",
      label: "Join Date",
      render: (u) => (
        <span className="text-muted-foreground">{u.joinDate}</span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <RowActions
          onView={() => console.log("View", u)}
          onEdit={() => console.log("Edit", u)}
          onDelete={() => console.log("Delete", u)}
        />
      ),
    },
  ];

  return (
    <>
      {/* STATS */}
      <QuickStats stats={stats} />

      <TableShell>
        <TableHeader
          title="All Users"
          subtitle={`${filtered.length} users found`}
          search={search}
          setSearch={setSearch}
          actions={
            <>
              <button className="flex items-center gap-2 px-4 py-2 border rounded-border hover:bg-accent">
                <Filter className="h-4 w-4" />
                Filter
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-theme text-primary-foreground rounded-border">
                <Users className="h-4 w-4" />
                Add User
              </button>

              <button className="flex items-center gap-2 px-4 py-2 border rounded-border hover:bg-accent">
                <Download className="h-4 w-4" />
                Export
              </button>
            </>
          }
        />

        <TableBody columns={columns} data={paginated} />

        <TablePagination
          page={page}
          setPage={setPage}
          total={filtered.length}
          perPage={perPage}
        />
      </TableShell>
    </>
  );
}
