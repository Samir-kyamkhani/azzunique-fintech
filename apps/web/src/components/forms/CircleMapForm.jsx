"use client";

import { useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";

export default function CircleMapForm({ initialData, onSubmit, isPending }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      internalCircleCode: initialData?.internalCircleCode || "",
      mplanCircleCode: initialData?.mplanCircleCode || "",
    },
  });

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
        className="space-y-4"
      >
        <InputField
          label="Internal Circle Code"
          name="internalCircleCode"
          register={register}
          required
        />

        <InputField
          label="MPLAN Circle Code"
          name="mplanCircleCode"
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
