import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setActivePlanId } from "../../data/subscriptionPlans";
import { apiGetDashboard } from "../../lib/api";
import {
  platformDisplay,
  formatRelativeTime,
  formatScheduledLabel,
} from "../../lib/posts";
import { ErrorToast } from "../../components/Toast";

const platformLogos = {
  LinkedIn: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0A66C2]">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </span>
  ),
  Instagram: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] via-[#D62976] to-[#4F5BD5]">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="4"
          stroke="white"
          strokeWidth="2.5"
        />
        <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2.5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
      </svg>
    </span>
  ),
  Twitter: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    </span>
  ),
  Facebook: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1877F2]">
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="white">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    </span>
  ),
  Website: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
      <svg
        className="h-3 w-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path
          strokeLinecap="round"
          d="M3 12h18M12 3c2.485 2.4 3.75 5.55 3.75 9s-1.265 6.6-3.75 9c-2.485-2.4-3.75-5.55-3.75-9S9.515 5.4 12 3z"
        />
      </svg>
    </span>
  ),
  Medium: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
      M
    </span>
  ),
  WordPress: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#21759B] text-[9px] font-bold text-white">
      W
    </span>
  ),
  Blogger: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F57D00] text-[9px] font-bold text-white">
      B
    </span>
  ),
  Wix: (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0C6EFC] text-[8px] font-bold text-white">
      Wx
    </span>
  ),
};

const activityIcons = {
  drafted: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),
  approved: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12.75l2.25 2.25L15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  ),
  scheduled: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  published: (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  ),
};

const activityIconBg = {
  drafted: "bg-purple-100 text-purple-600",
  approved: "bg-cyan-100 text-cyan-600",
  scheduled: "bg-orange-100 text-orange-500",
  published: "bg-brand-100 text-brand-600",
};

const RECENT_ACTIVITY_LIMIT = 10;

function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-neutral-200 bg-white p-5">
          <div className="h-7 w-14 animate-pulse rounded bg-neutral-200" />
          <div className="mt-2 h-3.5 w-28 animate-pulse rounded bg-neutral-200" />
          <div className="mt-3 h-3 w-36 animate-pulse rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}

function PlatformCardSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-3.5 w-20 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="mb-3 flex items-center justify-between gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 space-y-1.5 text-center">
            <div className="mx-auto h-5 w-6 animate-pulse rounded bg-neutral-200" />
            <div className="mx-auto h-2 w-10 animate-pulse rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="h-1.5 animate-pulse rounded-full bg-neutral-200" />
    </div>
  );
}

function TopPostSkeleton() {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="h-3 w-28 animate-pulse rounded bg-neutral-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-3.5 w-5/6 animate-pulse rounded bg-neutral-200" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="mt-5 flex gap-6 border-t border-neutral-200 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-5 w-8 animate-pulse rounded bg-neutral-200" />
            <div className="h-2 w-12 animate-pulse rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3.5">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-neutral-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-neutral-200" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}

function ComingUpSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="h-5 w-10 shrink-0 animate-pulse rounded bg-neutral-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-neutral-200" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const signupPlanStatus = searchParams.get("signup_plan");
    if (!signupPlanStatus) return;

    const planId = searchParams.get("plan");
    setActivePlanId(signupPlanStatus === "success" && planId ? planId : "free");
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    apiGetDashboard()
      .then((data) => {
        if (cancelled) return;
        setDashboard(data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load dashboard");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboard?.stats || {};
  const platforms = dashboard?.platforms || [];
  const topPost = dashboard?.top_post || null;
  const recentActivity = dashboard?.recent_activity || [];
  const comingUp = dashboard?.coming_up || [];

  const publishedPlatformNames = (stats.published_platforms || []).map(
    platformDisplay,
  );
  const oldestAwaiting = formatRelativeTime(stats.oldest_awaiting_at);
  const nextScheduled = formatScheduledLabel(stats.next_scheduled_at);

  const statCards = [
    {
      value: stats.drafted_this_week ?? 0,
      label: "Drafted this week",
      accent: "text-brand-500",
      detail: stats.drafted_platforms ? (
        <span className="inline-flex items-center gap-1">
          <svg
            className="h-3 w-3 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 19V5m0 0l-6 6m6-6l6 6"
            />
          </svg>
          across {stats.drafted_platforms} platform
          {stats.drafted_platforms === 1 ? "" : "s"}
        </span>
      ) : (
        "No drafts yet"
      ),
      detailColor: "text-brand-500",
    },
    {
      value: stats.awaiting_review ?? 0,
      label: "Awaiting your review",
      accent: "text-orange-500",
      detail: oldestAwaiting ? `Oldest: ${oldestAwaiting}` : "Nothing pending",
      detailColor: "text-orange-500",
    },
    {
      value: stats.scheduled ?? 0,
      label: "Scheduled to post",
      accent: "text-black",
      detail: nextScheduled ? `Next: ${nextScheduled}` : "Nothing scheduled",
      detailColor: "text-black",
    },
    {
      value: stats.published_this_month ?? 0,
      label: "Published this month",
      accent: "text-brand-500",
      detail: publishedPlatformNames.length
        ? `Across ${publishedPlatformNames.join(", ")}`
        : "Nothing published yet",
    },
  ];

  return (
    <div className="space-y-4">
      {status === "error" && (
        <ErrorToast message={error} onClose={() => setStatus("ready")} />
      )}

      {/* Stat Cards */}
      {status === "loading" ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-neutral-200 bg-white p-5"
            >
              <p className={`text-3xl font-bold ${card.accent}`}>
                {card.value}
              </p>
              <p className="mt-1 text-sm text-neutral-500">{card.label}</p>
              <p
                className={`mt-2 text-xs font-medium ${card.detailColor ?? ""}`}
              >
                {card.detail}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Middle Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Platforms at a glance */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">
              Platforms at a glance
            </h2>
            <button
              onClick={() => navigate("/calendar")}
              className="group flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Open calendar
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
          {status === "loading" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PlatformCardSkeleton key={i} />
              ))}
            </div>
          ) : platforms.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400">
              No platform activity yet
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((p) => {
                const name = platformDisplay(p.platform);
                const total =
                  (p.drafted || 0) + (p.scheduled || 0) + (p.published || 0);
                return (
                  <div
                    key={p.platform}
                    className="rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="shrink-0">
                        {platformLogos[name] || platformLogos.Website}
                      </span>
                      <span className="truncate text-sm font-semibold text-black">
                        {name}
                      </span>
                    </div>
                    <div className="mb-3 flex items-center justify-between gap-1">
                      <div className="min-w-0 flex-1 text-center">
                        <p className="text-lg font-bold text-black">
                          {p.drafted ?? 0}
                        </p>
                        <p className="truncate text-[9px] font-semibold tracking-wider text-neutral-400">
                          DRAFTED
                        </p>
                      </div>
                      <div className="min-w-0 flex-1 text-center">
                        <p className="text-lg font-bold text-black">
                          {p.scheduled ?? 0}
                        </p>
                        <p className="truncate text-[9px] font-semibold tracking-wider text-neutral-400">
                          SCHEDULED
                        </p>
                      </div>
                      <div className="min-w-0 flex-1 text-center">
                        <p className="text-lg font-bold text-black">
                          {p.published ?? 0}
                        </p>
                        <p className="truncate text-[9px] font-semibold tracking-wider text-neutral-400">
                          PUBLISHED
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: total
                            ? `${((p.published || 0) / total) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top post this week */}
        <div className="min-w-0">
          <h2 className="mb-3 text-xl font-bold text-black">
            Top post this week
          </h2>
          {status === "loading" ? (
            <TopPostSkeleton />
          ) : !topPost ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-400">
              No published posts yet
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-orange-500">
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                BEST PERFORMER
              </p>
              <p className="text-sm leading-relaxed text-neutral-700">
                {topPost.text || topPost.title || "Untitled"}
              </p>
              {topPost.metrics_available ? (
                <div className="mt-5 border-t border-neutral-200 pt-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-lg font-bold text-black">
                        {topPost.views ?? 0}
                      </p>
                      <p className="text-[9px] font-semibold tracking-wider text-neutral-400">
                        VIEWS
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-black">
                        {topPost.reactions ?? 0}
                      </p>
                      <p className="text-[9px] font-semibold tracking-wider text-neutral-400">
                        REACTIONS
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-black">
                        {topPost.reposts ?? 0}
                      </p>
                      <p className="text-[9px] font-semibold tracking-wider text-neutral-400">
                        REPOSTS
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-neutral-400">
                  Metrics not available yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent activity */}
        <div className="min-w-0">
          <h2 className="mb-3 text-xl font-bold text-black">Recent activity</h2>
          {status === "loading" ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <ActivityRowSkeleton key={i} />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-400">
              No recent activity
            </div>
          ) : (
            <div className="max-h-105 space-y-2 overflow-y-auto pr-1">
              {recentActivity.slice(0, RECENT_ACTIVITY_LIMIT).map((item, i) => (
                <div
                  key={`${item.item_id}-${i}`}
                  className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3.5"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activityIconBg[item.type] || "bg-neutral-200 text-neutral-600"}`}
                  >
                    {activityIcons[item.type] || activityIcons.drafted}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">
                      {item.message}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400">
                      {formatRelativeTime(item.at, { uppercase: true })}
                      {item.platform
                        ? ` • ${platformDisplay(item.platform)}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coming up */}
        <div className="min-w-0">
          <h2 className="mb-3 text-xl font-bold text-black">Coming up</h2>
          {status === "loading" ? (
            <ComingUpSkeleton />
          ) : (
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              {comingUp.length === 0 ? (
                <p className="text-sm text-neutral-400">No upcoming events</p>
              ) : (
                <div className="space-y-3">
                  {comingUp.map((event, i) => {
                    const date = new Date(event.scheduled_at);
                    const dateLabel = Number.isNaN(date.getTime())
                      ? ""
                      : date
                          .toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                          .toUpperCase();
                    return (
                      <div key={event.id}>
                        {i > 0 && (
                          <div className="mb-4 border-t border-neutral-200" />
                        )}
                        <div className="flex items-start gap-4">
                          <span className="shrink-0 rounded bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600">
                            {dateLabel}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-black wrap-break-word">
                              {event.title || "Untitled"}
                            </p>
                            <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400">
                              {platformDisplay(event.platform)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
