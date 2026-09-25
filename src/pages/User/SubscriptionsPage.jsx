import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Feather,
  Rocket,
  Crown,
  Gem,
  Check,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { normalizePlan } from "../../data/subscriptionPlans";
import {
  apiGetSubscriptionPlans,
  apiStartSubscriptionCheckout,
} from "../../lib/api";

function StatusModal({ status, planName, onClose }) {
  const success = status === "success";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
        {success ? (
          <CheckCircle2
            className="mx-auto h-12 w-12 text-emerald-500"
            strokeWidth={1.5}
          />
        ) : (
          <XCircle
            className="mx-auto h-12 w-12 text-red-500"
            strokeWidth={1.5}
          />
        )}
        <h3 className="mt-3 text-base font-semibold text-black">
          {success ? "Payment successful" : "Payment failed"}
        </h3>
        <p className="mt-2 text-sm text-neutral-500">
          {success
            ? `Your ${planName} plan is now active.`
            : `Your payment for the ${planName} plan didn't go through. Your plan has not changed.`}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`mt-5 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition ${
            success
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-neutral-800 hover:bg-neutral-900"
          }`}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

const planTheme = {
  Free: {
    icon: Feather,
    iconWrap: "bg-neutral-100 text-neutral-500",
    glow: "",
    badgeClass: "bg-neutral-900 text-white",
    button: "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
    card: "border-neutral-200",
    checkBg: "bg-neutral-100 text-neutral-500",
  },
  Pro: {
    icon: Rocket,
    iconWrap: "bg-brand-100 text-brand-600",
    glow: "hover:shadow-brand-500/10",
    badgeClass: "bg-brand-500 text-white",
    button: "border border-brand-200 text-brand-600 hover:bg-brand-50",
    card: "border-neutral-200",
    checkBg: "bg-brand-100 text-brand-600",
  },
  Plus: {
    icon: Crown,
    iconWrap:
      "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/30",
    glow: "hover:shadow-violet-500/20",
    badgeClass: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white",
    button:
      "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:brightness-110",
    card: "border-violet-300 ring-2 ring-violet-500/20 scale-[1.03] shadow-lg shadow-violet-500/10",
    checkBg: "bg-violet-100 text-violet-600",
  },
  "Top Tier": {
    icon: Gem,
    iconWrap: "bg-neutral-900 text-white",
    glow: "hover:shadow-neutral-900/10",
    badgeClass: "bg-neutral-900 text-white",
    button:
      "border border-neutral-300 text-neutral-800 hover:bg-neutral-900 hover:text-white",
    card: "border-neutral-200",
    checkBg: "bg-neutral-100 text-neutral-700",
  },
};

function PlanCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-neutral-200" />
      <div className="mt-4 h-5 w-20 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-8 w-24 animate-pulse rounded bg-neutral-200" />
      <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-neutral-200" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="mt-6 h-10 w-full animate-pulse rounded-lg bg-neutral-200" />
    </div>
  );
}

export default function SubscriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cycle, setCycle] = useState("monthly");
  const [loadingPlanCode, setLoadingPlanCode] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [plans, setPlans] = useState([]);
  const [activePlanCode, setActivePlanCode] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [statusModal, setStatusModal] = useState(null);
  const isYearly = cycle === "yearly";

  async function loadPlans() {
    const data = await apiGetSubscriptionPlans();
    const list = (data?.plans || []).map(normalizePlan);
    setPlans(list);
    setActivePlanCode(
      data?.current_plan_code || list.find((p) => p.isCurrent)?.code || null,
    );
    return list;
  }

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const planCode = searchParams.get("plan");
    if (checkout) setSearchParams({}, { replace: true });

    loadPlans()
      .then((list) => {
        setLoadState("ready");
        if (!checkout || !planCode) return;
        const planName =
          list.find((p) => p.code === planCode)?.name || "selected";
        if (checkout === "success") {
          setStatusModal({ status: "success", planName });
        } else if (checkout === "cancelled") {
          setStatusModal({ status: "fail", planName });
        }
      })
      .catch((err) => {
        setLoadError(err.message || "Failed to load plans");
        setLoadState("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGetStarted(plan) {
    if (plan.code === activePlanCode) return;

    setCheckoutError("");
    setLoadingPlanCode(plan.code);
    try {
      const basePath = `${window.location.origin}/super-admin/subscriptions`;
      const { checkout_url } = await apiStartSubscriptionCheckout({
        plan_code: plan.code,
        billing_period: cycle,
        success_url: `${basePath}?checkout=success&plan=${plan.code}`,
        cancel_url: `${basePath}?checkout=cancelled&plan=${plan.code}`,
      });
      if (checkout_url) {
        window.location.href = checkout_url;
        return;
      }
      // No payment needed (e.g. the Free plan) — the switch is already saved.
      await loadPlans();
      setStatusModal({ status: "success", planName: plan.name });
    } catch (err) {
      setCheckoutError(err.message || "Failed to start checkout");
    }
    setLoadingPlanCode(null);
  }

  return (
    <div className="relative mx-auto ">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-tight text-black sm:text-4xl">
          Choose your plan
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-500">
          Simple, transparent pricing that scales with your business. Cancel
          anytime.
        </p>
        {checkoutError && (
          <p className="mx-auto mt-3 max-w-lg text-sm font-medium text-red-600">
            {checkoutError}
          </p>
        )}
      </div>

      <div className="mt-7 flex justify-center">
        <div className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 p-1">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              !isYearly
                ? "bg-white text-black shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              isYearly
                ? "bg-white text-black shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            Yearly
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {loadState === "error" && (
        <p className="mt-16 text-center text-sm font-medium text-red-600">
          {loadError}
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loadState === "loading" &&
          Array.from({ length: 4 }).map((_, i) => <PlanCardSkeleton key={i} />)}
        {plans.map((plan) => {
          const theme = planTheme[plan.name] || planTheme.Free;
          const Icon = theme.icon;
          const yearlyMonthlyEquivalent =
            plan.yearlyPricePerMonth ||
            (plan.yearlyPrice === 0 ? 0 : Math.round(plan.yearlyPrice / 12));
          const isActive = plan.code === activePlanCode;

          return (
            <div
              key={plan.id}
              className={`group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isActive
                  ? "border-emerald-400 ring-2 ring-emerald-500/20"
                  : theme.card
              } ${theme.glow}`}
            >
              {isActive ? (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-sm">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
                  ACTIVE PLAN
                </span>
              ) : (
                plan.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold tracking-wide shadow-sm ${theme.badgeClass}`}
                  >
                    {plan.badge}
                  </span>
                )
              )}

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-110 group-hover:rotate-3 ${theme.iconWrap}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>

              <p className="mt-4 text-lg font-bold text-black">{plan.name}</p>

              <div className="mt-1">
                <p className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-black">
                    {(isYearly ? plan.yearlyPrice : plan.price) === 0
                      ? "$0"
                      : `$${isYearly ? plan.yearlyPrice : plan.price}`}
                  </span>
                  <span className="text-xs font-medium text-neutral-400">
                    {isYearly ? "/year" : "/month"}
                  </span>
                </p>
                {isYearly && plan.price > 0 && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Billed{" "}
                    <span className="font-bold text-neutral-600">
                      ${yearlyMonthlyEquivalent} monthly
                    </span>
                  </p>
                )}
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                {plan.description}
              </p>

              <ul className="mt-5 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-neutral-700"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${theme.checkBg}`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleGetStarted(plan)}
                disabled={loadingPlanCode === plan.code || isActive}
                className={`mt-6 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 ${
                  isActive
                    ? "border border-emerald-300 bg-emerald-50 text-emerald-600"
                    : `disabled:opacity-60 ${theme.button}`
                }`}
              >
                {loadingPlanCode === plan.code && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isActive && <CheckCircle2 className="h-4 w-4" />}
                {isActive
                  ? "Current Plan"
                  : loadingPlanCode === plan.code
                    ? "Redirecting…"
                    : "Get Started"}
              </button>
            </div>
          );
        })}
      </div>

      {statusModal && (
        <StatusModal
          status={statusModal.status}
          planName={statusModal.planName}
          onClose={() => setStatusModal(null)}
        />
      )}
    </div>
  );
}
