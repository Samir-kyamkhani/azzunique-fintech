"use client";

import { useState } from "react";
import { RefreshCw, Users, CheckCircle, Ban, UserX } from "lucide-react";

import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "@/hooks/useEmployee";
import { useDepartments } from "@/hooks/useDepartment";

import EmployeesTable from "@/components/tables/EmployeesTable.jsx";
import EmployeeModal from "@/components/modals/EmployeeModal.jsx";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import QuickStats from "@/components/QuickStats.jsx";
import Button from "@/components/ui/Button.jsx";

import { formatDateTime } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setEmployee } from "@/store/employeeSlice";
import ImagePreviewModal from "../ImagePreviewModal.jsx";

export default function EmployeeClient() {
  /* ================= UI STATE ================= */
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const perPage = 10;
  const isEditing = Boolean(editingEmployee);

  const dispatch = useDispatch();
  const router = useRouter();

  /* ================= API ================= */
  const { data, isLoading, refetch } = useEmployees({
    page,
    limit: perPage,
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: deptRes } = useDepartments();

  const { mutate: createEmployee, isPending: creating } = useCreateEmployee();
  const { mutate: updateEmployee, isPending: updating } = useUpdateEmployee();
  const { mutate: deleteEmployee, isPending: deleting } = useDeleteEmployee();

  /* ================= NORMALIZE ================= */
  const employees =
    data?.data?.map((e) => ({
      ...e,
      fullName: `${e.firstName} ${e.lastName}`,
      createdAt: formatDateTime(e.createdAt),
    })) || [];

  const meta = data?.meta || {};

  const departments =
    deptRes?.data?.map((d) => ({
      label: d.departmentName,
      value: d.id,
    })) || [];

  /* ================= STATS ================= */
  const stats = [
    {
      title: "Total Employees",
      value: meta.total ?? 0,
      icon: Users,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Employees",
      value: employees.filter((e) => e.employeeStatus === "ACTIVE").length,
      icon: CheckCircle,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Suspended Employees",
      value: employees.filter((e) => e.employeeStatus === "SUSPENDED").length,
      icon: Ban,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Inactive Employees",
      value: employees.filter((e) => e.employeeStatus === "INACTIVE").length,
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
    setEditingEmployee(null);
    setOpenModal(true);
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setOpenModal(true);
  };

  const handleView = (employee) => {
    if (!employee?.id) return;
    dispatch(setEmployee(employee));
    router.push(`/dashboard/employee-management/employees/${employee.id}`);
  };

  const handleSubmit = (formData, setError) => {
    const action = isEditing ? updateEmployee : createEmployee;
    const args = isEditing
      ? { id: editingEmployee.id, payload: formData }
      : formData;

    action(args, {
      onSuccess: () => {
        toast.success(isEditing ? "Employee updated" : "Employee created");
        setOpenModal(false);
        setEditingEmployee(null);
        refetch();
      },
      onError: (err) => {
        if (err?.type === "FIELD") {
          err.errors.forEach(({ field, message }) =>
            setError(field, { message })
          );
          return;
        }
        setError("root", { message: err?.message });
      },
    });
  };

  const askDelete = (emp) => {
    setSelected(emp);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!selected) return;

    deleteEmployee(selected.id, {
      onSuccess: () => {
        toast.success("Employee deleted");
        setConfirmOpen(false);
        setSelected(null);
        refetch();
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

      <EmployeesTable
        employees={employees}
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
        onAddEmployee={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={askDelete}
        loading={isLoading}
        onImagePreview={handleImagePreview}
      />

      {openModal && (
        <EmployeeModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingEmployee(null);
          }}
          onSubmit={handleSubmit}
          isPending={creating || updating}
          initialData={editingEmployee}
          departments={departments}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Employee"
        description={`Delete ${selected?.firstName}?`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />

      <ImagePreviewModal
        open={previewOpen}
        image={previewImage}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
