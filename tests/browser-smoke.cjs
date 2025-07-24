/* Optional browser QA. Set PLAYWRIGHT_MODULE and BROWSER_PATH for local installations. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.STUDIO_URL || 'http://127.0.0.1:4173';
const root = path.resolve(__dirname, '..');
const errors = [];
let checks = 0;
const check = (condition, message) => { assert.ok(condition, message); checks++; console.log(`PASS ${message}`); };

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--headless=new', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
  });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['camera'] });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('#grid-info')?.textContent === '160 × 60 CHARACTERS');
    check(await page.locator('#canvas-mount canvas').count() === 1, 'the default specimen renders through p5');
    const baseline = await page.locator('#canvas-mount canvas').evaluate(canvas => canvas.toDataURL());
    await page.locator('#columns').evaluate(input => { input.value = 40; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForFunction(() => document.querySelector('#grid-info').textContent.startsWith('40 ×'));
    check(true, 'detail updates the actual conversion grid');
    await page.locator('#brightness').evaluate(input => { input.value = 90; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.click('#reset');
    await page.waitForFunction(before => document.querySelector('#canvas-mount canvas').toDataURL() === before, baseline);
    check(true, 'reset restores the original unmodified conversion');

    await page.click('[data-preset="blueprint"]');
    check(await page.inputValue('#background') === '#1936b6', 'presets update the real rendering settings');
    await page.click('#reset');
    await page.selectOption('#charset', 'custom');
    await page.fill('#customChars', '');
    await page.locator('#customChars').press('Tab');
    check(await page.locator('#grid-info').textContent() === '160 × 60 CHARACTERS', 'empty custom characters safely fall back');
    await page.click('#reset');
    const previewHeight = await page.locator('#viewport').evaluate(element => element.clientHeight);
    await page.click('#zoom');
    check(await page.locator('#viewport').evaluate(element => element.clientHeight) === previewHeight, 'actual-size zoom scrolls inside the preview without expanding the layout');
    await page.click('#zoom');
    await page.click('#compare');
    check(await page.locator('#compare').getAttribute('aria-pressed') === 'true', 'original comparison is accessible and toggles');
    await page.locator('#export-menu summary').click();
    let downloadEvent = page.waitForEvent('download');
    await page.click('#export-png');
    let download = await downloadEvent;
    let buffer = await fs.readFile(await download.path());
    check(buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'PNG export creates a valid image while comparing');
    check(buffer.equals(Buffer.from(baseline.split(',')[1], 'base64')), 'comparing the original still exports the actual ASCII artwork');
    await page.click('#compare');
    await page.locator('#export-menu summary').click();
    downloadEvent = page.waitForEvent('download');
    await page.click('#export-text');
    download = await downloadEvent;
    const text = await fs.readFile(await download.path(), 'utf8');
    const lines = text.split('\n');
    check(lines.length === 60 && lines.every(line => Array.from(line).length === 160), 'text export has the exact rendered rows and columns');

    await page.setInputFiles('#file-input', path.join(root, 'img.jpg'));
    await page.waitForFunction(() => document.querySelector('#source-name').textContent === 'img.jpg');
    check(await page.locator('#grid-info').textContent() === '160 × 50 CHARACTERS', 'an uploaded image preserves its aspect ratio');
    await page.setInputFiles('#file-input', { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
    await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('could not be decoded'));
    check(await page.locator('#source-name').textContent() === 'img.jpg', 'invalid image decoding keeps the previous usable source');
    await page.setInputFiles('#settings-input', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
    await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('not a valid JSON'));
    check(true, 'malformed settings produce a readable recovery message');
    await page.setInputFiles('#settings-input', { name: 'settings.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 1, settings: { columns: 80, brightness: 0, contrast: 100, invert: true } })) });
    await page.waitForFunction(() => document.querySelector('#columns').value === '80');
    check(await page.isChecked('#invert'), 'valid settings import updates controls and conversion');
    await page.click('#reset');

    await page.click('#fullscreen');
    await page.keyboard.press('Tab');
    check(await page.locator('#fullscreen').evaluate(button => button === document.activeElement), 'expanded preview keeps keyboard focus inside');
    await page.keyboard.press('Escape');
    check(!await page.locator('#viewport').evaluate(element => element.classList.contains('focus-view')), 'Escape closes the expanded preview');
    await page.keyboard.press('o');
    check(await page.locator('#compare').getAttribute('aria-pressed') === 'true', 'the original shortcut works after using a control');
    await page.keyboard.press('o');
    await page.click('#about-open');
    check(await page.locator('#about').evaluate(dialog => dialog.open), 'the experiment note opens as a native modal');
    await page.keyboard.press('Escape');

    await page.click('#tab-video');
    check(await page.isDisabled('#export-png'), 'empty media modes disable export');
    await page.setInputFiles('#file-input', path.join(root, 'readme files/Screen-Recording.mp4'));
    await page.waitForFunction(() => document.querySelector('#media-bin video')?.readyState >= 2);
    await page.waitForFunction(() => !document.querySelector('#media-controls').hidden);
    await page.locator('#media-bin video').evaluate(video => video.pause());
    check(await page.locator('#play').getAttribute('aria-label') === 'Play video', 'pause updates the transport control');
    await page.locator('#seek').evaluate(input => { input.value = '500'; input.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.waitForFunction(() => { const video = document.querySelector('#media-bin video'); return Math.abs(video.currentTime / video.duration - 0.5) < 0.03; });
    check(true, 'the video timeline seeks to the chosen frame');
    await page.check('#sound');
    check(await page.locator('#media-bin video').evaluate(video => !video.muted), 'the sound control unmutes source audio');
    await page.uncheck('#sound');
    await page.click('#play');
    await page.waitForFunction(() => !document.querySelector('#media-bin video').paused);
    await page.locator('#export-menu summary').click();
    await page.click('#record');
    await page.waitForFunction(() => document.querySelector('#preview-label').textContent === 'RECORDING');
    await page.waitForFunction(() => document.querySelector('#media-bin video').currentTime > document.querySelector('#media-bin video').duration * 0.5 + 0.5);
    await page.locator('#export-menu summary').click();
    downloadEvent = page.waitForEvent('download');
    await page.click('#record');
    download = await downloadEvent;
    buffer = await fs.readFile(await download.path());
    check(buffer.length > 1000 && buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])), 'video recording produces a real WebM download');
    await page.click('#tab-camera');
    check(await page.locator('#preview-label').textContent() === 'CAMERA OFF', 'camera stays off on entering the camera tab');
    await page.click('#empty-upload');
    await page.waitForFunction(() => document.querySelector('#media-bin video')?.srcObject?.getVideoTracks().some(track => track.readyState === 'live'));
    await page.evaluate(() => { window.testCameraTrack = document.querySelector('#media-bin video').srcObject.getVideoTracks()[0]; });
    await page.click('#camera-stop');
    check(await page.evaluate(() => window.testCameraTrack.readyState === 'ended'), 'stopping the camera releases its hardware track');
    await page.click('#empty-upload');
    await page.waitForFunction(() => document.querySelector('#media-bin video')?.srcObject?.getVideoTracks().some(track => track.readyState === 'live'));
    await page.evaluate(() => { window.testCameraTrack = document.querySelector('#media-bin video').srcObject.getVideoTracks()[0]; });
    await page.click('#tab-image');
    check(await page.evaluate(() => window.testCameraTrack.readyState === 'ended'), 'changing modes also releases the camera');
    await page.click('#tab-camera');
    await page.evaluate(() => {
      window.testCameraOpen = window.AsciiCamera.open;
      window.AsciiCamera.open = async () => { throw new Error('Camera permission was declined. Allow access in your browser and try again.'); };
    });
    await page.click('#empty-upload');
    await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('permission was declined'));
    check(await page.locator('#upload-label').textContent() === 'Try your camera again', 'denied camera permission leaves a working retry control');
    await page.evaluate(() => { window.AsciiCamera.open = () => new Promise(resolve => { window.testResolveCamera = resolve; }); });
    await page.click('#empty-upload');
    await page.click('#tab-image');
    await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      window.testLateStream = canvas.captureStream(1);
      window.testResolveCamera(window.testLateStream);
    });
    await page.waitForFunction(() => window.testLateStream.getTracks().every(track => track.readyState === 'ended'));
    check(true, 'a late camera permission response is canceled after changing modes');
    await page.evaluate(() => { window.AsciiCamera.open = window.testCameraOpen; });

    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `layout fits ${width}px without horizontal overflow`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const [route, mode, toggle] of [
      ['image_to_ascii.html', 'image'], ['video_to_ascii.html', 'video'], ['camera_to_ascii.html', 'camera'],
      ['original_image_to_ascii.html', 'image', 'color'], ['original_video_to_ascii.html', 'video', 'color'], ['square_pixeled_video.html', 'video', 'pixel']
    ]) {
      await page.goto(`${base}/${route}`);
      await page.waitForSelector('#canvas-mount canvas');
      check(await page.locator(`#tab-${mode}`).getAttribute('aria-selected') === 'true' && (!toggle || await page.isChecked(`#${toggle}`)), `${route} preserves its mode and behavior`);
    }
    await page.goto(`${base}/vector_path.html`);
    await page.waitForSelector('#flow-canvas canvas');
    await page.click('#flow-pause');
    check(await page.locator('#flow-pause').textContent() === 'Resume', 'the flow field can pause');
    await page.click('#flow-reset');
    downloadEvent = page.waitForEvent('download');
    await page.click('#flow-export');
    download = await downloadEvent;
    check((await fs.stat(await download.path())).size > 1000, 'the flow field can export a frame');
    await page.goto(`file://${path.join(root, 'index.html')}`);
    await page.waitForFunction(() => document.querySelector('#grid-info')?.textContent === '160 × 60 CHARACTERS');
    check(true, 'the studio also runs directly from the filesystem without a server');
    check(errors.length === 0, `no uncaught browser errors: ${errors.join('; ')}`);
    console.log(`\n${checks} browser checks passed.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
