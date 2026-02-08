# latest-stack

## Deployment (GitHub Pages)

For versions to load in production, add a repository secret:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VITE_GITHUB_TOKEN`
4. Value: your GitHub personal access token (create at [github.com/settings/tokens](https://github.com/settings/tokens), no scopes needed for public repos)

The token is inlined in the build; use a token with minimal scope.