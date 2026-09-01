import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import { getAllBlogs, removeBlog } from '../data/blogs'

export default function BlogsPage() {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState([])
  const [status, setStatus] = useState('loading')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadBlogs = useCallback(() => {
    setBlogs(getAllBlogs())
    setStatus('ready')
  }, [])

  useEffect(() => {
    loadBlogs()
  }, [loadBlogs])

  function confirmDelete() {
    setDeleting(true)
    removeBlog(deleteTarget.id)
    loadBlogs()
    setDeleteTarget(null)
    setDeleting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-neutral-500">
          {status === 'ready'
            ? `Showing ${blogs.length} blog post${blogs.length === 1 ? '' : 's'}`
            : 'Loading blogs…'}
        </p>
        <button
          onClick={() => navigate('/create-blog')}
          className="flex items-center gap-1.5 rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Blog
        </button>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg border border-neutral-200 bg-neutral-100" />
          ))}
        </div>
      )}

      {status === 'ready' && blogs.length === 0 && (
        <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-400">
          No blogs yet. Create one to see it here.
        </div>
      )}

      {status === 'ready' && blogs.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
            >
              <div className={`h-28 w-full ${blog.thumbClass ?? 'bg-gradient-to-br from-sky-200 to-slate-400'}`} />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-sm bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
                    {blog.status ?? 'STAGING'}
                  </span>
                  <span className="text-xs text-neutral-400">{blog.timestamp}</span>
                </div>
                <h3 className="line-clamp-2 text-sm font-semibold text-black">{blog.title}</h3>
                <p className="line-clamp-2 text-xs text-neutral-500">{blog.caption}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(blog.hashtags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-end pt-2">
                  <button
                    onClick={() => setDeleteTarget(blog)}
                    aria-label={`Delete ${blog.title}`}
                    className="rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete blog"
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirming={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
