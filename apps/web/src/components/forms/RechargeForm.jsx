"use client";

import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
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
}) {
  const [step, setStep] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState(null);

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

  const operatorOptions = operatorMaps.map((o) => ({
    label: o.internalOperatorCode,
    value: o.internalOperatorCode,
    key: o.id,
  }));

  const circleOptions = circleMaps.map((c) => ({
    label: c.internalCircleCode,
    value: c.internalCircleCode,
    key: c.id,
  }));

  const handleContinue = async () => {
    const valid = await trigger(["mobileNumber", "operatorCode", "circleCode"]);

    if (!valid) return;

    const { mobileNumber } = getValues();
    if (mobileNumber.length < 10) {
      setError("mobileNumber", {
        message: "Enter valid mobile number",
      });
      return;
    }

    setStep(2);
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
        {/* STEP 1 */}
        {!isRetryMode && step === 1 && (
          <>
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              register={register}
              required
              error={errors.mobileNumber}
            />

            <Controller
              name="operatorCode"
              control={control}
              rules={{ required: "Operator is required" }}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  options={operatorOptions}
                  placeholder="Select Operator"
                />
              )}
            />

            {errors.operatorCode && (
              <p className="text-sm text-destructive">
                {errors.operatorCode.message}
              </p>
            )}

            <Controller
              name="circleCode"
              control={control}
              rules={{ required: "Circle is required" }}
              render={({ field }) => (
                <SelectField
                  value={field.value}
                  onChange={field.onChange}
                  options={circleOptions}
                  placeholder="Select Circle"
                />
              )}
            />

            {errors.circleCode && (
              <p className="text-sm text-destructive">
                {errors.circleCode.message}
              </p>
            )}

            <Button type="button" onClick={handleContinue} className="w-full">
              Continue
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {!isRetryMode && step === 2 && (
          <>
            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-primary hover:underline"
            >
              ← Back
            </button>

            {/* OFFERS */}
            {offers.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/40 p-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Special Offers</h4>

                {offers.map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedOffer(o);
                      setValue("amount", o.rs);
                    }}
                    className={`w-full text-left rounded border px-3 py-2 mb-2 ${
                      selectedOffer?.rs === o.rs
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    ₹{o.rs} - {o.desc}
                  </button>
                ))}
              </div>
            )}

            {/* PLANS (Grouped by Category) */}
            {plans && Object.keys(plans).length > 0 && (
              <div className="space-y-6 mt-4">
                {Object.entries(plans).map(([category, planList]) => (
                  <div
                    key={category}
                    className="rounded-lg border border-border bg-muted/40 p-4"
                  >
                    <h4 className="text-sm font-semibold mb-3">{category}</h4>

                    {planList.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedOffer(p);
                          setValue("amount", p.rs);
                        }}
                        className={`w-full text-left rounded border px-3 py-2 mb-2 ${
                          selectedOffer?.rs === p.rs
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        ₹{p.rs} - {p.desc}
                        <div className="text-xs text-muted-foreground">
                          Validity: {p.validity} Days
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Manual Amount (only if nothing selected) */}
            {!selectedOffer && (
              <InputField
                label="Amount"
                name="amount"
                register={register}
                required
                error={errors.amount}
              />
            )}

            {/* Recharge Button only after selection or manual amount */}
            {(selectedOffer || getValues("amount")) && (
              <Button type="submit" loading={isPending} className="w-full mt-4">
                Recharge Now
              </Button>
            )}
          </>
        )}

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
