// Brand tiles for every channel: a white logo on the platform's color.
// Used by the sidebar and by the super admin tables so a channel looks the same everywhere.
import { PinterestIcon, ThreadsIcon, TikTokIcon } from './SocialIcons'

export const socialChannels = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="#fff" />
      </svg>
    ),
    bg: 'bg-linear-to-br from-amber-400 via-pink-500 to-violet-600',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#fff">
        <path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z" />
      </svg>
    ),
    bg: 'bg-[#1877F2]',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#fff">
        <path d="M4.98 3.5C3.88 3.5 3 4.38 3 5.48c0 1.1.88 2 1.98 2h.02C6.1 7.48 7 6.6 7 5.48 7 4.38 6.1 3.5 4.98 3.5zM3.5 8.75h3v11.75h-3zM9.5 8.75h2.9v1.6h.04c.4-.76 1.4-1.6 2.9-1.6 3.1 0 3.66 2 3.66 4.6v6.65h-3v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1v6h-3z" />
      </svg>
    ),
    bg: 'bg-[#0A66C2]',
  },
  {
    key: 'twitter',
    label: 'X / Twitter',
    icon: (
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="#fff">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22H16.6l-5.2-6.8L5.4 22H2.3l8.1-9.3L1.4 2h6.9l4.7 6.2L18.9 2z" />
      </svg>
    ),
    bg: 'bg-black',
  },
  {
    key: 'threads',
    label: 'Threads',
    icon: <ThreadsIcon className="h-3.5 w-3.5" color="#fff" />,
    bg: 'bg-black',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: <TikTokIcon className="h-3.5 w-3.5" color="#fff" />,
    bg: 'bg-[#111820]',
  },
  {
    key: 'pinterest',
    label: 'Pinterest',
    icon: <PinterestIcon className="h-3.5 w-3.5" color="#fff" />,
    bg: 'bg-[#E60023]',
  },
]

function monogram(letter) {
  return <span className="text-[10px] leading-none font-bold text-white">{letter}</span>
}

export const blogChannels = [
  {
    key: 'website',
    label: 'Website',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#fff">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeWidth="2"
          d="M3 12h18M12 3c2.485 2.4 3.75 5.55 3.75 9s-1.265 6.6-3.75 9c-2.485-2.4-3.75-5.55-3.75-9S9.515 5.4 12 3z"
        />
      </svg>
    ),
    bg: 'bg-brand-500',
  },
  { key: 'wordpress', label: 'WordPress', icon: monogram('W'), bg: 'bg-[#21759B]' },
  { key: 'medium', label: 'Medium', icon: monogram('M'), bg: 'bg-black' },
  { key: 'blogger', label: 'Blogger', icon: monogram('B'), bg: 'bg-[#F57D00]' },
  { key: 'wix', label: 'Wix', icon: monogram('Wx'), bg: 'bg-[#0C6EFC]' },
]

const channelsByKey = Object.fromEntries(
  [...socialChannels, ...blogChannels].map((c) => [c.key, c]),
)

// The API may call X either "twitter" or "x".
export function findChannel(key) {
  const k = String(key).toLowerCase()
  return channelsByKey[k === 'x' ? 'twitter' : k] || null
}
