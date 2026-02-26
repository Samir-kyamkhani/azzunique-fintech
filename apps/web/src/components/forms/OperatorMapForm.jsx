"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";
import { useServiceFeatures } from "@/hooks/useAdminServices";

export default function OperatorMapForm({
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
      platformServiceFeatureId: initialData?.platformServiceFeatureId || "",
      serviceProviderId: initialData?.serviceProviderId || "",
      internalOperatorCode: initialData?.internalOperatorCode || "",
      providerOperatorCode: initialData?.providerOperatorCode || "",
    },
  });

  const selectedServiceId = useWatch({
    control,
    name: "platformServiceId",
  });
  
  const { data: features = [] } = useServiceFeatures(selectedServiceId);

  const serviceOptions = services.map((s) => ({
    label: `${s.name} (${s.code})`,
    value: s.id,
  }));

  const featureOptions = features.map((f) => ({
    label: `${f.name} (${f.code})`,
    value: f.id,
  }));

  const providerOptions = providers.map((p) => ({
    label: `${p.providerName} (${p.code})`,
    value: p.id,
  }));

  return (
    <>
      {errors?.root && (
        <div className="mb-4 text-destructive text-sm">
          {errors.root.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
        className="space-y-5"
      >
        {/* Platform Service */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Platform Service
          </label>

          <p className="text-xs text-muted-foreground mb-2">
            Choose the recharge service this operator belongs to (e.g., Mobile
            Recharge, DTH, Data Card, etc.).
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

        {/* Platform Service Feature */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Service Feature
          </label>

          <p className="text-xs text-muted-foreground mb-2">
            Choose the specific feature (e.g., INITIATE_RECHARGE, FETCH_PLANS,
            STATUS_CHECK).
          </p>

          <Controller
            name="platformServiceFeatureId"
            control={control}
            rules={{ required: "Feature is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={featureOptions}
                placeholder="Select Feature"
                disabled={!selectedServiceId}
              />
            )}
          />

          {errors.platformServiceFeatureId && (
            <p className="text-sm text-destructive mt-1">
              {errors.platformServiceFeatureId.message}
            </p>
          )}
        </div>

        {/* Service Provider */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Service Provider
          </label>

          <p className="text-xs text-muted-foreground mb-2">
            Choose the external provider whose API will be used (e.g., MPLAN,
            RechargeExchange, etc.).
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

        {/* Internal Operator Code */}
        <div>
          <InputField
            label="Internal Operator Code"
            name="internalOperatorCode"
            register={register}
            required
          />

          <p className="text-xs text-muted-foreground mt-1">
            This is your system&lsquo;s operator identifier (e.g., JIO_PREPAID,
            AIRTEL_POSTPAID). It is used internally inside your platform.
          </p>
        </div>

        {/* Provider Operator Code */}
        <div>
          <InputField
            label="Provider Operator Code"
            name="providerOperatorCode"
            register={register}
            required
          />

          <p className="text-xs text-muted-foreground mt-1">
            This is the operator code expected by the selected provider&lsquo;s
            API (e.g., JIO, RJ, OP_001). This value will be sent in the actual
            recharge API request.
          </p>
        </div>

        <Button type="submit" loading={isPending} className="w-full">
          Save Mapping
        </Button>
      </form>
    </>
  );
}
