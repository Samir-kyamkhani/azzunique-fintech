"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import MembersTable from "@/components/tables/MembersTable";
import MemberModal from "@/components/modals/MemberModal";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";

import { Users, UserCheck, UserX, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useMe } from "@/hooks/useAuth";
import { loginSuccess } from "@/store/authSlice";
import {
  useCreateMember,
  useMembers,
  useMemberUpdate,
} from "@/hooks/useMemeber";
import { useDebounce } from "@/hooks/useDebounce";
import { useRoles } from "@/hooks/useRole";
import { useTenants } from "@/hooks/useTenant";

/* ================= FIELD RULES ================= */

const CREATE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "mobileNumber",
  "roleId",
  "tenantId",
];

const UPDATE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "mobileNumber",
  "roleId",
  "tenantId",
  "userStatus",
  "actionReason",
];

export const buildCreatePayload = (formData) => {
  const data = new FormData();

  CREATE_FIELDS.forEach((key) => {
    if (formData[key]) data.append(key, formData[key]);
  });

  return data;
};

export const buildUpdatePayload = (formData, initialData) => {
  const data = new FormData();

  UPDATE_FIELDS.forEach((key) => {
    if (formData[key] && formData[key] !== initialData?.[key]) {
      data.append(key, formData[key]);
    }
  });

  if (formData.profilePicture instanceof File) {
    data.append("profilePicture", formData.profilePicture);
  }

  return data;
};

/* ================= COMPONENT ================= */

export default function MembersClient() {
  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= UI STATE ================= */
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [tenantSearch, setTenantSearch] = useState("");
  const debouncedTenantSearch = useDebounce(tenantSearch, 400);

  const perPage = 10;
  const isEditing = Boolean(editingMember);

  /* ================= API ================= */
  const { data, isLoading, refetch } = useMembers({
    page,
    limit: perPage,
    search: debouncedSearch,
    status: status === "ALL" ? undefined : status,
  });

  const { data: rolesRes } = useRoles();
  const roleOptions =
    rolesRes?.data?.map((role) => ({
      value: role.id,
      label: role.roleName,
    })) || [];

  const { data: tenantsRes } = useTenants({
    page,
    limit: perPage,
    search: debouncedTenantSearch,
    status: "all",
  });

  const tenantOptions = (tenantsRes?.data?.data || tenantsRes?.data || []).map(
    (t) => ({
      value: t.id,
      label: t.tenantName,
    }),
  );

  const {
    mutate: createMember,
    isPending: isCreating,
    reset: resetCreate,
  } = useCreateMember();

  const {
    mutate: updateMember,
    isPending: isUpdating,
    reset: resetUpdate,
  } = useMemberUpdate();

  const { data: meRes, isLoading: meLoading } = useMe();

  useEffect(() => {
    if (meRes?.data) dispatch(loginSuccess(meRes.data));
  }, [meRes, dispatch]);

  if (meLoading) return null;

  /* ================= NORMALIZE ================= */
  const members =
    data?.data?.flatMap((entry) =>
      entry.users.map((u) => ({
        id: u.id,
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        mobileNumber: u.mobileNumber,
        status: u.userStatus,
        createdAt: formatDateTime(u.createdAt),
        updatedAt: formatDateTime(u.updatedAt),
        tenantId: entry.tenant.id,
        tenantName: entry.tenant.tenantName,
      })),
    ) || [];

  const meta = data?.meta || {};

  /* ================= STATS ================= */
  const stats = [
    {
      title: "Total Members",
      value: meta.total ?? 0,
      icon: Users,
    },
    {
      title: "Active Members",
      value: members.filter((m) => m.status === "ACTIVE").length,
      icon: UserCheck,
    },
    {
      title: "Inactive Members",
      value: members.filter((m) => m.status !== "ACTIVE").length,
      icon: UserX,
    },
  ];

  /* ================= ACTIONS ================= */

  const handleSubmit = (formData, setError) => {
    const onError = (err) => {
      if (err?.type === "FIELD") {
        err.errors.forEach(({ field, message }) =>
          setError(field, { message }),
        );
        return;
      }
      setError("root", { message: err.message });
    };

    if (!editingMember) {
      createMember(buildCreatePayload(formData), {
        onSuccess: () => {
          setOpenModal(false);
          refetch();
        },
        onError,
      });
      return;
    }

    const payload = buildUpdatePayload(formData, editingMember);

    if (!payload || payload.entries().next().done) {
      setError("root", { message: "No changes detected" });
      return;
    }

    updateMember(
      { id: editingMember.id, payload },
      {
        onSuccess: () => {
          setOpenModal(false);
          setEditingMember(null);
          refetch();
        },
        onError,
      },
    );
  };

  /* ================= RENDER ================= */

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Member Management</h1>
          <p className="text-muted-foreground">
            Manage members, roles and permissions
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

      <MembersTable
        rawData={data?.data || []}
        total={meta.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearch={setSearch}
        statusFilter={status}
        onStatusFilterChange={setStatus}
        onAddMember={() => {
          resetCreate();
          setEditingMember(null);
          setOpenModal(true);
        }}
        onEditMember={(m) => {
          resetUpdate();
          setEditingMember(m);
          setOpenModal(true);
        }}
        loading={isLoading}
      />

      {openModal && (
        <MemberModal
          open={openModal}
          onClose={() => {
            resetCreate();
            resetUpdate();
            setOpenModal(false);
            setEditingMember(null);
          }}
          onSubmit={handleSubmit}
          isEditing={isEditing}
          isPending={isEditing ? isUpdating : isCreating}
          initialData={editingMember}
          roleOptions={roleOptions}
          tenantOptions={tenantOptions}
          onTenantSearch={setTenantSearch}
        />
      )}
    </>
  );
}
