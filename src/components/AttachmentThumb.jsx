import { FileText, X } from 'lucide-react'
import { fileExtension } from '../lib/attachments'

// Small tile for an attached file: an image preview, or a document icon with its extension.
export default function AttachmentThumb({ attachment, onRemove }) {
  const isImage = attachment.kind === 'image'

  return (
    <div className="relative h-16 w-16 shrink-0" title={attachment.name}>
      <div className="h-full w-full overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200">
        {isImage ? (
          <img src={attachment.preview} alt={attachment.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-neutral-50 px-1">
            <FileText className="h-6 w-6 text-brand-500" strokeWidth={1.75} />
            <span className="w-full truncate text-center text-[10px] font-semibold uppercase text-neutral-500">
              {fileExtension(attachment.name) || 'file'}
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(attachment.id)
        }}
        aria-label={isImage ? 'Remove image' : 'Remove document'}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-sm ring-2 ring-white transition hover:bg-brand-600"
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
      </button>
    </div>
  )
}
