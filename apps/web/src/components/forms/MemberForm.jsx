"use client";

import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
} from "lucide-react";

import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";

const CRITICAL_STATUSES = ["INACTIVE", "SUSPENDED", "DELETED"];

export default function MemberForm({
  initialData = null,
  isEditing = false,
  onSubmit,
  isPending = false,
  error = null,
  roles = [],
  tenants = [
    {
      id: "tenant_001",
      name: "Azzuni Fintech Pvt Ltd",
    },
    {
      id: "tenant_002",
      name: "FinPay Solutions",
    },
    {
      id: "tenant_003",
      name: "PayWave Technologies",
    },
  ],
}) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      roleId: "",
      tenantId: "",
      userStatus: "ACTIVE",
      password: "",
      actionReason: "",
      ...initialData,
    },
  });

  const currentStatus = getValues("userStatus");

  const actionReasonRequired = useMemo(
    () => CRITICAL_STATUSES.includes(currentStatus),
    [currentStatus]
  );

  const validate = (data) => {
    if (!data.firstName?.trim())
      return setError("firstName", { message: "First name is required" });

    if (!data.lastName?.trim())
      return setError("lastName", { message: "Last name is required" });

    if (!data.email?.trim())
      return setError("email", { message: "Email is required" });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return setError("email", { message: "Invalid email address" });

    if (!/^[0-9]{10,15}$/.test(data.mobileNumber))
      return setError("mobileNumber", {
        message: "Mobile number must be 10–15 digits",
      });

    if (!data.roleId)
      return setError("roleId", { message: "Role is required" });

    if (!data.tenantId)
      return setError("tenantId", { message: "Tenant is required" });

    if (!isEditing && !data.password)
      return setError("password", { message: "Password is required" });

    if (actionReasonRequired && !data.actionReason?.trim())
      return setError("actionReason", {
        message: "Action reason is required",
      });

    return true;
  };

  const onFormSubmit = (data) => {
    clearErrors();
    if (validate(data) === true) {
      onSubmit(data);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg-border shadow-xl w-full max-w-2xl overflow-hidden">
      {/* HEADER */}
      <div className="bg-gradient-theme px-6 py-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-foreground/20 rounded-full">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-primary-foreground mb-2">
            {isEditing ? "Update Member" : "Create Member"}
          </h2>

          <p className="text-primary-foreground/90 text-sm">
            {isEditing
              ? "Manage member account and permissions"
              : "Add a new member to your organization"}
          </p>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        {(error || Object.keys(errors).length > 0) && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-border mb-4">
            <div className="flex items-center gap-2 text-destructive-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                {error?.message || Object.values(errors)[0]?.message}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* PERSONAL */}
          <InputField
            label="First Name"
            name="firstName"
            register={register}
            required
          />

          <InputField
            label="Last Name"
            name="lastName"
            register={register}
            required
          />

          <InputField
            label="Email Address"
            name="email"
            register={register}
            required
          />

          <InputField
            label="Mobile Number"
            name="mobileNumber"
            register={register}
            required
          />

          {/* ACCOUNT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Role <span className="text-destructive">*</span>
              </label>

              <SelectField
                value={getValues("roleId")}
                onChange={(v) => setValue("roleId", v)}
                options={roles.map((r) => ({
                  value: r.id,
                  label: r.name,
                }))}
                placeholder="Select Role"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Tenant <span className="text-destructive">*</span>
              </label>

              <SelectField
                value={getValues("tenantId")}
                onChange={(v) => setValue("tenantId", v)}
                options={tenants.map((t) => ({
                  value: t.id,
                  label: t.name,
                }))}
                placeholder="Select Tenant"
              />
            </div>
          </div>

          {!isEditing && (
            <InputField
              label="Password"
              name="password"
              register={register}
              required
              type={showPassword ? "text" : "password"}
              rightIcon={showPassword ? <EyeOff /> : <Eye />}
              onRightIconClick={() => setShowPassword((p) => !p)}
            />
          )}

          {isEditing && actionReasonRequired && (
            <InputField
              label="Action Reason"
              name="actionReason"
              register={register}
              required
            />
          )}

          <Button
            type="submit"
            loading={isPending}
            disabled={isPending}
            className="w-full"
          >
            {isEditing ? "Update Member" : "Create Member"}
          </Button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 pt-4 border-t border-border text-center">
          <div className="flex items-center justify-center text-muted-foreground mb-2">
            <Lock className="h-3 w-3 mr-1" />
            <p className="text-xs">
              Member data is securely stored and audited
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Fields marked with * are mandatory
          </p>
        </div>
      </div>
    </div>
  );
}
