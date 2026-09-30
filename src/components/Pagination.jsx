function getPageNumbers(page, totalPages) {
  const pages = []
  const add = (p) => {
    if (!pages.includes(p)) pages.push(p)
  }

  add(1)
  for (let p = page - 1; p <= page + 1; p++) {
    if (p > 1 && p < totalPages) add(p)
  }
  if (totalPages > 1) add(totalPages)

  const withGaps = []
  let prev = 0
  for (const p of pages.sort((a, b) => a - b)) {
    if (prev && p - prev > 1) withGaps.push('…')
    withGaps.push(p)
    prev = p
  }
  return withGaps
}

const arrowClass =
  'flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-transparent disabled:hover:text-neutral-500'

// Table footer with "Showing x–y of z" and numbered page buttons.
export default function Pagination({ page, pageSize, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
      <p className="text-xs text-neutral-500">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className={arrowClass}
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {getPageNumbers(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-neutral-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition ${
                p === page
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-600'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className={arrowClass}
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
