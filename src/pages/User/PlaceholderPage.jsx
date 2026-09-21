export default function PlaceholderPage({ title }) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 text-center">
      <h2 className="text-lg font-semibold text-black">{title}</h2>
      <p className="mt-1 text-sm text-neutral-400">Coming soon</p>
    </div>
  )
}
