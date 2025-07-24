/* Shared, non-destructive conversion math. Browser global + Node test support. */
(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.AsciiEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const RAMPS = Object.freeze({
    classic: ' .:-=+*#%@',
    detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    minimal: ' .:+#', binary: ' 01', blocks: ' ░▒▓█'
  });
  const DEFAULTS = Object.freeze({
    columns: 160, contrast: 120, brightness: 0, saturation: 100,
    charset: 'classic', customChars: ' .:-=+*#%@', foreground: '#d6d2c4',
    background: '#101110', invert: false, color: false, pixel: false
  });
  const PRESETS = Object.freeze({
    afterimage: { ...DEFAULTS },
    terminal: { ...DEFAULTS, foreground: '#9fd498', background: '#0b130c', charset: 'detailed', contrast: 140 },
    bloodline: { ...DEFAULTS, foreground: '#f15a48', background: '#190e0d', contrast: 155, charset: 'minimal' },
    blueprint: { ...DEFAULTS, foreground: '#d8e4ff', background: '#1936b6', contrast: 135 },
    phosphor: { ...DEFAULTS, foreground: '#e6b968', background: '#17120b', charset: 'detailed', contrast: 130 }
  });
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback, min, max) => {
    const parsed = Number(value);
    return value === '' || value === null || typeof value === 'boolean' || !Number.isFinite(parsed)
      ? fallback : clamp(parsed, min, max);
  };
  function normalizeSettings(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Settings must be a JSON object.');
    const settings = { ...DEFAULTS };
    settings.columns = Math.round(number(input.columns, DEFAULTS.columns, 40, 240));
    settings.contrast = number(input.contrast, DEFAULTS.contrast, 0, 250);
    settings.brightness = number(input.brightness, DEFAULTS.brightness, -100, 100);
    settings.saturation = number(input.saturation, DEFAULTS.saturation, 0, 200);
    settings.charset = input.charset === 'custom' || Object.hasOwn(RAMPS, input.charset) ? input.charset : DEFAULTS.charset;
    if (typeof input.customChars === 'string' && input.customChars.trim()) {
      settings.customChars = Array.from(input.customChars.replace(/[\r\n\t\u0000-\u001f\u007f]/g, '')).slice(0, 96).join('') || DEFAULTS.customChars;
    }
    for (const name of ['foreground', 'background']) {
      if (typeof input[name] === 'string' && /^#[\da-f]{6}$/i.test(input[name])) settings[name] = input[name];
    }
    for (const name of ['invert', 'color', 'pixel']) settings[name] = typeof input[name] === 'boolean' ? input[name] : DEFAULTS[name];
    return settings;
  }
  function getGrid(width, height, columns, pixel = false) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Source dimensions are invalid.');
    const cols = Math.round(number(columns, 160, 40, 240));
    let rows = Math.max(1, Math.round(cols * height / width * (pixel ? 1 : 0.55)));
    const scale = Math.min(1, 320 / rows, Math.sqrt(50000 / (cols * rows)));
    return { columns: Math.max(1, Math.floor(cols * scale)), rows: Math.max(1, Math.floor(rows * scale)) };
  }
  function convert(pixels, columns, rows, input) {
    const settings = normalizeSettings(input);
    if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns <= 0 || rows <= 0 || columns * rows > 50000) throw new Error('Conversion grid is invalid.');
    if (!pixels || pixels.length < columns * rows * 4) throw new Error('Incomplete source pixels.');
    const ramp = Array.from(settings.charset === 'custom' ? settings.customChars : RAMPS[settings.charset]);
    const text = [];
    const colors = settings.color || settings.pixel ? new Uint8ClampedArray(columns * rows * 3) : null;
    const bg = [1, 3, 5].map(offset => parseInt(settings.background.slice(offset, offset + 2), 16));
    for (let y = 0; y < rows; y++) {
      let line = '';
      for (let x = 0; x < columns; x++) {
        const cell = y * columns + x;
        const offset = cell * 4;
        const alpha = pixels[offset + 3] / 255;
        const r = pixels[offset] * alpha + bg[0] * (1 - alpha);
        const g = pixels[offset + 1] * alpha + bg[1] * (1 - alpha);
        const b = pixels[offset + 2] * alpha + bg[2] * (1 - alpha);
        const luma = (r * 2126 + g * 7152 + b * 722) / 10000;
        let luminance = clamp((luma - 127.5) * settings.contrast / 100 + 127.5 + settings.brightness * 2.55, 0, 255);
        if (settings.invert) luminance = 255 - luminance;
        line += ramp[Math.min(ramp.length - 1, Math.floor(luminance / 255 * (ramp.length - 1)))];
        if (colors) {
          for (let channel = 0; channel < 3; channel++) {
            const source = channel === 0 ? r : channel === 1 ? g : b;
            let value = clamp((luma + (source - luma) * settings.saturation / 100 - 127.5) * settings.contrast / 100 + 127.5 + settings.brightness * 2.55, 0, 255);
            colors[cell * 3 + channel] = settings.invert ? 255 - value : value;
          }
        }
      }
      text.push(line);
    }
    return { lines: text, colors, columns, rows };
  }
  function formatTime(seconds) {
    const value = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }
  return { DEFAULTS, PRESETS, RAMPS, clamp, normalizeSettings, getGrid, convert, formatTime };
});
