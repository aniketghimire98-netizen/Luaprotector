import { Redis } from '@upstash/redis'

export const redis = Redis.fromEnv()
export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } })
}
export function isAdmin(req: Request) {
  const expected = process.env.ADMIN_API_KEY
  return !!expected && req.headers.get('authorization') === `Bearer ${expected}`
}
export function makeId() {
  return crypto.randomUUID().replaceAll('-', '').slice(0, 20)
}
