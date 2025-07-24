const { test } = require('node:test');
const assert = require('node:assert/strict');
const E = require('../ascii-engine.js');

test('dark, middle, and fully bright pixels map to bounded characters', () => {
  const pixels = new Uint8ClampedArray([0, 0, 0, 255, 128, 128, 128, 255, 255, 255, 255, 255]);
  const result = E.convert(pixels, 3, 1, { ...E.DEFAULTS, contrast: 100 });
  assert.equal(result.lines[0], ' =@');
  assert.equal(E.convert(pixels, 3, 1, { ...E.DEFAULTS, invert: true, contrast: 100 }).lines[0], '@= ');
});

test('converting does not mutate source pixels or accumulate adjustments', () => {
  const pixels = new Uint8ClampedArray([75, 120, 200, 255]);
  const original = pixels.slice();
  const baseline = E.convert(pixels, 1, 1, E.DEFAULTS);
  E.convert(pixels, 1, 1, { brightness: 100, contrast: 250, color: true });
  assert.deepEqual(pixels, original);
  assert.deepEqual(E.convert(pixels, 1, 1, E.DEFAULTS), baseline);
});

test('transparent pixels use the selected paper color', () => {
  const pixels = new Uint8ClampedArray([255, 0, 0, 0]);
  assert.equal(E.convert(pixels, 1, 1, { background: '#000000', contrast: 100 }).lines[0], ' ');
  assert.equal(E.convert(pixels, 1, 1, { background: '#ffffff', contrast: 100 }).lines[0], '@');
});

test('full Unicode custom ramps and empty ramps produce valid characters', () => {
  const pixels = new Uint8ClampedArray([255, 255, 255, 255]);
  assert.equal(E.convert(pixels, 1, 1, { charset: 'custom', customChars: ' ░😀', contrast: 100 }).lines[0], '😀');
  assert.equal(E.convert(pixels, 1, 1, { charset: 'custom', customChars: '', contrast: 100 }).lines[0], '@');
  assert.equal(E.normalizeSettings({ customChars: '\n\t' }).customChars, E.DEFAULTS.customChars);
});

test('imported settings are bounded and invalid fields get safe defaults', () => {
  const settings = E.normalizeSettings({ columns: 99999, contrast: -50, brightness: -999, foreground: 'red', background: '#aAbBcC', color: 'true', invert: true, charset: '__proto__', saturation: null });
  assert.equal(settings.columns, 240);
  assert.equal(settings.contrast, 0);
  assert.equal(settings.brightness, -100);
  assert.equal(settings.foreground, E.DEFAULTS.foreground);
  assert.equal(settings.background, '#aAbBcC');
  assert.equal(settings.color, false);
  assert.equal(settings.invert, true);
  assert.equal(settings.charset, 'classic');
  assert.equal(settings.saturation, 100);
  for (const invalid of [null, [], 'invalid', 1]) assert.throws(() => E.normalizeSettings(invalid));
});

test('portrait, landscape, tiny, and pathological grids respect memory bounds', () => {
  for (const pixel of [false, true]) {
    for (let columns = 40; columns <= 240; columns += 1) {
      for (const [width, height] of [[1, 1], [1, 100000], [100000, 1], [400, 1477], [1920, 1080], [1080, 1920]]) {
        const grid = E.getGrid(width, height, columns, pixel);
        assert.ok(grid.columns >= 1 && grid.columns <= 240);
        assert.ok(grid.rows >= 1 && grid.rows <= 320);
        assert.ok(grid.columns * grid.rows <= 50000, JSON.stringify(grid));
      }
    }
  }
  assert.throws(() => E.getGrid(0, 100, 160));
  assert.throws(() => E.getGrid(NaN, 100, 160));
});

test('source colors honor grayscale, brightness, contrast, and inversion', () => {
  const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
  const normal = E.convert(pixels, 1, 1, { color: true, contrast: 100 });
  assert.deepEqual([...normal.colors], [255, 0, 0]);
  const gray = E.convert(pixels, 1, 1, { color: true, contrast: 100, saturation: 0 });
  assert.equal(gray.colors[0], gray.colors[1]);
  assert.equal(gray.colors[1], gray.colors[2]);
  assert.deepEqual([...E.convert(pixels, 1, 1, { color: true, contrast: 100, invert: true }).colors], [0, 255, 255]);
});

test('bad pixel buffers and oversized conversion requests fail explicitly', () => {
  assert.throws(() => E.convert(new Uint8ClampedArray(3), 1, 1, E.DEFAULTS));
  assert.throws(() => E.convert(new Uint8ClampedArray(4), 0, 1, E.DEFAULTS));
  assert.throws(() => E.convert([], 1000, 1000, E.DEFAULTS));
});

test('media time formatting handles missing, infinite, and negative durations', () => {
  assert.equal(E.formatTime(125.8), '2:05');
  assert.equal(E.formatTime(Infinity), '0:00');
  assert.equal(E.formatTime(-1), '0:00');
});
