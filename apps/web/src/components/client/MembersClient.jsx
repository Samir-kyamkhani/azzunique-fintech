"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, CheckCircle, Ban, UserX } from "lucide-react";

import QuickStats from "@/components/QuickStats.jsx";
import UsersTable from "@/components/tables/UsersTable.jsx";
import MemberModal from "@/components/modals/MemberModal.jsx";

import {
  setMembers,
  closeCreate,
  selectMemberQuery,
  selectMemberState,
} from "@/store/memberSlice";

import { useCreateMember, useGetMembers } from "@/hooks/useMemeber";

export default function MembersClient() {
  const dispatch = useDispatch();

  const { isCreateOpen, stats, total } = useSelector(selectMemberState);
  const query = useSelector(selectMemberQuery);

  const { data, isLoading } = useGetMembers(query);
  const createMember = useCreateMember();

  useEffect(() => {
    if (!data) return;

    const groups = Array.isArray(data?.data) ? data.data : [];

    const users = groups.flatMap((group) =>
      Array.isArray(group.users)
        ? group.users.map((u) => ({
            ...u,
            tenant: group.tenant,
          }))
        : []
    );

    dispatch(
      setMembers({
        data: users,
        total: data?.meta?.total ?? 0,
        stats: data?.meta?.stats ?? {
          ACTIVE: 0,
          INACTIVE: 0,
          SUSPENDED: 0,
          DELETED: 0,
        },
      })
    );
  }, [data, dispatch]);

  const quickStats = useMemo(
    () => [
      {
        title: "Total Members",
        value: total,
        icon: Building2,
        iconColor: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Active Members",
        value: stats.ACTIVE,
        icon: CheckCircle,
        iconColor: "text-success",
        bgColor: "bg-success/10",
      },
      {
        title: "Suspended Members",
        value: stats.SUSPENDED,
        icon: Ban,
        iconColor: "text-warning",
        bgColor: "bg-warning/10",
      },
      {
        title: "Inactive Members",
        value: stats.INACTIVE,
        icon: UserX,
        iconColor: "text-destructive",
        bgColor: "bg-destructive/10",
      },
    ],
    [stats, total]
  );

  const handleCreate = async (formData) => {
    await createMember.mutateAsync(formData);
    dispatch(closeCreate());
  };

  if (isLoading) return <div>Loading members...</div>;

  return (
    <>
      <QuickStats stats={quickStats} />

      <UsersTable />

      <MemberModal
        open={isCreateOpen}
        onClose={() => dispatch(closeCreate())}
        onSubmit={handleCreate}
      />
    </>
  );
}
