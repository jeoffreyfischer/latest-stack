import { useState, useEffect, useRef } from 'react'
import type { Stack } from '../types/stack'
import { CATEGORY_LABELS } from '../data/stacks'

interface SearchBarProps {
  stacks: Stack[]
  onSelect: (stack: Stack) => void
}

export function SearchBar({ stacks, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const matches = query.trim().length > 0
    ? stacks.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase().trim())
      )
    : []

  const showDropdown = isOpen && query.trim().length > 0

  useEffect(() => {
    setFocusedIndex(-1)
  }, [query])

  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (stack: Stack) => {
    setQuery('')
    setIsOpen(false)
    setFocusedIndex(-1)
    onSelect(stack)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => (i < matches.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => (i > 0 ? i - 1 : matches.length - 1))
    } else if (e.key === 'Enter' && focusedIndex >= 0 && matches[focusedIndex]) {
      e.preventDefault()
      handleSelect(matches[focusedIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search stacks..."
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        aria-controls="search-results"
        aria-activedescendant={
          focusedIndex >= 0 && matches[focusedIndex]
            ? `search-result-${matches[focusedIndex].id}`
            : undefined
        }
        className="w-full rounded-xl border border-gray-200/80 bg-white/90 px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-pink-600"
      />
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {showDropdown && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No matches
            </li>
          ) : (
            matches.map((stack, i) => (
              <li
                key={stack.id}
                ref={(el) => { itemRefs.current[i] = el }}
                id={`search-result-${stack.id}`}
                role="option"
                aria-selected={i === focusedIndex}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  i === focusedIndex
                    ? 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleSelect(stack)}
              >
                <span className="font-medium">{stack.name}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {CATEGORY_LABELS[stack.category] ?? stack.category}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
