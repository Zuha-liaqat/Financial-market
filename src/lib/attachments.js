// Shared rules for files attached on the Create Post, Create Blog and Planner pages.

const MB = 1024 * 1024
const IMAGE_MAX_SIZE = 5 * MB
const DOCUMENT_MAX_SIZE = 10 * MB

const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'csv']

export const ATTACHMENT_ACCEPT = ['image/*', ...DOCUMENT_EXTENSIONS.map((ext) => `.${ext}`)].join(',')

export function fileExtension(name) {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase()
}

function isImage(file) {
  return file.type.startsWith('image/')
}

function isDocument(file) {
  return DOCUMENT_EXTENSIONS.includes(fileExtension(file.name))
}

function isAllowed(file) {
  if (isImage(file)) return file.size <= IMAGE_MAX_SIZE
  if (isDocument(file)) return file.size <= DOCUMENT_MAX_SIZE
  return false
}

// Turns picked or dropped files into attachment objects. Only images get a preview URL.
export function toAttachments(files) {
  return files.filter(isAllowed).map((file) => {
    const kind = isImage(file) ? 'image' : 'document'
    return {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      kind,
      file,
      preview: kind === 'image' ? URL.createObjectURL(file) : null,
    }
  })
}

export function releaseAttachment(attachment) {
  if (attachment?.preview) URL.revokeObjectURL(attachment.preview)
}
