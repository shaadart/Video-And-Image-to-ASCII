(function () {
  'use strict';
  const E = window.AsciiEngine;
  const icon = (name, size = 18) => {
    const paths = {
      image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
      video: '<rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
      camera: '<path d="m8 5 1-2h6l1 2h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><circle cx="12" cy="12" r="4"/>',
      arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
      upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/>',
      reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
      expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
      compare: '<path d="M12 3v18M8 5H4v14h4m8-14h4v14h-4"/>',
      close: '<path d="m6 6 12 12M6 18 18 6"/>',
      download: '<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
      play: '<path d="m8 5 11 7-11 7Z"/>',
      pause: '<path d="M8 5v14M16 5v14"/>',
      rewind: '<path d="M5 5v14m14-14L8 12l11 7Z"/>',
      eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
      grid: '<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/>',
      chevron: '<path d="m6 9 6 6 6-6"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
  };
  const range = (name, title, min, max, value, unit = '') => `<div class="range-control"><label for="${name}">${title}<output id="${name}-value" for="${name}">${value}${unit}</output></label><input id="${name}" data-setting="${name}" type="range" min="${min}" max="${max}" value="${value}" aria-label="${title}"></div>`;

  document.getElementById('app').innerHTML = `
    <header class="site-header">
      <a class="brand" href="index.html" aria-label="Death of Pixels home"><img class="brand-symbol" src="assets/logo.svg" width="80" height="88" alt="" aria-hidden="true"><span>DEATH OF PIXELS</span></a>
      <span class="header-note">ASCII CONVERTER</span>
      <button class="text-button about-button" id="about-open">About ${icon('arrow', 15)}</button>
    </header>
    <main>
      <section class="introduction" aria-labelledby="page-title">
        <div><h1 id="page-title">ASCII studio</h1></div>
        <p>Convert an image, video, or camera feed to ASCII.</p>
      </section>
      <section class="studio" aria-label="ASCII art studio">
        <div class="studio-topbar">
          <div class="mode-tabs" role="tablist" aria-label="Source mode">${['image', 'video', 'camera'].map(mode => `<button id="tab-${mode}" class="mode-tab" role="tab" aria-controls="workspace" aria-selected="${mode === 'image'}" data-mode="${mode}">${icon(mode, 16)} ${mode[0].toUpperCase() + mode.slice(1)}</button>`).join('')}</div>
          <div class="topbar-right"><span class="local-badge"><span></span> ON YOUR DEVICE</span><button class="icon-button mobile-upload" id="mobile-upload" aria-label="Choose a source file">${icon('upload', 17)}</button><details class="export-menu" id="export-menu"><summary class="button primary">${icon('download', 15)} Export ${icon('chevron', 13)}</summary><div class="export-options"><button id="export-png">Download PNG <span>.png</span></button><button id="export-text">Download text <span>.txt</span></button><button id="copy-text">Copy ASCII <span>↗</span></button><button id="record" hidden>Record video <span>.webm</span></button><div class="menu-divider"></div><button id="save-settings">Save settings <span>.json</span></button><button id="load-settings">Load settings <span>↑</span></button></div></details></div>
        </div>
        <div class="workspace" id="workspace" role="tabpanel" aria-labelledby="tab-image">
          <aside class="controls" aria-label="Conversion controls">
            <section class="control-section source-section"><h2>Source</h2>
              <button class="upload-zone" id="upload"><span class="upload-icon">${icon('upload', 20)}</span><strong id="upload-label">Drop an image here</strong><span id="upload-hint">or choose a file</span><span class="file-formats" id="file-formats">JPG, PNG, WEBP, GIF, SVG</span></button>
              <div class="sample-picker" id="sample-picker"><span>Try a sample</span><div><button data-specimen="eye" class="specimen active" aria-label="Use eye sample" aria-pressed="true">${icon('eye', 16)}</button><button data-specimen="orb" class="specimen" aria-label="Use orb sample" aria-pressed="false">◉</button><button data-specimen="waves" class="specimen" aria-label="Use wave sample" aria-pressed="false">≋</button></div></div>
              <button class="button camera-stop" id="camera-stop" hidden>Stop camera</button>
            </section>
            <section class="control-section"><h2>Characters</h2><div class="field"><label for="charset">Character set</label><div class="select-wrap"><select id="charset" data-setting="charset"><option value="classic">Classic ASCII</option><option value="detailed">Detailed</option><option value="minimal">Minimal</option><option value="binary">Binary</option><option value="blocks">Blocks</option><option value="custom">Custom</option></select>${icon('chevron', 13)}</div></div>
              <div class="character-preview" id="character-preview" aria-hidden="true">. : - = + * # % @</div><div class="field" id="custom-field" hidden><label for="customChars">Characters, dark → light</label><input type="text" id="customChars" data-setting="customChars" maxlength="96" spellcheck="false" autocomplete="off" value=" .:-=+*#%@"></div>
              ${range('columns', 'Detail', 40, 240, 160)}<div class="range-endpoints"><span>LESS</span><span>MORE</span></div>
            </section>
            <section class="control-section"><h2>Adjustments</h2>${range('contrast', 'Contrast', 0, 250, 120, '%')}${range('brightness', 'Brightness', -100, 100, 0)}
              <div class="color-controls"><label class="color-field" for="foreground"><input type="color" id="foreground" data-setting="foreground" value="#d6d2c4"><span>Text</span><span id="foreground-code">D6D2C4</span></label><label class="color-field" for="background"><input type="color" id="background" data-setting="background" value="#101110"><span>Background</span><span id="background-code">101110</span></label></div>
              <label class="switch-row" for="invert"><span>Invert light & dark</span><input type="checkbox" role="switch" id="invert" data-setting="invert"><span class="switch" aria-hidden="true"></span></label>
              <details class="advanced"><summary>Advanced ${icon('chevron', 12)}</summary><label class="switch-row" for="color"><span>Use source colors</span><input type="checkbox" role="switch" id="color" data-setting="color"><span class="switch" aria-hidden="true"></span></label><div id="saturation-field" hidden>${range('saturation', 'Saturation', 0, 200, 100, '%')}</div><label class="switch-row" for="pixel"><span>Pixel blocks</span><input type="checkbox" role="switch" id="pixel" data-setting="pixel"><span class="switch" aria-hidden="true"></span></label><div class="settings-actions"><button id="settings-import">Load settings</button><button id="settings-export">Save settings</button></div></details>
            </section>
            <div class="controls-footer"><button class="text-button" id="reset">${icon('reset', 13)} Reset adjustments</button><span id="preset-label">AFTERIMAGE</span></div>
          </aside>
          <div class="preview-column">
            <div class="preview-topline"><div><span class="live-dot" id="status-dot"></span><span id="preview-label">LIVE PREVIEW</span><button class="record-stop" id="record-stop" hidden>Stop & save</button></div><span id="specimen-label">EYE SAMPLE</span></div>
            <div class="viewport" id="viewport"><div class="canvas-mount" id="canvas-mount"></div><div class="corner top-left"></div><div class="corner top-right"></div><div class="corner bottom-left"></div><div class="corner bottom-right"></div><span class="art-coordinate coordinate-top" aria-hidden="true">FIG. 001</span><span class="art-coordinate coordinate-bottom" aria-hidden="true">ASCII PREVIEW</span><div class="empty-state" id="empty-state" hidden><span id="empty-title">No video loaded.</span><p id="empty-description">Choose a video to preview it as ASCII.</p><button class="button primary" id="empty-upload">Choose a video ${icon('arrow', 14)}</button></div><div class="drop-overlay" id="drop-overlay" hidden>Drop a file<span>Image or video.</span></div></div>
            <div class="media-controls" id="media-controls" hidden><button class="icon-button" id="rewind" aria-label="Back to first frame">${icon('rewind', 16)}</button><button class="icon-button" id="play" aria-label="Play video">${icon('play', 16)}</button><span id="current-time">0:00</span><input type="range" id="seek" min="0" max="1000" value="0" step="1" aria-label="Video position"><span id="duration">0:00</span><label class="sound-toggle"><input type="checkbox" id="sound"> Sound</label></div>
            <div class="preview-toolbar"><div class="file-info">${icon('image', 14)}<span id="source-name">eye / sample</span></div><div class="preview-actions"><button class="text-button" id="compare" aria-pressed="false" title="Toggle original (O)">${icon('compare', 15)} <span>Original</span></button><span class="toolbar-divider"></span><button class="text-button zoom-button" id="zoom" aria-pressed="false">FIT</button><button class="icon-button" id="fullscreen" aria-label="Expand preview" title="Expand preview (F)">${icon('expand', 16)}</button></div></div>
            <div class="preview-metadata"><span id="grid-info">160 × 60 CHARACTERS</span><span id="render-info">NO SOURCE</span><span>LOCAL PROCESSING</span></div>
            <div class="preset-section"><div class="preset-heading"><h2>Presets</h2><span>Five presets.</span></div><div class="presets">${Object.entries(E.PRESETS).map(([key, preset], index) => `<button class="preset ${index === 0 ? 'active' : ''}" data-preset="${key}" aria-pressed="${index === 0}"><span class="preset-art" style="--preset-ink:${preset.foreground};--preset-paper:${preset.background}" aria-hidden="true"><span>${[' .:+*#%@@%#*+:.', ' 01/|MWWM|/10 ', '   .::+##+::. ', ' .:-+*##*+-:. ', ' .;i!lIWWIl!i;.'][index]}<br>${['.:-=+*#%%#*+=-:.', '/|tfjMWWWWMjft|/', ' .:+#      #+:. ', ':-=+#%@@%#+=-:', ';i!lI#WWWW#Il!i;'][index]}<br>${[' .:+*#%@@%#*+:.', ' 01/|MWWM|/10 ', '   .::+##+::. ', ' .:-+*##*+-:. ', ' .;i!lIWWIl!i;.'][index]}</span></span><span class="preset-name">${key[0].toUpperCase() + key.slice(1)}<span class="preset-indicator">${index === 0 ? '↗' : '+'}</span></span></button>`).join('')}</div></div>
          </div>
        </div>
      </section>
      <div class="under-studio"><span><span class="privacy-mark">↳</span> Files stay in this browser.</span><span class="keyboard-hint"><kbd>O</kbd> original <span>·</span> <kbd>F</kbd> focus <span>·</span> <kbd>Space</kbd> play / pause</span></div>
      <footer class="site-footer"><span>IMAGE · VIDEO · CAMERA</span><div><a href="vector_path.html">Flow field ${icon('arrow', 12)}</a><span>DEATH OF PIXELS © ${new Date().getFullYear()}</span></div></footer>
    </main>
    <input type="file" id="file-input" accept="image/*" hidden><input type="file" id="settings-input" accept="application/json,.json" hidden><div id="media-bin" hidden></div><div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
    <dialog class="about-dialog" id="about"><button class="icon-button dialog-close" id="about-close" aria-label="Close note">${icon('close', 20)}</button><span class="eyebrow">ABOUT</span><h2>Death of Pixels</h2><p>Convert images, videos, and camera frames to ASCII.</p><ol><li><span>01</span> Choose a file or start the camera.</li><li><span>02</span> Adjust characters, detail, and colors.</li><li><span>03</span> Export a PNG, text, or silent WebM.</li></ol><p class="dialog-note">Files are processed in this browser.</p><a href="LICENSE.md">License: CC BY-NC 4.0 ${icon('arrow', 12)}</a></dialog>`;

  const $ = id => document.getElementById(id);
  const state = {
    mode: 'image', settings: { ...E.DEFAULTS }, preset: 'afterimage', source: null,
    sourceURL: null, stream: null, frame: null, original: false, zoom: false,
    loadId: 0, pending: false, cameraPending: false, recorder: null, recordingStream: null,
    recordingTimer: null, recording: false, sourceLabel: 'eye', disposed: false, renderFailed: false
  };
  const sampleCache = new Map();
  const sampleCanvas = document.createElement('canvas');
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  const rendered = document.createElement('canvas');
  const renderContext = rendered.getContext('2d');
  let sketch;
  let toastTimer;
  let dragDepth = 0;
  let pendingRender = false;
  let lastSourceTime = -1;

  function toast(message, error = false) {
    $('toast').textContent = message;
    $('toast').classList.toggle('error', error);
    $('toast').hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, error ? 7500 : 3500);
  }
  function sourceSize(source = state.source) {
    return { width: source?.videoWidth || source?.naturalWidth || source?.width || 0, height: source?.videoHeight || source?.naturalHeight || source?.height || 0 };
  }
  function isVideo() { return state.source instanceof HTMLVideoElement; }
  function ready() { return !!state.source && !state.pending && !state.renderFailed && (!isVideo() || state.source.readyState >= 2); }
  function requestRender() {
    pendingRender = true;
    if (sketch && !sketch.isLooping()) sketch.redraw();
  }
  function updatePlayback() {
    const playing = isVideo() && !state.source.paused;
    $('play').innerHTML = icon(playing ? 'pause' : 'play', 16);
    $('play').setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    if (sketch) {
      if (playing && !document.hidden) sketch.loop();
      else sketch.noLoop();
    }
    updateExport();
    requestRender();
  }
  function updateExport() {
    for (const id of ['export-png', 'export-text', 'copy-text', 'compare', 'zoom']) $(id).disabled = !ready();
    $('export-text').disabled = !ready() || state.settings.pixel;
    $('copy-text').disabled = !ready() || state.settings.pixel;
    $('record').hidden = !isVideo();
    $('record').disabled = !ready() || state.pending || !window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream;
    $('record').innerHTML = `${state.recording ? 'Stop & save recording' : 'Record video'} <span>.webm</span>`;
    $('status-dot').classList.toggle('recording', state.recording);
    $('record-stop').hidden = !state.recording;
    $('preview-label').textContent = state.recording ? 'RECORDING' : state.pending ? 'LOADING SOURCE' : !state.source ? state.mode === 'camera' ? 'CAMERA OFF' : 'AWAITING SOURCE' : state.original ? 'ORIGINAL SOURCE' : 'LIVE PREVIEW';
  }
  function syncSettings() {
    for (const input of document.querySelectorAll('[data-setting]')) {
      const value = state.settings[input.dataset.setting];
      if (input.type === 'checkbox') input.checked = value;
      else if (input.type !== 'text' || input !== document.activeElement) input.value = value;
      if (input.type === 'range') {
        const name = input.dataset.setting;
        $(name + '-value').textContent = `${name === 'brightness' && value > 0 ? '+' : ''}${value}${['contrast', 'saturation'].includes(name) ? '%' : ''}`;
        input.style.setProperty('--fill', `${(value - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
      }
    }
    $('custom-field').hidden = state.settings.charset !== 'custom';
    $('character-preview').hidden = state.settings.charset === 'custom';
    $('character-preview').textContent = (E.RAMPS[state.settings.charset] || state.settings.customChars).trim().split('').join(' ');
    $('saturation-field').hidden = !state.settings.color && !state.settings.pixel;
    $('foreground').disabled = state.settings.color || state.settings.pixel;
    $('foreground-code').textContent = state.settings.foreground.slice(1).toUpperCase();
    $('background-code').textContent = state.settings.background.slice(1).toUpperCase();
    $('preset-label').textContent = state.preset ? state.preset.toUpperCase() : 'CUSTOM';
    for (const button of document.querySelectorAll('[data-preset]')) {
      const active = button.dataset.preset === state.preset;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active);
      button.querySelector('.preset-indicator').textContent = active ? '↗' : '+';
    }
    updateExport();
    requestRender();
  }
  function stopRecording() {
    if (state.recorder && state.recorder.state !== 'inactive') state.recorder.stop();
    state.recording = false;
    clearTimeout(state.recordingTimer);
    state.recordingStream?.getTracks().forEach(track => track.stop());
    state.recordingStream = null;
    updateExport();
  }
  function releaseSource() {
    stopRecording();
    if (isVideo()) {
      state.source.pause();
      state.source.srcObject = null;
      state.source.removeAttribute('src');
      state.source.load();
      state.source.remove();
    }
    window.AsciiCamera.stop(state.stream);
    if (state.sourceURL) URL.revokeObjectURL(state.sourceURL);
    state.sourceURL = null;
    state.stream = null;
    state.source = null;
    state.frame = null;
    state.renderFailed = false;
    lastSourceTime = -1;
  }
  function setOriginal(value) {
    state.original = value;
    $('compare').setAttribute('aria-pressed', value);
    $('compare').classList.toggle('selected', value);
    updateExport();
    requestRender();
  }
  function setSource(source, label, url = null, stream = null) {
    releaseSource();
    state.source = source;
    state.sourceURL = url;
    state.stream = stream;
    state.pending = false;
    state.sourceLabel = label;
    $('source-name').textContent = label;
    $('empty-state').hidden = true;
    $('viewport').classList.remove('awaiting-source');
    $('media-controls').hidden = !(source instanceof HTMLVideoElement) || !!stream;
    $('camera-stop').hidden = !stream;
    $('upload-label').textContent = stream ? 'Camera is live' : state.mode === 'video' ? 'Replace your video' : 'Drop another image';
    $('upload-hint').textContent = stream ? 'Stop the feed below' : 'or choose a file';
    setOriginal(false);
    if (source instanceof HTMLVideoElement) {
      $('media-bin').append(source);
      source.addEventListener('play', () => { if (state.source === source) updatePlayback(); });
      source.addEventListener('pause', () => { if (state.source === source) updatePlayback(); });
      source.addEventListener('seeked', () => { if (state.source === source) { updateExport(); requestRender(); } });
      source.addEventListener('loadeddata', () => { if (state.source === source) updateExport(); });
      source.addEventListener('ended', () => { if (state.source === source) updatePlayback(); });
      source.addEventListener('error', () => { if (state.source === source) toast('The video could not be decoded. Try an MP4 or WebM file.', true); });
      if (stream) stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (state.source === source) { setMode('camera', false); toast('The camera has disconnected.', true); }
      }));
      updatePlayback();
    } else {
      sketch?.noLoop();
      requestRender();
    }
    updateExport();
  }
  function useSpecimen(kind, changeMode = true) {
    if (changeMode && state.mode !== 'image') setMode('image', false);
    state.loadId++;
    if (!sampleCache.has(kind)) sampleCache.set(kind, window.AsciiSpecimens.create(kind));
    const names = { eye: 'Eye', orb: 'Orb', waves: 'Waves' };
    setSource(sampleCache.get(kind), `${kind} / sample`);
    $('upload-label').textContent = 'Drop an image here';
    $('specimen-label').textContent = `${names[kind].toUpperCase()} SAMPLE`;
    for (const button of document.querySelectorAll('[data-specimen]')) {
      const active = button.dataset.specimen === kind;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active);
    }
  }
  function setMode(mode, updateURL = true) {
    state.loadId++;
    state.pending = false;
    state.cameraPending = false;
    releaseSource();
    state.mode = mode;
    $('workspace').setAttribute('aria-labelledby', 'tab-' + mode);
    for (const button of document.querySelectorAll('.mode-tab[data-mode]')) {
      const active = button.dataset.mode === mode;
      button.setAttribute('aria-selected', active);
      button.tabIndex = active ? 0 : -1;
    }
    $('file-input').accept = mode === 'video' ? 'video/*' : 'image/*';
    $('mobile-upload').setAttribute('aria-label', mode === 'camera' ? 'Start camera' : `Choose ${mode === 'image' ? 'an image' : 'a video'} file`);
    $('sample-picker').hidden = mode !== 'image';
    $('camera-stop').hidden = true;
    $('media-controls').hidden = true;
    $('upload-label').textContent = mode === 'camera' ? 'Start camera' : `Drop ${mode === 'image' ? 'an image' : 'a video'} here`;
    $('upload-hint').textContent = mode === 'camera' ? 'Requires camera permission' : 'or choose a file';
    $('file-formats').textContent = mode === 'camera' ? 'LIVE FEED · NO AUDIO' : mode === 'video' ? 'MP4, WEBM, MOV · UP TO 500 MB' : 'JPG, PNG, WEBP, GIF, SVG';
    $('empty-state').hidden = mode === 'image';
    $('viewport').classList.toggle('awaiting-source', mode !== 'image');
    $('source-name').textContent = mode === 'camera' ? 'camera is off' : 'no video loaded';
    $('specimen-label').textContent = mode === 'camera' ? 'CAMERA' : 'VIDEO';
    $('empty-title').textContent = mode === 'camera' ? 'Camera is off.' : 'No video loaded.';
    $('empty-description').textContent = mode === 'camera' ? 'Start the camera to preview the feed as ASCII.' : 'Choose a video to preview it as ASCII.';
    $('empty-upload').innerHTML = `${mode === 'camera' ? 'Start camera' : 'Choose a video'} ${icon('arrow', 14)}`;
    $('preview-label').textContent = mode === 'camera' ? 'CAMERA OFF' : 'AWAITING SOURCE';
    setOriginal(false);
    if (mode === 'image') useSpecimen('eye', false);
    else { sketch?.noLoop(); requestRender(); }
    if (updateURL) {
      try { const url = new URL(location.href); url.searchParams.set('mode', mode); history.replaceState(null, '', url); } catch (_) { /* File URLs can disallow history updates. */ }
    }
    updateExport();
  }

  async function loadFile(file) {
    if (!file) return;
    const kind = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : null;
    if (!kind) return toast('Choose an image or video file. Settings can be loaded from the Export menu.', true);
    if (file.size > (kind === 'image' ? 40 : 500) * 1024 * 1024) return toast(`${kind === 'image' ? 'Images must be under 40 MB' : 'Videos must be under 500 MB'}. Try a smaller file.`, true);
    if (state.mode !== kind) setMode(kind);
    const id = ++state.loadId;
    state.pending = true;
    updateExport();
    const url = URL.createObjectURL(file);
    let source;
    try {
      source = kind === 'image' ? new Image() : document.createElement('video');
      if (kind === 'video') { source.muted = !$('sound').checked; source.playsInline = true; source.loop = true; source.preload = 'auto'; }
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { cleanup(); reject(new Error('This file took too long to open. Try a smaller file or another format.')); }, 20000);
        const cleanup = () => { clearTimeout(timer); source.onload = null; source.onloadeddata = null; source.onerror = null; };
        const complete = () => { cleanup(); resolve(); };
        source.onerror = () => { cleanup(); reject(new Error(`This ${kind} could not be decoded. Try ${kind === 'image' ? 'a JPG, PNG, or WebP' : 'an MP4 or WebM'} file.`)); };
        if (kind === 'image') source.onload = complete;
        else source.onloadeddata = complete;
        source.src = url;
      });
      if (id !== state.loadId || state.disposed) { URL.revokeObjectURL(url); if (kind === 'video') { source.removeAttribute('src'); source.load(); } return; }
      // Some locally recorded WebM files omit duration metadata. Seeking to the
      // end lets the browser discover it before exposing the timeline.
      if (kind === 'video' && !Number.isFinite(source.duration)) {
        await new Promise(resolve => {
          const finish = () => { clearTimeout(timer); source.removeEventListener('seeked', finish); resolve(); };
          const timer = setTimeout(finish, 2500);
          source.addEventListener('seeked', finish, { once: true });
          try { source.currentTime = 1e10; } catch (_) { finish(); }
        });
        source.currentTime = 0;
      }
      if (id !== state.loadId || state.disposed) { URL.revokeObjectURL(url); if (kind === 'video') { source.removeAttribute('src'); source.load(); } return; }
      const size = sourceSize(source);
      if (!size.width || !size.height) throw new Error('The file has no readable image dimensions.');
      setSource(source, file.name, url);
      $('seek').disabled = kind === 'video' && !Number.isFinite(source.duration);
      $('specimen-label').textContent = `${size.width} × ${size.height} / YOUR ${kind.toUpperCase()}`;
      document.querySelectorAll('[data-specimen]').forEach(button => { button.classList.remove('active'); button.setAttribute('aria-pressed', 'false'); });
      if (kind === 'video') {
        try { await source.play(); } catch (_) { toast('Video loaded. Press play.'); }
      }
      toast(kind === 'image' ? 'Image loaded.' : 'Video loaded.');
    } catch (error) {
      URL.revokeObjectURL(url);
      if (source instanceof HTMLVideoElement) { source.removeAttribute('src'); source.load(); }
      if (id !== state.loadId) return;
      state.pending = false;
      updateExport();
      requestRender();
      toast(error.message, true);
    }
  }
  async function startCamera() {
    if (state.cameraPending || state.stream) return;
    state.cameraPending = true;
    const id = ++state.loadId;
    $('upload-label').textContent = 'Waiting for permission…';
    let stream;
    let video;
    try {
      stream = await window.AsciiCamera.open();
      if (id !== state.loadId || state.disposed) { window.AsciiCamera.stop(stream); return; }
      video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { cleanup(); reject(new Error('The camera did not become ready. Please try again.')); }, 15000);
        const cleanup = () => { clearTimeout(timer); video.onloadeddata = null; video.onerror = null; };
        video.onloadeddata = () => { cleanup(); resolve(); };
        video.onerror = () => { cleanup(); reject(new Error('The camera feed could not be opened.')); };
        video.play().catch(error => { cleanup(); reject(error); });
      });
      if (id !== state.loadId || state.disposed) { window.AsciiCamera.stop(stream); video.srcObject = null; return; }
      setSource(video, 'live camera / on your device', null, stream);
      $('specimen-label').textContent = 'LIVE CAMERA';
      toast('Camera started.');
    } catch (error) {
      window.AsciiCamera.stop(stream);
      if (video) video.srcObject = null;
      if (id === state.loadId) { $('upload-label').textContent = 'Try your camera again'; toast(error.message, true); }
    } finally { if (id === state.loadId) state.cameraPending = false; }
  }
  function chooseSource() {
    $('export-menu').open = false;
    if (state.mode === 'camera') startCamera();
    else $('file-input').click();
  }

  function paintFrame(frame, settings) {
    const size = sourceSize();
    const scale = Math.min(1, 1600 / Math.max(size.width, size.height));
    const width = Math.max(1, Math.round(size.width * scale));
    const height = Math.max(1, Math.round(size.height * scale));
    if (rendered.width !== width || rendered.height !== height) { rendered.width = width; rendered.height = height; }
    const cw = width / frame.columns;
    const ch = height / frame.rows;
    renderContext.fillStyle = settings.background;
    renderContext.fillRect(0, 0, width, height);
    renderContext.font = `${cw / 0.602}px "Courier New", monospace`;
    renderContext.textBaseline = 'middle';
    renderContext.textAlign = 'left';
    renderContext.fillStyle = settings.foreground;
    for (let y = 0; y < frame.rows; y++) {
      if (!settings.color && !settings.pixel && !(settings.charset === 'custom' && /[^\x20-\x7e]/.test(settings.customChars))) {
        renderContext.fillText(frame.lines[y], 0, (y + 0.5) * ch);
      } else {
        const chars = Array.from(frame.lines[y]);
        for (let x = 0; x < frame.columns; x++) {
          const offset = (y * frame.columns + x) * 3;
          renderContext.fillStyle = frame.colors ? `rgb(${frame.colors[offset]},${frame.colors[offset + 1]},${frame.colors[offset + 2]})` : settings.foreground;
          if (settings.pixel) renderContext.fillRect(x * cw, y * ch, Math.ceil(cw), Math.ceil(ch));
          else if (chars[x] !== ' ') renderContext.fillText(chars[x], x * cw, (y + 0.5) * ch, cw);
        }
      }
    }
  }
  function render() {
    if (!sketch) return;
    if (!state.source) {
      sketch.background(state.settings.background);
      $('grid-info').textContent = 'NO SOURCE CONNECTED';
      $('render-info').textContent = 'NO SOURCE';
      return;
    }
    if (isVideo() && state.source.readyState < 2) return;
    if (isVideo() && !pendingRender && lastSourceTime === state.source.currentTime) return;
    pendingRender = false;
    lastSourceTime = isVideo() ? state.source.currentTime : -1;
    const start = performance.now();
    try {
      const size = sourceSize();
      const grid = E.getGrid(size.width, size.height, state.settings.columns, state.settings.pixel);
      if (sampleCanvas.width !== grid.columns || sampleCanvas.height !== grid.rows) { sampleCanvas.width = grid.columns; sampleCanvas.height = grid.rows; }
      sampleContext.clearRect(0, 0, grid.columns, grid.rows);
      sampleContext.drawImage(state.source, 0, 0, grid.columns, grid.rows);
      state.frame = E.convert(sampleContext.getImageData(0, 0, grid.columns, grid.rows).data, grid.columns, grid.rows, state.settings);
      paintFrame(state.frame, state.settings);
      if (sketch.width !== rendered.width || sketch.height !== rendered.height) sketch.resizeCanvas(rendered.width, rendered.height, true);
      const context = sketch.drawingContext;
      context.clearRect(0, 0, sketch.width, sketch.height);
      if (state.original) context.drawImage(state.source, 0, 0, sketch.width, sketch.height);
      else context.drawImage(rendered, 0, 0);
      $('grid-info').textContent = `${grid.columns} × ${grid.rows} ${state.settings.pixel ? 'BLOCKS' : 'CHARACTERS'}`;
      $('render-info').textContent = `${Math.round(performance.now() - start)} MS / ${isVideo() && !state.source.paused ? 'LIVE' : 'RENDER'}`;
      if (isVideo() && !state.stream) {
        const duration = state.source.duration;
        $('current-time').textContent = E.formatTime(state.source.currentTime);
        $('duration').textContent = E.formatTime(duration);
        if (document.activeElement !== $('seek')) $('seek').value = Number.isFinite(duration) && duration > 0 ? state.source.currentTime / duration * 1000 : 0;
      }
      if (state.renderFailed) { state.renderFailed = false; updateExport(); }
    } catch (error) {
      sketch.noLoop();
      state.renderFailed = true;
      updateExport();
      toast('This source could not be rendered. Try another file or a lower detail setting.', true);
      console.error('ASCII conversion failed:', error);
    }
  }
  function download(blob, extension, sourceLabel = state.sourceLabel) {
    if (!blob) return toast('The export could not be created. Please try again.', true);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = sourceLabel.split('/')[0].trim().replace(/\.[^.]+$/, '').replace(/[^a-z\d_-]+/gi, '-').slice(0, 80) || 'death-of-pixels';
    link.href = url;
    link.download = `${name}-ascii.${extension}`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('export-menu').open = false;
  }
  function exportPNG() {
    if (!ready()) return;
    pendingRender = true;
    render();
    if (!ready()) return;
    rendered.toBlob(blob => download(blob, 'png'), 'image/png');
    toast('PNG exported.');
  }
  function exportText() {
    if (!ready() || state.settings.pixel) return;
    render();
    if (!ready() || !state.frame) return;
    download(new Blob([state.frame.lines.join('\n')], { type: 'text/plain;charset=utf-8' }), 'txt');
    toast('ASCII text exported.');
  }
  async function copyText() {
    if (!ready() || state.settings.pixel) return;
    render();
    if (!ready() || !state.frame) return;
    try {
      await navigator.clipboard.writeText(state.frame.lines.join('\n'));
      $('export-menu').open = false;
      toast('ASCII copied.');
    } catch (_) { toast('Clipboard access is unavailable here. Use Download text to keep the ASCII.', true); }
  }
  function saveSettings() {
    download(new Blob([JSON.stringify({ version: 1, settings: state.settings }, null, 2)], { type: 'application/json' }), 'json');
    toast('Settings exported.');
  }
  async function importSettings(file) {
    if (!file) return;
    if (file.size > 65536) return toast('Settings files must be smaller than 64 KB.', true);
    try {
      const data = JSON.parse(await file.text());
      if (data?.version !== undefined && data.version !== 1) throw new Error('This settings version is not supported.');
      const input = data?.settings ?? data;
      if (!input || !Object.keys(E.DEFAULTS).some(key => Object.hasOwn(input, key))) throw new Error('This file does not contain studio settings.');
      state.settings = E.normalizeSettings(input);
      state.preset = '';
      syncSettings();
      toast('Settings loaded.');
    } catch (error) { toast(error instanceof SyntaxError ? 'That is not a valid JSON settings file.' : error.message, true); }
  }
  function record() {
    if (state.recording) return stopRecording();
    if (!ready() || !isVideo()) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return toast('Video recording is unavailable in this browser. You can still export a PNG.', true);
    try {
      const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mime) return toast('This browser cannot record WebM. Try Chrome or Firefox, or export a PNG.', true);
      setOriginal(false);
      pendingRender = true;
      render();
      if (!ready()) return;
      const recordingStream = sketch.canvas.captureStream(24);
      state.recordingStream = recordingStream;
      const recorder = new MediaRecorder(recordingStream, { mimeType: mime, videoBitsPerSecond: 6000000 });
      const chunks = [];
      const sourceLabel = state.sourceLabel;
      state.recorder = recorder;
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        recordingStream.getTracks().forEach(track => track.stop());
        if (chunks.length) { download(new Blob(chunks, { type: mime }), 'webm', sourceLabel); toast('Recording saved.'); }
        if (state.recorder === recorder) state.recorder = null;
      };
      recorder.onerror = () => { stopRecording(); toast('Recording stopped unexpectedly. Try again or export a PNG.', true); };
      recorder.start(1000);
      state.recording = true;
      state.recordingTimer = setTimeout(() => { stopRecording(); toast('Recording saved. Five-minute limit reached.'); }, 300000);
      $('export-menu').open = false;
      updateExport();
      state.source.play().catch(() => { stopRecording(); toast('Press play, then try recording again.', true); });
      toast('Recording started. Click Stop & save to finish.');
    } catch (_) { stopRecording(); toast('Recording could not start in this browser. Try exporting a PNG.', true); }
  }

  async function togglePlayback() {
    if (!isVideo() || state.stream) return;
    try {
      if (state.source.paused) await state.source.play();
      else state.source.pause();
    } catch (_) { toast('Playback could not start. Try another video format.', true); }
  }
  function toggleFocus() {
    const expanded = $('viewport').classList.toggle('focus-view');
    document.body.classList.toggle('preview-focused', expanded);
    $('fullscreen').innerHTML = icon(expanded ? 'close' : 'expand', 16);
    $('fullscreen').setAttribute('aria-label', expanded ? 'Close expanded preview' : 'Expand preview');
    if (expanded) {
      $('viewport').setAttribute('role', 'dialog');
      $('viewport').setAttribute('aria-modal', 'true');
      $('viewport').setAttribute('aria-label', 'Expanded ASCII preview');
      document.querySelectorAll('.site-header,.introduction,.studio-topbar,.controls,.preview-topline,.preview-toolbar,.preview-metadata,.preset-section,.media-controls,.under-studio,.site-footer').forEach(element => { element.inert = true; });
      $('viewport').append($('fullscreen'));
      $('fullscreen').focus();
    } else {
      $('viewport').removeAttribute('role');
      $('viewport').removeAttribute('aria-modal');
      $('viewport').removeAttribute('aria-label');
      document.querySelectorAll('[inert]').forEach(element => { element.inert = false; });
      document.querySelector('.preview-actions').append($('fullscreen'));
      $('fullscreen').focus();
    }
  }

  $('upload').addEventListener('click', chooseSource);
  $('mobile-upload').addEventListener('click', chooseSource);
  $('empty-upload').addEventListener('click', chooseSource);
  $('file-input').addEventListener('change', event => { loadFile(event.target.files[0]); event.target.value = ''; });
  $('settings-input').addEventListener('change', event => { importSettings(event.target.files[0]); event.target.value = ''; });
  $('camera-stop').addEventListener('click', () => { setMode('camera', false); toast('Camera stopped.'); });
  document.querySelectorAll('.mode-tab[data-mode]').forEach(button => {
    button.addEventListener('click', () => { if (state.mode !== button.dataset.mode) setMode(button.dataset.mode); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...document.querySelectorAll('.mode-tab[data-mode]')];
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (buttons.indexOf(button) + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      setMode(buttons[index].dataset.mode);
      buttons[index].focus();
    });
  });
  document.querySelectorAll('[data-setting]').forEach(input => input.addEventListener('input', () => {
    state.settings = E.normalizeSettings({ ...state.settings, [input.dataset.setting]: input.type === 'checkbox' ? input.checked : input.value });
    state.preset = '';
    syncSettings();
  }));
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    state.preset = button.dataset.preset;
    state.settings = { ...E.PRESETS[state.preset] };
    syncSettings();
  }));
  document.querySelectorAll('[data-specimen]').forEach(button => button.addEventListener('click', () => useSpecimen(button.dataset.specimen)));
  $('reset').addEventListener('click', () => { state.settings = { ...E.DEFAULTS }; state.preset = 'afterimage'; syncSettings(); toast('Adjustments reset.'); });
  $('export-png').addEventListener('click', exportPNG);
  $('export-text').addEventListener('click', exportText);
  $('copy-text').addEventListener('click', copyText);
  $('record').addEventListener('click', record);
  $('record-stop').addEventListener('click', stopRecording);
  $('save-settings').addEventListener('click', saveSettings);
  $('settings-export').addEventListener('click', saveSettings);
  const openSettings = () => { $('export-menu').open = false; $('settings-input').click(); };
  $('load-settings').addEventListener('click', openSettings);
  $('settings-import').addEventListener('click', openSettings);
  $('compare').addEventListener('click', () => { if (state.recording) return toast('Stop recording before comparing the original.'); setOriginal(!state.original); });
  $('zoom').addEventListener('click', () => { state.zoom = !state.zoom; $('viewport').classList.toggle('actual-size', state.zoom); $('zoom').textContent = state.zoom ? '100%' : 'FIT'; $('zoom').setAttribute('aria-pressed', state.zoom); });
  $('fullscreen').addEventListener('click', toggleFocus);
  $('play').addEventListener('click', togglePlayback);
  $('rewind').addEventListener('click', () => { if (isVideo()) { state.source.currentTime = 0; requestRender(); } });
  $('seek').addEventListener('input', () => { if (isVideo() && Number.isFinite(state.source.duration)) { state.source.currentTime = Number($('seek').value) / 1000 * state.source.duration; requestRender(); } });
  $('sound').addEventListener('change', () => { if (isVideo() && !state.stream) state.source.muted = !$('sound').checked; });
  $('about-open').addEventListener('click', () => $('about').showModal());
  $('about-close').addEventListener('click', () => $('about').close());
  $('about').addEventListener('click', event => { if (event.target === $('about')) { const rect = $('about').getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('about').close(); } });
  document.addEventListener('click', event => { if (!$('export-menu').contains(event.target)) $('export-menu').open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && $('viewport').classList.contains('focus-view')) { event.preventDefault(); $('fullscreen').focus(); return; }
    if (event.key === 'Escape') {
      if ($('viewport').classList.contains('focus-view')) toggleFocus();
      $('export-menu').open = false;
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.target.closest('input, select, textarea, dialog, [contenteditable]')) return;
    if (event.key.toLowerCase() === 'o' && ready() && !state.recording) { event.preventDefault(); setOriginal(!state.original); }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFocus(); }
    if (event.code === 'Space' && isVideo() && !state.stream && !event.target.closest('button, summary, a')) { event.preventDefault(); togglePlayback(); }
  });
  for (const type of ['dragenter', 'dragover', 'dragleave', 'drop']) {
    document.addEventListener(type, event => {
      if (!event.dataTransfer?.types.includes('Files')) return;
      event.preventDefault();
      if (type === 'dragenter') { dragDepth++; $('drop-overlay').hidden = false; }
      if (type === 'dragleave') { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) $('drop-overlay').hidden = true; }
      if (type === 'drop') { dragDepth = 0; $('drop-overlay').hidden = true; loadFile(event.dataTransfer.files[0]); }
    });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.recording) stopRecording();
    updatePlayback();
  });
  window.addEventListener('pagehide', event => { state.disposed = true; state.loadId++; releaseSource(); if (!event.persisted) sketch?.remove(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { state.disposed = false; setMode(state.mode, false); } });

  const params = new URLSearchParams(location.search);
  const initialMode = ['image', 'video', 'camera'].includes(params.get('mode')) ? params.get('mode') : document.body.dataset.mode || 'image';
  if (document.body.dataset.color === 'true') state.settings.color = true;
  if (document.body.dataset.pixel === 'true') state.settings.pixel = true;
  if (state.settings.color || state.settings.pixel) state.preset = '';
  syncSettings();
  if (!window.p5) { $('canvas-mount').innerHTML = '<p class="load-failure">The drawing engine could not load. Reload the page.</p>'; toast('The local drawing engine is missing. Please restore vendor/p5.min.js.', true); return; }
  new window.p5(p => {
    p.setup = () => {
      sketch = p;
      const canvas = p.createCanvas(1200, 820);
      canvas.parent('canvas-mount');
      canvas.elt.setAttribute('role', 'img');
      canvas.elt.setAttribute('aria-label', 'ASCII art preview. Export text to read the characters.');
      p.pixelDensity(1);
      p.frameRate(24);
      p.noLoop();
      setMode(initialMode, false);
      syncSettings();
    };
    p.draw = render;
  });
})();
