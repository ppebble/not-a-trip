export function SpotFormSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-6">
        <div className="h-16 w-full rounded-lg bg-neutral-200"></div>
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-neutral-200"></div>
          <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-neutral-200"></div>
          <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-neutral-200"></div>
          <div className="h-32 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-neutral-200"></div>
          <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div className="h-64 w-full rounded-lg bg-neutral-200"></div>
        <div className="flex justify-end gap-3 pt-4">
          <div className="h-10 w-20 rounded-lg bg-neutral-200"></div>
          <div className="h-10 w-20 rounded-lg bg-neutral-200"></div>
        </div>
      </div>
    </div>
  )
}
