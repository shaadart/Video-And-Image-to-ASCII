# Death of Pixels

ASCII from images, video, and your camera.

Choose a file. Change the characters, light, and color. Export the result.
Your files stay in your browser.

## Run

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Open [localhost:4173](http://localhost:4173). No install. No build step.
You can also open `index.html` directly for images and video. Camera access requires localhost or HTTPS.

## Use

- Drop an image or video, start the camera, or try a sample.
- Adjust detail, contrast, brightness, and colors. Choose a preset or write your own character set.
- Compare the original. Switch to source colors or pixel blocks under **Advanced**.
- Export PNG or text, copy ASCII, or record a silent WebM. Save settings to reuse them.

Images: up to 40 MB. Video: up to 500 MB. Recordings: up to five minutes.
GIFs render as still images. Video decoding and recording depend on browser support.

The [flow field](vector_path.html) is a separate particle sketch. Pause it, change its color, or save a frame.

## Keys

| Key | Action |
| --- | --- |
| `O` | Toggle the original |
| `F` | Expand the preview |
| `Esc` | Close the expanded preview |
| `Space` | Play or pause video |

## Code

HTML, CSS, JavaScript, and p5.js 1.6.0. Dependencies are included locally.

[studio.js](studio.js) handles the interface and media.
[ascii-engine.js](ascii-engine.js) converts pixels to characters without changing the source.
Still images redraw on adjustment; moving sources render at up to 24 fps.

Run the conversion tests with Node:

```sh
node tests/ascii-engine.test.cjs
```

The optional [browser checks](tests/browser-smoke.cjs) use Playwright. With the local server running:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright-core \
BROWSER_PATH=/path/to/chromium \
node tests/browser-smoke.cjs
```

## License

[CC BY-NC 4.0](LICENSE.md). Credit the project. Noncommercial use.
p5.js and Geist retain their licenses in [vendor](vendor/) and [assets/fonts](assets/fonts/).
