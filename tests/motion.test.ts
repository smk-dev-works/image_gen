import { test } from 'node:test';
import assert from 'node:assert/strict';
import { revealMonster } from '../lib/motion';

test('reduced motion cancels a current reveal and does not start another', () => {
  let cancelled = 0, started = 0;
  const target = { getAnimations: () => [{ cancel: () => { cancelled++; } }], animate: () => { started++; } };
  revealMonster(target, true);
  assert.equal(cancelled, 1);
  assert.equal(started, 0);
});
test('repeated reveals cancel the old animation and keep the reveal brief', () => {
  let cancelled = false;
  let duration: number | undefined;
  const target = { getAnimations: () => [{ cancel: () => { cancelled = true; } }], animate: (_: Keyframe[], options: KeyframeAnimationOptions) => { duration = Number(options.duration); } };
  revealMonster(target, false);
  assert.equal(cancelled, true);
  assert.equal(duration, 320);
  assert.doesNotThrow(() => revealMonster(null, false));
});
