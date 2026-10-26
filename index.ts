import { redis, json, isAdmin, makeId } from '../_store'

// POST /api/releases — Authorization: Bearer <ADMIN_API_KEY>
// Body: { name: string, source: string }
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!isAdmin(req)) return json({ error: 'Unauthorized' }, 401)
  let body: any
  try { body = await req.json() } catch { return json({ error: 'Expected JSON body' }, 400) }
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 80) : 'Untitled script'
  const source = body?.source
  if (typeof source !== 'string' || !source.trim()) return json({ error: 'source must be a non-empty string' }, 400)
  if (new TextEncoder().encode(source).byteLength > 500_000) return json({ error: 'Source exceeds 500 KB limit' }, 413)
  const id = makeId()
  await redis.set(`lg:release:${id}`, { id, name, source, createdAt: new Date().toISOString(), version: 1 })
  const base = new URL(req.url).origin
  return json({ id, name, loaderUrl: `${base}/api/loader/${id}`, note: 'This release endpoint is a hosting wrapper, not a Luarmor-grade obfuscator.' }, 201)
}
