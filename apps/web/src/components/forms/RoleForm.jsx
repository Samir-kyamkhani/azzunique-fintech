"use client";

import { useForm } from "react-hook-form";
import { AlertCircle, Shield } from "lucide-react";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import TextareaField from "@/components/ui/TextareaField";

export default function RoleForm({ initialData = null, isPending, onSubmit }) {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      roleCode: "",
      roleName: "",
      roleDescription: "",
      ...initialData,
    },
  });

  const onFormSubmit = (data) => {
    clearErrors();

    if (!data.roleCode?.trim()) {
      setError("roleCode", { message: "Role code is required" });
      return;
    }

    if (!data.roleName?.trim()) {
      setError("roleName", { message: "Role name is required" });
      return;
    }

    onSubmit(
      {
        ...data,
        roleCode: data.roleCode.toUpperCase(),
      },
      setError,
    );
  };

  return (
    <>
      {errors?.root && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm">{errors.root.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <InputField
          label="Role Code"
          name="roleCode"
          placeholder="RESELLER, DISTRIBUTOR"
          register={(name) =>
            register(name, {
              setValueAs: (v) => v?.toUpperCase(),
            })
          }
          required
          error={errors.roleCode}
        />

        <InputField
          label="Role Name"
          name="roleName"
          placeholder="Reseller"
          register={register}
          required
          error={errors.roleName}
        />

        <TextareaField
          label="Description"
          name="roleDescription"
          placeholder="Brief role description"
          register={register}
          error={errors.roleDescription}
        />

        <Button type="submit" loading={isPending} className="w-full">
          Save Role
        </Button>

        <div className="pt-4 border-t border-border text-center">
          <div className="flex justify-center gap-1 text-muted-foreground">
            <Shield className="h-3 w-3" />
            <p className="text-xs">
              Roles control system hierarchy & permissions
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
