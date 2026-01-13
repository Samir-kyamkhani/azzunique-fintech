"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { AlertCircle } from "lucide-react";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { onlyDigits } from "@/lib/utils";

export default function EmployeeForm({
  initialData = null,
  isPending,
  onSubmit,
  departments = [],
}) {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      departmentId: "",
      employeeStatus: "ACTIVE",
      actionReason: "",
      ...initialData,
    },
  });

  // ✅ React Compiler SAFE (replacement of watch)
  const status = useWatch({
    control,
    name: "employeeStatus",
  });

  const onFormSubmit = (data) => {
    clearErrors();

    // 🔥 only changed fields
    const payload = {};
    Object.keys(dirtyFields).forEach((key) => {
      payload[key] = data[key];
    });

    // 👇 status change hua hai to actionReason ensure karo
    if (
      payload.employeeStatus &&
      payload.employeeStatus !== initialData?.employeeStatus &&
      !payload.actionReason
    ) {
      setError("actionReason", {
        message: "Action reason is required",
      });
      return;
    }

    onSubmit(payload, setError);
  };

  return (
    <>
      {/* ROOT ERROR */}
      {errors?.root && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm">{errors.root.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            register={register}
            required
            error={errors.firstName}
          />

          <InputField
            label="Last Name"
            name="lastName"
            register={register}
            required
            error={errors.lastName}
          />

          <InputField
            label="Email"
            name="email"
            register={register}
            required
            error={errors.email}
          />

          <InputField
            label="Mobile Number"
            name="mobileNumber"
            maxLength={10}
            register={register}
            required
            onInput={onlyDigits(10)}
            error={errors.mobileNumber}
          />

          {/* DEPARTMENT */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Department <span className="text-destructive">*</span>
            </label>

            <Controller
              name="departmentId"
              control={control}
              rules={{ required: "Department is required" }}
              render={({ field }) => (
                <SelectField
                  options={departments}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.departmentId}
                />
              )}
            />
          </div>

          {/* STATUS */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">
              Status <span className="text-destructive">*</span>
            </label>

            <Controller
              name="employeeStatus"
              control={control}
              render={({ field }) => (
                <SelectField
                  options={[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Inactive", value: "INACTIVE" },
                    { label: "Suspended", value: "SUSPENDED" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.employeeStatus}
                />
              )}
            />
          </div>

          {/* ACTION REASON */}
          {status !== "ACTIVE" && (
            <InputField
              label="Action Reason"
              name="actionReason"
              register={register}
              error={errors.actionReason}
            />
          )}
        </div>

        <Button type="submit" loading={isPending} className="w-full">
          Save Employee
        </Button>
      </form>
    </>
  );
}
