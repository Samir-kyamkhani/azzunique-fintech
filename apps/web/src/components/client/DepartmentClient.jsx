"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "@/components/ui/Button.jsx";
import PageSkeleton from "@/components/details/PageSkeleton.jsx";
import DataTableSearchEmpty from "@/components/tables/core/DataTableSearchEmpty.jsx";
import DepartmentModal from "@/components/modals/DepartmentModal.jsx";

import { Building2, Hash, FileText, Plus } from "lucide-react";

import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/useDepartments";

import {
  setDepartments,
  setDepartment,
  clearDepartment,
} from "@/store/departmentSlice";

import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import RowActions from "../tables/core/RowActions.jsx";
import { Shield } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog.jsx";

export default function DepartmentClient() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const dispatch = useDispatch();
  const departments = useSelector((s) => s.department.list);
  const current = useSelector((s) => s.department.current);

  const [openModal, setOpenModal] = useState(false);

  const { data, isLoading, refetch } = useDepartments();
  const { mutate: createMutate, isPending: creating } = useCreateDepartment();
  const { mutate: updateMutate, isPending: updating } = useUpdateDepartment();
  const { mutate: deleteMutate, isPending: deleting } = useDeleteDepartment();

  useEffect(() => {
    dispatch(setDepartments(data?.data || []));
  }, [data, dispatch]);

  const handleSubmit = (payload, setError) => {
    const action = current ? updateMutate : createMutate;
    const args = current ? { id: current.id, payload } : payload;

    action(args, {
      onSuccess: () => {
        toast.success(current ? "Department updated" : "Department created");
        dispatch(clearDepartment());
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

        setError("root", {
          message: err?.message || "Operation failed",
        });
      },
    });
  };

  const askDelete = (dept) => {
    setSelectedDept(dept);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedDept) return;

    deleteMutate(selectedDept.id, {
      onSuccess: () => {
        toast.success("Department deleted");
        setConfirmOpen(false);
        setSelectedDept(null);
        refetch();
      },
      onError: (err) => {
        toast.error(err?.message || "Failed to delete department");
      },
    });
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <>
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Organize teams and control access permissions
          </p>
        </div>

        <Button
          icon={Plus}
          onClick={() => {
            dispatch(clearDepartment());
            setOpenModal(true);
          }}
        >
          Add Department
        </Button>
      </div>

      {/* LIST */}
      {departments.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className={cn(
                "group relative rounded-xl border bg-card p-5",
                "transition-all hover:shadow-md hover:border-primary/40"
              )}
            >
              <div className="absolute right-3 top-3  transition">
                <RowActions
                  onEdit={() => {
                    dispatch(setDepartment(dept));
                    setOpenModal(true);
                  }}
                  onDelete={() => askDelete(dept)}
                  extraActions={[
                    {
                      icon: Shield,
                      label: "Permissions",
                      onClick: () => {
                        console.log("Department ID:", dept.id);
                      },
                    },
                  ]}
                />
              </div>

              {/* TITLE */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {dept.departmentName}
                  </h3>

                  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
                    <Hash className="h-3 w-3" />
                    {dept.departmentCode}
                  </span>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4 mt-0.5" />
                <p className="line-clamp-2">
                  {dept.departmentDescription || "No description provided"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTableSearchEmpty
          isEmpty
          emptyTitle="No departments yet"
          emptyDescription="Create departments to manage teams and permissions"
          emptyAction={
            <Button icon={Building2} onClick={() => setOpenModal(true)}>
              Create Department
            </Button>
          }
        />
      )}

      {/* MODAL */}
      {openModal && (
        <DepartmentModal
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
          title="Delete Department"
          description={`Are you sure you want to delete "${selectedDept?.departmentName}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleting}
        />
      )}
    </>
  );
}
