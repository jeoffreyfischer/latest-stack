# AGENTS.md

### Do
- Use React 19 with functional components and hooks (e.g. `useState`).
- Use Tailwind CSS for layout and utilities; keep custom CSS in `src/App.css` and `src/index.css` where needed.
- Use Font Awesome for icons (CDN in `public/index.html`); prefer `fa-solid` / `fa-brands` class names.
- Prefer small, focused components and small diffs.
- Reuse existing patterns (e.g. section config in `App.js`, CSS custom properties for theming).

### Don't
- Do not hard-code colors; use Tailwind tokens (e.g. `slate-900`, `amber-500`) or CSS variables already used in the app.
- Do not add new heavy dependencies without approval.
- Do not introduce class components; keep everything function components with hooks.

### Commands
```bash
# development
npm start

# tests (Jest + React Testing Library)
npm run test
npm run test -- --watch path/to/App.test.js

# lint (via react-scripts / ESLint)
npm run build
# or run ESLint directly if configured
npx eslint src/

# production build
npm run build

# deploy to GitHub Pages
npm run deploy
```

### Safety and permissions

**Allowed without prompt:**
- Read files, list files.
- Run tests for a single file, run build to verify.
- Edit existing files and add new files in `src/` and `public/`.
- `npm run build` 

**Ask first:**
- `npm install` / adding or changing dependencies.
- `git push`, `npm run deploy`.
- Deleting files, changing permissions.
- Large refactors or changing project structure.

### Project structure
- **Entry:** `src/index.js` → mounts `App` into `#root`.
- **Main UI:** `src/App.js` – single-page CV with quarter sections and center home; state is `activeSection`.
- **Styles:** `src/App.css` (layout, quarters, center, icons), `src/index.css` (global). Tailwind in `index.css` or PostCSS config.
- **Assets / HTML:** `public/index.html` (title, fonts, Font Awesome CDN).
- **Tests:** `src/App.test.js`; use React Testing Library and `react-scripts test`.

### Good and bad examples
- **Good:** Functional component with hooks like `App.js` (e.g. `useState` for `activeSection`).
- **Bad:** Class components, inline styles for colors that could use Tailwind or existing CSS variables.
- **Icons:** Use Font Awesome classes (e.g. `fa-solid fa-house`, `fa-brands fa-youtube`) and keep icon behaviour consistent (e.g. page background color by default, white on hover).

### PR checklist
- Lint and tests pass (`npm run build`, `npm run test`).
- Add or update tests for new behaviour where relevant.
- Keep the diff small with a short summary.

### When stuck
- Ask a clarifying question, propose a short plan, or open a draft PR with notes.

### Test-first mode
- For new features, write or update tests first, then implement until tests pass.
