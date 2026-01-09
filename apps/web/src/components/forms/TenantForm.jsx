"use client";

import { useForm } from "react-hook-form";
import { useMemo, useEffect } from "react";
import { AlertCircle, Lock } from "lucide-react";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { onlyDigits } from "@/lib/utils";

const CRITICAL_STATUSES = ["INACTIVE", "SUSPENDED", "DELETED"];

export default function TenantForm({
  initialData = null,
  isEditing = false,
  onSubmit,
  isPending = false,
  error = null, // string
  formErrors = [], // [{ field, message }]
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenantName: "",
      tenantLegalName: "",
      tenantEmail: "",
      tenantWhatsapp: "",
      tenantMobileNumber: "",
      tenantStatus: "ACTIVE",
      tenantType: "",
      userType: "",
      actionReason: "",
      ...initialData,
    },
  });

  const tenantStatus = watch("tenantStatus");

  const actionReasonRequired = useMemo(
    () => CRITICAL_STATUSES.includes(tenantStatus),
    [tenantStatus]
  );

  /* ================= BACKEND FIELD ERRORS ================= */
  useEffect(() => {
    if (Array.isArray(formErrors) && formErrors.length) {
      clearErrors();
      formErrors.forEach((e) => {
        setError(e.field, { type: "server", message: e.message });
      });
    }
  }, [JSON.stringify(formErrors)]);

  const allErrors = Object.values(errors);

  /* ================= SUBMIT ================= */
  const onFormSubmit = (data) => {
    clearErrors();

    if (actionReasonRequired && !data.actionReason?.trim()) {
      setError("actionReason", {
        message: "Action reason is required for this status",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <>
      {/* ================= ERROR BANNER ================= */}
      {(error || allErrors.length > 0) && (
        <div className="rounded-lg border border-red-500 p-4 mb-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full  p-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 " />
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-500">
                Submission failed
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please review the{" "}
                <span className="text-red-500">highlighted fields</span> and try
                again
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Tenant Name"
            name="tenantName"
            register={register}
            required
            error={errors.tenantName}
          />

          <InputField
            label="Tenant Legal Name"
            name="tenantLegalName"
            register={register}
            required
            error={errors.tenantLegalName}
          />

          <InputField
            label="Tenant Email"
            name="tenantEmail"
            type="email"
            register={register}
            required
            error={errors.tenantEmail}
          />

          <InputField
            label="WhatsApp Number"
            name="tenantWhatsapp"
            type="text" // ✅ FIX
            inputMode="numeric"
            maxLength={10}
            register={register}
            required
            onInput={onlyDigits(10)}
            error={errors.tenantWhatsapp}
          />

          <InputField
            label="Mobile Number"
            name="tenantMobileNumber"
            type="text" // ✅ FIX
            inputMode="numeric"
            maxLength={10}
            register={register}
            required
            onInput={onlyDigits(10)}
            error={errors.tenantMobileNumber}
          />

          {/* STATUS */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Tenant Status <span className="text-red-500">*</span>
            </label>

            <SelectField
              value={tenantStatus}
              onChange={(v) => setValue("tenantStatus", v)}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "DELETED", label: "Deleted" },
              ]}
              placeholder="Select status"
              error={errors.tenantStatus}
            />
          </div>

          {/* TENANT TYPE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Tenant Type <span className="text-red-500">*</span>
            </label>

            <SelectField
              value={watch("tenantType")}
              onChange={(v) => setValue("tenantType", v)}
              options={[
                { value: "PROPRIETORSHIP", label: "Proprietorship" },
                { value: "PARTNERSHIP", label: "Partnership" },
                { value: "PRIVATE_LIMITED", label: "Private Limited" },
              ]}
              placeholder="Select tenant type"
              error={errors.tenantType}
            />
          </div>

          {/* USER TYPE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              User Type <span className="text-red-500">*</span>
            </label>

            <SelectField
              value={watch("userType")}
              onChange={(v) => setValue("userType", v)}
              options={[
                { value: "RESELLER", label: "Reseller" },
                { value: "AZZUNIQUE", label: "Azzunique" },
                { value: "WHITELABEL", label: "White Label" },
              ]}
              placeholder="Select user type"
              error={errors.userType}
            />
          </div>
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

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className="w-full"
        >
          {isEditing ? "Update Tenant" : "Create Tenant"}
        </Button>

        {/* FOOTER */}
        <div className="pt-4 border-t border-border text-center">
          <div className="flex items-center justify-center text-muted-foreground gap-1">
            <Lock className="h-3 w-3" />
            <p className="text-xs">
              Tenant data is securely stored and audited
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
