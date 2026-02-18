"use client";

import { Controller, useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import SelectField from "../ui/SelectField";

export default function OperatorMapForm({
  initialData,
  onSubmit,
  isPending,
  services = [],
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
      internalOperatorCode: initialData?.internalOperatorCode || "",
      providerCode: initialData?.providerCode || "",
      providerOperatorCode: initialData?.providerOperatorCode || "",
    },
  });

  const serviceOptions = services.map((s) => ({
    label: `${s.name} (${s.code})`,
    value: s.id,
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
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Platform Service
          </label>

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

        <InputField
          label="Internal Operator Code"
          name="internalOperatorCode"
          register={register}
          required
        />

        <InputField
          label="Provider Code"
          name="providerCode"
          register={register}
          required
        />

        <InputField
          label="Provider Operator Code"
          name="providerOperatorCode"
          register={register}
          required
        />

        <Button type="submit" loading={isPending} className="w-full">
          Save Mapping
        </Button>
      </form>
    </>
  );
}
