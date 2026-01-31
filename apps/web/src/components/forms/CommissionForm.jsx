"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { AlertCircle, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";

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
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      type: "USER", // 🔥 NEW
      commissionType: "PERCENTAGE",
      commissionValue: "",
      surchargeType: "FLAT",
      surchargeValue: "",
      gstApplicable: true,
      gstRate: 18,
      maxCommissionValue: "",
      isActive: true,
      ...initialData,
    },
  });

  const selectedType = useWatch({ control, name: "type" });

  const onFormSubmit = (data) => {
    clearErrors();
    onSubmit(data, setError);
  };

  return (
    <>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 🔥 RULE TYPE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Rule Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Rule Type"
                  disabled={isEditing} // lock on edit
                  options={[
                    { value: "USER", label: "User" },
                    { value: "ROLE", label: "Role" },
                  ]}
                />
              )}
            />
          </div>

          {/* 🔥 USER / ROLE ID */}
          {!isEditing && selectedType === "USER" && (
            <InputField
              label="User ID"
              name="userId"
              register={register}
              required
              error={errors.userId}
            />
          )}

          {!isEditing && selectedType === "ROLE" && (
            <InputField
              label="Role ID"
              name="roleId"
              register={register}
              required
              error={errors.roleId}
            />
          )}

          {/* COMMISSION TYPE */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Commission Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="commissionType"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Commission Type"
                  options={[
                    { value: "PERCENTAGE", label: "Percentage" },
                    { value: "FLAT", label: "Flat" },
                  ]}
                  error={errors.commissionType}
                />
              )}
            />
          </div>

          <InputField
            label="Commission Value"
            name="commissionValue"
            type="number"
            register={register}
            required
            error={errors.commissionValue}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Surcharge Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="surchargeType"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Surcharge Type"
                  options={[
                    { value: "PERCENTAGE", label: "Percentage" },
                    { value: "FLAT", label: "Flat" },
                  ]}
                  error={errors.surchargeType}
                />
              )}
            />
          </div>

          <InputField
            label="Surcharge Value"
            name="surchargeValue"
            type="number"
            register={register}
            required
            error={errors.surchargeValue}
          />

          <InputField
            label="GST Rate (%)"
            name="gstRate"
            type="number"
            register={register}
            error={errors.gstRate}
          />

          <InputField
            label="Max Commission Cap"
            name="maxCommissionValue"
            type="number"
            register={register}
            error={errors.maxCommissionValue}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Rule Status"
                  options={[
                    { value: true, label: "Active" },
                    { value: false, label: "Inactive" },
                  ]}
                  error={errors.isActive}
                />
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className="w-full"
        >
          {isEditing ? "Update Rule" : "Create Rule"}
        </Button>

        <div className="pt-4 border-t border-border text-center">
          <div className="flex items-center justify-center text-muted-foreground gap-1">
            <Lock className="h-3 w-3" />
            <p className="text-xs">
              Commission settings directly impact financial transactions
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
