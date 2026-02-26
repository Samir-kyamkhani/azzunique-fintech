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
  planOperatorMaps = [],
  rechargeOperatorMaps,
  circleMaps = [],
  onFieldChange,
  fetchPlans,
  plansLoading,
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

  const planOperatorOptions = planOperatorMaps.map((o) => ({
    label: o.internalOperatorCode,
    value: o.providerOperatorCode,
    key: o.id,
  }));

  const circleOptions = circleMaps.map((c) => ({
    label: c.internalCircleCode,
    value: c.providerCircleCode,
    key: c.id,
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

    try {
      await fetchPlans({ throwOnError: true });
      setStep(2);
    } catch (err) {
      setError("root", {
        message: err.message,
      });
    }
  };

  /* ================= SUBMIT ================= */

  const submitHandler = (data) => {
    if (!data.amount) {
      setError("amount", { message: "Please select a plan" });
      return;
    }

    // Find selected PLAN operator (by providerOperatorCode)
    const selectedPlanOperator = planOperatorMaps.find(
      (o) => o.providerOperatorCode === data.operatorCode,
    );

    if (!selectedPlanOperator) {
      setError("operatorCode", {
        message: "Invalid plan operator selected",
      });
      return;
    }

    // Now match RECHARGE operator using internalOperatorCode
    const matchedRechargeOperator = rechargeOperatorMaps.find(
      (o) =>
        o.internalOperatorCode === selectedPlanOperator.internalOperatorCode,
    );

    if (!matchedRechargeOperator) {
      setError("operatorCode", {
        message: "Recharge mapping not found for this operator",
      });
      return;
    }

    onSubmit(
      {
        ...data,
        operatorCode: matchedRechargeOperator.internalOperatorCode,
        amount: Number(data.amount),
        idempotencyKey: uuid(),
      },
      setError,
    );
  };

  return (
    <>
      {errors?.root && (
        <div className="mb-4 bg-destructive/10 text-red-500 border border-destructive/20 p-3 rounded">
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
                  options={planOperatorOptions}
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

            <Button
              type="button"
              onClick={handleContinue}
              className="w-full"
              loading={plansLoading}
            >
              View Plans
            </Button>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {!isRetryMode && step === 2 && (
          <div className="flex flex-col h-[70vh]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-primary hover:underline mb-2"
            >
              ← Change Details
            </button>

            {/* Scrollable Plans Area */}
            <div className="flex-1 overflow-y-auto pr-1">
              <PlansAndOffersList
                plans={plans}
                selectedPlan={selectedPlan}
                onSelect={(plan) => {
                  setSelectedPlan(plan);
                  setValue("amount", plan.rs);
                }}
              />
            </div>

            {/* Sticky Bottom Section */}
            <div className="pt-3 border-t bg-background sticky bottom-0">
              {selectedPlan && (
                <div className="mb-3 p-3 bg-primary/10 border border-primary/20 rounded text-sm">
                  <div className="font-medium">
                    Selected Plan: ₹{selectedPlan.rs}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPlan.desc}
                  </div>
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
            </div>
          </div>
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
