"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  CheckCircle,
  Ban,
  UserX,
  Shield,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import UsersTable from "@/components/tables/UsersTable";
import UserModal from "@/components/modals/UserModal";
import QuickStats from "@/components/QuickStats";
import Button from "@/components/ui/Button";
import ImagePreviewModal from "../ImagePreviewModal";
import UserPermissionModal from "../modals/UserPermissionModal";

import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { setUser } from "@/store/userSlice";
import { setPermissions } from "@/store/permissionSlice";

import {
  useAssignUserPermissions,
  useCreateUser,
  useUsers,
  useUpdateUser,
} from "@/hooks/useUser";
import { useRoles } from "@/hooks/useRole";
import { useTenants } from "@/hooks/useTenant";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/hooks/usePermission";

import { PERMISSIONS } from "@/lib/permissionKeys";
import { permissionChecker } from "@/lib/permissionCheker";

export default function UserClient() {
  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= PERMISSIONS ================= */
  const perms = useSelector((s) => s.auth.user?.permissions);

  const can = (perm) => permissionChecker(perms, perm?.resource, perm?.action);

  const canCreateUser = can(PERMISSIONS.USER.CREATE);
  const canEditUser = can(PERMISSIONS.USER.UPDATE);
  const canViewUser = can(PERMISSIONS.USER.VIEW);
  const canAssignUserPerms = can(PERMISSIONS.USER.ASSIGN_PERMISSIONS);

  /* ================= UI STATE ================= */
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permOpen, setPermOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const perPage = 10;
  const isEditing = Boolean(editingUser);

  /* ================= SAFE PERMISSION MODAL ================= */
  const openPermissionModal = (user) => {
    if (!canAssignUserPerms) {
      toast.error("No permission to assign permissions");
      return;
    }
    setSelectedUser(user);
    setPermOpen(true);
  };

  const extraActions = canAssignUserPerms
    ? [{ icon: Shield, label: "Permissions", onClick: openPermissionModal }]
    : [];

  /* ================= API ================= */
  const { data, isLoading, refetch, error } = useUsers({
    page,
    limit: perPage,
    search,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  useEffect(() => {
    if (error) toast.error(error?.message || "Something went wrong");
  }, [error]);

  const [tenantSearch, setTenantSearch] = useState("");
  const debouncedTenantSearch = useDebounce(tenantSearch, 400);

  const { data: tenantRes } = useTenants({
    page: 1,
    limit: 10,
    search: debouncedTenantSearch,
    status: "all",
  });

  const { data: roleRes } = useRoles();
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const { mutate: assignPermissions, isPending: permSaving } =
    useAssignUserPermissions();
  const { data: permissionList } = usePermissions();

  useEffect(() => {
    if (permissionList) dispatch(setPermissions(permissionList));
  }, [permissionList, dispatch]);

  /* ================= PERMISSION SUBMIT ================= */
  const handlePermissionSubmit = (data, setError) => {
    assignPermissions(
      { userId: selectedUser?.id, payload: data },
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
  const users =
    data?.data
      ?.map((item) => {
        const user = item.users?.[0];
        const tenant = item.tenant;
        if (!user) return null;

        return {
          id: user.id,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          mobileNumber: user.mobileNumber,
          roleId: user.roleId,
          profilePictureUrl: user.profilePictureUrl,
          userStatus: user.userStatus,
          createdAt: formatDateTime(user.createdAt),
          tenantName: tenant?.tenantName,
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

  /* ================= ACTIONS ================= */
  const handleImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handleAdd = () => {
    if (!canCreateUser) return toast.error("No permission");
    setEditingUser(null);
    setOpenModal(true);
  };

  const handleEdit = (user) => {
    if (!canEditUser) return toast.error("No permission");
    setEditingUser(user);
    setOpenModal(true);
  };

  const handleView = (user) => {
    if (!canViewUser || !user?.id) return;
    dispatch(setUser(user));
    router.push(`/dashboard/users/${user.id}`);
  };

  const handleSubmit = (formData, setError) => {
    if (isEditing && !canEditUser) return toast.error("No permission");
    if (!isEditing && !canCreateUser) return toast.error("No permission");

    const action = isEditing ? updateUser : createUser;
    const args = isEditing
      ? { id: editingUser.id, payload: formData }
      : formData;

    action(args, {
      onSuccess: () => {
        toast.success(isEditing ? "User updated" : "User created");
        setOpenModal(false);
        setEditingUser(null);
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

      <QuickStats
        stats={[
          { title: "Total Users", value: meta.total ?? 0, icon: Users },
          {
            title: "Active Users",
            value: users.filter((u) => u.userStatus === "ACTIVE").length,
            icon: CheckCircle,
          },
          {
            title: "Suspended Users",
            value: users.filter((u) => u.userStatus === "SUSPENDED").length,
            icon: Ban,
          },
          {
            title: "Inactive Users",
            value: users.filter((u) => u.userStatus === "INACTIVE").length,
            icon: UserX,
          },
        ]}
      />

      <UsersTable
        users={users}
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
        onAddUser={canCreateUser ? handleAdd : undefined}
        onEdit={canEditUser ? handleEdit : undefined}
        onView={canViewUser ? handleView : undefined}
        loading={isLoading}
        onImagePreview={handleImagePreview}
        extraActions={extraActions}
      />

      {openModal && (
        <UserModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingUser(null);
          }}
          onSubmit={handleSubmit}
          isPending={creating || updating}
          initialData={editingUser}
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

      <UserPermissionModal
        open={permOpen}
        onClose={() => setPermOpen(false)}
        user={selectedUser}
        onSubmit={handlePermissionSubmit}
        isPending={permSaving}
      />
    </>
  );
}
