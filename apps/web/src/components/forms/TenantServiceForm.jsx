"use client";

import { useForm, Controller } from "react-hook-form";
import SelectField from "../ui/SelectField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";

export default function TenantServiceForm({
  onSubmit,
  isPending,
  servicesList = [],
  tenantsList = [],
}) {
  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenantId: "",
      platformServiceId: "",
    },
  });

  /* ================= OPTIONS ================= */

  const tenantOptions = tenantsList.map((t) => ({
    label: t.tenantName,
    value: t.id,
  }));

  const serviceOptions = servicesList.map((s) => ({
    label: `${s.name} (${s.code})`,
    value: s.id,
  }));

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

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
        className="space-y-4"
      >
        {/* TENANT */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Tenant
          </label>

          <Controller
            name="tenantId"
            control={control}
            rules={{ required: "Tenant is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={tenantOptions}
                placeholder="Select Tenant"
              />
            )}
          />

          {errors.tenantId && (
            <p className="text-sm text-destructive mt-1">
              {errors.tenantId.message}
            </p>
          )}
        </div>

        {/* SERVICE */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Platform Service
          </label>

          <Controller
            name="platformServiceId"
            control={control}
            rules={{ required: "Service is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={serviceOptions}
                placeholder="Select Service"
              />
            )}
          />

          {errors.platformServiceId && (
            <p className="text-sm text-destructive mt-1">
              {errors.platformServiceId.message}
            </p>
          )}
        </div>

        <Button type="submit" loading={isPending} className="w-full">
          Enable Service
        </Button>
      </form>
    </>
  );
}
