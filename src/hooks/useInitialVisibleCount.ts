import { useState, useEffect } from 'react'

/**
 * Returns the number of stacks to show initially based on viewport:
 * - 1 col (< 640px): 3 stacks (3 rows)
 * - 2 cols (640–1023): 4 stacks (2 rows)
 * - 3 cols (1024–1279): 6 stacks (2 rows)
 * - 4 cols (1280+): 4 stacks (1 row)
 */
export function useInitialVisibleCount(): number {
  const [count, setCount] = useState(4)

  useEffect(() => {
    const mqSm = window.matchMedia('(min-width: 640px)')
    const mqLg = window.matchMedia('(min-width: 1024px)')
    const mqXl = window.matchMedia('(min-width: 1280px)')

    const update = () => {
      if (mqXl.matches) {
        setCount(4) // 4 cols, 1 row
      } else if (mqLg.matches) {
        setCount(6) // 3 cols, 2 rows
      } else if (mqSm.matches) {
        setCount(4) // 2 cols, 2 rows
      } else {
        setCount(3) // 1 col, 3 rows
      }
    }

    update()
    mqSm.addEventListener('change', update)
    mqLg.addEventListener('change', update)
    mqXl.addEventListener('change', update)
    return () => {
      mqSm.removeEventListener('change', update)
      mqLg.removeEventListener('change', update)
      mqXl.removeEventListener('change', update)
    }
  }, [])

  return count
}
