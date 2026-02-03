"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/ui/Button";
import PageSkeleton from "@/components/details/PageSkeleton";
import DataTableSearchEmpty from "@/components/tables/core/DataTableSearchEmpty";
import RoleModal from "@/components/modals/RoleModal";

import { Shield, Hash, FileText, Plus } from "lucide-react";

import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/useRole";

import { setRoles, setRole, clearRole } from "@/store/roleSlice";

import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import RowActions from "../tables/core/RowActions";
import ConfirmDialog from "../ConfirmDialog";

export default function RoleClient() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const dispatch = useDispatch();
  const roles = useSelector((s) => s.role.list);
  const current = useSelector((s) => s.role.current);

  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading, refetch } = useRoles();
  const { mutate: createMutate, isPending: creating } = useCreateRole();
  const { mutate: updateMutate, isPending: updating } = useUpdateRole();
  const { mutate: deleteMutate, isPending: deleting } = useDeleteRole();

  useEffect(() => {
    dispatch(setRoles(data?.data || []));
  }, [data, dispatch]);

  const handleSubmit = (payload, setError) => {
    const action = current ? updateMutate : createMutate;
    const args = current ? { id: current.id, payload } : payload;

    action(args, {
      onSuccess: () => {
        toast.success(current ? "Role updated" : "Role created");
        dispatch(clearRole());
        setOpenModal(false);
        refetch();
      },
      onError: (err) => {
        if (err?.type === "FIELD") {
          err.errors.forEach(({ field, message }) => {
            setError(field, { message });
          });
          return;
        }
        setError("root", { message: err?.message || "Operation failed" });
      },
    });
  };

  const askDelete = (role) => {
    setSelectedRole(role);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedRole) return;

    deleteMutate(selectedRole.id, {
      onSuccess: () => {
        toast.success("Role deleted");
        setConfirmOpen(false);
        setSelectedRole(null);
        refetch();
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to delete role");
      },
    });
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground mt-1">
            Manage access hierarchy and permissions
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={() => {
            dispatch(clearRole());
            setOpenModal(true);
          }}
        >
          Add Role
        </Button>
      </div>

      {/* LIST */}
      {roles.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className={cn(
                "group relative rounded-xl border bg-card p-5",
                "transition-all hover:shadow-md hover:border-primary/40",
              )}
            >
              <div className="absolute right-3 top-3">
                <RowActions
                  onEdit={() => {
                    dispatch(setRole(role));
                    setOpenModal(true);
                  }}
                  onDelete={() => askDelete(role)}
                  extraActions={[
                    {
                      icon: Shield,
                      label: "Permissions",
                      onClick: () => console.log("Role ID:", role.id),
                    },
                  ]}
                />
              </div>

              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {role.roleName}
                  </h3>

                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
                    <Hash className="h-3 w-3" />
                    {role.roleCode}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mt-0.5" />
                <p className="line-clamp-2">
                  {role.roleDescription || "No description provided"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTableSearchEmpty
          isEmpty
          emptyTitle="No roles yet"
          emptyDescription="Create roles to define system hierarchy"
          emptyAction={
            <Button icon={Shield} onClick={() => setOpenModal(true)}>
              Create Role
            </Button>
          }
        />
      )}

      {openModal && (
        <RoleModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={handleSubmit}
          isPending={creating || updating}
          initialData={current}
        />
      )}

      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Role"
          description={`Are you sure you want to delete "${selectedRole?.roleName}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleting}
        />
      )}
    </>
  );
}
