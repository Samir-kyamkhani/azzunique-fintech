"use client";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Lock } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";

const CRITICAL_STATUSES = ["INACTIVE", "SUSPENDED", "DELETED"];

export default function MemberForm({
  initialData = null,
  isEditing = false,
  onSubmit,
  isPending = false,
  roleOptions = [],
  tenantOptions = [],
  onTenantSearch,
}) {
  const isUpdateMode = isEditing;

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: isEditing
      ? initialData
      : {
          firstName: "",
          lastName: "",
          email: "",
          mobileNumber: "",
          roleId: "",
          tenantId: "",
        },
  });

  const status = useWatch({ control, name: "userStatus" });
  const actionRequired = CRITICAL_STATUSES.includes(status);

  const submit = (data) => {
    clearErrors();

    if (isUpdateMode && actionRequired && !data.actionReason) {
      setError("actionReason", { message: "Action reason required" });
      return;
    }

    onSubmit(data, setError);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      {errors.root && <p className="text-red-500">{errors.root.message}</p>}

      <div className="grid md:grid-cols-2 gap-4">
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

        {!isEditing && (
          <>
            <InputField
              label="Email"
              name="email"
              type="email"
              register={register}
              required
              error={errors.email}
            />
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              register={register}
              required
              maxLength={10}
              error={errors.mobileNumber}
            />
          </>
        )}

        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <SelectField
              {...field}
              options={roleOptions}
              placeholder="Select Role"
            />
          )}
        />

        <Controller
          name="tenantId"
          control={control}
          render={({ field }) => (
            <SelectField
              {...field}
              options={tenantOptions}
              placeholder="Select Tenant"
              searchable
              onSearch={onTenantSearch}
            />
          )}
        />
      </div>

      {isUpdateMode && (
        <>
          <Controller
            name="userStatus"
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
              />
            )}
          />

          {actionRequired && (
            <InputField
              label="Action Reason"
              name="actionReason"
              register={register}
              required
              error={errors.actionReason}
            />
          )}
        </>
      )}

      <Button type="submit" loading={isPending} className="w-full">
        {isEditing ? "Update Member" : "Create Member"}
      </Button>

      <div className="text-xs text-muted-foreground flex justify-center gap-1 pt-2">
        <Lock className="h-3 w-3" /> Secure & audited
      </div>
    </form>
  );
}
