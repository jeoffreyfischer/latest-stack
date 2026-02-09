# Latest Stack

A single dashboard showing the latest versions of programming languages, frameworks, tools, and DevOps utilities—all pulled from official sources.

## Features

- **Version tracking** — Latest versions fetched from GitHub Releases, endoflife.date, package registries, and other official APIs
- **Favorites** — Star stacks to pin them at the top; persisted in localStorage
- **Dark mode** — Toggle with system preference fallback
- **Caching** — Versions cached for 1 hour; stale-while-revalidate for instant load when returning
- **Responsive** — Adaptive grid with expand/collapse per category

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS 4
- Vite 7

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Optional: GitHub token

Without a token, the GitHub API allows ~60 requests/hour. Add a token for higher limits:

1. Create `.env.local` with:
   ```
   VITE_GITHUB_TOKEN=ghp_...
   ```
2. Get a token at [github.com/settings/tokens](https://github.com/settings/tokens) (no scopes needed for public repos)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Deployment (GitHub Pages)

The workflow builds and deploys on push to `main`.

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VITE_GITHUB_TOKEN`
4. Value: your GitHub personal access token (create at [github.com/settings/tokens](https://github.com/settings/tokens), no scopes needed for public repos)

The token is inlined in the build; use a token with minimal scope.

## Version Sources

| Source | Examples |
|--------|----------|
| GitHub Releases | Node.js, React, Vite, Docker |
| endoflife.date | Python, PHP, Ruby, PostgreSQL, Visual Studio |
| Package registries | PyPI (Django), npm (Expo) |
| Official APIs | Go (go.dev), Java (Adoptium), Cursor (community API) |

See [AGENTS.md](./AGENTS.md) for the version-fetch flow and how to add new stacks.

## Acknowledgments

Thanks to [Griffen](https://github.com/griffenedge) for his contributions and for helping improve the design, UX, and UI.

## Contribute

Contributions are welcome. Here are ways to get involved:

1. **Report issues** - Found a bug or outdated version? Open an [issue](https://github.com/jeoffreyfischer/latest-stack/issues).
2. **Suggest changes** - Ideas for new stacks, features, or improvements? Start with an issue so we can discuss.
3. **Submit a pull request** - Code changes are appreciated.
   - Fork the repo, create a branch, make your changes
   - Run `npm run build` and `npm run lint` before submitting
   - See [AGENTS.md](./AGENTS.md) for conventions and how to add new stacks

Adding a new stack (languages, frameworks, tools) is a great first contribution - see the "Adding a new stack" section in [AGENTS.md](./AGENTS.md).
