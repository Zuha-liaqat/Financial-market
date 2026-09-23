import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wifi as WifiIcon } from 'lucide-react'
import { apiPublishPost } from '../lib/api'

function friendlyPublishError(message) {
  const credMatch = /no credentials found for platform ['"]?([a-z]+)['"]?/i.exec(message || '')
  if (credMatch) {
    const platform = credMatch[1]
    return {
      text: `Your ${platform.charAt(0).toUpperCase() + platform.slice(1)} account isn't connected yet. Connect it from Integrations before publishing.`,
      showIntegrationsLink: true,
    }
  }
  return { text: message, showIntegrationsLink: false }
}

function getInitials(title) {
  const letters = title
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
  return letters.join('') || '?'
}

const HeartIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
)

const CommentIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M21 12c0 4.418-4.03 8-9 8-1.18 0-2.304-.203-3.328-.568L3 21l1.395-4.185C3.512 15.629 3 13.87 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const ShareIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
    />
  </svg>
)

const BookmarkIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
)

const DotsIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
)

const MessengerIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M12 2C6.48 2 2 6.14 2 11.32c0 2.84 1.35 5.36 3.45 7.02.1.9.03 1.94-.52 3.24 1.25-.13 2.31-.57 3.18-1.17.93.26 1.91.4 2.94.4 5.52 0 10-4.14 10-9.32S17.52 2 12 2zm-.85 12.44l-2.57-2.74-4.5 2.53 4.94-5.24 2.6 2.74 4.47-2.53-4.94 5.24z" />
  </svg>
)

const SmileyIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
    <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
)

const XLogo = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const ThumbIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M18.7 11.9a2.9 2.9 0 012.5 3c.2 2.4-1.5 4.4-3.9 4.4h-1.7l-1.4 3.4c-.4.9-1.7 1.3-2.6.9l-2.9-1.3c-.5-.2-.8-.7-.8-1.2v-7.3c0-.5.2-.9.6-1.2l3-2.4 3-2.3c.9-.7 2.2-.2 2.5.9l1.3 3.2h.4c.3 0 .6 0 .9.3zM4 10v11H1.5V10H4z" />
  </svg>
)

const RetweetIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16a2 2 0 002 2H10v2H7.5a4 4 0 01-4-4V7.55l-1.018.952-1.364-1.46L4.5 3.88zm15 16.24l-4.432-4.14 1.364-1.46 1.068.998V8a2 2 0 00-2-2H14V4h2.5a4 4 0 014 4v8.55l1.018-.952 1.364 1.46-4.382 4.061z" />
  </svg>
)

const ChartIcon = (props) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
)

const SignalIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 18 12" {...props}>
    <rect x="0" y="7" width="2.5" height="5" rx="0.75" />
    <rect x="5" y="4.5" width="2.5" height="7.5" rx="0.75" />
    <rect x="10" y="2" width="2.5" height="10" rx="0.75" />
    <rect x="15" y="0" width="2.5" height="12" rx="0.75" />
  </svg>
)

const BatteryIcon = (props) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M21 10a1 1 0 011 1v2a1 1 0 01-1 1v2a3 3 0 01-3 3H4a3 3 0 01-3-3V8a3 3 0 013-3h14a3 3 0 013 3v2zm-2 0V8a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-2h1v-3h-1v-2h-1z" />
    <rect x="4" y="9" width="12" height="6" opacity=".55" />
  </svg>
)

const VerifiedBadge = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="12" fill="#3897f0" />
    <path d="M7 12.5l3.2 3.2L17.5 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function StatusBar() {
  return (
    <div className="relative z-10 flex items-center justify-between px-6 pt-2 text-black">
      <span className="text-[11px] font-semibold tracking-wide">9:41</span>
      <div className="flex items-center gap-1">
        <SignalIcon className="h-3 w-3" />
        <WifiIcon className="h-3 w-3" />
        <BatteryIcon className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}

function PostImage({ item, initials, textSize = 'text-5xl', className = '' }) {
  if (item.images && item.images.length > 0) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <img
          src={item.images[0].dataUri}
          alt={item.images[0].name}
          className="h-full w-full object-contain"
        />
      </div>
    )
  }
  return (
    <div className={`relative overflow-hidden ${item.thumbClass} ${className}`}>
      <span className={`absolute inset-0 flex items-center justify-center font-black tracking-tight text-white/70 ${textSize}`}>
        {initials}
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
    </div>
  )
}

const avatarGradient = 'bg-gradient-to-tr from-[#FEDA75] via-[#FA7E1E] to-[#D62976]'

function PostImages({ item, initials, platform, className = '' }) {
  const images = item.images || []
  if (images.length === 0) {
    return <PostImage item={item} initials={initials} className={className} />
  }

  if (platform === 'Instagram') {
    if (images.length === 1) {
      return (
        <div className={`relative overflow-hidden bg-white ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-full object-contain" />
        </div>
      )
    }
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <div className="flex h-full gap-0.5">
          <img src={images[0].dataUri} alt={images[0].name} className="h-full flex-1 object-contain" />
          {images.length > 1 && (
            <div className="flex h-full flex-1 flex-col gap-0.5">
              {images.slice(1, 3).map((img, i) => (
                <img key={i} src={img.dataUri} alt={img.name} className="h-full w-full object-contain" />
              ))}
            </div>
          )}
        </div>
        {images.length > 2 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.slice(0, 5).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/80" />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (platform === 'LinkedIn') {
    if (images.length === 1) {
      return (
        <div className={`relative overflow-hidden bg-white ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-full object-contain" />
        </div>
      )
    }
    if (images.length === 2) {
      return (
        <div className={`relative flex overflow-hidden bg-white gap-0.5 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-1/2 object-contain" />
          <img src={images[1].dataUri} alt={images[1].name} className="h-full w-1/2 object-contain" />
        </div>
      )
    }
    if (images.length === 3) {
      return (
        <div className={`relative flex overflow-hidden bg-white gap-0.5 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-1/2 object-contain" />
          <div className="flex h-full w-1/2 flex-col gap-0.5">
            <img src={images[1].dataUri} alt={images[1].name} className="h-full w-full object-contain" />
            <img src={images[2].dataUri} alt={images[2].name} className="h-full w-full object-contain" />
          </div>
        </div>
      )
    }
    return (
      <div className={`relative grid grid-cols-2 overflow-hidden bg-white gap-0.5 ${className}`}>
        {images.slice(0, 4).map((img, i) => (
          <img key={i} src={img.dataUri} alt={img.name} className="h-full w-full object-contain" />
        ))}
      </div>
    )
  }

  if (platform === 'Twitter') {
    if (images.length === 1) {
      return (
        <div className={`relative overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-full object-contain" />
        </div>
      )
    }
    if (images.length === 2) {
      return (
        <div className={`relative flex overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 gap-0.5 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-1/2 object-contain" />
          <img src={images[1].dataUri} alt={images[1].name} className="h-full w-1/2 object-contain" />
        </div>
      )
    }
    if (images.length === 3) {
      return (
        <div className={`relative flex overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 gap-0.5 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-1/2 object-contain" />
          <div className="flex h-full w-1/2 flex-col gap-0.5">
            <img src={images[1].dataUri} alt={images[1].name} className="h-full w-full object-contain" />
            <img src={images[2].dataUri} alt={images[2].name} className="h-full w-full object-contain" />
          </div>
        </div>
      )
    }
    return (
      <div className={`relative grid grid-cols-2 overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 gap-0.5 ${className}`}>
        {images.slice(0, 4).map((img, i) => (
          <img key={i} src={img.dataUri} alt={img.name} className="h-full w-full object-contain" />
        ))}
      </div>
    )
  }

  if (platform === 'Facebook') {
    if (images.length === 1) {
      return (
        <div className={`relative overflow-hidden bg-white ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-full object-contain" />
        </div>
      )
    }
    if (images.length === 2) {
      return (
        <div className={`relative flex overflow-hidden bg-white gap-0.5 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-1/2 object-contain" />
          <img src={images[1].dataUri} alt={images[1].name} className="h-full w-1/2 object-contain" />
        </div>
      )
    }
    if (images.length === 3) {
      return (
        <div className={`relative flex overflow-hidden bg-white gap-0.5 ${className}`}>
          <img src={images[0].dataUri} alt={images[0].name} className="h-full w-1/2 object-contain" />
          <div className="flex h-full w-1/2 flex-col gap-0.5">
            <img src={images[1].dataUri} alt={images[1].name} className="h-full w-full object-contain" />
            <img src={images[2].dataUri} alt={images[2].name} className="h-full w-full object-contain" />
          </div>
        </div>
      )
    }
    return (
      <div className={`relative grid grid-cols-2 overflow-hidden bg-white gap-0.5 ${className}`}>
        {images.slice(0, 4).map((img, i) => (
          <img key={i} src={img.dataUri} alt={img.name} className="h-full w-full object-contain" />
        ))}
      </div>
    )
  }

  return <PostImage item={item} initials={initials} className={className} />
}

function TruncatedCaption({ prefix, text, hashtags, hashtagClass, limit = 100 }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > limit
  const shown = expanded || !isLong ? text : `${text.slice(0, limit).trimEnd()}...`
  const ref = useRef(null)

  useEffect(() => {
    if (expanded) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [expanded])

  return (
    <span ref={ref}>
      {prefix}
      {shown}
      {!expanded && isLong && (
        <>
          {' '}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="font-medium text-neutral-400 hover:text-neutral-600"
          >
            more
          </button>
        </>
      )}
      {(expanded || !isLong) && hashtags && (
        <>
          {' '}
          <span className={hashtagClass}>{hashtags}</span>
        </>
      )}
      {expanded && isLong && (
        <>
          {' '}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="font-medium text-neutral-400 hover:text-neutral-600"
          >
            less
          </button>
        </>
      )}
    </span>
  )
}

function StoryAvatar({ initials, size = 'h-8 w-8', text = 'text-[10px]' }) {
  return (
    <div className={`shrink-0 rounded-full ${avatarGradient} p-[2px]`}>
      <div className={`flex ${size} items-center justify-center rounded-full bg-white ${text} font-bold text-neutral-500`}>
        {initials}
      </div>
    </div>
  )
}

function InstagramMobile({ item, initials }) {
  return (
    <div className="min-h-full bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-base font-bold tracking-tight text-black">Instagram</span>
        <div className="flex items-center gap-4 text-black">
          <HeartIcon className="h-5 w-5" />
          <MessengerIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pt-1">
        <StoryAvatar initials={initials} />
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-black">financialmarket</span>
          <VerifiedBadge className="h-3.5 w-3.5" />
          <span className="text-[10px] text-neutral-400">• Sponsored</span>
        </div>
        <DotsIcon className="ml-auto h-5 w-5 text-neutral-700" />
      </div>

      <div className="mt-1.5">
        <PostImages item={item} initials={initials} platform="Instagram" textSize="text-6xl" className="h-56" />
      </div>

      <div className="flex items-center px-3 pt-2 text-black">
        <HeartIcon className="h-6 w-6" />
        <CommentIcon className="ml-4 h-6 w-6" />
        <ShareIcon className="ml-4 h-6 w-6" />
        <BookmarkIcon className="ml-auto h-6 w-6" />
      </div>

      <p className="px-3 pt-1.5 text-[11px] font-semibold text-black">1,284 likes</p>
      <p className="px-3 pt-1 text-[12px] font-bold leading-snug text-black">{item.title}</p>
      <p className="px-3 pt-0.5 text-[11px] leading-snug text-neutral-800">
        <TruncatedCaption
          prefix={<span className="font-semibold text-black">financialmarket </span>}
          text={item.caption}
          hashtags={item.hashtags.join(' ')}
          hashtagClass="text-[#0a55a0]"
          limit={90}
        />
      </p>
      <p className="px-3 pt-0.5 text-[11px] text-neutral-500">View all 24 comments</p>

      <div className="mt-2 flex items-center justify-between border-t border-neutral-100 px-3 pb-1 pt-2">
        <span className="text-[11px] text-neutral-400">Add a comment…</span>
        <SmileyIcon className="h-4 w-4 text-neutral-300" />
      </div>
    </div>
  )
}

function InstagramWeb({ item, initials }) {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5">
        <span className="text-lg font-bold tracking-tight text-black">Instagram</span>
        <div className="flex items-center gap-4 text-neutral-600">
          <HeartIcon className="h-5 w-5" />
          <MessengerIcon className="h-5 w-5" />
          <DotsIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="mx-auto flex max-w-2xl p-4">
        <div className="flex w-full overflow-hidden rounded-md border border-neutral-200 shadow-sm">
          <div className="w-1/2">
            <PostImages item={item} initials={initials} platform="Instagram" className="h-full" />
          </div>
          <div className="flex w-1/2 flex-col">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2.5">
              <StoryAvatar initials={initials} />
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-black">financialmarket</span>
                <VerifiedBadge className="h-3.5 w-3.5" />
              </div>
              <DotsIcon className="ml-auto h-5 w-5 text-neutral-700" />
            </div>
            <div className="flex-1 space-y-2 px-3 py-2.5">
              <p className="text-xs font-bold leading-relaxed text-black">{item.title}</p>
              <p className="text-xs leading-relaxed text-neutral-800">
                <TruncatedCaption
                  prefix={<span className="font-semibold text-black">financialmarket </span>}
                  text={item.caption}
                  hashtags={item.hashtags.join(' ')}
                  hashtagClass="text-[#0a55a0]"
                  limit={90}
                />
              </p>
              <p className="text-[11px] text-neutral-400">View all 24 comments</p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-24 rounded bg-neutral-200" />
                    <div className="h-2 w-32 rounded bg-white" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center border-t border-neutral-100 px-3 py-2.5 text-neutral-600">
              <HeartIcon className="h-5 w-5" />
              <CommentIcon className="ml-3 h-5 w-5" />
              <ShareIcon className="ml-3 h-5 w-5" />
              <BookmarkIcon className="ml-auto h-5 w-5" />
            </div>
            <p className="px-3 pb-3 text-[11px] font-semibold text-neutral-800">1,284 likes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkedInMobile({ item, initials }) {
  return (
    <div className="min-h-full bg-white">
      <StatusBar />
      <div className="flex items-center gap-1.5 px-4 py-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#0A66C2] text-[11px] font-bold text-white">
          in
        </div>
        <span className="text-sm font-semibold text-[#0A66C2]">LinkedIn</span>
      </div>

      <div className="border-t border-neutral-100 bg-white">
        <div className="flex items-center gap-2 px-3 pt-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-xs font-bold text-white">
            D
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-black">Financial Market</span>
              <VerifiedBadge className="h-3.5 w-3.5" />
            </div>
            <p className="truncate text-[10px] text-neutral-500">12,481 followers</p>
            <p className="text-[10px] text-neutral-500">2h • Edited</p>
          </div>
          <button className="ml-auto rounded-full border border-[#0A66C2] px-2.5 py-1 text-[10px] font-semibold text-[#0A66C2]">
            Follow
          </button>
        </div>

        <p className="px-3 pt-2.5 text-[12px] font-bold leading-relaxed text-black">{item.title}</p>
        <p className="whitespace-pre-line px-3 pt-1 text-[11px] leading-relaxed text-neutral-800">
          <TruncatedCaption
            text={item.caption}
            hashtags={item.hashtags.join(' ')}
            hashtagClass="text-[#0a66c2]"
            limit={150}
          />
        </p>

        <div className="mt-2">
          <PostImages item={item} initials={initials} platform="LinkedIn" textSize="text-3xl" className="h-48" />
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0A66C2] text-white">
              <ThumbIcon className="h-2.5 w-2.5" />
            </span>
            312
          </span>
          <span>24 comments · 12 reposts</span>
        </div>

        <div className="grid grid-cols-4 border-t border-neutral-100 text-[10px] font-semibold text-neutral-600">
          <span className="flex items-center justify-center gap-1.5 py-2">
            <ThumbIcon className="h-4 w-4" /> Like
          </span>
          <span className="flex items-center justify-center gap-1.5 py-2">
            <CommentIcon className="h-4 w-4" /> Comment
          </span>
          <span className="flex items-center justify-center gap-1.5 py-2">
            <RetweetIcon className="h-4 w-4" /> Repost
          </span>
          <span className="flex items-center justify-center gap-1.5 py-2">
            <ShareIcon className="h-4 w-4" /> Send
          </span>
        </div>
      </div>
    </div>
  )
}

function LinkedInWeb({ item, initials }) {
  return (
    <div className="flex bg-neutral-50">
      <div className="flex flex-1 items-start gap-5 p-4">
        <div className="min-w-0 flex-1">
          <div className="rounded-md border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 px-4 pt-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-sm font-bold text-white">
                D
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-black">Financial Market</span>
                  <VerifiedBadge className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-neutral-500">12,481 followers • 2h • Edited</p>
              </div>
              <button className="ml-auto rounded-full border border-[#0A66C2] px-3 py-1.5 text-[11px] font-semibold text-[#0A66C2]">
                Follow
              </button>
            </div>

            <p className="px-4 pt-3 text-sm font-bold leading-relaxed text-black">{item.title}</p>
            <p className="whitespace-pre-line px-4 pt-1 text-[13px] leading-relaxed text-neutral-800">
              <TruncatedCaption
                text={item.caption}
                hashtags={item.hashtags.join(' ')}
                hashtagClass="text-[#0a66c2]"
                limit={200}
              />
            </p>

            <div className="mt-3">
              <PostImages item={item} initials={initials} platform="LinkedIn" textSize="text-4xl" className="h-44" />
            </div>

            <div className="flex items-center justify-between px-4 py-2 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A66C2] text-white">
                  <ThumbIcon className="h-3 w-3" />
                </span>
                312
              </span>
              <span>24 comments · 12 reposts</span>
            </div>

            <div className="grid grid-cols-4 border-t border-neutral-100 text-[11px] font-semibold text-neutral-600">
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <ThumbIcon className="h-4 w-4" /> Like
              </span>
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <CommentIcon className="h-4 w-4" /> Comment
              </span>
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <RetweetIcon className="h-4 w-4" /> Repost
              </span>
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <ShareIcon className="h-4 w-4" /> Send
              </span>
            </div>
          </div>
        </div>

        <div className="hidden w-52 shrink-0 space-y-4 md:block">
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-semibold text-neutral-500">Financial Market</p>
            <div className="mt-2 h-8 rounded bg-neutral-200" />
            <div className="mt-2 h-2 w-3/4 rounded bg-neutral-200" />
            <div className="mt-3 h-6 rounded bg-[#0A66C2] opacity-90" />
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-semibold text-neutral-500">Hashtags</p>
            <p className="mt-2 text-[11px] font-medium text-[#0A66C2]">{item.hashtags.slice(0, 3).join(' ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FacebookMobile({ item, initials }) {
  return (
    <div className="min-h-full bg-white">
      <StatusBar />
      <div className="flex items-center justify-between px-4 py-1.5">
        <span className="text-lg font-bold tracking-tight text-[#1877F2]">facebook</span>
        <div className="flex items-center gap-4 text-neutral-700">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-4.35-4.35M18 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
          </svg>
          <MessengerIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="border-t border-neutral-100 bg-white">
        <div className="flex items-center gap-2 px-3 pt-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-black">Financial Market</span>
              <VerifiedBadge className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] text-neutral-500">2h · Edited</p>
          </div>
          <DotsIcon className="ml-auto h-5 w-5 text-neutral-500" />
        </div>

        <p className="px-3 pt-2.5 text-[12px] font-bold leading-relaxed text-black">{item.title}</p>
        <p className="whitespace-pre-line px-3 pt-1 text-[11px] leading-relaxed text-neutral-800">
          <TruncatedCaption
            text={item.caption}
            hashtags={item.hashtags.join(' ')}
            hashtagClass="text-[#1877F2]"
            limit={150}
          />
        </p>

        <div className="mt-2">
          <PostImages item={item} initials={initials} platform="Facebook" textSize="text-3xl" className="h-48" />
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-white">
              <ThumbIcon className="h-2.5 w-2.5" />
            </span>
            312
          </span>
          <span>24 comments · 12 shares</span>
        </div>

        <div className="grid grid-cols-3 border-t border-neutral-100 text-[10px] font-semibold text-neutral-600">
          <span className="flex items-center justify-center gap-1.5 py-2">
            <ThumbIcon className="h-4 w-4" /> Like
          </span>
          <span className="flex items-center justify-center gap-1.5 py-2">
            <CommentIcon className="h-4 w-4" /> Comment
          </span>
          <span className="flex items-center justify-center gap-1.5 py-2">
            <ShareIcon className="h-4 w-4" /> Share
          </span>
        </div>
      </div>
    </div>
  )
}

function FacebookWeb({ item, initials }) {
  return (
    <div className="flex bg-neutral-50">
      <div className="flex flex-1 items-start gap-5 p-4">
        <div className="min-w-0 flex-1">
          <div className="rounded-md border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 px-4 pt-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-black">Financial Market</span>
                  <VerifiedBadge className="h-4 w-4" />
                </div>
                <p className="text-[11px] text-neutral-500">2h · Edited</p>
              </div>
              <DotsIcon className="ml-auto h-5 w-5 text-neutral-500" />
            </div>

            <p className="px-4 pt-3 text-sm font-bold leading-relaxed text-black">{item.title}</p>
            <p className="whitespace-pre-line px-4 pt-1 text-[13px] leading-relaxed text-neutral-800">
              <TruncatedCaption
                text={item.caption}
                hashtags={item.hashtags.join(' ')}
                hashtagClass="text-[#1877F2]"
                limit={200}
              />
            </p>

            <div className="mt-3">
              <PostImages item={item} initials={initials} platform="Facebook" textSize="text-4xl" className="h-44" />
            </div>

            <div className="flex items-center justify-between px-4 py-2 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-white">
                  <ThumbIcon className="h-3 w-3" />
                </span>
                312
              </span>
              <span>24 comments · 12 shares</span>
            </div>

            <div className="grid grid-cols-3 border-t border-neutral-100 text-[11px] font-semibold text-neutral-600">
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <ThumbIcon className="h-4 w-4" /> Like
              </span>
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <CommentIcon className="h-4 w-4" /> Comment
              </span>
              <span className="flex items-center justify-center gap-1.5 py-2.5">
                <ShareIcon className="h-4 w-4" /> Share
              </span>
            </div>
          </div>
        </div>

        <div className="hidden w-52 shrink-0 space-y-4 md:block">
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-semibold text-neutral-500">Financial Market</p>
            <div className="mt-2 h-8 rounded bg-neutral-200" />
            <div className="mt-2 h-2 w-3/4 rounded bg-neutral-200" />
            <div className="mt-3 h-6 rounded bg-[#1877F2] opacity-90" />
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3 shadow-sm">
            <p className="text-[11px] font-semibold text-neutral-500">Hashtags</p>
            <p className="mt-2 text-[11px] font-medium text-[#1877F2]">{item.hashtags.slice(0, 3).join(' ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TwitterMobile({ item, initials }) {
  return (
    <div className="min-h-full bg-white text-black">
      <StatusBar />
      <div className="flex items-center justify-between px-4 py-2">
        <XLogo className="h-6 w-6" />
        <div className="flex items-center gap-4">
          <ChartIcon className="h-5 w-5 text-neutral-500" />
          <div className="h-6 w-6 rounded-full bg-neutral-300" />
        </div>
      </div>

      <div className="flex gap-2.5 px-3 pt-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0] text-[10px] font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1">
            <span className="text-xs font-bold text-black">Financial Market</span>
            <VerifiedBadge className="h-3.5 w-3.5" />
            <span className="text-xs text-neutral-500">@financialmarket · 2h</span>
          </div>
          <p className="mt-1 text-[12px] font-bold leading-snug text-black">{item.title}</p>
          <p className="whitespace-pre-line text-[12px] leading-snug text-neutral-800">
            <TruncatedCaption
              text={item.caption}
              hashtags={item.hashtags.join(' ')}
              hashtagClass="text-[#1d9bf0]"
              limit={140}
            />
          </p>
        </div>
      </div>

      <div className="px-3 pt-2">
        <PostImages
          item={item}
          initials={initials}
          platform="Twitter"
          textSize="text-4xl"
          className="h-44"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <CommentIcon className="h-4 w-4" /> 12
        </span>
        <span className="flex items-center gap-1.5">
          <RetweetIcon className="h-4 w-4" /> 34
        </span>
        <span className="flex items-center gap-1.5">
          <HeartIcon className="h-4 w-4" /> 210
        </span>
        <span className="flex items-center gap-1.5">
          <ChartIcon className="h-4 w-4" /> 21K
        </span>
        <ShareIcon className="h-4 w-4" />
      </div>
    </div>
  )
}

function TwitterWeb({ item, initials }) {
  return (
    <div className="min-h-full bg-white text-black">
      <div className="mx-auto max-w-lg p-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0] text-[11px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1">
              <span className="text-[13px] font-bold text-black">Financial Market</span>
              <VerifiedBadge className="h-4 w-4" />
              <span className="text-[13px] text-neutral-500">@financialmarket · 2h</span>
            </div>
            <p className="mt-1 text-[14px] font-bold leading-relaxed text-black">{item.title}</p>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-neutral-800">
              <TruncatedCaption
                text={item.caption}
                hashtags={item.hashtags.join(' ')}
                hashtagClass="text-[#1d9bf0]"
                limit={180}
              />
            </p>
            <div className="mt-3">
              <PostImages
                item={item}
                initials={initials}
                platform="Twitter"
                textSize="text-5xl"
                className="aspect-video"
              />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-[12px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <CommentIcon className="h-4 w-4" /> 12
              </span>
              <span className="flex items-center gap-1.5">
                <RetweetIcon className="h-4 w-4" /> 34
              </span>
              <span className="flex items-center gap-1.5">
                <HeartIcon className="h-4 w-4" /> 210
              </span>
              <span className="flex items-center gap-1.5">
                <ChartIcon className="h-4 w-4" /> 21K
              </span>
              <ShareIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneFrame({ children }) {
  return (
    <div className="relative mx-auto w-[296px] rounded-[3rem] border-[2.5px] border-neutral-700 bg-gradient-to-b from-neutral-500 via-neutral-700 to-neutral-800 p-[2.5px] shadow-2xl">
      <div className="absolute -left-[3px] top-[90px] h-6 w-[2.5px] rounded-l bg-neutral-500" />
      <div className="absolute -left-[3px] top-[138px] h-10 w-[2.5px] rounded-l bg-neutral-500" />
      <div className="absolute -left-[3px] top-[188px] h-10 w-[2.5px] rounded-l bg-neutral-500" />
      <div className="absolute -right-[3px] top-[158px] h-14 w-[2.5px] rounded-r bg-neutral-500" />

      <div className="relative h-[612px] overflow-hidden rounded-[2.7rem]">
        <div className="h-full overflow-y-auto pb-8">{children}</div>
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-[20px] w-[68px] -translate-x-1/2 rounded-full bg-black shadow-[0_0_0_1px_rgba(60,60,60,0.3)]" />
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 h-[4px] w-28 -translate-x-1/2 rounded-full bg-neutral-900" />
      </div>
    </div>
  )
}

function BrowserFrame({ children, url }) {
  return (
    <div className="mx-auto w-full overflow-hidden rounded-lg border border-neutral-200 shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-neutral-200 bg-white px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-neutral-400">{url}</div>
      </div>
      <div className="max-h-[520px] overflow-y-auto">{children}</div>
    </div>
  )
}

const platforms = [
  {
    key: 'LinkedIn', label: 'LinkedIn', activeColor: 'text-[#0A66C2]', Mobile: LinkedInMobile, Web: LinkedInWeb, url: 'linkedin.com/feed', icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  },
  {
    key: 'Instagram', label: 'Instagram', activeColor: 'text-[#E1306C]', Mobile: InstagramMobile, Web: InstagramWeb, url: 'instagram.com', icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    )
  },
  {
    key: 'Twitter', label: 'X / Twitter', activeColor: 'text-black', Mobile: TwitterMobile, Web: TwitterWeb, url: 'x.com/home', icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    key: 'Facebook', label: 'Facebook', activeColor: 'text-[#1877F2]', Mobile: FacebookMobile, Web: FacebookWeb, url: 'facebook.com', icon: (
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    )
  },
]

export default function PostPreviewModal({ item, onClose, onPublished }) {
  const navigate = useNavigate()
  const defaultTab = platforms.some((p) => p.key === item.platform) ? item.platform : 'LinkedIn'
  const [tab, setTab] = useState(defaultTab)
  const [device, setDevice] = useState('mobile')
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState(null)
  const [posted, setPosted] = useState(item.isPosted)
  const initials = getInitials(item.title)
  const active = platforms.find((p) => p.key === tab)

  async function handlePublish() {
    setPublishing(true)
    setPublishError(null)
    try {
      const result = await apiPublishPost(item.id)
      setPosted(true)
      onPublished?.(item.id, result)
    } catch (err) {
      setPublishError(friendlyPublishError(err.message))
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl transition-all max-h-[calc(100vh-2rem)] overflow-y-auto ${device === 'mobile' ? 'max-w-[420px]' : 'max-w-3xl'
          }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-black">Post Preview</h3>
          <button onClick={onClose} aria-label="Close" className="text-neutral-400 transition hover:text-black">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg bg-neutral-100 p-1.5">
          {platforms.map((p) => {
            const enabled = p.key === item.platform
            return (
              <button
                key={p.key}
                disabled={!enabled}
                onClick={() => enabled && setTab(p.key)}
                title={p.label}
                aria-label={p.label}
                className={`flex flex-1 items-center justify-center rounded-lg px-3 py-2.5 ring-1 transition-all ${
                  !enabled
                    ? 'cursor-not-allowed text-neutral-300'
                    : tab === p.key
                      ? `bg-white shadow-md ring-1 ring-neutral-200 ${p.activeColor}`
                      : 'bg-transparent text-neutral-400 ring-transparent hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]'
                }`}
              >
                {p.icon}
              </button>
            )
          })}
        </div>

        <div className="mb-4 flex w-fit mx-auto items-center gap-1.5 rounded-lg bg-neutral-100 p-1">
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${device === 'mobile'
              ? 'bg-white text-black shadow-sm ring-1 ring-neutral-200'
              : 'text-neutral-500 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]'
              }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3"
              />
            </svg>
            Mobile
          </button>
          <button
            onClick={() => setDevice('web')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition ${device === 'web'
              ? 'bg-white text-black shadow-sm ring-1 ring-neutral-200'
              : 'text-neutral-500 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]'
              }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
              />
            </svg>
            Web
          </button>
        </div>

        {device === 'mobile' ? (
          <PhoneFrame>
            <active.Mobile item={item} initials={initials} />
          </PhoneFrame>
        ) : (
          <BrowserFrame url={active.url}>
            <active.Web item={item} initials={initials} />
          </BrowserFrame>
        )}

        {publishError && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            <p>{publishError.text}</p>
            {publishError.showIntegrationsLink && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate('/integrations')
                }}
                className="mt-1.5 font-semibold underline hover:text-red-700"
              >
                Go to Integrations
              </button>
            )}
          </div>
        )}

        {item.contentType !== 'blog' && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-neutral-200 pt-4">
            <p className="text-xs text-neutral-500">
              Skip review and publish this post to the target platform(s) right away.
            </p>
            <button
              onClick={handlePublish}
              disabled={publishing || posted}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!publishing && !posted && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {posted ? 'Published' : publishing ? 'Publishing…' : 'Post Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
