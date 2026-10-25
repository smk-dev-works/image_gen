import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compilePrompt, isLook, looks } from '../lib/illustration';
import { initialRecipe, createRecipe } from '../lib/recipe';
import { decodeImage, generateImage } from '../lib/providers/openrouter';
import { localRequest, POST } from '../app/api/generations/route';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZyckAAAAASUVORK5CYII=';
test('all kids looks preserve anatomy, palette, locks, and child-friendly constraints', () => {
  const recipe = structuredClone(initialRecipe);
  recipe.locks.eyes = true;
  for (const look of looks) {
    const prompt = compilePrompt(recipe, look.id);
    assert.match(prompt, /exactly three round eyes/);
    assert.match(prompt, /Especially preserve locked eyes/);
    assert.match(prompt, /#bca4ed/);
    assert.match(prompt, /Suitable for young children/);
    assert.match(prompt, /entire hands and feet visible/);
  }
  assert.equal(isLook('horror'), false);
  assert.notEqual(compilePrompt(recipe, 'playful'), compilePrompt(recipe, 'realistic'));
  assert.match(compilePrompt(recipe, 'ultra-crazy'), /extra craziness in textures and surroundings/);
});
test('prompts explicitly cover every eye count in the catalog', () => {
  for (let eyes = 0; eyes < 6; eyes++) {
    const recipe = createRecipe(1); recipe.parts.eyes = eyes;
    assert.match(compilePrompt(recipe, 'playful'), new RegExp(`exactly ${eyes === 0 ? 'one' : eyes === 2 ? 'three' : 'two'}`));
  }
});
test('provider sends one image request and decodes actual raster bytes', async () => {
  const old = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'test-key';
  try {
    let calls = 0;
    const result = await generateImage('A friendly monster', 'openai/gpt-image-2.5-flare', async (url, options) => {
      calls++;
      assert.equal(url, 'https://openrouter.ai/api/v1/images');
      const body = JSON.parse(options!.body as string);
      assert.equal(body.n, 1); assert.equal(body.quality, 'high');
      return Response.json({ data: [{ b64_json: png }], usage: { cost: 0.05 } });
    });
    assert.equal(calls, 1); assert.equal(result.mediaType, 'image/png'); assert.equal(result.cost, 0.05);
    const withoutCost = await generateImage('test', 'other/model', async (_url, options) => {
      assert.equal(JSON.parse(options!.body as string).quality, undefined);
      return Response.json({ data: [{ b64_json: png }] });
    });
    assert.equal(withoutCost.cost, undefined);
    await assert.rejects(generateImage('test', 'test', async () => new Response('secret upstream body', { status: 402 })), /needs credits/);
    await assert.rejects(generateImage('test', 'test', async () => Response.json({ data: [] })), /usable image/);
    await assert.rejects(generateImage('test', 'test', async () => { throw new Error('secret'); }), /may already have charged/);
  } finally { if (old === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = old; }
});
test('image validation rejects active formats, invalid base64, empty images', () => {
  for (const value of [undefined, {}, { b64_json: 'bad!' }, { b64_json: Buffer.from('<svg onload="bad()"/>').toString('base64') }, { b64_json: 'iVBORw0KGgo=' }]) assert.throws(() => decodeImage(value));
  assert.equal(decodeImage({ b64_json: png }).mediaType, 'image/png');
});
test('generation route rejects cross-origin, nonlocal and invalid recipes before provider calls', async () => {
  const url = 'http://localhost:3000/api/generations';
  assert.equal(localRequest(new Request(url, { headers: { origin: 'https://evil.example' } })), false);
  assert.equal(localRequest(new Request('https://public.example/api/generations')), false);
  const request = (body: unknown) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await POST(request({ recipe: {}, look: 'playful', requestId: crypto.randomUUID() }))).status, 400);
  assert.equal((await POST(request({ recipe: initialRecipe, look: 'horror', requestId: crypto.randomUUID() }))).status, 400);
  assert.equal((await POST(request({ recipe: initialRecipe, look: 'playful', requestId: '../../bad' }))).status, 400);
  assert.equal((await POST(request(null))).status, 400);
  assert.equal((await POST(new Request(url, { method: 'POST', body: '{}' }))).status, 415);
});

test('local host normalization still accepts same-origin browser requests', () => {
  assert.equal(localRequest(new Request('http://localhost:3001/api/generations', { headers: { host: '127.0.0.1:3001', origin: 'http://127.0.0.1:3001' } })), true);
  assert.equal(localRequest(new Request('http://localhost:3001/api/generations', { headers: { host: 'evil.example', origin: 'http://evil.example' } })), false);
});
