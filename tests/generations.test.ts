import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { illustrate, getGeneration, imagePath, GenerationBusyError, RequestConflictError } from '../lib/generations';
import { initialRecipe } from '../lib/recipe';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZyckAAAAASUVORK5CYII=';
test('generation persists immutable snapshots, deduplicates paid calls, and limits concurrency', async () => {
  const id = crypto.randomUUID(), failedId = crypto.randomUUID();
  const oldFetch = globalThis.fetch, oldKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'test';
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  globalThis.fetch = async () => { calls++; await gate; return Response.json({ data: [{ b64_json: png }] }); };
  try {
    const recipe = structuredClone(initialRecipe);
    const pending = illustrate(id, recipe, 'realistic');
    await assert.rejects(illustrate(crypto.randomUUID(), recipe, 'playful'), GenerationBusyError);
    release();
    const result = await pending;
    assert.equal(result.status, 'succeeded');
    recipe.parts.eyes = 0;
    assert.equal((await getGeneration(id))!.recipe.parts.eyes, initialRecipe.parts.eyes);
    assert.equal((await illustrate(id, initialRecipe, 'realistic')).id, id);
    assert.equal(calls, 1);
    await assert.rejects(illustrate(id, initialRecipe, 'playful'), RequestConflictError);
    globalThis.fetch = async () => { calls++; return new Response('secret', { status: 402 }); };
    assert.equal((await illustrate(failedId, initialRecipe, 'playful')).status, 'failed');
    await illustrate(failedId, initialRecipe, 'playful');
    assert.equal(calls, 2, 'failed request ID is not billed again');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = oldKey;
    for (const requestId of [id, failedId]) {
      await rm(path.join(process.cwd(), '.artifacts/generations', `${requestId}.json`), { force: true });
      await rm(imagePath(requestId), { force: true });
    }
  }
});
