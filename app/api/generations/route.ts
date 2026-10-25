import { parseRecipe } from '@/lib/recipe';
import { isLook } from '@/lib/illustration';
import { configuredModel, GenerationBusyError, illustrate, listGenerations, RequestConflictError, validId } from '@/lib/generations';

export const runtime = 'nodejs';
export const maxDuration = 300;
const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
export function localRequest(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  // Next may normalize request.url to localhost even when the browser uses 127.0.0.1.
  const publicUrl = new URL(`${url.protocol}//${request.headers.get('host') || url.host}`);
  return localHosts.has(url.hostname) && localHosts.has(publicUrl.hostname) && (!origin || origin === publicUrl.origin) && request.headers.get('sec-fetch-site') !== 'cross-site';
}
export async function GET(request: Request) {
  if (!localRequest(request)) return Response.json({ error: 'Illustration is available on the local app only.' }, { status: 403 });
  try { return Response.json({ configured: !!process.env.OPENROUTER_API_KEY, model: configuredModel(), generations: await listGenerations() }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: 'The local illustration collection could not be opened.' }, { status: 500 }); }
}
export async function POST(request: Request) {
  if (!localRequest(request)) return Response.json({ error: 'Illustration is available on the local app only.' }, { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({ error: 'Send a JSON recipe.' }, { status: 415 });
  try {
    const raw = await request.text();
    if (raw.length > 10000) return Response.json({ error: 'Recipe is too large.' }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: 'Invalid JSON.' }, { status: 400 }); }
    const recipe = parseRecipe(body?.recipe);
    if (!recipe || !isLook(body?.look) || typeof body?.requestId !== 'string' || !validId(body.requestId)) return Response.json({ error: 'Choose a valid monster, look, and request ID.' }, { status: 400 });
    if (!process.env.OPENROUTER_API_KEY) return Response.json({ error: 'Add OPENROUTER_API_KEY to .env.local and restart the app.' }, { status: 503 });
    const record = await illustrate(body.requestId, recipe, body.look);
    return Response.json(record, { status: record.status === 'failed' ? 502 : record.status === 'running' ? 202 : 200 });
  } catch (error) {
    const busy = error instanceof GenerationBusyError || error instanceof RequestConflictError;
    return Response.json({ error: busy ? error.message : 'The local illustration service could not complete this request. Check your collection before trying again.' }, { status: busy ? 409 : 500 });
  }
}
