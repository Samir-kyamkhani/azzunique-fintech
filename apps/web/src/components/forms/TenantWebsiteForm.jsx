"use client";

import { useForm } from "react-hook-form";
import { AlertCircle, Palette } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import TextareaField from "@/components/ui/TextareaField";
import { onlyDigits } from "@/lib/utils";

export default function TenantWebsiteForm({
  initialData = null,
  isPending,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      brandName: "",
      tagLine: "",
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      supportEmail: "",
      supportPhone: "",
      ...initialData,
    },
  });

  const onFormSubmit = (data) => {
    clearErrors();

    if (!data.brandName?.trim()) {
      setError("brandName", { message: "Brand name is required" });
      return;
    }

    onSubmit(data, setError);
  };

  return (
    <>
      {errors?.root && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 mb-6">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm">{errors.root.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <InputField
          label="Brand Name"
          name="brandName"
          placeholder="Brand Name"
          register={register}
          required
          error={errors.brandName}
        />

        <TextareaField
          label="Tag Line"
          name="tagLine"
          placeholder="Your trusted fintech partner"
          register={register}
          error={errors.tagLine}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Primary Color"
            name="primaryColor"
            type="color"
            register={register}
            error={errors.primaryColor}
          />

          <InputField
            label="Secondary Color"
            name="secondaryColor"
            type="color"
            register={register}
            error={errors.secondaryColor}
          />
        </div>

        <InputField
          label="Support Email"
          name="supportEmail"
          placeholder="support@example.com"
          register={register}
          error={errors.supportEmail}
        />

        <InputField
          label="Support Phone"
          name="supportPhone"
          placeholder="+919876543210"
          register={register}
          error={errors.supportPhone}
          inputMode="numeric"
          maxLength={10}
          onInput={onlyDigits(10)}
        />

        <Button type="submit" loading={isPending} className="w-full">
          Save Branding Settings
        </Button>

        <div className="pt-4 border-t border-border text-center">
          <div className="flex justify-center gap-1 text-muted-foreground">
            <Palette className="h-3 w-3" />
            <p className="text-xs">
              Branding changes apply across tenant pages
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
