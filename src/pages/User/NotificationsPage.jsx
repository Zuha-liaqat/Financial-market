import { useEffect, useState } from 'react'
import {
  apiDisconnectNotificationChannel,
  apiListNotificationChannels,
  apiSaveNotificationChannel,
  apiTestNotificationChannel,
} from '../../lib/api'
import { ErrorToast } from '../../components/Toast'

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      data-track-label={label ? `Toggle ${label}` : 'Toggle Notification Trigger'}
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

const triggerFields = [
  { key: 'ready_for_approval', label: 'New Post Ready for Approval' },
  { key: 'published', label: 'Post Published Successfully' },
  { key: 'failed', label: 'Post Failed / Error Alerts' },
]

const channelMeta = {
  whatsapp: {
    name: 'WhatsApp',
    fieldLabel: 'Recipient Group Invite Link',
    fieldPlaceholder: 'https://chat.whatsapp.com/…',
    icon: (
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-neutral-50 ring-1 ring-neutral-200">
        <img src="/whatsapp.png" alt="WhatsApp" className="h-full w-full object-cover" />
      </div>
    ),
  },
  slack: {
    name: 'Slack',
    webhookPlaceholder: 'https://hooks.slack.com/services/…',
    webhookHelp: 'Found under Slack → Apps → Incoming Webhooks.',
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
  teams: {
    name: 'Microsoft Teams',
    webhookPlaceholder: 'https://…webhook.office.com/…',
    webhookHelp: 'Found via the Workflows app inside the Teams channel.',
    icon: (
      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200">
        <img src="/Teams.png" alt="Microsoft Teams" className="h-full w-full object-contain p-1" />
      </div>
    ),
  },
}

const providerOrder = ['whatsapp', 'slack', 'teams']

function ChannelCard({ channel, onChange }) {
  const meta = channelMeta[channel.provider]
  const needsWebhook = channel.provider !== 'whatsapp'
  const needsTarget = channel.provider === 'whatsapp'

  const [target, setTarget] = useState(channel.target || '')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [togglingKey, setTogglingKey] = useState(null)

  useEffect(() => {
    setTarget(channel.target || '')
  }, [channel.target])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setTestResult(null)
    try {
      const payload = {}
      if (needsTarget) {
        payload.target = target.trim() || null
      }
      if (needsWebhook && webhookUrl.trim()) {
        payload.webhook_url = webhookUrl.trim()
      }
      await apiSaveNotificationChannel(channel.provider, payload)
      setWebhookUrl('')
      onChange()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDisconnect() {
    setSaving(true)
    setSaveError('')
    try {
      await apiDisconnectNotificationChannel(channel.provider)
      onChange()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleTrigger(field) {
    setTogglingKey(field)
    setSaveError('')
    try {
      await apiSaveNotificationChannel(channel.provider, { [field]: !channel.triggers[field] })
      onChange()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setTogglingKey(null)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await apiTestNotificationChannel(channel.provider)
      setTestResult(result)
    } catch (err) {
      setTestResult({ success: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {meta.icon}
          <div>
            <p className="text-sm font-semibold text-black">{meta.name}</p>
            <span
              className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${
                channel.is_connected ? 'text-emerald-600' : 'text-neutral-400'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${channel.is_connected ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
              {channel.is_connected ? 'Connected' : 'Disconnected'}
            </span>
            {!channel.can_send && (
              <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
                Can't send messages
              </span>
            )}
          </div>
        </div>
        {channel.is_connected && (
          <button
            onClick={handleDisconnect}
            disabled={saving}
            data-track-label={`${meta.name} - Disconnect`}
            className="shrink-0 cursor-pointer text-xs font-semibold text-neutral-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Disconnect
          </button>
        )}
      </div>

      {needsTarget && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">{meta.fieldLabel}</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={meta.fieldPlaceholder}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      )}

      {needsWebhook && (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-neutral-500">
            Webhook URL
            {channel.webhook_configured && <span className="ml-1 font-normal text-emerald-600">(saved)</span>}
          </label>
          <input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder={meta.webhookPlaceholder}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          />
          <p className="mt-1 text-[11px] text-neutral-400">{meta.webhookHelp}</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        data-track-label={`${meta.name} - ${channel.is_connected ? 'Save' : 'Connect'}`}
        className={`mt-4 shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          channel.is_connected
            ? 'text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'
            : 'bg-brand-500 text-white hover:bg-brand-600'
        }`}
      >
        {saving ? 'Saving…' : channel.is_connected ? 'Save Changes' : 'Connect'}
      </button>
      {saveError && <ErrorToast message={saveError} onClose={() => setSaveError('')} />}

      <div className="mt-4 space-y-2.5">
        <p className="text-[10px] font-semibold tracking-widest text-neutral-400">NOTIFICATION TRIGGERS</p>
        {triggerFields.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-2">
            <span className="text-xs text-neutral-600">{field.label}</span>
            <Toggle
              checked={channel.triggers[field.key]}
              onChange={() => toggleTrigger(field.key)}
              disabled={!channel.is_connected || togglingKey === field.key}
              label={`${meta.name} - ${field.label}`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleTest}
        disabled={!channel.is_connected || testing}
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
      {testResult && (
        <p className={`mt-2 text-[11px] ${testResult.success ? 'text-emerald-600' : 'text-amber-700'}`}>
          {testResult.message}
        </p>
      )}
    </div>
  )
}

export default function NotificationChannelsPage() {
  const [channels, setChannels] = useState(null)
  const [loadError, setLoadError] = useState('')

  function load() {
    setLoadError('')
    apiListNotificationChannels()
      .then((list) => {
        const sorted = [...list].sort(
          (a, b) => providerOrder.indexOf(a.provider) - providerOrder.indexOf(b.provider),
        )
        setChannels(sorted)
      })
      .catch((err) => setLoadError(err.message))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-4">
      {loadError && <ErrorToast message={loadError} onClose={() => setLoadError('')} />}
      {channels === null && (
        <p className="text-sm text-neutral-400">
          {loadError ? "Couldn't load notification channels." : 'Loading notification channels…'}
        </p>
      )}
      {channels && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => (
            <ChannelCard key={channel.provider} channel={channel} onChange={load} />
          ))}
        </div>
      )}
    </div>
  )
}
