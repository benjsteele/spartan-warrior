import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves project sites from /<repo-name>/. In GitHub Actions the
// repo name comes from GITHUB_REPOSITORY ("owner/repo"); locally we fall back
// to this repository's name so `npm run build && npm run preview` matches prod.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'spartan-warrior'

export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
})
