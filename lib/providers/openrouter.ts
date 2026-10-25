export const DEFAULT_IMAGE_MODEL = 'openai/gpt-image-2.5-flare';
export class ProviderError extends Error {}

export function decodeImage(value: unknown): { bytes: Buffer; mediaType: string } {
  const item = value as { b64_json?: unknown } | undefined;
  if (typeof item?.b64_json !== 'string' || item.b64_json.length > 28_000_000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(item.b64_json)) throw new ProviderError('The model did not return a usable image.');
  const bytes = Buffer.from(item.b64_json, 'base64');
  const hex = bytes.subarray(0, 12).toString('hex');
  const mediaType = hex.startsWith('89504e470d0a1a0a') ? 'image/png' : hex.startsWith('ffd8ff') ? 'image/jpeg' : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null;
  if (!mediaType || bytes.length < 32) throw new ProviderError('The model returned an unsupported or empty image.');
  return { bytes, mediaType };
}

export async function generateImage(prompt: string, model: string, fetcher: typeof fetch = fetch) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new ProviderError('Add OPENROUTER_API_KEY to .env.local and restart the app.');
  const configuredTimeout = Number(process.env.GENERATION_TIMEOUT_MS || 180000);
  const timeout = Number.isFinite(configuredTimeout) ? Math.min(300000, Math.max(1000, configuredTimeout)) : 180000;
  let response: Response;
  try {
    response = await fetcher('https://openrouter.ai/api/v1/images', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, n: 1, aspect_ratio: '1:1', ...(model.startsWith('openai/') ? { quality: 'high' } : {}) }),
      signal: AbortSignal.timeout(timeout),
    });
  } catch {
    throw new ProviderError('The image service timed out or could not be reached. It may already have charged for this request. Check OpenRouter activity before trying again.');
  }
  if (!response.ok) {
    // Never expose upstream bodies: they can contain secrets or request details.
    throw new ProviderError(response.status === 401 || response.status === 403 ? 'OpenRouter rejected the API key or model access. Check your server configuration.' : response.status === 402 ? 'Your OpenRouter account needs credits before illustrating.' : response.status === 429 ? 'The image service is busy. Wait a moment before trying again.' : `The image service could not complete this request (${response.status}). Check OpenRouter activity before trying again.`);
  }
  let payload;
  try { payload = await response.json(); } catch { throw new ProviderError('The image service returned an unreadable response. Check OpenRouter activity before trying again.'); }
  const image = decodeImage(payload?.data?.[0]);
  const cost = payload?.usage?.cost;
  return { ...image, cost: typeof cost === 'number' && Number.isFinite(cost) && cost >= 0 ? cost : undefined };
}
