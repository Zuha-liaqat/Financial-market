import { useState } from 'react'

const badgeStyles = {
  'VIDEO 4K': 'bg-black text-white',
  PHOTO: 'bg-black/70 text-white',
  ARTICLE: 'bg-black text-white',
  ANIMATION: 'bg-black text-white',
}

const fallbackGradient = {
  video: 'bg-gradient-to-br from-indigo-200 to-violet-400',
  article: 'bg-gradient-to-br from-neutral-300 to-neutral-500',
  photo: 'bg-gradient-to-br from-sky-200 to-slate-400',
}

const fallbackIcon = {
  video: (
    <svg className="h-10 w-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.75 10.5l4.72-2.36a.75.75 0 011.03.67v6.38a.75.75 0 01-1.03.67L15.75 13.5m-9.75 3.75h6a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v6A2.25 2.25 0 006 17.25z"
      />
    </svg>
  ),
  article: (
    <svg className="h-10 w-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),
  photo: (
    <svg className="h-10 w-10 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 8.25V15a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 15V8.25A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25zm10.5-1.5h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  ),
}

function Thumbnail({ type, mediaType, thumbClass, imageUrl, children }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const showImage = mediaType === 'photo' && imageUrl && !imgError

  return (
    <div
      className={`relative flex h-40 items-center justify-center overflow-hidden rounded-t-lg ${
        showImage ? 'bg-neutral-100' : thumbClass || fallbackGradient[mediaType] || 'bg-neutral-300'
      }`}
    >
      {showImage ? (
        <>
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-neutral-200" />
          )}
          <img
            src={imageUrl}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        fallbackIcon[mediaType] ?? fallbackIcon.article
      )}
      <span
        className={`absolute left-2 top-2 z-10 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
          badgeStyles[type] ?? 'bg-black/70 text-white'
        }`}
      >
        {type}
      </span>
      {children}
    </div>
  )
}

export default function AssetCard({
  type,
  mediaType,
  thumbClass,
  imageUrl,
  icon,
  title,
  date,
  size,
  usedIn,
  category,
  description,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white transition hover:shadow-md">
      <Thumbnail type={type} mediaType={mediaType} thumbClass={thumbClass} imageUrl={imageUrl}>
        {usedIn != null && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-neutral-600 shadow-sm">
            Used in {usedIn} post{usedIn === 1 ? '' : 's'}
          </span>
        )}
        {!mediaType && !imageUrl && icon}
        {description && (
          <p className="absolute bottom-2 left-2 right-2 z-10 line-clamp-2 text-left text-xs text-white">
            {description}
          </p>
        )}
      </Thumbnail>

      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-semibold text-black">{title}</p>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {date}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.9A5.5 5.5 0 0117.5 8H18a4 4 0 010 8H7z"
              />
            </svg>
            {size}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-semibold tracking-widest text-neutral-400">
            {category}
          </span>
          <div className="flex items-center gap-2 text-neutral-400">
            {(onEdit || onDelete) && (
              <div className="relative">
                <button
                  aria-label="More options"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="hover:text-black"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-6 z-20 w-32 overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                    {onEdit && (
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          onEdit()
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                          />
                        </svg>
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          onDelete()
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M6 7h12M9.5 7V5.5A1.5 1.5 0 0111 4h2a1.5 1.5 0 011.5 1.5V7m2 0-.7 12.1a2 2 0 01-2 1.9H8.2a2 2 0 01-2-1.9L5.5 7"
                          />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
