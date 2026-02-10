"use client";

import { useForm, Controller } from "react-hook-form";
import SelectField from "../ui/SelectField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";
import TextareaField from "../ui/TextareaField";

export default function AssignPlatformServiceProviderForm({
  serviceId,
  providers = [],
  onSubmit,
  isPending,
}) {
  const providerOptions = providers.map((p) => ({
    label: `${p.code} - ${p.name}`,
    value: p.id,
  }));

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      platformServiceId: serviceId,
      serviceProviderId: "",
    },
  });

  const submitHandler = (data) => {
    let parsedConfig = {};

    try {
      parsedConfig = data.config ? JSON.parse(data.config) : {};
    } catch {
      return setError("config", { message: "Invalid JSON config" });
    }

    onSubmit(
      {
        platformServiceId: data.platformServiceId,
        serviceProviderId: data.serviceProviderId,
        config: parsedConfig,
      },
      setError,
    );
  };

  return (
    <>
      {errors?.root && (
        <div className="mb-4 rounded border border-destructive/20 bg-destructive/10 p-3">
          <div className="flex gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {errors.root.message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        {/* Provider Select */}
        <Controller
          name="serviceProviderId"
          control={control}
          rules={{ required: "Provider required" }}
          render={({ field }) => (
            <SelectField
              value={field.value}
              onChange={field.onChange}
              options={providerOptions}
              placeholder="Select Provider"
              searchable
              error={errors.serviceProviderId}
            />
          )}
        />

        {/* Config JSON */}
        <TextareaField
          label="Config JSON"
          name="config"
          register={register}
          error={errors.config}
          rows={4}
          placeholder='{"apiKey": "...", "timeout": 30}'
        />

        <Button type="submit" loading={isPending} className="w-full">
          Assign Provider
        </Button>
      </form>
    </>
  );
}
