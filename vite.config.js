import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// DueWell — Stay on top of every due date.
// Brand: calm, trustworthy fintech. Deep teal primary, navy ink.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = env.VITE_SUPABASE_URL || ''
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  return {
    plugins: [
      react(),
      VitePWA({
        // 'prompt' (not 'autoUpdate'): the new service worker waits instead of
        // reloading silently, so <ReloadPrompt> can ask the user to reload.
        registerType: 'prompt',
        // We register the SW ourselves via useRegisterSW() in <ReloadPrompt>,
        // so tell the plugin not to also inject a registration script.
        injectRegister: null,
        includeAssets: [
          'favicon.svg',
          'favicon-32.png',
          'apple-touch-icon.png',
          'icons/*.png',
          'screenshots/*.png',
        ],
        manifest: {
          name: 'DueWell',
          short_name: 'DueWell',
          description: 'Stay on top of every due date.',
          id: '/',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#0f766e',
          background_color: '#0b1220',
          categories: ['finance', 'productivity'],
          icons: [
            { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'icons/maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: 'icons/maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          screenshots: [
            {
              src: 'screenshots/mobile-1.png',
              sizes: '1080x1920',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Your upcoming bills at a glance',
            },
            {
              src: 'screenshots/wide-1.png',
              sizes: '1920x1080',
              type: 'image/png',
              form_factor: 'wide',
              label: 'Track every due date on the desktop',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          // Only register the Supabase route when a URL is configured.
          // urlPattern MUST be a RegExp, not a closure: generateSW stringifies
          // it into sw.js via .toString(), so a build-time variable like
          // `supabaseUrl` would be undefined at runtime and throw on every
          // request (ReferenceError: supabaseUrl is not defined).
          runtimeCaching: supabaseUrl
            ? [
                {
                  // Supabase REST reads: serve fresh when online, fall back to
                  // the last response when offline so the app still shows data.
                  urlPattern: new RegExp(`^${escapeRegExp(supabaseUrl)}/rest/`),
                  handler: 'NetworkFirst',
                  method: 'GET',
                  options: {
                    cacheName: 'supabase-rest',
                    networkTimeoutSeconds: 5,
                    expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 },
                    cacheableResponse: { statuses: [0, 200] },
                  },
                },
              ]
            : [],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          // Split heavy vendors into their own chunks for faster first load.
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (/recharts|d3-|victory|react-smooth|decimal\.js-light|internmap|delaunator|robust-predicates/.test(id))
              return 'charts'
            if (id.includes('framer-motion') || id.includes('popmotion') || id.includes('motion-dom'))
              return 'motion'
            if (id.includes('@supabase')) return 'supabase'
            // Match ONLY the leaf React runtime packages — the `(name)[\\/]`
            // boundary stops `react` from also matching `react-router-dom`.
            // If react-router-dom landed here it would drag its `history` /
            // `@remix-run/router` deps (which live in `vendor`) into this
            // chunk, creating a react-vendor⇄vendor cycle that leaves React
            // undefined when `vendor` runs first (React.forwardRef crash).
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store|react-is)[\\/]/.test(id))
              return 'react-vendor'
            return 'vendor'
          },
        },
      },
    },
    server: { host: true, port: 5173 },
  }
})
