"use client";

import { CheckCircle } from "lucide-react";

export default function PlansAndOffersList({
  offers,
  plans,
  selectedPlan,
  onSelect,
}) {
  // ✅ Always normalize offers to array
  const safeOffers = Array.isArray(offers) ? offers : [];

  // ✅ Handle plans in multiple possible shapes
  let normalizedPlans = null;

  if (Array.isArray(plans)) {
    // Backend accidentally sent flat array
    normalizedPlans = { Plans: plans };
  } else if (plans && typeof plans === "object") {
    normalizedPlans = plans;
  }

  const hasOffers = safeOffers.length > 0;

  const hasPlans =
    normalizedPlans &&
    Object.values(normalizedPlans).some(
      (val) => Array.isArray(val) && val.length > 0,
    );

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
          {safeOffers.map((offer, i) => (
            <PlanCard
              key={`offer-${i}`}
              plan={offer}
              selected={selectedPlan?.rs === offer?.rs}
              onClick={() => onSelect?.(offer)}
              highlight
            />
          ))}
        </SectionWrapper>
      )}

      {/* ================= NORMAL PLANS ================= */}
      {hasPlans &&
        Object.entries(normalizedPlans).map(([category, planList]) =>
          Array.isArray(planList) && planList.length > 0 ? (
            <SectionWrapper key={category} title={category}>
              {planList.map((plan, i) => (
                <PlanCard
                  key={`${category}-${i}`}
                  plan={plan}
                  selected={selectedPlan?.rs === plan?.rs}
                  onClick={() => onSelect?.(plan)}
                />
              ))}
            </SectionWrapper>
          ) : null,
        )}
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

function PlanCard({ plan = {}, selected, onClick, highlight = false }) {
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
          <div className="text-lg font-bold text-primary">₹{plan?.rs ?? 0}</div>

          {plan?.validity && (
            <div className="text-xs text-muted-foreground mt-1">
              Validity: {plan.validity} Days
            </div>
          )}
        </div>

        {selected && <CheckCircle size={18} className="text-primary mt-1" />}
      </div>

      <div className="text-sm mt-3 leading-relaxed text-muted-foreground">
        {plan?.desc ?? ""}
      </div>
    </button>
  );
}
