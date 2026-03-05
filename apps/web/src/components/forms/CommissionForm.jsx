"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { AlertCircle, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { useUsers } from "@/hooks/useUser";
import { useServiceFeatures, useServices } from "@/hooks/useAdminServices";
import { useRoles } from "@/hooks/useRole";

export default function CommissionForm({
  initialData = null,
  isEditing = false,
  onSubmit,
  isPending = false,
}) {
  const {
    register,
    handleSubmit,
    control,
    useWatch: watchField,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
  } = useForm({
    defaultValues: {
      scope: "USER",
      mode: "COMMISSION",
      type: "PERCENTAGE",
      value: "",
      minAmount: 0,
      maxAmount: 0,
      applyGST: false,
      gstPercent: 18,
      applyTDS: false,
      tdsPercent: 0,
      ...initialData,
    },
  });

  const scope = useWatch({ control, name: "scope" });
  const mode = useWatch({ control, name: "mode" });
  const applyGST = useWatch({ control, name: "applyGST" });
  const applyTDS = useWatch({ control, name: "applyTDS" });
  const serviceId = useWatch({ control, name: "platformServiceId" });

  /* ================= AUTO RESET TAX ================= */

  useEffect(() => {
    if (mode === "SURCHARGE") {
      setValue("applyTDS", false);
      setValue("tdsPercent", 0);
    } else if (mode === "COMMISSION") {
      setValue("applyGST", false);
      setValue("gstPercent", 0);
    }
  }, [mode, setValue]);

  /* ================= FETCH DATA ================= */

  const { data: usersData } = useUsers({ page: 1, limit: 100 });
  const { data: rolesData } = useRoles();
  const { data: services } = useServices();
  const { data: features } = useServiceFeatures(serviceId);

  const users =
    usersData?.data?.flatMap((tenantBlock) =>
      tenantBlock.users.map((user) => ({
        ...user,
        tenantName: tenantBlock.tenant?.tenantName,
      })),
    ) || [];

  const roles = rolesData?.data || [];

  const onFormSubmit = (data) => {
    clearErrors();

    const payload = {
      ...data,

      value: Number(data.value),
      minAmount: Number(data.minAmount),
      maxAmount: Number(data.maxAmount),
      gstPercent: Number(data.gstPercent),
      tdsPercent: Number(data.tdsPercent),

      targetUserId: data.scope === "USER" ? data.targetUserId : null,
      roleId: data.scope === "ROLE" ? data.roleId : null,
    };

    onSubmit(payload, setError);
  };

  return (
    <>
      {errors?.root && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {errors.root.message}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SCOPE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Scope <span className="text-red-500">*</span>
            </label>
            <Controller
              name="scope"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  disabled={isEditing}
                  options={[
                    { value: "USER", label: "User" },
                    { value: "ROLE", label: "Role" },
                  ]}
                  error={errors.scope}
                />
              )}
            />
          </div>

          {/* USER SELECT */}
          {!isEditing && scope === "USER" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                Select User <span className="text-red-500">*</span>
              </label>
              <Controller
                name="targetUserId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    options={users.map((u) => ({
                      value: u.id,
                      label: `${u.firstName} ${u.lastName} (${u.tenantName})`,
                    }))}
                    error={errors.targetUserId}
                  />
                )}
              />
            </div>
          )}

          {/* ROLE SELECT */}
          {!isEditing && scope === "ROLE" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">
                Select Role <span className="text-red-500">*</span>
              </label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    options={roles.map((r) => ({
                      value: r.id,
                      label: `${r.roleName} (${r.roleCode})`,
                    }))}
                    error={errors.roleId}
                  />
                )}
              />
            </div>
          )}

          {/* SERVICE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Service <span className="text-red-500">*</span>
            </label>
            <Controller
              name="platformServiceId"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={(services || []).map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  error={errors.platformServiceId}
                />
              )}
            />
          </div>

          {/* FEATURE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Feature <span className="text-red-500">*</span>
            </label>
            <Controller
              name="platformServiceFeatureId"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={(features || []).map((f) => ({
                    value: f.id,
                    label: f.name,
                  }))}
                  error={errors.platformServiceFeatureId}
                />
              )}
            />
          </div>

          {/* MODE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Mode <span className="text-red-500">*</span>
            </label>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={[
                    { value: "COMMISSION", label: "Commission" },
                    { value: "SURCHARGE", label: "Surcharge" },
                  ]}
                  error={errors.mode}
                />
              )}
            />
          </div>

          {/* TYPE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Calculation Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={[
                    { value: "PERCENTAGE", label: "Percentage" },
                    { value: "FLAT", label: "Flat" },
                  ]}
                  error={errors.type}
                />
              )}
            />
          </div>

          {/* VALUE */}
          <InputField
            label="Value"
            name="value"
            type="number"
            register={register}
            required
            error={errors.value}
          />

          <InputField
            label="Min Amount"
            name="minAmount"
            type="number"
            register={register}
          />

          <InputField
            label="Max Amount"
            name="maxAmount"
            type="number"
            register={register}
          />
        </div>

        {/* ================= TAX SECTION ================= */}

        {mode === "SURCHARGE" && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Controller
                name="applyGST"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    {...field}
                    checked={field.value}
                    className="h-4 w-4"
                  />
                )}
              />
              <label className="text-sm font-medium">
                Apply GST on Surcharge
              </label>
            </div>

            {applyGST && (
              <InputField
                label="GST Percent (%)"
                name="gstPercent"
                type="number"
                register={register}
                required
                error={errors.gstPercent}
              />
            )}
          </div>
        )}

        {mode === "COMMISSION" && (
          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-3">
              <Controller
                name="applyTDS"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    {...field}
                    checked={field.value}
                    className="h-4 w-4"
                  />
                )}
              />
              <label className="text-sm font-medium">
                Apply TDS on Commission
              </label>
            </div>

            {applyTDS && (
              <InputField
                label="TDS Percent (%)"
                name="tdsPercent"
                type="number"
                register={register}
                required
                error={errors.tdsPercent}
              />
            )}
          </div>
        )}

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className="w-full"
        >
          {isEditing ? "Update Rule" : "Create Rule"}
        </Button>

        <div className="pt-4 border-t text-center">
          <div className="flex items-center justify-center text-muted-foreground gap-1">
            <Lock className="h-3 w-3" />
            <p className="text-xs">
              Financial rule — impacts live transactions
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
