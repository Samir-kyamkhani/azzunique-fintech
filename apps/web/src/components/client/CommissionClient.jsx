"use client";

import { useState } from "react";
import { RefreshCw, Percent, Users, ShieldCheck } from "lucide-react";
import {
  useCommissionList,
  useSetUserCommission,
  useSetRoleCommission,
} from "@/hooks/useCommission";

import CommissionTable from "@/components/tables/CommissionTable";
import CommissionModal from "@/components/modals/CommissionModal";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";

export default function CommissionClient() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const perPage = 10;

  const { data, isLoading, refetch } = useCommissionList({
    type: typeFilter,
    page,
    limit: perPage,
    search: debouncedSearch,
  });

  const { mutate: setUserRule, isPending: userPending } =
    useSetUserCommission();
  const { mutate: setRoleRule, isPending: rolePending } =
    useSetRoleCommission();

  const commissions = data?.data || [];
  const meta = data?.meta || {};

  const stats = [
    {
      title: "Total Rules",
      value: meta.total ?? 0,
      icon: Percent,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "User Rules",
      value: commissions.filter((c) => c.type === "USER").length,
      icon: Users,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Role Rules",
      value: commissions.filter((c) => c.type === "ROLE").length,
      icon: ShieldCheck,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  const handleAddRule = () => {
    setEditingRule(null);
    setOpenModal(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule({
      ...rule,
      isActive: rule.isActive === "ACTIVE",
    });
    setOpenModal(true);
  };

  // 🔥 MAIN FIX HERE
  const handleSubmitRule = (formData, setError) => {
    const onError = (err) => setError("root", { message: err.message });

    // EDIT MODE
    if (editingRule) {
      if (editingRule.type === "USER") {
        setUserRule(
          { ...formData, userId: editingRule.userId },
          { onSuccess: refetch, onError }
        );
      } else {
        setRoleRule(
          { ...formData, roleId: editingRule.roleId },
          { onSuccess: refetch, onError }
        );
      }
    }

    // CREATE MODE
    else {
      if (formData.type === "USER" && formData.userId) {
        setUserRule(formData, { onSuccess: refetch, onError });
      } else if (formData.type === "ROLE" && formData.roleId) {
        setRoleRule(formData, { onSuccess: refetch, onError });
      } else {
        setError("root", { message: "Select User or Role" });
        return;
      }
    }

    setOpenModal(false);
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Commission Management</h1>
          <p className="text-muted-foreground">
            Control commission rules across users and roles
          </p>
        </div>

        <Button
          onClick={refetch}
          loading={isLoading}
          variant="outline"
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <QuickStats stats={stats} />

      <CommissionTable
        commissions={commissions}
        total={meta.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearch={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={(v) => {
          setTypeFilter(v);
          setPage(1);
        }}
        onAdd={handleAddRule}
        onEdit={handleEditRule}
      />

      {openModal && (
        <CommissionModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingRule(null);
          }}
          onSubmit={handleSubmitRule}
          isEditing={Boolean(editingRule)}
          isPending={userPending || rolePending}
          initialData={editingRule}
        />
      )}
    </>
  );
}
