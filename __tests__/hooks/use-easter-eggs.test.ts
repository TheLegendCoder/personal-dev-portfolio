import test from 'node:test';
import assert from 'node:assert';
import { isKonamiKeyMatch } from '../../src/lib/easter-egg-utils.ts';

test('isKonamiKeyMatch', async (t) => {
  await t.test('returns false for missing or malformed keys', () => {
    assert.strictEqual(isKonamiKeyMatch(undefined, 'ArrowUp'), false);
    assert.strictEqual(isKonamiKeyMatch(null, 'ArrowUp'), false);
    assert.strictEqual(isKonamiKeyMatch('ArrowUp', undefined), false);
    assert.strictEqual(isKonamiKeyMatch('ArrowUp', null), false);
    assert.strictEqual(isKonamiKeyMatch('', 'ArrowUp'), false);
  });

  await t.test('matches exact and case-insensitive keys', () => {
    assert.strictEqual(isKonamiKeyMatch('ArrowUp', 'ArrowUp'), true);
    assert.strictEqual(isKonamiKeyMatch('b', 'B'), true);
    assert.strictEqual(isKonamiKeyMatch('A', 'a'), true);
  });

  await t.test('rejects different keys', () => {
    assert.strictEqual(isKonamiKeyMatch('ArrowLeft', 'ArrowRight'), false);
    assert.strictEqual(isKonamiKeyMatch('x', 'b'), false);
  });
});
