export function SceneGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-neutral-200"
        >
          <div className="aspect-[4/3] bg-neutral-200" />
          <div className="px-3 py-2">
            <div className="h-4 w-3/4 rounded bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
