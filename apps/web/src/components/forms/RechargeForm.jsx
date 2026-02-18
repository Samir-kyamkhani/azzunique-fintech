"use client";

import { Controller, useForm } from "react-hook-form";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";
import SelectField from "../ui/SelectField";

export default function RechargeForm({
  initialData,
  onSubmit,
  isPending,
  isRetryMode,
  plans = [],
  offers = [],
  operatorMaps = [],
  circleMaps = [],
  onFieldChange,
}) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobileNumber: initialData?.mobileNumber || "",
      operatorCode: initialData?.operatorCode || "",
      circleCode: initialData?.circleCode || "",
      amount: initialData?.amount || "",
    },
  });

  const operatorOptions = operatorMaps.map((o) => ({
    label: `${o.operatorName} (${o.operatorCode})`,
    value: o.operatorCode,
  }));

  const circleOptions = circleMaps.map((c) => ({
    label: `${c.circleName} (${c.circleCode})`,
    value: c.circleCode,
  }));

  const handleFieldChange = (field, value) => {
    onFieldChange?.((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitHandler = (data) => {
    onSubmit({ ...data, idempotencyKey: crypto.randomUUID() }, setError);
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
        {/* MOBILE */}
        <InputField
          label="Mobile Number"
          name="mobileNumber"
          register={(name) =>
            register(name, {
              onChange: (e) =>
                handleFieldChange("mobileNumber", e.target.value),
            })
          }
          required
          disabled={isRetryMode}
          error={errors.mobileNumber}
        />

        {/* OPERATOR */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Operator
          </label>

          <Controller
            name="operatorCode"
            control={control}
            rules={{ required: "Operator is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  handleFieldChange("operatorCode", val);
                }}
                options={operatorOptions}
                placeholder="Select Operator"
                disabled={isRetryMode}
              />
            )}
          />

          {errors.operatorCode && (
            <p className="text-sm text-destructive mt-1">
              {errors.operatorCode.message}
            </p>
          )}
        </div>

        {/* CIRCLE */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Select Circle
          </label>

          <Controller
            name="circleCode"
            control={control}
            rules={{ required: "Circle is required" }}
            render={({ field }) => (
              <SelectField
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  handleFieldChange("circleCode", val);
                }}
                options={circleOptions}
                placeholder="Select Circle"
                disabled={isRetryMode}
              />
            )}
          />

          {errors.circleCode && (
            <p className="text-sm text-destructive mt-1">
              {errors.circleCode.message}
            </p>
          )}
        </div>

        {/* OFFERS */}
        {!isRetryMode && offers.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h4 className="text-sm font-semibold mb-2">Available Offers</h4>
            {offers.map((o, i) => (
              <div key={i}>{o.desc}</div>
            ))}
          </div>
        )}

        {/* PLANS */}
        {!isRetryMode && plans.length > 0 && (
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <h4 className="text-sm font-semibold mb-3">Available Plans</h4>
            {plans.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setValue("amount", p.rs);
                  handleFieldChange("amount", p.rs);
                }}
                className="w-full text-left rounded border border-border px-3 py-2 hover:bg-muted transition"
              >
                ₹{p.rs} - {p.desc}
              </button>
            ))}
          </div>
        )}

        {/* AMOUNT */}
        <InputField
          label="Amount"
          name="amount"
          register={register}
          required
          disabled={isRetryMode}
          error={errors.amount}
        />

        <Button type="submit" loading={isPending} className="w-full">
          {isRetryMode ? "Retry Recharge" : "Recharge Now"}
        </Button>
      </form>
    </>
  );
}
