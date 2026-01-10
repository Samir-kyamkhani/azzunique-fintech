"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { AlertCircle, Lock } from "lucide-react";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";

/* ================= CONSTANTS ================= */

const CRITICAL_STATUSES = ["INACTIVE", "SUSPENDED", "DELETED"];

/* ================= COMPONENT ================= */

export default function TenantDomainForm({
  initialData = null,
  isEditing = false,
  onSubmit,
  isPending = false,
}) {
  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      domainName: "",
      tenantId: "",
      serverDetailId: "",
      status: "ACTIVE",
      actionReason: "",
      ...initialData,
    },
  });

  /* ================= WATCHERS ================= */

  const status = useWatch({
    control,
    name: "status",
  });

  const actionReasonRequired = CRITICAL_STATUSES.includes(status);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (status === "ACTIVE") {
      setValue("actionReason", "");
    }
  }, [status, setValue]);

  /* ================= SUBMIT ================= */

  const onFormSubmit = (data) => {
    clearErrors();

    if (actionReasonRequired && !data.actionReason?.trim()) {
      setError("actionReason", {
        message: "Action reason is required for this status",
      });
      return;
    }

    onSubmit(data, setError);
  };

  /* ================= RENDER ================= */

  return (
    <>
      {/* GLOBAL ERROR */}
      {errors?.root && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-destructive">
                Submission failed
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {errors.root.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* ================= FIELDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DOMAIN NAME */}
          <InputField
            label="Domain Name"
            name="domainName"
            placeholder="example.com"
            register={register}
            required
            error={errors.domainName}
          />

          {/* STATUS */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Status <span className="text-red-500">*</span>
            </label>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                    { value: "SUSPENDED", label: "Suspended" },
                    { value: "DELETED", label: "Deleted" },
                  ]}
                  placeholder="Select status"
                  error={errors.status}
                />
              )}
            />
          </div>

          {/* TENANT ID */}
          <InputField
            label="Tenant ID"
            name="tenantId"
            register={register}
            required={!isEditing}
            disabled={isEditing}
            error={errors.tenantId}
          />

          {/* SERVER DETAIL ID */}
          <InputField
            label="Server Detail ID"
            name="serverDetailId"
            register={register}
            required={!isEditing}
            error={errors.serverDetailId}
          />
        </div>

        {/* ACTION REASON */}
        {actionReasonRequired && (
          <InputField
            label="Action Reason"
            name="actionReason"
            register={register}
            required
            error={errors.actionReason}
          />
        )}

        {/* ================= SUBMIT ================= */}
        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className="w-full"
        >
          {isEditing ? "Update Domain" : "Create Domain"}
        </Button>

        {/* ================= FOOTER ================= */}
        <div className="pt-4 border-t border-border text-center">
          <div className="flex items-center justify-center text-muted-foreground gap-1">
            <Lock className="h-3 w-3" />
            <p className="text-xs">
              Domain configuration is securely stored and audited
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
