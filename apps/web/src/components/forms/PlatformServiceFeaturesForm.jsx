"use client";

import { useForm, Controller } from "react-hook-form";
import InputField from "../ui/InputField";
import SelectField from "../ui/SelectField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";

export default function PlatformServiceFeatureForm({
  initialData,
  services = [], // 🔥 ALL SERVICES LIST
  onSubmit,
  isPending,
}) {
  const isEditMode = Boolean(initialData?.id);

  const serviceOptions = services.map((s) => ({
    label: `${s.code} - ${s.name}`, // 🔥 SEARCH BY CODE
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
      name: initialData?.name || "",
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const submitHandler = (data) => {
    if (isEditMode) {
      return onSubmit(
        {
          platformServiceId: data.platformServiceId,
          name: data.name,
          isActive: data.isActive,
        },
        setError,
      );
    }

    return onSubmit(data, setError);
  };

  return (
    <>
      {errors?.root && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm">{errors.root.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        {/* 🔥 PLATFORM SERVICE SELECT */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">
            Platform Service *
          </label>

          <Controller
            name="platformServiceId"
            control={control}
            rules={{ required: "Platform Service is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={field.onChange}
                options={serviceOptions}
                placeholder="Select Service"
                searchable
                error={errors.platformServiceId}
              />
            )}
          />
        </div>

        {/* CODE */}
        <InputField
          label="Code"
          name="code"
          register={register}
          required={!isEditMode}
          disabled={isEditMode} // 🔥 Code immutable update me
          error={errors.code}
        />

        {/* NAME */}
        <InputField
          label="Name"
          name="name"
          register={register}
          required
          error={errors.name}
        />

        {/* STATUS */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Status</label>

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
        </div>

        <Button type="submit" loading={isPending} className="w-full">
          {isEditMode ? "Update Feature" : "Create Feature"}
        </Button>
      </form>
    </>
  );
}
