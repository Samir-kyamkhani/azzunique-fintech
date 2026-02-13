"use client";

import { useForm, Controller } from "react-hook-form";
import InputField from "../ui/InputField";
import SelectField from "../ui/SelectField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";

export default function ServiceProviderForm({
  initialData,
  services = [], // 🔥 needed for platformServiceId select
  onSubmit,
  isPending,
}) {
  const isEditMode = Boolean(initialData?.id);

  const serviceOptions = services.map((s) => ({
    label: `${s.code} - ${s.name}`,
    value: s.id,
  }));

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      platformServiceId: initialData?.platformServiceId || "",
      code: initialData?.code || "",
      providerName: initialData?.providerName || "",
      handler: initialData?.handler || "",
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const submitHandler = (data) => {
    if (isEditMode) {
      // 🔥 UPDATE SCHEMA
      return onSubmit(
        {
          providerName: data.providerName,
          handler: data.handler,
          isActive: data.isActive,
        },
        setError,
      );
    }

    // 🔥 CREATE SCHEMA
    return onSubmit(data, setError);
  };

  return (
    <>
      {errors?.root && (
        <div className="mb-4 p-3 border rounded bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive inline mr-2" />
          {errors.root.message}
        </div>
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        {/* PLATFORM SERVICE SELECT */}
        {!isEditMode && (
          <Controller
            name="platformServiceId"
            control={control}
            rules={{ required: "Platform Service is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={serviceOptions}
                placeholder="Select Platform Service"
                searchable
                error={errors.platformServiceId}
              />
            )}
          />
        )}

        {/* CODE (immutable after create) */}
        <InputField
          label="Code"
          name="code"
          register={register}
          required={!isEditMode}
          disabled={isEditMode}
          error={errors.code}
        />

        {/* PROVIDER NAME */}
        <InputField
          label="Provider Name"
          name="providerName"
          register={register}
          required
          error={errors.providerName}
        />

        {/* HANDLER */}
        <InputField
          label="Handler (Class / Key)"
          name="handler"
          register={register}
          required
          error={errors.handler}
        />

        {/* STATUS */}
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <SelectField
              value={field.value}
              onChange={field.onChange}
              options={[
                { label: "Active", value: true },
                { label: "Inactive", value: false },
              ]}
            />
          )}
        />

        <Button type="submit" loading={isPending} className="w-full">
          {isEditMode ? "Update Provider" : "Create Provider"}
        </Button>
      </form>
    </>
  );
}
