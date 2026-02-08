interface LoadingOverlayProps {
  show: boolean
}

export function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <>
      <div
        className="absolute inset-0 z-10 bg-slate-50/80 backdrop-blur-sm dark:bg-slate-900/80"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-20 flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-white px-12 py-10 shadow-xl dark:bg-slate-800">
          <span className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 dark:border-slate-600 dark:border-t-emerald-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Almost there… Initial load takes a few seconds 🫠
          </p>
        </div>
      </div>
    </>
  )
}
