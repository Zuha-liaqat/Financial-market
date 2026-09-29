// Channels a company has connected. The API does not return these yet, so each
// company gets a fixed placeholder set picked from its id until the backend is wired up.
const CHANNELS = [
  { key: 'linkedin', label: 'LinkedIn', short: 'in', className: 'bg-[#0a66c2] text-white' },
  { key: 'x', label: 'X / Twitter', short: 'X', className: 'bg-black text-white' },
  { key: 'instagram', label: 'Instagram', short: 'IG', className: 'bg-linear-to-br from-amber-400 via-pink-500 to-purple-600 text-white' },
  { key: 'facebook', label: 'Facebook', short: 'f', className: 'bg-[#1877f2] text-white' },
]

const SAMPLE_SETS = [
  ['linkedin', 'x', 'instagram', 'facebook'],
  ['linkedin', 'facebook'],
  ['instagram'],
  ['linkedin', 'x'],
  [],
  ['x', 'instagram', 'facebook'],
  ['linkedin'],
]

export function sampleChannelsFor(id) {
  const seed = [...String(id ?? '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const keys = SAMPLE_SETS[seed % SAMPLE_SETS.length]
  return CHANNELS.filter((c) => keys.includes(c.key))
}

export default function ChannelBadges({ channels }) {
  if (!channels.length) return <span className="text-neutral-400">—</span>
  return (
    <div className="flex items-center gap-1">
      {channels.map((c) => (
        <span
          key={c.key}
          title={c.label}
          aria-label={c.label}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${c.className}`}
        >
          {c.short}
        </span>
      ))}
    </div>
  )
}
