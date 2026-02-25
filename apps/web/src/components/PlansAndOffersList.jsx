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
      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : highlight
            ? "border-warning/40 bg-warning/5 hover:shadow-sm"
            : "border-border hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-bold text-primary">₹{plan.rs}</div>

          {plan.validity && (
            <div className="text-xs text-muted-foreground mt-1">
              Validity: {plan.validity} Days
            </div>
          )}
        </div>

        {selected && <CheckCircle size={18} className="text-primary mt-1" />}
      </div>

      <div className="text-sm mt-3 leading-relaxed text-muted-foreground">
        {plan.desc}
      </div>
    </button>
  );
}
