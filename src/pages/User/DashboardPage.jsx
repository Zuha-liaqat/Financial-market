import { useEffect, useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CircleCheck,
  Clock,
  FilePen,
  Plus,
  Send,
  Star,
  TriangleAlert,
} from "lucide-react";
import {
  apiGetDashboard,
  apiListPlatformCredentials,
  apiVerifyPaymentSession,
} from "../../lib/api";
import { takeCheckoutSession } from "../../data/subscriptionPlans";
import {
  platformDisplay,
  formatRelativeTime,
  formatScheduledLabel,
} from "../../lib/posts";
import { ErrorToast } from "../../components/Toast";
import {
  PinterestIcon,
  ThreadsIcon,
  TikTokIcon,
} from "../../components/SocialIcons";

// Brand colour and white glyph for each platform, keyed by display name.
const PLATFORM_META = {
  LinkedIn: {
    color: "#0A66C2",
    glyph: (
      <svg viewBox="0 0 24 24" fill="white" className="h-[55%] w-[55%]">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    ),
  },
  Instagram: {
    color: "#E4405F",
    background: "linear-gradient(45deg,#FEDA75,#FA7E1E,#D62976,#4F5BD5)",
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%]">
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="white" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="2.5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
      </svg>
    ),
  },
  Twitter: {
    color: "#111820",
    glyph: (
      <svg viewBox="0 0 24 24" fill="white" className="h-[50%] w-[50%]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  Facebook: {
    color: "#1877F2",
    glyph: (
      <svg viewBox="0 0 24 24" fill="white" className="h-[55%] w-[55%]">
        <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" />
      </svg>
    ),
  },
  Threads: {
    color: "#000000",
    glyph: <ThreadsIcon color="#fff" className="h-[50%] w-[50%]" />,
  },
  TikTok: {
    color: "#FE2C55",
    background: "#111820",
    glyph: <TikTokIcon color="#fff" className="h-[50%] w-[50%]" />,
  },
  Pinterest: {
    color: "#E60023",
    glyph: <PinterestIcon color="#fff" className="h-[55%] w-[55%]" />,
  },
  Website: {
    color: "#3a5f87",
    glyph: (
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-[55%] w-[55%]">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M3 12h18M12 3c2.485 2.4 3.75 5.55 3.75 9s-1.265 6.6-3.75 9c-2.485-2.4-3.75-5.55-3.75-9S9.515 5.4 12 3z" />
      </svg>
    ),
  },
  Medium: { color: "#000000", letter: "M" },
  WordPress: { color: "#21759B", letter: "W" },
  Blogger: { color: "#F57D00", letter: "B" },
  Wix: { color: "#0C6EFC", letter: "Wx" },
};

function platformMeta(name) {
  return PLATFORM_META[name] || PLATFORM_META.Website;
}

function PlatformBadge({ name, size = "h-9 w-9", rounded = "rounded-lg", textClass = "text-[10px]" }) {
  const meta = platformMeta(name);
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center ${rounded} ${textClass} font-bold text-white`}
      style={{ background: meta.background || meta.color }}
    >
      {meta.glyph || meta.letter}
    </span>
  );
}

const activityIcons = {
  drafted: FilePen,
  approved: Star,
  scheduled: Clock,
  published: Send,
};

const activityIconBg = {
  drafted: "bg-purple-50 text-purple-600",
  approved: "bg-cyan-50 text-cyan-600",
  scheduled: "bg-orange-50 text-orange-500",
  published: "bg-brand-50 text-brand-600",
};

const RECENT_ACTIVITY_LIMIT = 10;
const COMING_UP_LIMIT = 4;

const cardClass = "rounded-2xl border border-neutral-200 bg-white shadow-sm";

function sum(list, key) {
  return list.reduce((total, item) => total + (item[key] || 0), 0);
}

// "TODAY • 2:30 PM", "TOMORROW • 9:00 AM" or "OCT 3 • 4:15 PM".
function comingUpLabel(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  let day = date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
  if (date.toDateString() === today.toDateString()) day = "TODAY";
  else if (date.toDateString() === tomorrow.toDateString()) day = "TOMORROW";
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} • ${time}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 7;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Per-day count of one activity type over the last TREND_DAYS days, oldest first.
function dailyCounts(activity, type) {
  const counts = Array(TREND_DAYS).fill(0);
  const today = startOfDay(new Date());
  activity.forEach((item) => {
    if (item.type !== type || !item.at) return;
    const daysAgo = Math.round((today - startOfDay(item.at)) / DAY_MS);
    if (daysAgo >= 0 && daysAgo < TREND_DAYS) counts[TREND_DAYS - 1 - daysAgo] += 1;
  });
  return counts;
}

function formatDuration(ms) {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

// Approvals in the last TREND_DAYS days, plus the average time from draft to approval.
function approvalStats(activity) {
  const since = startOfDay(new Date()) - (TREND_DAYS - 1) * DAY_MS;
  const approvals = activity.filter(
    (item) => item.type === "approved" && item.at && new Date(item.at).getTime() >= since,
  );
  const reviewTimes = approvals
    .map((approved) => {
      const drafted = activity.find(
        (item) => item.type === "drafted" && item.item_id === approved.item_id,
      );
      return drafted ? new Date(approved.at) - new Date(drafted.at) : null;
    })
    .filter((ms) => ms !== null && ms >= 0);
  const avgReviewMs = reviewTimes.length
    ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length
    : null;
  const lastApprovedAt = approvals.reduce(
    (latest, item) => (!latest || item.at > latest ? item.at : latest),
    null,
  );
  return { count: approvals.length, avgReviewMs, lastApprovedAt };
}

// Per-day count of drafts that have no approval or publish event yet, by the day they were drafted.
function pendingDailyCounts(activity) {
  const reviewed = new Set(
    activity
      .filter((item) => item.type === "approved" || item.type === "published")
      .map((item) => item.item_id),
  );
  return dailyCounts(
    activity.filter((item) => !reviewed.has(item.item_id)),
    "drafted",
  );
}

// Smooth curve through the points (Catmull-Rom converted to cubic Béziers).
function smoothPath(points) {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const SPARK_W = 200;
const SPARK_H = 56;
const SPARK_PAD = 6;

// Line chart with a soft gradient fill underneath; the line draws itself in on mount.
function Sparkline({ values, color }) {
  const gradientId = useId();
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const max = Math.max(...values);
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * SPARK_W,
    max
      ? SPARK_PAD + (1 - v / max) * (SPARK_H - SPARK_PAD * 2)
      : SPARK_H - SPARK_PAD * 2,
  ]);
  const line = smoothPath(points);
  const area = `${line} L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z`;

  return (
    <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" className="h-14 w-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill={`url(#${gradientId})`}
        className="transition-opacity delay-300 duration-700"
        style={{ opacity: drawn ? 1 : 0 }}
      />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength="1"
        strokeDasharray="1"
        className="transition-[stroke-dashoffset] duration-1000 ease-out"
        style={{ strokeDashoffset: drawn ? 0 : 1 }}
      />
    </svg>
  );
}

function DeltaText({ value, suffix, colorClass }) {
  return (
    <span className={`text-xs font-semibold ${value ? colorClass : "text-neutral-400"}`}>
      +{value} {suffix}
    </span>
  );
}

function StatCard({ label, icon: Icon, iconClass, value, valueClass = "text-black", extra, visual, footer }) {
  return (
    <div className={`${cardClass} flex flex-col p-5`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-widest text-neutral-500">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
        {extra}
      </div>
      <div className="mt-3">{visual}</div>
      <div className="mt-3 text-xs text-neutral-400">{footer}</div>
    </div>
  );
}

// Ring chart of each platform's share of all content.
function ShareDonut({ slices, total }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F1F3F6" strokeWidth="11" />
        {slices.map((s) => {
          const length = (s.value / total) * circumference;
          const circle = (
            <circle
              key={s.name}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="11"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-black">{total}</p>
        <p className="text-[10px] font-semibold tracking-widest text-neutral-400">TOTAL POSTS</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-black">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse rounded bg-neutral-200 ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={`${cardClass} space-y-3 p-5`}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [connectedKeys, setConnectedKeys] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const signupPlanStatus = searchParams.get("signup_plan");
    if (!signupPlanStatus) return;

    // Coming back from the signup checkout: confirm the payment so the plan
    // activates right away.
    if (signupPlanStatus === "success") {
      const sessionId = takeCheckoutSession(searchParams.get("session_id"));
      if (sessionId) apiVerifyPaymentSession(sessionId).catch(() => {});
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all([
      apiGetDashboard(),
      // If this fails the channel cards just show no connected accounts.
      apiListPlatformCredentials().catch(() => []),
    ])
      .then(([data, credentials]) => {
        if (cancelled) return;
        setDashboard(data);
        setConnectedKeys(
          (credentials || [])
            .filter((c) => c.is_connected)
            .map((c) => c.platform),
        );
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

  const loading = status === "loading";
  const stats = dashboard?.stats || {};
  const topPost = dashboard?.top_post || null;
  const recentActivity = dashboard?.recent_activity || [];
  const comingUp = dashboard?.coming_up || [];
  const platforms = (dashboard?.platforms || []).map((p) => {
    const name = platformDisplay(p.platform);
    const drafted = p.drafted || 0;
    const scheduled = p.scheduled || 0;
    const published = p.published || 0;
    return {
      ...p,
      name,
      drafted,
      scheduled,
      published,
      total: drafted + scheduled + published,
      color: platformMeta(name).color,
    };
  });

  const totalPublished = sum(platforms, "published") || stats.published_this_month || 0;
  const approvals = approvalStats(recentActivity);
  const scheduledFeeds = platforms.filter((p) => p.scheduled > 0).length;
  const awaiting = stats.awaiting_review ?? 0;
  const oldestAwaiting = formatRelativeTime(stats.oldest_awaiting_at);
  const nextScheduled = formatScheduledLabel(stats.next_scheduled_at);

  // The channel cards only list accounts the company has connected, including ones with no content yet.
  const connectedPlatforms = connectedKeys.map((key) => {
    const name = platformDisplay(key);
    return (
      platforms.find((p) => p.name === name) || {
        platform: key,
        name,
        drafted: 0,
        scheduled: 0,
        published: 0,
        total: 0,
        color: platformMeta(name).color,
      }
    );
  });

  const shareSlices = connectedPlatforms.filter((p) => p.total > 0).sort((a, b) => b.total - a.total);
  const shareTotal = sum(shareSlices, "total");

  return (
    <div className="space-y-5">
      {status === "error" && (
        <ErrorToast message={error} onClose={() => setStatus("ready")} />
      )}

      {/* Stat cards */}
      {loading ? (
        <StatSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="TOTAL PUBLISHED"
            icon={Send}
            iconClass="bg-brand-50 text-brand-600"
            value={totalPublished}
            extra={<DeltaText value={stats.published_this_month ?? 0} suffix="this month" colorClass="text-emerald-600" />}
            visual={<Sparkline values={dailyCounts(recentActivity, "published")} color="#1D8BE0" />}
            footer={
              platforms.some((p) => p.published)
                ? `Live on ${platforms.filter((p) => p.published).map((p) => p.name).join(", ")}`
                : "Nothing published yet"
            }
          />
          <StatCard
            label="APPROVED"
            icon={CircleCheck}
            iconClass="bg-emerald-50 text-emerald-600"
            value={approvals.count}
            extra={
              <span className={`text-xs font-semibold ${approvals.avgReviewMs !== null ? "text-emerald-600" : "text-neutral-400"}`}>
                {approvals.avgReviewMs !== null
                  ? `Avg review ${formatDuration(approvals.avgReviewMs)}`
                  : "Last 7 days"}
              </span>
            }
            visual={<Sparkline values={dailyCounts(recentActivity, "approved")} color="#10B981" />}
            footer={
              approvals.lastApprovedAt
                ? `Last approved ${formatRelativeTime(approvals.lastApprovedAt)}`
                : "Nothing approved this week"
            }
          />
          <StatCard
            label="SCHEDULED POSTS"
            icon={Clock}
            iconClass="bg-indigo-50 text-indigo-600"
            value={stats.scheduled ?? 0}
            extra={
              <span className="text-sm text-neutral-500">
                Across {scheduledFeeds} feed{scheduledFeeds === 1 ? "" : "s"}
              </span>
            }
            visual={<Sparkline values={dailyCounts(recentActivity, "scheduled")} color="#6366F1" />}
            footer={nextScheduled ? `Next: ${nextScheduled}` : "Nothing scheduled"}
          />
          <StatCard
            label="PENDING REVIEW"
            icon={TriangleAlert}
            iconClass="bg-orange-50 text-orange-500"
            value={awaiting}
            extra={
              <span className={`text-xs font-semibold ${oldestAwaiting ? "text-orange-500" : "text-neutral-400"}`}>
                {oldestAwaiting ? `Oldest ${oldestAwaiting}` : "All caught up"}
              </span>
            }
            visual={<Sparkline values={pendingDailyCounts(recentActivity)} color="#F97316" />}
            footer={
              <Link
                to="/approval-queue"
                className="inline-flex items-center gap-1 transition hover:text-brand-600"
              >
                {awaiting ? "Review in Approval Queue" : "Open Approval Queue"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
        </div>
      )}

      {/* Channel status + share */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className={`${cardClass} min-w-0 p-6`}>
          <SectionHeader
            title="Channel Status"
            subtitle="Drafted, scheduled and published content on each channel"
            action={
              <Link
                to="/calendar"
                className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Open calendar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          {loading ? (
            <PanelSkeleton rows={2} />
          ) : connectedPlatforms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-400">
              No connected channels yet.{" "}
              <Link to="/integrations" className="font-semibold text-brand-600 hover:underline">
                Connect a channel
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {connectedPlatforms.map((p) => {
                const publishedPct = p.total ? Math.round((p.published / p.total) * 100) : 0;
                return (
                  <div key={p.platform} className="rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center gap-3">
                      <PlatformBadge name={p.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-black">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.drafted} drafted</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-emerald-600">
                        {publishedPct}% live
                      </span>
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${publishedPct}%`, background: p.color }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-neutral-500">{p.published} Published</span>
                      <span className="font-medium text-black">{p.scheduled} Scheduled</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`${cardClass} min-w-0 p-6`}>
          <SectionHeader
            title="Channel Share"
            action={
              !loading && (
                <span className="shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  {shareSlices.length} Active
                </span>
              )
            }
          />
          {loading ? (
            <Skeleton className="mx-auto h-44 w-44 rounded-full" />
          ) : shareTotal === 0 ? (
            <div className="flex h-44 items-center justify-center text-sm text-neutral-400">
              No content yet
            </div>
          ) : (
            <>
              <ShareDonut slices={shareSlices.map((s) => ({ name: s.name, value: s.total, color: s.color }))} total={shareTotal} />
              <div className="mt-6 space-y-2.5 border-t border-neutral-100 pt-4">
                {shareSlices.map((s) => (
                  <div key={s.platform} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 truncate text-neutral-700">{s.name}</span>
                    <span className="font-semibold text-black">
                      {Math.round((s.total / shareTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Activity + coming up */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className={`${cardClass} min-w-0 p-6`}>
          <SectionHeader title="Recent Activity" subtitle="The latest changes across your content" />

          {!loading && topPost && (
            <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest text-orange-500">
                <Star className="h-3.5 w-3.5" fill="currentColor" />
                TOP POST THIS WEEK
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-700">
                {topPost.text || topPost.title || "Untitled"}
              </p>
              {topPost.metrics_available && (
                <p className="mt-2 text-xs font-medium text-neutral-500">
                  {topPost.views ?? 0} views · {topPost.reactions ?? 0} reactions · {topPost.reposts ?? 0} reposts
                </p>
              )}
            </div>
          )}

          {loading ? (
            <PanelSkeleton rows={4} />
          ) : recentActivity.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">No recent activity</p>
          ) : (
            <div className="max-h-105 space-y-1 overflow-y-auto pr-1">
              {recentActivity.slice(0, RECENT_ACTIVITY_LIMIT).map((item, i) => {
                const Icon = activityIcons[item.type] || FilePen;
                return (
                  <div
                    key={`${item.item_id}-${i}`}
                    className="flex items-center gap-3.5 rounded-xl px-2 py-2.5 transition hover:bg-neutral-50"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activityIconBg[item.type] || "bg-neutral-100 text-neutral-600"}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-black">{item.message}</p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-neutral-400">
                        {formatRelativeTime(item.at, { uppercase: true })}
                        {item.platform ? ` • ${platformDisplay(item.platform)}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`${cardClass} flex min-w-0 flex-col p-6`}>
          <SectionHeader
            title="Coming Up"
            action={
              <Link to="/calendar" className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700">
                View All
              </Link>
            }
          />
          {loading ? (
            <PanelSkeleton rows={3} />
          ) : comingUp.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">Nothing scheduled yet</p>
          ) : (
            <div className="space-y-3">
              {comingUp.slice(0, COMING_UP_LIMIT).map((event) => (
                <div key={event.id} className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-700">
                      {comingUpLabel(event.scheduled_at)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <PlatformBadge name={platformDisplay(event.platform)} size="h-4 w-4" rounded="rounded" textClass="text-[7px]" />
                      {platformDisplay(event.platform)}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-black">{event.title || "Untitled"}</p>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/create-post"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 py-2.5 text-sm font-semibold text-neutral-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <Plus className="h-4 w-4" />
            Schedule a Post
          </Link>
        </div>
      </div>
    </div>
  );
}
