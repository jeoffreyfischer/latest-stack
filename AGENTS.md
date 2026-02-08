# AGENTS.md

### Version fetching

**Flow:** When adding or updating version sources for a stack:
1. **First try GitHub** – Check if the project has GitHub Releases. Prefer Releases over tags. Use `githubRepo` and `versionRepo` when the version comes from GitHub.
2. **If no GitHub Releases** – Search for official version info on the web (e.g. endoflife.date, project websites, package registries). Add a custom `versionSource` fetcher in `fetchVersion.ts` and set `versionUrl` to the official version/release page.

**Version link icon:** Use `TagIcon` in `icons.tsx` for the version link on stack cards. Same icon for all (GitHub Releases, endoflife.date, etc.).

**Helpers in `fetchVersion.ts`:**
- `fetchNpmVersion(packageName)` – for npm packages (e.g. @builder.io/qwik)
- `fetchWithCorsProxy(url, parse)` – when CORS blocks direct fetch (e.g. endoflife.date, adoptium.net)
- `fetchVersionFromTags(owner, repo)` – when a repo uses tags only, not Releases

**CORS:** Some APIs (endoflife.date, adoptium) block browser requests. Use `fetchWithCorsProxy` with fallback proxies.

### Do
- Use React 19 with functional components and hooks (e.g. `useState`).
- Prefer `rem`, `em`, or viewport units (`vw`, `vh`, `vmin`, `vmax`) for measurements; use `px` only as a last resort.
- Use Tailwind CSS for layout and utilities; keep custom CSS in `src/App.css` and `src/index.css` where needed.
- Use custom SVG icons in `src/components/icons.tsx` (GitHubIcon, SunIcon, MoonIcon, TagIcon, StarIcon).
- Stack logos: use `iconSlug` for Simple Icons CDN (`cdn.jsdelivr.net/npm/simple-icons`).
- Prefer small, focused components and small diffs.
- Reuse existing patterns (e.g. section config in `App.tsx`, hooks in `src/hooks/`).

### Don't
- Do not hard-code colors; use Tailwind tokens (e.g. `slate-900`, `amber-500`) or CSS variables already used in the app.
- Do not add new heavy dependencies without approval.
- Do not introduce class components; keep everything function components with hooks.

### Commands
```bash
# development
npm run dev

# build
npm run build

# lint
npm run lint

# preview (production build locally)
npm run preview
```

**Deploy:** GitHub Actions deploys to GitHub Pages on push to `main` (`.github/workflows/deploy.yml`). Requires `VITE_GITHUB_TOKEN` secret for higher GitHub API rate limits.

### Safety and permissions

**Allowed without prompt:**
- Read files, list files.
- Run build, run lint.
- Edit existing files and add new files in `src/` and `public/`.
- Fetch data from the web

**Ask first:**
- `npm install` / adding or changing dependencies.
- `git push`, `npm run deploy`.
- Deleting files, changing permissions.
- Large refactors or changing project structure.

### Project structure
- **Entry:** `index.html` → loads `src/main.tsx` → mounts `App` into `#root`
- **Main UI:** `src/App.tsx` – stack version dashboard with category sections, favorites, theme toggle
- **Components:** `src/components/` – StackCard, StackSection, LoadingOverlay, icons
- **Data:** `src/data/stacks.ts` – STACK_DEFINITIONS, CATEGORY_ORDER, CATEGORY_LABELS, CATEGORY_COLORS
- **Version fetching:** `src/lib/fetchVersion.ts` (fetchers), `src/lib/fetchVersions.ts` (orchestration, VERSION_FETCHERS map)
- **Hooks:** `src/hooks/` – useTheme, useFavorites, useInitialVisibleCount
- **Types:** `src/types/stack.ts` – Stack, StackCategory
- **Styles:** `src/App.css`, `src/index.css` (Tailwind in index.css)
- **Assets:** `public/lightning.svg`, `index.html` at repo root

### Code structure

**Data flow:**
```
STACK_DEFINITIONS (stacks.ts)
    ↓
App.tsx: fetchAllVersions() → versions Map<id, version>
    ↓
stacks = STACK_DEFINITIONS + latestVersion + isFavorite
    ↓
stacksByCategory (grouped by category) + favoriteStacks
    ↓
StackSection (per category) → StackCard (per stack)
```

**Component hierarchy:**
```
App
├── header (title, GitHub link, theme toggle)
├── main
│   ├── [Expand all] [Clear favorites] (conditional)
│   ├── LoadingOverlay (shows over content when isLoading)
│   ├── StackSection (favorites) – if any favorites
│   └── StackSection (per category) – language, frontend, backend, etc.
│       └── StackCard (per stack)
│           ├── stretched link → stack.url
│           ├── logo/initial + name + version
│           ├── TagIcon link → version page (versionUrl or github releases)
│           └── StarIcon → toggle favorite
└── footer
```

**Version fetching flow:**
1. `getInitialVersionState()` – sync: reads localStorage cache for instant display
2. `fetchAllVersions(STACK_DEFINITIONS, setVersions)` – runs on mount
3. If cache exists: return cached map immediately; background fetch; merge and cache; call `setVersions` if changed
4. If no cache: fetch all; cache; return. First load shows LoadingOverlay until done.
5. Per stack: `versionSource` → `VERSION_FETCHERS[versionSource]()`; else `githubRepo`/`versionRepo` → `fetchVersion()` (GitHub Releases)

**Adding a new stack:**
1. Add entry to `STACK_DEFINITIONS` in `stacks.ts` (id, name, category, url, iconSlug, githubRepo/versionSource/versionUrl)
2. If custom version source: add fetcher in `fetchVersion.ts` and entry in `VERSION_FETCHERS` in `fetchVersions.ts` + add to `versionSource` union in `stack.ts`

### Stack cards
- `StackCard` uses stretched-link pattern: anchor covers whole card; content has `pointer-events-none`; tag icon and star have `pointer-events-auto` so they stay clickable.
- `logo` on Stack is deprecated; use `iconSlug` for Simple Icons CDN. Fallback: first letter of name.

### Good and bad examples
- **Good:** Functional component with hooks like `App.tsx` (e.g. `useState` for versions, `expandAll`).
- **Bad:** Class components, inline styles for colors that could use Tailwind or existing CSS variables.
- **Icons:** Use SVG components from `icons.tsx`; avoid adding new icon libraries.

### PR checklist
- Lint and build pass (`npm run lint`, `npm run build`).
- Add or update tests for new behaviour where relevant.
- Keep the diff small with a short summary.

### When stuck
- Ask a clarifying question, propose a short plan, or open a draft PR with notes.

### Test-first mode
- For new features, write or update tests first, then implement until tests pass.
