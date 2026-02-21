"use client";

import { Controller, useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import { AlertCircle } from "lucide-react";

export default function CircleMapForm({
  initialData,
  onSubmit,
  isPending,
  services = [],
  providers = [],
}) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      platformServiceId: initialData?.platformServiceId || "",
      serviceProviderId: initialData?.serviceProviderId || "",
      internalCircleCode: initialData?.internalCircleCode || "",
      providerCircleCode: initialData?.providerCircleCode || "",
    },
  });

  const serviceOptions = services.map((s) => ({
    label: `${s.name} (${s.code})`,
    value: s.id,
  }));

  const providerOptions = providers.map((p) => ({
    label: `${p.providerName} (${p.code})`,
    value: p.id,
  }));

  return (
    <>
      {errors?.root && (
        <div className="mb-4 text-destructive text-sm flex gap-2">
          <AlertCircle size={16} />
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
        className="space-y-6"
      >
        {/* Platform Service */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Platform Service
          </label>

          <p className="text-xs text-muted-foreground mb-2">
            Choose the service this circle belongs to (e.g., Mobile Recharge,
            DTH, Data Card). Circle mappings are service-specific.
          </p>

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

        {/* Service Provider */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Service Provider
          </label>

          <p className="text-xs text-muted-foreground mb-2">
            Choose the external API provider whose circle code will be mapped
            (e.g., MPLAN, RechargeExchange, etc.).
          </p>

          <Controller
            name="serviceProviderId"
            control={control}
            rules={{ required: "Provider is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={providerOptions}
                placeholder="Select Provider"
              />
            )}
          />

          {errors.serviceProviderId && (
            <p className="text-sm text-destructive mt-1">
              {errors.serviceProviderId.message}
            </p>
          )}
        </div>

        {/* Internal Circle Code */}
        <div>
          <InputField
            label="Internal Circle Code"
            name="internalCircleCode"
            register={register}
            required
          />

          <p className="text-xs text-muted-foreground mt-1">
            This is your system&lsquo;s circle identifier (e.g., RJ, DL, MH). It is
            used internally inside your platform.
          </p>
        </div>

        {/* Provider Circle Code */}
        <div>
          <InputField
            label="Provider Circle Code"
            name="providerCircleCode"
            register={register}
            required
          />

          <p className="text-xs text-muted-foreground mt-1">
            This is the circle code expected by the selected provider’s API.
            This value will be sent in the actual recharge request.
          </p>
        </div>

        <Button type="submit" loading={isPending} className="w-full">
          Save Mapping
        </Button>
      </form>
    </>
  );
}
