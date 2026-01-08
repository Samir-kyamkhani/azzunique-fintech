"use client";

import { useMemo, useState } from "react";
import UsersTable from "@/components/tables/UsersTable";
import MemberForm from "@/components/forms/MemberForm";
import QuickStats from "@/components/QuickStats";
import { Users } from "lucide-react";
import { UserX } from "lucide-react";
import { UserCheck } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import MemberModal from "@/components/modals/MemberModal";

const USERS = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
  status: i % 4 === 0 ? "Active" : "Inactive",
  joinDate: `2024-01-${String(i + 1).padStart(2, "0")}`,
}));

// STATS
const stats = [
  {
    title: "Total Users",
    value: USERS.length,
    icon: Users,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    change: "+12%",
    isPositive: true,
    footer: "From last month",
  },
  {
    title: "Active Users",
    value: USERS.filter((u) => u.status === "Active").length,
    icon: UserCheck,
    iconColor: "text-success",
    bgColor: "bg-success/10",
    change: "+6%",
    isPositive: true,
    // footer: "From last month",
  },
  {
    title: "Admins",
    value: USERS.filter((u) => u.role === "Admin").length,
    icon: ShieldCheck,
    iconColor: "text-info",
    bgColor: "bg-info/10",
    // footer: "Role based",
  },
  {
    title: "Inactive Users",
    value: USERS.filter((u) => u.status === "Inactive").length,
    icon: UserX,
    iconColor: "text-warning",
    bgColor: "bg-primary/10",
    change: "-3%",
    isPositive: false,
    // footer: "From last month",
  },
];

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);

  const perPage = 10;

  const filtered = useMemo(() => {
    return USERS.filter((u) => {
      if (statusFilter === "active" && u.status !== "Active") return false;
      if (statusFilter === "inactive" && u.status !== "Inactive") return false;
      if (statusFilter === "admin" && u.role !== "Admin") return false;

      return (
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [search, statusFilter]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCreateUser = (data) => {
    console.log("Create user", data);
    setOpenCreate(false);
  };

  return (
    <>
      <QuickStats stats={stats} />

      <UsersTable
        users={paginated}
        total={filtered.length}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onAddUser={() => setOpenCreate(true)}
      />

      <MemberModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreateUser}
      />
    </>
  );
}
