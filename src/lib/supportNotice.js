import { apiAdminGetSupportRequest } from './api'

const ATTEMPTS = 8
const GAP_MS = 2000

/**
 * What became of the email for the close that just happened.
 *
 * The server answers before it sends, so at the moment of closing there is
 * nothing to report yet. This watches the request's own history and only counts
 * an email result recorded *after* the last close - which is what ties it to
 * this close rather than to one from last week.
 *
 * Returns 'sent', 'failed', or 'unknown' if it is still not settled, which is
 * not an error: the email may simply be slow, and the history will show it.
 */
export async function watchResolvedEmail(requestId) {
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, GAP_MS))
    try {
      const detail = await apiAdminGetSupportRequest(requestId)
      const kinds = (detail.events || []).map((event) => event.kind)
      const lastClose = kinds.lastIndexOf('closed')
      if (lastClose === -1) continue

      const since = kinds.slice(lastClose)
      if (since.includes('resolved_emailed')) return 'sent'
      if (since.includes('resolved_email_failed')) return 'failed'
    } catch {
      // A read that failed is not an answer; keep waiting.
    }
  }
  return 'unknown'
}

/** The line to show once the watch above has settled. */
export function closedNotice(result) {
  if (result === 'sent') return 'Request closed. The company has been emailed.'
  if (result === 'failed') return 'Request closed, but the email to the company could not be sent.'
  return 'Request closed. The email to the company is still on its way.'
}
