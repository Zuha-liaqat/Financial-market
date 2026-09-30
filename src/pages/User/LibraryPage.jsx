import { useCallback, useEffect, useState } from "react";
import AssetCard from "../../components/AssetCard";
import UploadAssetModal from "../../components/UploadAssetModal";
import AssetViewer, { isPdfAsset } from "../../components/AssetViewer";
import ConfirmDialog from "../../components/ConfirmDialog";
import { apiDeleteLibraryAsset, apiListLibraryAssets } from "../../lib/api";

const mediaTypes = [
  {
    key: "all",
    label: "All Assets",
    icon: (
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
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    key: "video",
    label: "Videos",
    icon: (
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
          d="M15 10l4.55-2.28A1 1 0 0121 8.6v6.8a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    key: "photo",
    label: "Photographs",
    icon: (
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
          d="M3 9a2 2 0 012-2h1.5l1-1.5h5l1 1.5H15a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <circle cx="10" cy="13" r="3" strokeWidth={2} />
      </svg>
    ),
  },
  {
    key: "article",
    label: "Articles",
    icon: (
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
          d="M9 4h9a1 1 0 011 1v14a1 1 0 01-1 1H9m0-16H6a1 1 0 00-1 1v14a1 1 0 001 1h3m0-16v16M12 8h4M12 12h4M12 16h4"
        />
      </svg>
    ),
  },
];

const categories = [
  "Product",
  "Engineering",
  "Marketing",
  "Design",
  "Software",
  "Events",
];

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSize(sizeKb) {
  return sizeKb >= 1024
    ? `${(sizeKb / 1024).toFixed(2)} MB`
    : `${sizeKb.toFixed(2)} KB`;
}

// Photos uploaded together share a name and category and are created within moments of each other,
// so they are gathered into one album card. Everything else stays a card of its own.
const ALBUM_WINDOW_MS = 5 * 60 * 1000;

// Batches used to be saved as "Name 1", "Name 2"…, so the trailing number is ignored when grouping.
function albumName(name = "") {
  return name.replace(/\s*\(?\d+\)?$/, "").trim() || name;
}

function groupIntoAlbums(assets) {
  const groups = [];
  const openAlbums = new Map();
  for (const asset of assets) {
    if (asset.media_type !== "photo" || !asset.media_url) {
      groups.push([asset]);
      continue;
    }
    const key = `${albumName(asset.name)}\u0000${asset.type}`;
    const time = new Date(asset.created_at).getTime();
    const album = openAlbums.get(key);
    if (album && Math.abs(time - album.lastTime) <= ALBUM_WINDOW_MS) {
      album.items.push(asset);
      album.lastTime = time;
    } else {
      const items = [asset];
      groups.push(items);
      openAlbums.set(key, { items, lastTime: time });
    }
  }
  return groups;
}

function AssetCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="h-40 w-full animate-pulse bg-neutral-100" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
          <div className="h-3 w-12 animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-2.5 w-20 animate-pulse rounded bg-neutral-100" />
          <div className="h-4 w-4 animate-pulse rounded bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [activeType, setActiveType] = useState("all");
  const [activeCategory, setActiveCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    all: 0,
    video: 0,
    photo: 0,
    article: 0,
  });
  const [storage, setStorage] = useState(null);
  const [status, setStatus] = useState("loading");
  const [showUpload, setShowUpload] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const loadItems = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await apiListLibraryAssets();
      setItems(data.items || []);
      setCounts({
        all: data.total_assets ?? 0,
        video: data.total_video ?? 0,
        photo: data.total_photo ?? 0,
        article: data.total_article ?? 0,
      });
      setStorage({
        usedMb: data.total_storage_mb ?? 0,
        usedKb: data.total_storage_kb ?? 0,
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  const filteredItems = items.filter((item) => {
    const typeMatch = activeType === "all" || item.media_type === activeType;
    const categoryMatch = !activeCategory || item.type === activeCategory;
    return typeMatch && categoryMatch;
  });
  const cards = groupIntoAlbums(filteredItems);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await Promise.all(deleteTarget.map((asset) => apiDeleteLibraryAsset(asset.id)));
      await loadItems();
    } finally {
      setDeleteTarget(null);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Unified toolbar card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-8">
          {/* Media types — segmented control */}
          <div className="min-w-[280px] flex-1">
            <p className="mb-2.5 text-xs font-semibold tracking-widest text-neutral-400">
              MEDIA TYPES
            </p>
            <div className="inline-flex flex-wrap gap-1 rounded-lg bg-neutral-100 p-1">
              {mediaTypes.map((mt) => (
                <button
                  key={mt.key}
                  onClick={() => setActiveType(mt.key)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    activeType === mt.key
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-neutral-500 hover:bg-white hover:text-neutral-800"
                  }`}
                >
                  {mt.icon}
                  {mt.label}
                  <span
                    className={`ml-0.5 rounded px-1.5 py-0.5 text-xs tabular-nums ${
                      activeType === mt.key
                        ? "bg-white/15 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {counts[mt.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden self-stretch border-l border-neutral-200 lg:block" />

          {/* Categories */}
          <div className="min-w-[320px] flex-1">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-xs font-semibold tracking-widest text-neutral-400">
                CATEGORIES
              </p>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-xs font-medium text-neutral-400 hover:text-neutral-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setActiveCategory((prev) => (prev === cat ? null : cat))
                    }
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-brand-500 text-white shadow-sm shadow-brand-200"
                        : "bg-neutral-50 text-neutral-600 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {active && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden self-stretch border-l border-neutral-200 lg:block" />

          {/* Storage */}
          <div className="w-full max-w-[220px] lg:w-56">
            <p className="mb-2.5 text-xs font-semibold tracking-widest text-neutral-400">
              STORAGE
            </p>
            <div className="rounded-lg bg-neutral-50 p-3 ring-1 ring-inset ring-neutral-200">
              <span className="text-sm font-semibold text-neutral-800">
                {storage
                  ? (storage.usedMb ?? 0) < 1
                    ? `${(storage.usedKb ?? 0).toFixed(1)} KB`
                    : `${(storage.usedMb ?? 0).toFixed(2)} MB`
                  : "—"}
              </span>
              <span className="ml-1 text-xs text-neutral-400">used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {status === "ready" ? (
            <p className="text-sm text-neutral-500">
              {activeType === "all" && !activeCategory
                ? `Showing ${filteredItems.length} total asset${filteredItems.length === 1 ? "" : "s"} for Financial Market`
                : `Showing ${filteredItems.length} of ${items.length} assets for Financial Market`}
            </p>
          ) : (
            <div className="h-4 w-56 animate-pulse rounded bg-neutral-200" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
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
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 8l5-5 5 5M12 3v13"
              />
            </svg>
            Upload Asset
          </button>
        </div>
      </div>

      {status === "error" && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 p-6 text-center text-sm text-red-600">
          Couldn't load library assets. Please try again later.
        </div>
      )}

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AssetCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === "ready" && filteredItems.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
              <svg
                className="h-6 w-6 text-neutral-400"
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
            </div>
            {items.length === 0 ? (
              <>
                <h3 className="text-lg font-bold text-black">
                  Your library is empty
                </h3>
                <p className="mt-2 max-w-md text-sm text-neutral-500">
                  Upload photos, videos, or articles to build a reusable
                  asset library for your posts.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-black">
                  No assets match your filters
                </h3>
                <p className="mt-2 max-w-md text-sm text-neutral-500">
                  Try a different media type or category, or clear your
                  filters to see everything.
                </p>
                <button
                  onClick={() => {
                    setActiveType("all");
                    setActiveCategory(null);
                  }}
                  className="mt-5 rounded-lg px-5 py-3 text-sm font-semibold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {status === "ready" && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((group) => {
            const item = group[0];
            const isAlbum = group.length > 1;
            return (
              <AssetCard
                key={item.id}
                type={(item.media_type ?? item.type)?.toUpperCase()}
                mediaType={item.media_type}
                imageUrl={item.media_url}
                imageUrls={isAlbum ? group.map((a) => a.media_url) : undefined}
                title={isAlbum ? albumName(item.name) : item.name}
                date={formatDate(item.created_at)}
                size={formatSize(group.reduce((sum, a) => sum + (a.size_kb ?? 0), 0))}
                category={item.type?.toUpperCase()}
                onEdit={() => setEditItem(group)}
                onDelete={() => setDeleteTarget(group)}
                onView={
                  item.media_url
                    ? (index = 0) =>
                        // PDFs read better in the browser's own viewer, so open them in a new tab.
                        isPdfAsset(item)
                          ? window.open(item.media_url, "_blank", "noopener,noreferrer")
                          : setViewItem({ items: group, index })
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {viewItem && (
        <AssetViewer
          item={viewItem.items[0]}
          items={viewItem.items}
          startIndex={viewItem.index}
          onClose={() => setViewItem(null)}
        />
      )}

      {(showUpload || editItem) && (
        <UploadAssetModal
          item={editItem?.[0]}
          group={editItem}
          onClose={() => {
            setShowUpload(false);
            setEditItem(null);
          }}
          onSaved={loadItems}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={deleteTarget.length > 1 ? "Delete album" : "Delete asset"}
          message={
            deleteTarget.length > 1
              ? `Delete "${albumName(deleteTarget[0].name)}" and all ${deleteTarget.length} of its images? This cannot be undone.`
              : `Delete "${deleteTarget[0].name}"? This cannot be undone.`
          }
          confirmLabel="Delete"
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
