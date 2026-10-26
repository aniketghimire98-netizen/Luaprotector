# Luau Guard — frontend + Vercel backend starter

This project now includes a small authenticated release API. It is **not a Luarmor-grade obfuscator**: it stores source privately in Upstash Redis and serves a short loader that fetches the source at runtime. The runtime payload can still be inspected by someone who controls the client or captures the HTTP response. Use only with scripts you own or are authorized to distribute.

## Deploy to Vercel

1. Push this project to a GitHub repository and import it into Vercel.
2. Add an Upstash Redis database in the Vercel Storage marketplace, or set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Project Settings → Environment Variables.
3. Add `ADMIN_API_KEY` as a long random secret. Never put it in frontend code or commit it to Git.
4. Deploy. Runtime functions use Vercel's Node.js runtime and the Upstash REST API.

## Create a release

Send a POST request to `/api/releases` with `Authorization: Bearer YOUR_ADMIN_API_KEY`:

```bash
curl -X POST "https://YOUR-DOMAIN.vercel.app/api/releases" \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"name":"My Script","source":"print(\"hello\")"}'
```

The response includes a `loaderUrl`. Visiting that URL (or `/releases/RELEASE_ID`) returns only loader code. In Roblox/Luau environments that support `game:HttpGet` and `loadstring`, the loader fetches `/api/payload?id=RELEASE_ID` and executes the returned source.

## Security limits

- This is a **loader/hosting backend**, not source-code obfuscation. It does not implement virtualized bytecode or control-flow transformation.
- Since runtime code must reach the client to execute, a determined client can capture it. The loader URL only hides source from the initial loader response, not from runtime inspection.
- The payload route is public by release ID. Add license/key checks, rate limits, revocation, and audit logging before distributing paid scripts.
- Do not use the second uploaded archive as a server-side engine without auditing it. It contains a large mixed collection of third-party scripts; no engine in it has been verified as safe or suitable.

## Local development

```bash
npm install
npm run dev
```

The API routes are Vercel functions, so test them with `vercel dev` after setting the environment variables. The static frontend still builds with `npm run build`.
