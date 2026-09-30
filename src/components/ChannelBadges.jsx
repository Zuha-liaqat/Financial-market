import { findChannel } from './channelIcons'

// Logos of the channels a company has connected, from the API's connected_accounts keys.
export default function ChannelBadges({ accounts = [] }) {
  if (!accounts.length) return <span className="text-neutral-400">—</span>
  return (
    <div className="flex items-center gap-1">
      {accounts.map((key) => {
        const channel = findChannel(key)
        return (
          <span
            key={key}
            title={channel?.label || key}
            aria-label={channel?.label || key}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${channel?.bg || 'bg-neutral-400'}`}
          >
            {channel ? (
              channel.icon
            ) : (
              <span className="text-[10px] font-bold text-white">{String(key).slice(0, 2).toUpperCase()}</span>
            )}
          </span>
        )
      })}
    </div>
  )
}
