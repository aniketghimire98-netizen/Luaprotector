import { redis, json } from '../_store'

// GET /api/loader/<id> returns only a small loader. The runtime payload is a separate request.
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405)
  const match = new URL(req.url).pathname.match(/\/api\/loader\/([a-f0-9]{20})$/)
  const id = match?.[1]
  if (!id) return json({ error: 'Invalid release id' }, 400)
  const release = await redis.get<any>(`lg:release:${id}`)
  if (!release) return json({ error: 'Release not found' }, 404)
  const payloadUrl = `${new URL(req.url).origin}/api/payload?id=${id}`
  const loader = `-- Luau Guard loader | ${release.name.replace(/[\r\n]/g, ' ')}\nlocal url = ${JSON.stringify(payloadUrl)}\nlocal ok, source = pcall(function() return game:HttpGet(url) end)\nif not ok or type(source) ~= "string" then error("Luau Guard: failed to fetch release") end\nlocal run = loadstring or load\nif not run then error("Luau Guard: this environment does not support loadstring") end\nlocal fn, err = run(source)\nif not fn then error(err) end\nreturn fn()\n`
  return new Response(loader, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } })
}
