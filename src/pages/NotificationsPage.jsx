import { useState } from 'react'

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-brand-500' : 'bg-neutral-200'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

const triggerLabels = [
  'New Post Ready for Approval',
  'Post Published Successfully',
  'Post Failed / Error Alerts',
]

const channels = [
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    connected: false,
    fieldLabel: 'Recipient Group Invite Link',
    fieldPlaceholder: 'https://chat.whatsapp.com/…',
    defaultTriggers: [false, false, false],
    icon: (
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
        <img src="/whatsapp.jfif" alt="WhatsApp" className="h-full w-full object-cover" />
      </div>
    ),
  },
  {
    key: 'slack',
    name: 'Slack',
    connected: true,
    fieldLabel: 'Target Channel',
    fieldPlaceholder: '#content-approvals',
    defaultTriggers: [true, false, true],
    icon: (
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
        <svg className="h-5 w-5" viewBox="0 0 122.8 122.8">
          <path
            d="M25.8,77.6c0,7.1-5.8,12.9-12.9,12.9S0,84.7,0,77.6s5.8-12.9,12.9-12.9h12.9V77.6z M32.3,77.6 c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9v32.3c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V77.6z"
            fill="#E01E5A"
          />
          <path
            d="M45.2,25.8c-7.1,0-12.9-5.8-12.9-12.9S38.1,0,45.2,0s12.9,5.8,12.9,12.9v12.9H45.2z M45.2,32.3 c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H12.9C5.8,58.1,0,52.3,0,45.2s5.8-12.9,12.9-12.9H45.2z"
            fill="#36C5F0"
          />
          <path
            d="M97,45.2c0-7.1,5.8-12.9,12.9-12.9s12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H97V45.2z M90.5,45.2 c0,7.1-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V12.9C64.7,5.8,70.5,0,77.6,0s12.9,5.8,12.9,12.9V45.2z"
            fill="#2EB67D"
          />
          <path
            d="M77.6,97c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9s-12.9-5.8-12.9-12.9V97H77.6z M77.6,90.5 c-7.1,0-12.9-5.8-12.9-12.9s5.8-12.9,12.9-12.9h32.3c7.1,0,12.9,5.8,12.9,12.9s-5.8,12.9-12.9,12.9H77.6z"
            fill="#ECB22E"
          />
        </svg>
      </div>
    ),
  },
  {
    key: 'teams',
    name: 'Microsoft Teams',
    connected: false,
    fieldLabel: 'Target Channel',
    fieldPlaceholder: 'Content Approvals',
    defaultTriggers: [false, false, false],
    icon: (
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
        <img src="/Teams.png" alt="Microsoft Teams" className="h-full w-full object-contain p-1" />
      </div>
    ),
  },
]

function ChannelCard({ channel }) {
  const [connected, setConnected] = useState(channel.connected)
  const [target, setTarget] = useState('')
  const [triggers, setTriggers] = useState(channel.defaultTriggers)
  const [testing, setTesting] = useState(false)

  function toggleTrigger(i) {
    setTriggers((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  function handleTest() {
    setTesting(true)
    setTimeout(() => setTesting(false), 900)
  }

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {channel.icon}
          <div>
            <p className="text-sm font-semibold text-black">{channel.name}</p>
            <span
              className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${
                connected ? 'text-emerald-600' : 'text-neutral-400'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setConnected((v) => !v)}
          className={`shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            connected
              ? 'text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          {connected ? 'Configure' : 'Connect'}
        </button>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-medium text-neutral-500">{channel.fieldLabel}</label>
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={channel.fieldPlaceholder}
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="mt-4 space-y-2.5">
        <p className="text-[10px] font-semibold tracking-widest text-neutral-400">NOTIFICATION TRIGGERS</p>
        {triggerLabels.map((label, i) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-600">{label}</span>
            <Toggle checked={triggers[i]} onChange={() => toggleTrigger(i)} />
          </div>
        ))}
      </div>

      <button
        onClick={handleTest}
        disabled={!connected || testing}
        className="mt-4 flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold text-brand-600 ring-1 ring-brand-200 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:ring-neutral-200 disabled:hover:bg-transparent"
      >
        <svg className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
        {testing ? 'Testing…' : 'Test Connection'}
      </button>
    </div>
  )
}

export default function NotificationChannelsPage() {
  return (
    <div className="space-y-4">
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => (
          <ChannelCard key={channel.key} channel={channel} />
        ))}
      </div>
    </div>
  )
}
