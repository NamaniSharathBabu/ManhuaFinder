# Deployment notes (Vercel)

This project includes a serverless endpoint at `/api/search` that proxies requests to the Google GenAI API so your **API key stays server-side**.

Steps to deploy to Vercel

1. In the Vercel dashboard: Project → Settings → Environment Variables → Add `API_KEY` and set the value for Production (and Preview/Development if desired).
2. Ensure your repository is connected and push your changes (or run `vercel --prod`).
3. Vercel will run `npm run build` (which runs `tsc && vite build`) during the build step. The API key is accessed server-side; it is NOT bundled into the client.

Security note

- Do NOT reference `process.env.API_KEY` in client code or inject it into `vite.config.ts` for the browser. Keep the key in server-side code only (we use `api/search.ts`).

If you'd like, I can also convert the project to plain JavaScript (no TypeScript) before deploy; say so and I'll prepare and apply the migration.
