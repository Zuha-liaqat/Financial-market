import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { apiGetCalendar } from "../../lib/api";
import { mapCalendarItem } from "../../lib/posts";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const typeBadgeColor = {
  REEL: "bg-fuchsia-100 text-fuchsia-700",
  MOTION: "bg-brand-100 text-brand-700",
  INTERIOR: "bg-neutral-800 text-white",
  API: "bg-emerald-100 text-emerald-700",
};

const tagColors = [
  "bg-brand-100 text-brand-800",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

const eventColorPalette = [
  "bg-brand-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
];

function pickEventColor(id) {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return eventColorPalette[Math.abs(hash) % eventColorPalette.length];
}

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

const schedulePlatforms = ["LinkedIn", "Instagram", "Twitter"];

const HOUR_HEIGHT = 80;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

function parseTimeToHour(t) {
  if (!t) return 9;
  const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 9;
  let hour = parseInt(match[1], 10);
  const min = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return hour + min / 60;
}

function formatHourLabel(h) {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7;
  return addDays(d, -offset);
}

function formatTime(t) {
  const [h, m] = t.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${ampm}`;
}

function formatTime24(t) {
  if (!t) return "09:00 AM";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ScheduleModal({ date, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [hashtags, setHashtags] = useState("#NewProduct");
  const [description, setDescription] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      platform,
      time: formatTime(time),
      endTime: formatTime(endTime),
      hashtags: hashtags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      description: description.trim() || "Scheduled content for this day.",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-20 sm:items-center sm:pt-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-black">
            Schedule a new post
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-700">
          <CalendarDays className="h-4 w-4 shrink-0" />
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title, e.g. Product Launch Announcement"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              Platform
            </label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {schedulePlatforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                Start time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                End time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              Hashtags{" "}
              <span className="font-normal text-neutral-400">
                (comma separated)
              </span>
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Schedule
          </button>
        </div>
      </form>
    </div>
  );
}

function TimeGrid({
  days,
  eventsByDate,
  today,
  selected,
  onSelect,
  multiDay = false,
}) {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      const currentHour = new Date().getHours();
      const scrollTo = Math.max(
        0,
        (currentHour - START_HOUR - 1) * HOUR_HEIGHT,
      );
      gridRef.current.scrollTop = scrollTo;
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {/* Day headers */}
      <div
        className={`grid border-b border-neutral-200 bg-neutral-50 ${multiDay ? "grid-cols-[4rem_repeat(7,1fr)]" : "grid-cols-[4rem_1fr]"}`}
      >
        <div className="border-r border-neutral-200" />
        {days.map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div
              key={d.toISOString()}
              className={`flex flex-col items-center gap-0.5 px-1 py-2 border-r border-neutral-100 last:border-r-0 ${
                isToday ? "bg-brand-50" : ""
              }`}
            >
              <span className="text-[10px] font-semibold tracking-widest text-neutral-400">
                {d
                  .toLocaleDateString("en-US", { weekday: "short" })
                  .toUpperCase()}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday ? "bg-brand-500 text-white" : "text-neutral-700"
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div ref={gridRef} className="relative max-h-[720px] overflow-y-auto">
        <div
          className={`grid ${multiDay ? "grid-cols-[4rem_repeat(7,1fr)]" : "grid-cols-[4rem_1fr]"}`}
        >
          {/* Hour labels column */}
          <div className="relative border-r border-neutral-200">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-neutral-100"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="relative -top-2.5 pl-2 text-[10px] font-medium text-neutral-400">
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((d) => {
            const dayEvents = eventsByDate.filter((ev) =>
              isSameDay(ev.date, d),
            );
            const isToday = isSameDay(d, today);
            const now = new Date();
            const currentHourDecimal = now.getHours() + now.getMinutes() / 60;

            return (
              <div
                key={d.toISOString()}
                className="relative border-r border-neutral-100 last:border-r-0"
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-b border-neutral-100"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday &&
                  currentHourDecimal >= START_HOUR &&
                  currentHourDecimal < END_HOUR && (
                    <div
                      className="absolute left-0 z-10 flex items-center"
                      style={{
                        top: (currentHourDecimal - START_HOUR) * HOUR_HEIGHT,
                      }}
                    >
                      <div className="h-2.5 w-2.5 -ml-1.5 rounded-full bg-red-500" />
                      <div className="h-[2px] w-full bg-red-500" />
                    </div>
                  )}

                {/* Events */}
                {dayEvents.map((ev) => {
                  const startHour = parseTimeToHour(ev.time);
                  const endHour =
                    parseTimeToHour(ev.endTime) || startHour + 0.5;
                  const top = (startHour - START_HOUR) * HOUR_HEIGHT;
                  const height = Math.max(
                    (endHour - startHour) * HOUR_HEIGHT,
                    28,
                  );

                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(ev);
                      }}
                      className={`absolute left-0.5 right-0.5 z-20 flex flex-col justify-center overflow-hidden rounded px-1.5 py-1 text-left text-white transition hover:opacity-90 ${
                        selected?.id === ev.id
                          ? "ring-2 ring-brand-500 ring-offset-1"
                          : ""
                      } ${ev.bannerColor ?? pickEventColor(ev.id)}`}
                      style={{
                        top,
                        height: Math.min(
                          height,
                          (END_HOUR - startHour) * HOUR_HEIGHT,
                        ),
                      }}
                    >
                      <span className="truncate text-[11px] font-semibold leading-tight">
                        {ev.title}
                      </span>
                      <span className="truncate text-[9px] opacity-90">
                        {ev.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EventPlatformBadges({ event }) {
  const platforms = [];
  if (event.bestPlatform) platforms.push(event.bestPlatform);
  if (event.platforms) platforms.push(...event.platforms);
  const unique = [...new Set(platforms)].slice(0, 3);
  if (unique.length === 0) return null;
  return (
    <span className="ml-1 inline-flex items-center gap-1">
      {unique.map((p) => (
        <span key={p}>
          {platformLogos[p] ?? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-300" />
          )}
        </span>
      ))}
    </span>
  );
}

function MonthView({
  grid,
  monthDate,
  today,
  eventsByDate,
  selected,
  onSelect,
  onDayClick,
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-[10px] font-semibold tracking-widest text-neutral-400"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((date) => {
          const inMonth = date.getMonth() === monthDate.getMonth();
          const isToday = isSameDay(date, today);
          const dayEvents = eventsByDate.filter((ev) =>
            isSameDay(ev.date, date),
          );

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              className={`flex min-h-[7rem] flex-col border-b border-r border-neutral-100 p-1.5 transition hover:bg-neutral-50/70 ${
                inMonth ? "bg-white" : "bg-neutral-50/60"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isToday
                      ? "bg-brand-500 font-semibold text-white"
                      : inMonth
                        ? "text-neutral-700"
                        : "text-neutral-300"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {dayEvents.map((ev) => {
                  const count = dayEvents.length;
                  const single = count === 1;
                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(ev);
                      }}
                      className={`flex w-full cursor-pointer flex-col gap-0.5 text-left font-medium text-white transition hover:opacity-90 ${
                        single
                          ? "rounded pl-1 pr-1.5 py-2 text-[11px]"
                          : "rounded pl-0.5 pr-1 py-0.5 text-[10px]"
                      } ${selected?.id === ev.id ? "ring-2 ring-brand-500" : ""} ${
                        ev.bannerColor ?? pickEventColor(ev.id)
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <EventPlatformBadges event={ev} />
                        <span
                          className={`whitespace-normal leading-snug ${single ? "line-clamp-2" : "line-clamp-1"}`}
                        >
                          {ev.title}
                        </span>
                      </span>
                      <span
                        className={
                          single
                            ? "text-[9px] opacity-80 ml-4"
                            : "text-[8px] opacity-80 ml-3"
                        }
                      >
                        {ev.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [view, setView] = useState("month");
  const [anchor, setAnchor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [extraEvents, setExtraEvents] = useState([]);
  const [generatedPosts, setGeneratedPosts] = useState([]);

  const visibleRange = useMemo(() => {
    if (view === "day") return { start: anchor, end: anchor };
    if (view === "week") {
      const start = startOfWeek(anchor);
      return { start, end: addDays(start, 6) };
    }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -startWeekday);
    const daysInMonth = new Date(
      anchor.getFullYear(),
      anchor.getMonth() + 1,
      0,
    ).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
    return { start: gridStart, end: addDays(gridStart, totalCells - 1) };
  }, [view, anchor]);

  useEffect(() => {
    apiGetCalendar({
      start_date: toISODate(visibleRange.start),
      end_date: toISODate(visibleRange.end),
    })
      .then((data) =>
        setGeneratedPosts(
          (data?.items || []).map(mapCalendarItem).filter((p) => !p.isPosted),
        ),
      )
      .catch(() => setGeneratedPosts([]));
  }, [visibleRange]);

  const eventsByDate = useMemo(() => {
    const postEvents = generatedPosts
      .filter((p) => p.scheduleDate)
      .map((p) => {
        const d = new Date(p.scheduleDate + "T00:00:00");
        const diffMs = d.getTime() - today.getTime();
        const dayOffset = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return {
          id: p.id,
          relatedId: p.id,
          contentType: p.contentType,
          dayOffset,
          type: "MOTION",
          title: p.title,
          time: p.scheduleTime ? formatTime24(p.scheduleTime) : "09:00 AM",
          endTime: "09:30 AM",
          thumbClass:
            p.thumbClass || "bg-gradient-to-br from-brand-200 to-brand-400",
          description: p.caption,
          hashtags: p.hashtags || [],
          expectedReach: "—",
          reachDelta: "",
          bestPlatform: p.platform || "LinkedIn",
          matchScore: p.score || 85,
          sentimentLabel: "OPTIMISTIC",
          audienceLabel: "Scheduled",
          audiencePercent: 70,
          images: p.images || [],
          bannerColor: pickEventColor(p.id),
        };
      });
    return [...extraEvents, ...postEvents].map((ev) => ({
      ...ev,
      date: addDays(today, ev.dayOffset ?? 0),
    }));
  }, [today, extraEvents, generatedPosts]);

  const todaysEvent = eventsByDate.find((ev) => isSameDay(ev.date, today));
  const [selected, setSelected] = useState(todaysEvent ?? null);
  const [scheduleDate, setScheduleDate] = useState(null);

  const selectedWithImages = useMemo(() => {
    if (!selected) return null;
    if (selected.images && selected.images.length > 0) return selected;
    if (selected.relatedId) {
      const linkedPost = generatedPosts.find(
        (p) => p.id === selected.relatedId,
      );
      if (linkedPost?.images?.length > 0) {
        return { ...selected, images: linkedPost.images };
      }
    }
    return selected;
  }, [selected, generatedPosts]);

  const grid = useMemo(() => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -startWeekday);
    const daysInMonth = new Date(
      anchor.getFullYear(),
      anchor.getMonth() + 1,
      0,
    ).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
    return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i));
  }, [anchor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchor]);

  let label;
  if (view === "month") {
    label = anchor.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } else if (view === "week") {
    const start = weekDays[0];
    const end = weekDays[6];
    label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  } else {
    label = anchor.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function step(direction) {
    if (view === "day") {
      setAnchor((d) => addDays(d, direction));
    } else if (view === "week") {
      setAnchor((d) => addDays(d, direction * 7));
    } else {
      setAnchor((d) => new Date(d.getFullYear(), d.getMonth() + direction, 1));
    }
  }

  function goToday() {
    if (view === "month") {
      setAnchor(new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (view === "week") {
      setAnchor(startOfWeek(today));
    } else {
      setAnchor(today);
    }
  }

  function handleViewChange(next) {
    const target = selected ? selected.date : today;
    setView(next);
    if (next === "day") {
      setAnchor(target);
    } else if (next === "week") {
      setAnchor(startOfWeek(target));
    } else {
      setAnchor(new Date(target.getFullYear(), target.getMonth(), 1));
    }
  }

  function handleScheduleSave(ev) {
    const newEvent = {
      id: `cal-new-${Date.now()}`,
      dayOffset: Math.round((scheduleDate - today) / (1000 * 60 * 60 * 24)),
      type: "MOTION",
      title: ev.title,
      time: ev.time,
      endTime: ev.endTime,
      thumbClass: "bg-gradient-to-br from-brand-200 to-brand-400",
      bannerColor: pickEventColor(`cal-new-${Date.now()}`),
      description: ev.description,
      hashtags: ev.hashtags,
      expectedReach: "—",
      reachDelta: "",
      bestPlatform: ev.platform,
      matchScore: 90,
      sentimentLabel: "OPTIMISTIC",
      audienceLabel: "Scheduled",
      audiencePercent: 70,
    };
    setExtraEvents((prev) => [...prev, newEvent]);
    setScheduleDate(null);
    setSelected(newEvent);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => step(-1)}
                aria-label="Previous"
                className="flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next"
                className="flex h-8 w-8 items-center justify-center rounded-md ring-1 ring-neutral-200 hover:bg-neutral-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <h2 className="ml-1 text-xl font-bold text-black">{label}</h2>
          </div>

          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="w-32 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          <button
            onClick={() => navigate("/create-post")}
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            Create Post
          </button>
        </div>

        {view === "month" && (
          <MonthView
            grid={grid}
            monthDate={anchor}
            today={today}
            eventsByDate={eventsByDate}
            selected={selected}
            onSelect={setSelected}
            onDayClick={setScheduleDate}
          />
        )}
        {view === "week" && (
          <TimeGrid
            days={weekDays}
            eventsByDate={eventsByDate}
            today={today}
            selected={selected}
            onSelect={setSelected}
            multiDay
          />
        )}
        {view === "day" && (
          <TimeGrid
            days={[anchor]}
            eventsByDate={eventsByDate}
            today={today}
            selected={selected}
            onSelect={setSelected}
          />
        )}
      </div>

      {selectedWithImages && (
        <div className="flex w-full flex-col gap-7 rounded-lg border border-neutral-200 bg-white p-4 lg:w-80 lg:shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-black">
              {selectedWithImages.contentType === "blog"
                ? "Blog Details"
                : "Post Details"}
            </h3>
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="text-neutral-400 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className={`relative flex h-36 items-center justify-center overflow-hidden rounded-lg bg-white ${
              selectedWithImages.images && selectedWithImages.images.length > 0
                ? ""
                : selectedWithImages.thumbClass
            }`}
          >
            {selectedWithImages.images &&
            selectedWithImages.images.length > 0 ? (
              <img
                src={selectedWithImages.images[0].dataUri}
                alt={selectedWithImages.images[0].name}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="select-none text-5xl font-bold text-white/70">
                {selectedWithImages.title?.charAt(0).toUpperCase()}
              </span>
            )}
            <span
              className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                typeBadgeColor[selectedWithImages.type] ??
                "bg-brand-500 text-white"
              }`}
            >
              {selectedWithImages.type}
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-black">
              {selectedWithImages.title}
            </p>
            <p className="mt-2.5 flex items-start gap-1.5 text-[11px] text-neutral-400">
              <CalendarDays className="mt-px h-3 w-3 shrink-0" />
              <span className="leading-relaxed">
                {selectedWithImages.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                , {selectedWithImages.time} – {selectedWithImages.endTime}
              </span>
            </p>
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-neutral-500">
              {selectedWithImages.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedWithImages.hashtags.map((tag, i) => (
                <span
                  key={tag}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tagColors[i % tagColors.length]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-widest text-neutral-400">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 13.5l3-3 3 2 4-5 4 3M3 19.5h18"
                />
              </svg>
              PREDICTIVE ENGAGEMENT
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                  EXPECTED REACH
                </p>
                <p className="mt-1 text-lg font-bold text-black">
                  {selectedWithImages.expectedReach}
                </p>
                <p className="text-xs font-medium text-emerald-600">
                  {selectedWithImages.reachDelta}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                  BEST PLATFORM
                </p>
                <p className="mt-1 text-lg font-bold text-black">
                  {selectedWithImages.bestPlatform}
                </p>
                <p className="text-xs text-neutral-500">
                  {selectedWithImages.matchScore}% Match Score
                </p>
              </div>
            </div>
          </div>

          <div className="mt-1 rounded-lg bg-neutral-50 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest text-neutral-400">
                AUDIENCE SENTIMENT FORECAST
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                {selectedWithImages.sentimentLabel}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${selectedWithImages.audiencePercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              {selectedWithImages.audienceLabel}{" "}
              {selectedWithImages.audiencePercent}%
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-2">
            <button
              onClick={() =>
                selectedWithImages.relatedId &&
                navigate(`/approval-queue/${selectedWithImages.relatedId}/edit`)
              }
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ring-1 ring-neutral-200 hover:bg-neutral-50 ${
                selectedWithImages.relatedId
                  ? "text-neutral-600"
                  : "cursor-not-allowed text-neutral-300"
              }`}
            >
              Edit Content
            </button>
            <button className="flex-1 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600">
              Reschedule
            </button>
          </div>
        </div>
      )}

      {scheduleDate && (
        <ScheduleModal
          date={scheduleDate}
          onClose={() => setScheduleDate(null)}
          onSave={handleScheduleSave}
        />
      )}
    </div>
  );
}
