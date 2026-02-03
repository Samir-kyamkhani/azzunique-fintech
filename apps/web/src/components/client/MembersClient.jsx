"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users, CheckCircle, Ban, UserX } from "lucide-react";

import MembersTable from "@/components/tables/MembersTable";
import MemberModal from "@/components/modals/MemberModal";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";

import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setMember } from "@/store/memberSlice";
import ImagePreviewModal from "../ImagePreviewModal";
import {
  useAssignMemberPermissions,
  useCreateMember,
  useMembers,
  useUpdateMember,
} from "@/hooks/useMember";
import { useRoles } from "@/hooks/useRole";
import { useTenants } from "@/hooks/useTenant";
import { useDebounce } from "@/hooks/useDebounce";
import MemberPermissionModal from "../modals/MemberPermissionModal";
import { usePermissions } from "@/hooks/usePermission";
import { Shield } from "lucide-react";
import { setPermissions } from "@/store/permissionSlice";

export default function MemberClient() {
  /* ================= UI STATE ================= */
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [permOpen, setPermOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const openPermissionModal = (member) => {
    setSelectedMember(member);
    setPermOpen(true);
  };

  const extraActions = [
    {
      icon: Shield,
      label: "Permissions",
      onClick: openPermissionModal,
    },
  ];

  const perPage = 10;
  const isEditing = Boolean(editingMember);

  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= API ================= */
  const { data, isLoading, refetch } = useMembers({
    page,
    limit: perPage,
    search,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const [tenantSearch, setTenantSearch] = useState("");
  const debouncedTenantSearch = useDebounce(tenantSearch, 400);

  const { data: tenantRes } = useTenants({
    page: 1,
    limit: 10,
    search: debouncedTenantSearch,
    status: "all",
  });

  const { data: roleRes } = useRoles();

  const { mutate: createMember, isPending: creating } = useCreateMember();
  const { mutate: updateMember, isPending: updating } = useUpdateMember();

  const { data: permissionList } = usePermissions();
  const { mutate: assignPermissions, isPending: permSaving } =
    useAssignMemberPermissions();

  useEffect(() => {
    if (permissionList) {
      dispatch(setPermissions(permissionList));
    }
  }, [permissionList, dispatch]);

  const handlePermissionSubmit = (data, setError) => {
    assignPermissions(
      { memberId: selectedMember?.id, payload: data },
      {
        onSuccess: () => {
          toast.success("Permissions updated");
          setPermOpen(false);
        },
        onError: (err) => {
          if (err?.type === "FIELD") {
            err.errors.forEach(({ field, message }) =>
              setError(field, { message }),
            );
            return;
          }
          setError("root", { message: err?.message || "Update failed" });
        },
      },
    );
  };

  /* ================= NORMALIZE ================= */
  const members =
    data?.data
      ?.map((item) => {
        const user = item.users?.[0];
        const tenant = item.tenant;

        if (!user) return null;

        return {
          id: user.id,
          userNumber: user.userNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          mobileNumber: user.mobileNumber,
          roleId: user.roleId,
          actionReason: user.actionReason,
          profilePictureUrl: user.profilePictureUrl,
          userStatus: user.userStatus,
          createdAt: formatDateTime(user.createdAt),

          // optional extras if needed
          tenantName: tenant?.tenantName,
          tenantNumber: tenant?.tenantNumber,
          tenantId: tenant?.id,

          permissions: user.permissions,
        };
      })
      .filter(Boolean) || [];

  const meta = data?.meta || {};

  const roles =
    roleRes?.data?.map((d) => ({
      label: d.roleCode,
      value: d.id,
    })) || [];

  const tenants =
    tenantRes?.data?.map((d) => ({
      label: d.tenantName,
      value: d.id,
    })) || [];

  /* ================= STATS ================= */
  const stats = [
    {
      title: "Total Members",
      value: meta.total ?? 0,
      icon: Users,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Members",
      value: members.filter((m) => m.userStatus === "ACTIVE").length,
      icon: CheckCircle,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Suspended Members",
      value: members.filter((m) => m.userStatus === "SUSPENDED").length,
      icon: Ban,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Inactive Members",
      value: members.filter((m) => m.userStatus === "INACTIVE").length,
      icon: UserX,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  /* ================= ACTIONS ================= */

  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handleAdd = () => {
    setEditingMember(null);
    setOpenModal(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setOpenModal(true);
  };

  const handleView = (member) => {
    if (!member?.id) return;
    dispatch(setMember(member));
    router.push(`/dashboard/members/${member.id}`);
  };

  const handleSubmit = (formData, setError) => {
    const action = isEditing ? updateMember : createMember;
    const args = isEditing
      ? { id: editingMember.id, payload: formData }
      : formData;

    action(args, {
      onSuccess: () => {
        toast.success(isEditing ? "Member updated" : "Member created");
        setOpenModal(false);
        setEditingMember(null);
        refetch();
      },
      onError: (err) => {
        if (err?.type === "FIELD") {
          err.errors.forEach(({ field, message }) =>
            setError(field, { message }),
          );
          return;
        }
        setError("root", { message: err?.message });
      },
    });
  };

  /* ================= RENDER ================= */
  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button
          onClick={refetch}
          variant="outline"
          icon={RefreshCw}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      <QuickStats stats={stats} />

      <MembersTable
        members={members}
        total={meta.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        onAddMember={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        loading={isLoading}
        onImagePreview={handleImagePreview}
        extraActions={extraActions}
      />

      {openModal && (
        <MemberModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingMember(null);
          }}
          onSubmit={handleSubmit}
          isPending={creating || updating}
          initialData={editingMember}
          roles={roles}
          tenants={tenants}
          onTenantSearch={setTenantSearch}
        />
      )}

      <ImagePreviewModal
        open={previewOpen}
        image={previewImage}
        onClose={() => setPreviewOpen(false)}
      />

      <MemberPermissionModal
        open={permOpen}
        onClose={() => setPermOpen(false)}
        member={selectedMember}
        onSubmit={handlePermissionSubmit}
        isPending={permSaving}
      />
    </>
  );
}
