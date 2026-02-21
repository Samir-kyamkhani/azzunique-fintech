"use client";

import { CheckCircle } from "lucide-react";

export default function PlansAndOffersList({
  offers = [],
  plans = {},
  selectedPlan,
  onSelect,
}) {
  const hasOffers = offers?.length > 0;
  const hasPlans = plans && Object.keys(plans).length > 0;

  if (!hasOffers && !hasPlans) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        No plans available for selected operator & circle.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= OFFERS SECTION ================= */}
      {hasOffers && (
        <SectionWrapper title="Special Offers">
          {offers.map((offer, i) => (
            <PlanCard
              key={`offer-${i}`}
              plan={offer}
              selected={selectedPlan?.rs === offer.rs}
              onClick={() => onSelect(offer)}
              highlight
            />
          ))}
        </SectionWrapper>
      )}

      {/* ================= NORMAL PLANS ================= */}
      {hasPlans &&
        Object.entries(plans).map(([category, planList]) => (
          <SectionWrapper key={category} title={category}>
            {planList.map((plan, i) => (
              <PlanCard
                key={`${category}-${i}`}
                plan={plan}
                selected={selectedPlan?.rs === plan.rs}
                onClick={() => onSelect(plan)}
              />
            ))}
          </SectionWrapper>
        ))}
    </div>
  );
}

/* ================= SECTION WRAPPER ================= */

function SectionWrapper({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>

      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ================= PLAN CARD ================= */

function PlanCard({ plan, selected, onClick, highlight = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border px-4 py-3 transition ${
        selected
          ? "border-primary bg-primary/10"
          : highlight
            ? "border-warning/40 bg-warning/5"
            : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="font-semibold">₹{plan.rs}</div>

        {selected && <CheckCircle size={16} className="text-primary" />}
      </div>

      <div className="text-sm mt-1">{plan.desc}</div>

      {plan.validity && (
        <div className="text-xs text-muted-foreground mt-1">
          Validity: {plan.validity} Days
        </div>
      )}
    </button>
  );
}
