import { useState } from 'react'

const REDIRECT_URL = 'https://financial-marketing.vercel.app/api/credentials/linkedin/callback'

const URL_PATTERN = /(https?:\/\/[^\s"]+)/g

function linkify(text) {
  if (typeof text !== 'string') return text
  return text.split(URL_PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        data-track-label="Documentation - External Link"
        className="break-all font-medium text-brand-600 underline hover:text-brand-700"
      >
        {part}
      </a>
    ) : (
      part
    ),
  )
}

const steps = [
  {
    title: 'Go to the LinkedIn Developer Portal',
    items: [
      'Open the following link in your browser: https://www.linkedin.com/developers/',
      'Sign in with your LinkedIn account.',
      'Click the "Create App" button in the top-right corner.',
    ],
  },
  {
    title: 'Create a New App',
    intro: 'Fill in the app creation form with the following details:',
    items: [
      { label: 'App name', text: 'Enter any name you like (e.g., "My Marketing App" or your company name).' },
      { label: 'LinkedIn Page', text: 'Search for and select your LinkedIn Company Page.' },
      { label: 'App logo', text: 'Upload a square image or logo (e.g., your company logo).' },
      { label: 'Legal Agreement', text: 'Check the box confirming "I have read and agree to the terms".' },
      'Click the "Create app" button.',
    ],
  },
  {
    title: 'Enable the Required Products (Permissions)',
    intro: 'Once the app is created, you will land on its Dashboard:',
    items: [
      'Click the "Products" tab in the top menu.',
      {
        label: 'Share on LinkedIn',
        text: 'Click "Request access" next to this product and accept the terms. This permission is required to publish posts and images to LinkedIn.',
      },
      {
        label: 'Sign In with LinkedIn using OpenID Connect',
        text: 'Click "Request access" next to this product as well. This permission is required for one-click authentication.',
      },
    ],
    note: 'Both of these products are approved instantly.',
  },
  {
    title: 'Set the Callback / Redirect URL',
    items: [
      'Click the "Auth" tab in the top menu.',
      'Under the "OAuth 2.0 settings" section, find "Authorized redirect URLs for your app".',
      'Click the pencil (edit) icon or "Add redirect URL".',
      'Paste the exact URL below (you can copy it using the button):',
    ],
    code: REDIRECT_URL,
    after: 'Click the "Update / Save" button.',
  },
  {
    title: 'Copy the Client ID and Client Secret',
    items: [
      'At the top of the same "Auth" tab, locate the "Application credentials" section.',
      { label: 'Client ID', text: 'Click the copy icon next to it to copy the value.' },
      { label: 'Client Secret', text: 'Click the eye icon to reveal the secret, then copy it.' },
    ],
  },
  {
    title: 'Connect LinkedIn in the App',
    items: [
      'Return to this application and open the Integrations page.',
      'Click "Configure" (or "Enable") on the LinkedIn card.',
      'Paste your copied Client ID and Client Secret, then click "Save & Connect".',
    ],
    note: 'Your company account is detected automatically — you do not need to enter any company or account ID.',
  },
]

function CopyUrlField({ value }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
      <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-neutral-700">{value}</code>
      <button
        type="button"
        onClick={handleCopy}
        data-track-label="Documentation - Copy LinkedIn Redirect URL"
        className="flex shrink-0 items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-600 shadow-sm ring-1 ring-neutral-200 transition hover:bg-brand-50"
      >
        {copied ? (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9H10.5a1.125 1.125 0 00-1.125 1.125v3.375m7.5 10.376H10.875a1.125 1.125 0 01-1.125-1.125v-9.75c0-.621.504-1.125 1.125-1.125h6.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125z"
              />
            </svg>
            Copy
          </>
        )}
      </button>
    </div>
  )
}

function StepCard({ step, index }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
          {index + 1}
        </span>
        <h3 className="text-sm font-semibold text-black">{step.title}</h3>
      </div>

      {step.intro && <p className="mt-3 text-xs text-neutral-500">{linkify(step.intro)}</p>}

      <ul className="mt-3 space-y-2 pl-10 text-sm text-neutral-600">
        {step.items.map((item, i) => (
          <li key={i} className="list-disc leading-relaxed marker:text-neutral-300">
            {typeof item === 'string' ? (
              linkify(item)
            ) : (
              <>
                <span className="font-semibold text-black">{item.label}:</span> {linkify(item.text)}
              </>
            )}
          </li>
        ))}
      </ul>

      {step.code && (
        <div className="pl-10">
          <CopyUrlField value={step.code} />
        </div>
      )}

      {step.after && <p className="mt-3 pl-10 text-sm text-neutral-600">{linkify(step.after)}</p>}

      {step.note && (
        <div className="mt-3 ml-10 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-700">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
          <span>{step.note}</span>
        </div>
      )}
    </div>
  )
}

export default function DocumentationPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-black">LinkedIn Integration Guide</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Follow the steps below to create a LinkedIn Developer app, generate a Client ID and Client Secret, and
          connect your LinkedIn account to this platform.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <StepCard key={step.title} step={step} index={index} />
        ))}
      </div>
    </div>
  )
}
