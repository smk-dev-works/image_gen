import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRecipe, rollRecipe, parseRecipe, slots, catalog, initialRecipe, recipeKey, palettes, parseFavorites } from '../lib/recipe';
import { decodeState } from '../lib/storage';

test('each of all 32 lock combinations preserves locked features over 20 rolls', () => {
  for (let mask = 0; mask < 32; mask++) {
    let recipe = createRecipe(42);
    for (const [i, slot] of slots.entries()) recipe.locks[slot] = Boolean(mask & (1 << i));
    const original = structuredClone(recipe);
    for (let step = 0; step < 20; step++) {
      const previous = recipe;
      recipe = rollRecipe(recipe, step);
      for (const slot of slots) {
        if (original.locks[slot]) assert.equal(recipe.parts[slot], original.parts[slot]);
        else assert.notEqual(recipe.parts[slot], previous.parts[slot]);
      }
      assert.equal(recipe.palette, original.palette);
      assert.deepEqual(recipe.locks, original.locks);
    }
  }
});
test('an individual reroll changes only the unlocked requested slot', () => {
  for (const slot of slots) {
    const next = rollRecipe(initialRecipe, 100, slot);
    for (const s of slots) s === slot ? assert.notEqual(next.parts[s], initialRecipe.parts[s]) : assert.equal(next.parts[s], initialRecipe.parts[s]);
    const locked = { ...initialRecipe, locks: { ...initialRecipe.locks, [slot]: true } };
    assert.deepEqual(rollRecipe(locked, 100, slot).parts, locked.parts);
  }
});
test('pinned seed produces a stable catalog recipe and stable roll', () => {
  const a = createRecipe(42);
  assert.deepEqual(a.parts, { body: 2, eyes: 2, mouth: 5, arms: 2, feet: 0 });
  assert.deepEqual(createRecipe(42), a);
  assert.deepEqual(rollRecipe(a, 123), rollRecipe(a, 123));
  assert.deepEqual(createRecipe(0), createRecipe(0));
});
test('many sampled recipes stay within catalog bounds', () => {
  for (let seed = 0; seed < 2000; seed++) {
    const r = createRecipe(seed);
    assert.ok(parseRecipe(r));
    for (const slot of slots) assert.ok(r.parts[slot] >= 0 && r.parts[slot] < catalog[slot].length);
    assert.ok(r.palette >= 0 && r.palette < palettes.length);
    assert.ok(parseRecipe(rollRecipe(r, seed + 1)));
  }
});
test('refresh and favorites round-trip exact parts, palette, seed, and locks', () => {
  const recipe = rollRecipe(initialRecipe, 77);
  recipe.locks.eyes = true;
  const state = { recipe, favorites: [{ id: recipeKey(recipe), name: 'My friend', recipe }] };
  const restored = decodeState(JSON.stringify(state));
  assert.deepEqual(restored, state);
  assert.deepEqual(parseRecipe(JSON.parse(JSON.stringify(recipe))), recipe);
});
test('invalid or stale stored data is rejected safely', () => {
  for (const raw of [null, '', 'bad json', '{}', 'null', '{"recipe":{"version":2}}']) assert.equal(decodeState(raw), null);
  for (const value of [null, {}, { ...initialRecipe, version: 2 }, { ...initialRecipe, palette: -1 }, { ...initialRecipe, seed: Infinity }, { ...initialRecipe, seed: -1 }, { ...initialRecipe, parts: { ...initialRecipe.parts, eyes: 99 } }, { ...initialRecipe, locks: {} }]) assert.equal(parseRecipe(value), null);
  assert.deepEqual(parseFavorites([null, {}, { id: 'a', name: 'Bad', recipe: {} }]), []);
  const valid = { id: 'a', name: 'Buddy', recipe: initialRecipe };
  assert.equal(parseFavorites(Array(15).fill(valid)).length, 1);
});
