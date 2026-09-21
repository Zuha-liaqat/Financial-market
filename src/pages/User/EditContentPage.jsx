import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiGetPost, apiUpdatePost } from "../../lib/api";
import { mapApiPost } from "../../lib/posts";

const channelMeta = {
  Instagram: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Instagram"
    >
      <defs>
        <linearGradient
          id="ec-ig"
          x1="3"
          y1="3"
          x2="21"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="25%" stopColor="#FA7E1E" />
          <stop offset="50%" stopColor="#D62976" />
          <stop offset="75%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="url(#ec-ig)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.2" stroke="url(#ec-ig)" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="url(#ec-ig)" />
    </svg>
  ),
  LinkedIn: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="#0A66C2"
      aria-label="LinkedIn"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Twitter: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="black" aria-label="X">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Facebook: (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="#1877F2"
      aria-label="Facebook"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
};

const fieldClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15";

const tagColors = [
  "bg-brand-100 text-brand-800",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

export default function EditContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const backTo =
    searchParams.get("view") === "grid"
      ? "/approval-queue?view=grid"
      : "/approval-queue";

  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [title, setTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    apiGetPost(id)
      .then((post) => {
        if (cancelled) return;
        const found = mapApiPost(post);
        setItem(found);
        setTitle(found.title ?? "");
        setHeadline(found.headline ?? "");
        setCaption(found.caption ?? "");
        setHashtags(found.hashtags ?? []);
        setTone(found.tone ?? "");
        setLanguage(found.language ?? "");
        setDate(found.scheduleDate ?? "");
        setStartTime(found.scheduleTime ?? "");
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/30" />
          <span className="absolute inset-1 animate-pulse rounded-full bg-gradient-to-br from-brand-300 via-brand-500 to-fuchsia-400 opacity-80 blur-[3px]" />
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/50">
            <span className="flex items-center gap-0.5">
              <span
                className="h-1 w-1 rounded-full bg-white animate-claude-dot"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="h-1 w-1 rounded-full bg-white animate-claude-dot"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="h-1 w-1 rounded-full bg-white animate-claude-dot"
                style={{ animationDelay: "0.3s" }}
              />
            </span>
          </span>
        </div>
        <p className="text-sm text-neutral-500">Loading post…</p>
      </div>
    );
  }

  if (status === "error" || !item) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center">
        <p className="text-sm text-neutral-500">Post not found.</p>
        <button
          onClick={() => navigate(backTo)}
          className="mt-3 text-sm font-medium text-black hover:underline"
        >
          Back to Approval Queue
        </button>
      </div>
    );
  }

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, "#");
    if (clean.length > 1 && !hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean]);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiUpdatePost(id, {
        title,
        headline,
        caption,
        hashtags: hashtags.join(" "),
        tone,
        language,
        date: date || undefined,
        start_time: startTime || undefined,
      });
      navigate(backTo);
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-black"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Approval Queue
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "SAVING…" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-black">Edit Content</h2>
          <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-neutral-500">
            DRAFT
          </span>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
            PRIMARY MEDIA
          </p>
          <div
            className={`relative mx-auto flex h-56 w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 ${item.images?.length ? "bg-neutral-100" : item.thumbClass}`}
          >
            {item.images?.length ? (
              <img
                src={item.images[0].dataUri}
                alt={item.images[0].name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="select-none text-6xl font-bold text-white/70">
                {item.title?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              TITLE
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              HEADLINE
            </p>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
            CAPTION
          </p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={10}
            className={`resize-none ${fieldClass}`}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-neutral-400">
              HASHTAGS
            </p>
            <span className="text-xs text-neutral-400">
              {hashtags.length}/30 used
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hashtags.map((tag, i) => (
              <span
                key={tag}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tagColors[i % tagColors.length]}`}
              >
                {tag}
                <button
                  onClick={() =>
                    setHashtags((prev) => prev.filter((t) => t !== tag))
                  }
                  aria-label={`Remove ${tag}`}
                  className="opacity-60 transition hover:opacity-100"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTag(newTag);
                setNewTag("");
              }}
              className="flex items-center"
            >
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="w-20 rounded-full border border-dashed border-neutral-300 px-2 py-1 text-xs outline-none focus:border-black"
              />
              <button
                type="submit"
                aria-label="Add hashtag"
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 hover:border-black hover:text-black"
              >
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              TONE
            </p>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              LANGUAGE
            </p>
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              DATE
            </p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
              START TIME
            </p>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-400">
            PLATFORM
          </p>
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2.5">
            {channelMeta[item.platform]}
            <span className="text-sm font-medium text-neutral-700">
              {item.platform}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
