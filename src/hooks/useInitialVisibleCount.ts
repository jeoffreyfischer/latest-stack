import { useState, useEffect } from 'react'

/**
 * Returns the number of stacks to show initially based on viewport:
 * - 1 col (< sm): 3 stacks (3 rows)
 * - 2 cols (sm–lg): 4 stacks (2 rows)
 * - 4 cols (lg+): 4 stacks (1 row)
 */
export function useInitialVisibleCount(): number {
  const [count, setCount] = useState(4)

  useEffect(() => {
    const mqSm = window.matchMedia('(min-width: 640px)')
    const mqLg = window.matchMedia('(min-width: 1024px)')

    const update = () => {
      if (mqLg.matches) {
        setCount(4) // 4 cols, 1 row
      } else if (mqSm.matches) {
        setCount(4) // 2 cols, 2 rows
      } else {
        setCount(3) // 1 col, 3 rows
      }
    }

    update()
    mqSm.addEventListener('change', update)
    mqLg.addEventListener('change', update)
    return () => {
      mqSm.removeEventListener('change', update)
      mqLg.removeEventListener('change', update)
    }
  }, [])

  return count
}
