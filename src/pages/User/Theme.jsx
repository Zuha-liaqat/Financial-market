import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText, Plus, Upload, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { addNotification } from "../../data/notifications";
import { ErrorToast, SuccessToast } from "../../components/Toast";
import ConfirmDialog from "../../components/ConfirmDialog";
import LibraryPage from "./LibraryPage";
import {
  apiDeleteBrandReferenceFile,
  apiGetBrandProfile,
  apiGetThemeOptions,
  apiSaveBrandProfile,
  apiUploadBrandLogo,
  apiUploadBrandReferenceFiles,
} from "../../lib/api";

const MAX_COLORS = 8;

// Popular web font families offered alongside the ones the theme options API returns.
const FONT_FAMILIES = [
  // Sans-serif
  "Arial",
  "Helvetica",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Nunito",
  "Nunito Sans",
  "Raleway",
  "Source Sans 3",
  "Work Sans",
  "DM Sans",
  "Manrope",
  "Rubik",
  "Mulish",
  "Outfit",
  "Plus Jakarta Sans",
  "Figtree",
  "Barlow",
  "Quicksand",
  "Karla",
  "IBM Plex Sans",
  "Noto Sans",
  "Ubuntu",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Segoe UI",
  // Serif
  "Playfair Display",
  "Merriweather",
  "Lora",
  "PT Serif",
  "Libre Baskerville",
  "Crimson Text",
  "EB Garamond",
  "Cormorant Garamond",
  "Source Serif 4",
  "Noto Serif",
  "DM Serif Display",
  "Georgia",
  "Times New Roman",
  // Display & handwriting
  "Oswald",
  "Bebas Neue",
  "Anton",
  "Archivo Black",
  "Abril Fatface",
  "Pacifico",
  "Lobster",
  "Dancing Script",
  "Caveat",
  "Great Vibes",
  // Monospace
  "Roboto Mono",
  "Fira Code",
  "JetBrains Mono",
  "Source Code Pro",
  "Courier New",
];

// API fonts first, then the rest of the list, without duplicates.
function mergeFonts(apiFonts, savedFont) {
  return [
    ...new Set([...(apiFonts || []), savedFont, ...FONT_FAMILIES].filter(Boolean)),
  ];
}

const themeModes = [
  {
    key: "upload",
    title: "Upload your theme",
    description: "Already have brand guidelines? Upload them as an image or PDF.",
  },
  {
    key: "custom",
    title: "Don't have a theme? Choose your own",
    description: "Pick your brand colors and font.",
  },
];

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(value.trim());
}

// custom_color is the older single-colour field. Splitting on commas keeps any multi-colour value in it readable too.
function parseColors(value) {
  return (value || "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(isHexColor);
}

// brand_colors holds every saved colour; profiles saved before it existed only have custom_color.
function profileColors(profile) {
  const saved = Array.isArray(profile?.brand_colors)
    ? profile.brand_colors
        .filter((c) => typeof c === "string")
        .map((c) => c.trim().toLowerCase())
        .filter(isHexColor)
    : [];
  const colors = saved.length ? saved : parseColors(profile?.custom_color);
  return [...new Set(colors)].slice(0, MAX_COLORS);
}

// The saved choice wins. Profiles saved before the choice was kept were all stored as
// "custom", so one with no colours but with uploaded files lands on its upload.
// Generation decides the same way (theme_mode in the backend's brand_service.py), so
// keep the two in step: the option shown here is the one posts and blogs really use.
function profileThemeMode(profile, colors) {
  if (profile?.visual_style === "upload") return "upload";
  if (profile?.visual_style === "custom" && colors.length) return "custom";
  return profile?.reference_files?.length ? "upload" : "custom";
}

function SectionCard({ icon, chip, title, children }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${chip}`}
        >
          {icon}
        </span>
        <h3 className="text-sm font-bold tracking-wide text-neutral-800">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20";

function FieldSkeleton() {
  return (
    <div>
      <div className="mb-1.5 h-3 w-24 animate-pulse rounded bg-neutral-200" />
      <div className="h-9 w-full animate-pulse rounded-lg bg-neutral-100" />
    </div>
  );
}

function SectionSkeleton({ chip, children }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={`h-8 w-8 shrink-0 animate-pulse rounded-md ${chip}`} />
        <span className="h-3.5 w-32 animate-pulse rounded bg-neutral-200" />
      </div>
      {children}
    </div>
  );
}

function ThemeSkeleton() {
  return (
    <div className="space-y-4">
      <SectionSkeleton chip="bg-brand-100">
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 h-3 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-neutral-100" />
              <div className="h-8 w-24 animate-pulse rounded-md bg-neutral-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div>
            <div className="mb-1.5 h-3 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-neutral-100" />
          </div>
        </div>
      </SectionSkeleton>

      <SectionSkeleton chip="bg-amber-100">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </SectionSkeleton>

      <SectionSkeleton chip="bg-violet-100">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
      </SectionSkeleton>

      <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
        <div className="h-10 w-24 animate-pulse rounded-md bg-neutral-100" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-neutral-200" />
      </div>
    </div>
  );
}

const THEME_TABS = [
  { key: "brand", label: "Brand" },
  { key: "library", label: "Library" },
];

// Themes holds the brand settings and the media Library as two tabs. The tab lives in
// the URL (?tab=library), so the old /library link can land straight on it.
export default function ThemesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "library" ? "library" : "brand";
  // The Library loads the first time it is opened, then stays mounted like the Brand
  // tab, so switching back and forth keeps unsaved brand edits and library filters.
  const [libraryOpened, setLibraryOpened] = useState(tab === "library");

  useEffect(() => {
    if (tab === "library") setLibraryOpened(true);
  }, [tab]);

  function selectTab(key) {
    const next = new URLSearchParams(searchParams);
    if (key === "library") next.set("tab", "library");
    else next.delete("tab");
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1">
        {THEME_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => selectTab(t.key)}
            data-track-label={`Themes - ${t.label} Tab`}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-brand-500 text-white shadow-sm"
                : "text-neutral-500 hover:bg-white hover:text-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={tab === "brand" ? "" : "hidden"}>
        <BrandSettings />
      </div>
      {libraryOpened && (
        <div className={tab === "library" ? "" : "hidden"}>
          <LibraryPage />
        </div>
      )}
    </div>
  );
}

function BrandSettings() {
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [toneOptions, setToneOptions] = useState([]);
  const [fontOptions, setFontOptions] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [website, setWebsite] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [themeMode, setThemeMode] = useState("custom");
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [themeUploading, setThemeUploading] = useState(false);
  const [fileToRemove, setFileToRemove] = useState(null);
  const [removingFile, setRemovingFile] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [brandColors, setBrandColors] = useState([]);
  const [colorDraft, setColorDraft] = useState("");
  const [customFont, setCustomFont] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [savingComplete, setSavingComplete] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiGetThemeOptions(), apiGetBrandProfile()])
      .then(([options, profile]) => {
        if (cancelled) return;
        setToneOptions(options?.brand_tones || []);
        setFontOptions(mergeFonts(options?.fonts, profile?.custom_font));

        const colors = profileColors(profile);
        setCompanyName(profile?.company_name || "");
        setCompanyDescription(profile?.company_description || "");
        setLogoUrl(profile?.logo_url || null);
        setReferenceFiles(profile?.reference_files || []);
        setThemeMode(profileThemeMode(profile, colors));
        setWebsite(profile?.company_website || "");
        setContactPhone(profile?.contact_mobile || "");
        setBrandTone(profile?.brand_tone || options?.brand_tones?.[0] || "");
        setTargetAudience(profile?.target_audience || "");
        setBrandColors(colors);
        setCustomFont(
          profile?.custom_font || options?.fonts?.[0] || FONT_FAMILIES[0],
        );
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setSaveError("");
    try {
      const profile = await apiUploadBrandLogo(file);
      setLogoUrl(profile?.logo_url || null);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  }

  async function handleThemeFileSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setThemeUploading(true);
    setSaveError("");
    try {
      // Sent straight away rather than held until Save, so it cannot be lost by
      // leaving the page - which is what used to happen to it. The upload option is
      // saved with it, so the file is used even if Save is never pressed.
      const profile = await apiUploadBrandReferenceFiles([file], undefined, {
        visual_style: "upload",
      });
      setReferenceFiles(profile?.reference_files || []);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setThemeUploading(false);
    }
  }

  async function confirmRemoveFile() {
    const target = fileToRemove;
    if (!target) return;
    setRemovingFile(true);
    setRemoveError("");
    try {
      const profile = await apiDeleteBrandReferenceFile(target.url);
      setReferenceFiles(profile?.reference_files || []);
      setFileToRemove(null);
    } catch (err) {
      if (err.status === 404) {
        // It may already be gone; if the server no longer lists it, show its list.
        const profile = await apiGetBrandProfile().catch(() => null);
        const files = profile?.reference_files;
        if (Array.isArray(files) && !files.some((f) => f.url === target.url)) {
          setReferenceFiles(files);
          setFileToRemove(null);
          return;
        }
      }
      setRemoveError(err.message);
    } finally {
      setRemovingFile(false);
    }
  }

  function addColor() {
    const color = colorDraft.trim().toLowerCase();
    if (!isHexColor(color) || brandColors.length >= MAX_COLORS) return;
    if (!brandColors.includes(color)) {
      setBrandColors((prev) => [...prev, color]);
    }
    setColorDraft("");
  }

  function removeColor(color) {
    setBrandColors((prev) => prev.filter((c) => c !== color));
  }

  async function handleSave(complete) {
    if (complete && (!companyName.trim() || !companyDescription.trim())) {
      setSaveError(
        "Company name and description are required to complete setup.",
      );
      return;
    }
    const setSaving = complete ? setSavingComplete : setSavingDraft;
    setSaving(true);
    setSaveError("");
    try {
      const profile = await apiSaveBrandProfile({
        // Free-text fields are always sent, so clearing one on the page clears it on the server.
        company_name: companyName.trim(),
        company_description: companyDescription.trim(),
        company_website: website.trim(),
        contact_mobile: contactPhone.trim(),
        target_audience: targetAudience.trim(),
        // These are checked by the API, so they're only sent when they have a value.
        brand_tone: brandTone || undefined,
        // Upload styles content from the theme files, the other option from the picked colours.
        visual_style: themeMode === "upload" ? "upload" : "custom",
        // All colours are kept whichever option is picked, so switching back does not lose them.
        // An empty list is sent too, so removing every colour clears them on the server.
        brand_colors: brandColors,
        // Older readers only know custom_color, so it stays the first (primary) colour.
        custom_color: brandColors[0] || undefined,
        custom_font: customFont || undefined,
        status: complete ? "complete" : "draft",
      });
      if (profile?.logo_url) setLogoUrl(profile.logo_url);
      if (profile) {
        // Show what was saved rather than what was sent, and the option generation
        // will use (the same one a reload would show).
        const savedColors = profileColors(profile);
        setBrandColors(savedColors);
        setThemeMode(profileThemeMode(profile, savedColors));
      }
      window.dispatchEvent(
        new CustomEvent("user-profile-updated", {
          detail: { company_name: profile?.company_name ?? companyName },
        }),
      );
      addNotification({
        type: "creation",
        title: complete ? "Brand & voice setup completed" : "Draft saved",
        description: complete
          ? `${companyName || "Your company"}'s brand profile is ready to guide future posts.`
          : "Your brand and voice settings were saved as a draft.",
        platform: "Multi-platform",
        author: "Relay AI",
      });
      setSaveSuccess(
        complete ? "Brand setup completed!" : "Draft saved!",
      );
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return <ThemeSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-600">
        {loadError || "Couldn't load the brand profile. Please try again later."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saveError && (
        <ErrorToast message={saveError} onClose={() => setSaveError("")} />
      )}
      {saveSuccess && (
        <SuccessToast
          message={saveSuccess}
          onClose={() => setSaveSuccess("")}
        />
      )}

      <SectionCard
        icon={
          <svg
            className="h-4 w-4 text-brand-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect
              x="3"
              y="7.5"
              width="18"
              height="12"
              rx="2"
              strokeWidth={1.75}
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8.5 7.5V6a2 2 0 012-2h3a2 2 0 012 2v1.5M3 12.75h18"
            />
          </svg>
        }
        chip="bg-brand-100"
        title="COMPANY PROFILE"
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              Company Logo
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
                {logoUploading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-neutral-300"
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
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="h-6 w-6 text-neutral-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.25V15a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 15V8.25A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25z"
                    />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer rounded-md px-3 py-2 text-xs font-semibold text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50">
                {logoUrl ? "Change" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  disabled={logoUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="company-name"
                className="mb-1.5 block text-xs font-medium text-neutral-500"
              >
                Company Name
              </label>
              <input
                id="company-name"
                maxLength={255}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Financial Market"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="company-website"
                className="mb-1.5 block text-xs font-medium text-neutral-500"
              >
                Website
              </label>
              <input
                id="company-website"
                maxLength={500}
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://financialmarket.com"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="contact-phone"
                className="mb-1.5 block text-xs font-medium text-neutral-500"
              >
                Mobile Number
              </label>
              <input
                id="contact-phone"
                maxLength={50}
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="company-description"
              className="mb-1.5 block text-xs font-medium text-neutral-500"
            >
              Company Description
            </label>
            <textarea
              id="company-description"
              maxLength={5000}
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Describe your company's mission, products, and unique value proposition..."
              rows={3}
              className={`resize-none ${inputClass}`}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={
          <svg
            className="h-4 w-4 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.512l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73s-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
            />
          </svg>
        }
        chip="bg-amber-100"
        title="TONE & AUDIENCE"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-500">
              Brand Tone
            </label>
            <Select value={brandTone} onValueChange={setBrandTone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="target-audience"
              className="mb-1.5 block text-xs font-medium text-neutral-500"
            >
              Target Audience
            </label>
            <input
              id="target-audience"
              maxLength={500}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Urban planners, Tech enthusiasts"
              className={inputClass}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={
          <svg
            className="h-4 w-4 text-violet-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597l-5.814 3.876a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
            />
          </svg>
        }
        chip="bg-violet-100"
        title="VISUAL/BRANDING"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {themeModes.map((mode) => {
            const active = themeMode === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => setThemeMode(mode.key)}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 text-left transition ${
                  active
                    ? "border-brand-500 bg-brand-50/50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-brand-500" : "border-neutral-300"
                  }`}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                  )}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-black">
                    {mode.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    {mode.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {themeMode === "upload" ? (
          <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4">
            {referenceFiles.map((file) => (
              <div
                key={file.url}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5"
              >
                <FileText className="h-5 w-5 shrink-0 text-brand-500" />
                <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
                  {file.filename}
                </span>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-semibold text-brand-600 hover:underline"
                >
                  Open
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setRemoveError("");
                    setFileToRemove(file);
                  }}
                  disabled={themeUploading}
                  aria-label={`Remove ${file.filename}`}
                  className="shrink-0 cursor-pointer text-xs font-semibold text-neutral-500 transition hover:text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}

            <label
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50/40 ${
                themeUploading ? "cursor-wait opacity-60" : "cursor-pointer"
              }`}
            >
              <Upload className="h-6 w-6 text-neutral-400" />
              <span className="text-sm font-semibold text-neutral-700">
                {themeUploading
                  ? "Uploading…"
                  : referenceFiles.length
                    ? "Upload another file"
                    : "Click to upload your theme"}
              </span>
              <span className="text-xs text-neutral-400">
                Brand guidelines as a PDF, JPG, PNG, WebP, GIF or AVIF
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.avif"
                disabled={themeUploading || removingFile}
                onChange={handleThemeFileSelect}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 items-start gap-3 border-t border-neutral-200 pt-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="brand-color-hex"
                className="mb-1.5 block text-xs font-medium text-neutral-500"
              >
                Brand Colors
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isHexColor(colorDraft) ? colorDraft : "#000000"}
                  onChange={(e) => setColorDraft(e.target.value)}
                  aria-label="Pick a color"
                  className="h-10.5 w-11 shrink-0 cursor-pointer rounded-lg border border-neutral-200 bg-neutral-50 p-1"
                />
                <input
                  id="brand-color-hex"
                  value={colorDraft}
                  onChange={(e) => setColorDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="#1A4467"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addColor}
                  disabled={
                    !isHexColor(colorDraft) || brandColors.length >= MAX_COLORS
                  }
                  className="flex h-10.5 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Add
                </button>
              </div>

              {brandColors.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {brandColors.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 py-1 pl-1 pr-2"
                    >
                      <span
                        className="h-7 w-7 rounded-md ring-1 ring-black/10"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-xs uppercase text-neutral-600">
                        {color}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        aria-label={`Remove color ${color}`}
                        className="cursor-pointer rounded p-0.5 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="mt-3 text-xs text-neutral-400">
                    No colors added yet. Pick a color or type its hex code, then
                    click Add.
                  </p>
                  {referenceFiles.length > 0 && (
                    // Without a colour this option has nothing to apply, so the saved theme files stay in use.
                    <p className="mt-1.5 text-xs text-amber-600">
                      Until you add a color, your uploaded theme files are still
                      used. To stop using them, remove them under Upload your
                      theme.
                    </p>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-500">
                Font
              </label>
              <Select value={customFont} onValueChange={setCustomFont}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-neutral-400">
                AI images contain no text, so this font isn't applied to them
                yet.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
        <button
          onClick={() => handleSave(false)}
          disabled={savingDraft || savingComplete}
          className="cursor-pointer rounded-md px-4 py-2.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingDraft ? "Saving…" : "Save Draft"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={savingDraft || savingComplete}
          className="cursor-pointer rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingComplete ? "Saving…" : "Complete Setup"}
        </button>
      </div>

      {fileToRemove && (
        <ConfirmDialog
          title="Remove theme file?"
          message={`"${fileToRemove.filename}" will no longer be used to style your posts and blogs.`}
          confirmLabel="Remove"
          confirming={removingFile}
          error={removeError}
          onConfirm={confirmRemoveFile}
          onCancel={() => {
            if (removingFile) return;
            setFileToRemove(null);
            setRemoveError("");
          }}
        />
      )}
    </div>
  );
}
