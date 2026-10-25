import { readFile } from 'node:fs/promises';
import { getGeneration, imagePath } from '@/lib/generations';
import { localRequest } from '../../route';
export const runtime = 'nodejs';
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!localRequest(request)) return new Response(null, { status: 403 });
  const { id } = await params;
  try {
    const record = await getGeneration(id);
    if (record?.status !== 'succeeded' || !record.mediaType) return new Response(null, { status: 404 });
    return new Response(await readFile(imagePath(id)), { headers: { 'Content-Type': record.mediaType, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=31536000, immutable', ...(new URL(request.url).searchParams.has('download') ? { 'Content-Disposition': `attachment; filename="monster-${record.look}.${record.mediaType === 'image/jpeg' ? 'jpg' : record.mediaType === 'image/webp' ? 'webp' : 'png'}"` } : {}) } });
  } catch { return new Response(null, { status: 404 }); }
}
