interface LoadingOverlayProps {
  show: boolean
}

export function LoadingOverlay({ show }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <>
      <div
        className="absolute inset-0 z-10 bg-white/80 backdrop-blur-md dark:bg-gray-950/90"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-20 flex items-center justify-center"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-6 rounded-xl border border-gray-200/80 bg-white px-12 py-10 dark:border-gray-700/60 dark:bg-gray-900">
          <span className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-pink-500 dark:border-gray-700 dark:border-t-pink-400" />
          <p className="text-base font-medium text-gray-700 dark:text-gray-300">
            Almost there… initial load takes a few seconds 🫠
          </p>
        </div>
      </div>
    </>
  )
}
