import { useState, useRef, useEffect } from "react";
import { addNotification } from "../../data/notifications";
import { apiGenerateBlog, apiGetCurrentUser, apiListPlatformCredentials } from "../../lib/api";
import { showGlobalToast } from "../../lib/toastBus";

const DRAFT_KEY = "create_blog_draft";

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return null;
  }
}

const toneOptions = [
  "Professional",
  "Casual",
  "Enthusiastic",
  "Informative",
  "Humorous",
];
const languageOptions = ["EN-US", "EN-GB", "ES", "FR", "DE", "JA"];

const tagColors = [
  "bg-brand-100 text-brand-800",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
];

function MonogramIcon({ letter, bg }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ backgroundColor: bg }}
    >
      {letter}
    </span>
  );
}

const platformIcons = {
  Website: (
    <svg
      className="h-6 w-6 text-brand-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
      <path
        strokeLinecap="round"
        strokeWidth="1.75"
        d="M3 12h18M12 3c2.485 2.4 3.75 5.55 3.75 9s-1.265 6.6-3.75 9c-2.485-2.4-3.75-5.55-3.75-9S9.515 5.4 12 3z"
      />
    </svg>
  ),
  Medium: <MonogramIcon letter="M" bg="#000000" />,
  WordPress: <MonogramIcon letter="W" bg="#21759B" />,
  Blogger: <MonogramIcon letter="B" bg="#F57D00" />,
  Wix: <MonogramIcon letter="Wx" bg="#0C6EFC" />,
};

const sectionIcons = {
  prompt: (
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
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  ),
  schedule: (
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
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  ),
  target: (
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
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  ),
};

const sectionChips = {
  prompt: "bg-brand-100 text-brand-700",
  schedule: "bg-orange-100 text-orange-600",
  target: "bg-pink-100 text-pink-600",
};

function SectionLabel({ icon, chip, title, required }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${chip}`}
      >
        {icon}
      </span>
      <h3 className="text-sm font-bold tracking-wide text-neutral-800">
        {title}
        {required && <span className="text-red-500"> *</span>}
      </h3>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

export default function CreateBlogPage() {
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const draft = loadDraft();
  const [prompt, setPrompt] = useState(draft?.prompt ?? "");
  const [tone, setTone] = useState(draft?.tone ?? "Professional");
  const [language, setLanguage] = useState(draft?.language ?? "EN-US");
  const [referenceUrl, setReferenceUrl] = useState(draft?.referenceUrl ?? "");
  const [urlDraft, setUrlDraft] = useState("");
  const [scheduleDate, setScheduleDate] = useState(draft?.scheduleDate ?? "");
  const [scheduleTime, setScheduleTime] = useState(draft?.scheduleTime ?? "");
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    draft?.selectedPlatforms ?? ["Website"],
  );
  const [tags, setTags] = useState(draft?.tags ?? ["#NewProduct", "#Launch"]);
  const [newTag, setNewTag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [showToneDropdown, setShowToneDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [connectedMap, setConnectedMap] = useState({});

  useEffect(() => {
    apiGetCurrentUser()
      .then((me) =>
        apiListPlatformCredentials(me?.id ?? undefined).then((list) => {
          const map = Object.fromEntries(
            (list || []).map((p) => [p.platform, p.is_connected]),
          );
          setConnectedMap(map);
        }),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowToneDropdown(false);
        setShowLanguageDropdown(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") {
        setShowToneDropdown(false);
        setShowLanguageDropdown(false);
        setShowUrlDialog(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        prompt,
        tone,
        language,
        referenceUrl,
        scheduleDate,
        scheduleTime,
        selectedPlatforms,
        tags,
      }),
    );
  }, [
    prompt,
    tone,
    language,
    referenceUrl,
    scheduleDate,
    scheduleTime,
    selectedPlatforms,
    tags,
  ]);

  function addTag(tag) {
    const clean = tag.trim().replace(/^#*/, "#");
    if (clean.length > 1 && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    addFiles(files);
  }

  function addFiles(files) {
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024,
    );
    if (validFiles.length === 0) return;

    const file = validFiles[0];
    setUploadedFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.preview));
      return [
        {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          file,
          preview: URL.createObjectURL(file),
        },
      ];
    });
  }

  function removeFile(id) {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }

  async function handleGenerate() {
    if (
      !prompt.trim() ||
      selectedPlatforms.length === 0 ||
      !scheduleDate ||
      !scheduleTime
    )
      return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const result = await apiGenerateBlog({
        prompt,
        platforms: selectedPlatforms.map((p) => p.toLowerCase()).join(","),
        tone,
        language,
        hashtags: tags.join(","),
        reference_url: referenceUrl || undefined,
        date: scheduleDate,
        start_time: scheduleTime,
        image: uploadedFiles[0]?.file,
      });

      const firstBlog = Array.isArray(result?.blogs) ? result.blogs[0] : null;
      const title =
        firstBlog?.title ||
        (prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt);
      const platformLabel = selectedPlatforms.join(" + ");

      addNotification({
        type: "creation",
        title: `New ${platformLabel} blog post generated`,
        description: `"${title}" has been drafted and saved.`,
        platform: platformLabel,
        author: "Relay AI",
      });

      setIsGenerating(false);
      localStorage.removeItem(DRAFT_KEY);
      showGlobalToast("Blog post created successfully!");
    } catch (err) {
      setGenerateError(err.message);
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-3">
      {generateError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {generateError}
        </div>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          <svg className="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Generating your blog post — feel free to keep working elsewhere, we'll let you know when it's done.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Prompt Console */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <SectionLabel
            icon={sectionIcons.prompt}
            chip={sectionChips.prompt}
            title="PROMPT CONSOLE"
            required
          />

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the blog post in detail. e.g., 'Write a blog post about how our new dashboard redesign improves navigation and load times. Target audience is product managers and startup founders. Tone should be confident yet approachable.'"
              rows={11}
              className={`w-full resize-none rounded-lg border border-neutral-200 bg-white px-4 pt-3 pb-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                uploadedFiles.length > 0 ? "sm:pb-28" : "sm:pb-12"
              }`}
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-3 sm:mt-0 sm:absolute sm:inset-x-3 sm:bottom-3 flex flex-col-reverse gap-2 rounded-lg transition ${
                isDragOver ? "bg-brand-50" : ""
              }`}
            >
              <div
                ref={dropdownRef}
                className="flex flex-wrap items-center gap-2"
              >
                {/* Add Image */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add image"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white transition hover:bg-neutral-50"
                >
                  <img
                    src="/image2.png"
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                </button>

                {/* Reference URL */}
                <div
                  className={
                    referenceUrl
                      ? "flex w-48 max-sm:w-40 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600"
                      : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white transition hover:bg-neutral-50"
                  }
                >
                  <button
                    type="button"
                    onClick={() => {
                      setUrlDraft(referenceUrl);
                      setShowUrlDialog(true);
                      setShowToneDropdown(false);
                      setShowLanguageDropdown(false);
                    }}
                    aria-label="Reference URL"
                    className="flex shrink-0 cursor-pointer items-center justify-center"
                  >
                    <img
                      src="/url3.jfif"
                      alt=""
                      className="h-5 w-5 object-contain"
                    />
                  </button>
                  {referenceUrl && (
                    <input
                      readOnly
                      value={referenceUrl}
                      className="min-w-0 flex-1 border-none bg-transparent p-0 text-sm text-neutral-600 outline-none"
                    />
                  )}
                </div>

                {/* Tone Selector */}
                <div className="relative ml-auto max-sm:ml-0">
                  <button
                    onClick={() => {
                      setShowToneDropdown(!showToneDropdown);
                      setShowLanguageDropdown(false);
                      setShowUrlDialog(false);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    <svg
                      className="h-4 w-4 text-brand-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                      />
                    </svg>
                    Tone: {tone}
                    <svg
                      className="h-4 w-4 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {showToneDropdown && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                      {toneOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setTone(option);
                            setShowToneDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${
                            tone === option
                              ? "bg-brand-50 font-medium text-brand-700"
                              : "text-neutral-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowLanguageDropdown(!showLanguageDropdown);
                      setShowToneDropdown(false);
                      setShowUrlDialog(false);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                  >
                    <svg
                      className="h-4 w-4 text-brand-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                    {language}
                    <svg
                      className="h-4 w-4 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-32 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                      {languageOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setLanguage(option);
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-50 ${
                            language === option
                              ? "bg-brand-50 font-medium text-brand-700"
                              : "text-neutral-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 bg-white px-1 pb-1 pt-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative h-16 w-16 shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        aria-label="Remove image"
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-sm ring-2 ring-white transition hover:bg-brand-600"
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
                    </div>
                  ))}
                </div>
              )}

              <span className="text-right text-xs text-neutral-400">
                {prompt.length} / 2000 chars
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3">
            {tags.map((tag, i) => (
              <span
                key={tag}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tagColors[i % tagColors.length]}`}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
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
                placeholder="+ Tag"
                className="w-20 rounded-full border border-dashed border-brand-300 bg-white px-3 py-1 text-xs outline-none focus:border-brand-500"
              />
            </form>
          </div>
        </div>

        {/* Platform Target */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <SectionLabel
            icon={sectionIcons.target}
            chip={sectionChips.target}
            title="PLATFORM TARGET"
            required
          />
          <div className="flex flex-wrap gap-3">
            {Object.entries(platformIcons).map(([platform, icon]) => {
              const platformKey = platform.toLowerCase();
              const requiresConnection = platformKey === "wordpress" || platformKey === "blogger" || platformKey === "wix";
              const isEnabledPlatform = !requiresConnection || connectedMap[platformKey];
              const isMedium = platformKey === "medium";
              const isDisabled = !isEnabledPlatform || isMedium;
              return (
                <label
                  key={platform}
                  className={`flex flex-1 min-w-[140px] max-sm:min-w-full select-none items-center gap-3 rounded-lg border p-2.5 transition ${
                    isDisabled
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-60"
                      : selectedPlatforms.includes(platform)
                        ? "cursor-pointer border-brand-300 bg-brand-50"
                        : "cursor-pointer border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isDisabled}
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() =>
                      setSelectedPlatforms((prev) =>
                        prev.includes(platform)
                          ? prev.filter((p) => p !== platform)
                          : [...prev, platform],
                      )
                    }
                    className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-brand-500 disabled:cursor-not-allowed"
                  />
                  <span className="flex flex-col items-start justify-center">
                    <span className="flex items-center gap-2.5">
                      {icon}
                      <span className="text-sm font-medium text-neutral-700">
                        {platform}
                      </span>
                    </span>
                    {isMedium && (
                      <span className="mt-1.5 text-[11px] leading-tight text-neutral-400">
                        Unavailable — API discontinued in 2023
                      </span>
                    )}
                    {requiresConnection && !isEnabledPlatform && (
                      <span className="mt-1.5 text-[11px] leading-tight text-neutral-400">
                        Connect {platform} in Integrations first
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <SectionLabel
            icon={sectionIcons.schedule}
            chip={sectionChips.schedule}
            title="SCHEDULE"
          />
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
            <div>
              <label
                htmlFor="blog-schedule-date"
                className="mb-1.5 block text-xs font-medium text-neutral-500"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="blog-schedule-date"
                type="date"
                required
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="blog-schedule-time"
                className="mb-1.5 block text-xs font-medium text-neutral-500"
              >
                Post Time <span className="text-red-500">*</span>
              </label>
              <input
                id="blog-schedule-time"
                type="time"
                required
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={
              !prompt.trim() ||
              selectedPlatforms.length === 0 ||
              !scheduleDate ||
              !scheduleTime ||
              isGenerating
            }
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-full"
          >
            {isGenerating ? (
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            )}
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>

      {showUrlDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowUrlDialog(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              setReferenceUrl(urlDraft);
              setShowUrlDialog(false);
            }}
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide text-neutral-800">
                REFERENCE URL
              </h3>
              <button
                type="button"
                onClick={() => setShowUrlDialog(false)}
                aria-label="Close"
                className="cursor-pointer rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
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
                    strokeWidth={1.75}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <input
              type="url"
              autoFocus
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://example.com/inspiration"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-neutral-400">
              Used by the AI for context or style.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUrlDialog(false)}
                className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center">
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

              <h3 className="animate-shimmer-text mt-5 text-lg font-semibold">
                Generating your blog post
              </h3>
              <p className="mt-2 text-center text-sm text-neutral-500">
                Our AI is crafting your content based on your prompt. This
                usually takes a few seconds.
              </p>

              <div className="mt-6 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-1.5 w-1/3 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-fuchsia-400 animate-progress-indeterminate" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
