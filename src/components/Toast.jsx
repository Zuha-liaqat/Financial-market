import { useEffect } from 'react'

function ToastShell({ message, onClose, borderClass, iconClass, icon }) {
  useEffect(() => {
    const id = setTimeout(onClose, 4000)
    return () => clearTimeout(id)
  }, [message, onClose])

  return (
    <div className="pointer-events-none fixed right-4 top-5 z-50 flex justify-end px-4 sm:px-0">
      <div
        className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border ${borderClass} bg-white px-4 py-3 shadow-lg ring-1 ring-black/5`}
      >
        <svg className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
        <span className="flex-1 text-sm font-medium text-neutral-800">{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 text-neutral-400 hover:text-black"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ErrorToast({ message, onClose }) {
  return (
    <ToastShell
      message={message}
      onClose={onClose}
      borderClass="border-red-200"
      iconClass="text-red-500"
      icon={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      }
    />
  )
}

export function SuccessToast({ message, onClose }) {
  return (
    <ToastShell
      message={message}
      onClose={onClose}
      borderClass="border-brand-200"
      iconClass="text-brand-500"
      icon={
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75l2.25 2.25 4.5-6.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      }
    />
  )
}
