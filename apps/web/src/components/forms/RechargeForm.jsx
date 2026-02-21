"use client";

import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import { AlertCircle } from "lucide-react";
import SelectField from "../ui/SelectField";
import { v4 as uuid } from "uuid";
import PlansAndOffersList from "../PlansAndOffersList";

export default function RechargeForm({
  initialData,
  onSubmit,
  isPending,
  isRetryMode,
  plans = {},
  offers = [],
  planOperatorMaps = [],
  circleMaps = [],
  onFieldChange,
}) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mobileNumber: initialData?.mobileNumber || "",
      operatorCode: initialData?.operatorCode || "",
      circleCode: initialData?.circleCode || "",
      amount: initialData?.amount || "",
    },
  });

  /* ================= OPTIONS ================= */

  const operatorOptions = planOperatorMaps.map((o) => ({
    label: o.internalOperatorCode,
    value: o.internalOperatorCode,
  }));

  const circleOptions = circleMaps.map((c) => ({
    label: c.internalCircleCode,
    value: c.internalCircleCode,
  }));

  /* ================= STEP CONTROL ================= */

  const handleContinue = async () => {
    const valid = await trigger(["mobileNumber", "operatorCode", "circleCode"]);

    if (!valid) return;

    const { mobileNumber } = getValues();

    if (!mobileNumber || mobileNumber.length !== 10) {
      setError("mobileNumber", {
        message: "Enter valid 10 digit mobile number",
      });
      return;
    }

    setStep(2);
  };

  /* ================= SUBMIT ================= */

  const submitHandler = (data) => {
    if (!data.amount) {
      setError("amount", { message: "Please select a plan" });
      return;
    }

    onSubmit(
      {
        ...data,
        amount: Number(data.amount),
        idempotencyKey: uuid(),
      },
      setError,
    );
  };

  return (
    <>
      {errors?.root && (
        <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded">
          <div className="flex gap-2 items-center text-sm">
            <AlertCircle size={16} />
            {errors.root.message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
        {/* ================= STEP 1 ================= */}
        {!isRetryMode && step === 1 && (
          <>
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              register={(name) =>
                register(name, {
                  onChange: (e) => {
                    onFieldChange?.((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value,
                    }));
                  },
                })
              }
              required
              error={errors.mobileNumber}
            />

            <Controller
              name="operatorCode"
              control={control}
              rules={{ required: "Operator required" }}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    onFieldChange?.((prev) => ({
                      ...prev,
                      operatorCode: val,
                    }));
                  }}
                  options={operatorOptions}
                  placeholder="Select Operator"
                />
              )}
            />

            <Controller
              name="circleCode"
              control={control}
              rules={{ required: "Circle required" }}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    onFieldChange?.((prev) => ({
                      ...prev,
                      circleCode: val,
                    }));
                  }}
                  options={circleOptions}
                  placeholder="Select Circle"
                />
              )}
            />

            <Button type="button" onClick={handleContinue} className="w-full">
              View Plans
            </Button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {!isRetryMode && step === 2 && (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-primary hover:underline"
            >
              ← Change Details
            </button>

            {/* ✅ SINGLE REUSABLE COMPONENT */}
            <PlansAndOffersList
              offers={offers}
              plans={plans}
              selectedPlan={selectedPlan}
              onSelect={(plan) => {
                setSelectedPlan(plan);
                setValue("amount", plan.rs);
              }}
            />

            {/* Selected Summary */}
            {selectedPlan && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded text-sm">
                <div className="font-medium">
                  Selected Plan: ₹{selectedPlan.rs}
                </div>
                <div>{selectedPlan.desc}</div>
              </div>
            )}

            <Button
              type="submit"
              loading={isPending}
              className="w-full"
              disabled={!selectedPlan}
            >
              Recharge ₹{selectedPlan?.rs || ""}
            </Button>
          </>
        )}

        {/* ================= RETRY MODE ================= */}
        {isRetryMode && (
          <>
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              register={register}
              disabled
            />
            <InputField
              label="Amount"
              name="amount"
              register={register}
              disabled
            />
            <Button type="submit" loading={isPending} className="w-full">
              Retry Recharge
            </Button>
          </>
        )}
      </form>
    </>
  );
}
