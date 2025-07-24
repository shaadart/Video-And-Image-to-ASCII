/* Built-in specimens are drawn locally, then passed through the real converter. */
(function () {
  'use strict';
  window.AsciiSpecimens = {
    create(kind = 'eye') {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 820;
      const context = canvas.getContext('2d');
      const data = context.createImageData(canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const u = (x - 600) / 430;
          const v = (y - 410) / 290;
          const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
          let shade;
          if (kind === 'orb') {
            const radius = Math.hypot(u, v);
            const sphere = Math.sqrt(Math.max(0, 1 - radius * radius));
            const light = Math.max(0, (-u * 0.55 - v * 0.45 + sphere * 0.75));
            shade = radius < 1 ? 22 + light * 180 + Math.sin(v * 37 + u * 14 + sphere * 4) * 15 : 4;
            shade += 18 * Math.exp(-Math.pow((radius - 1.02) * 25, 2));
          } else if (kind === 'waves') {
            const ripple = Math.sin(Math.hypot(u * 1.4, v + 0.15) * 23 + Math.sin(u * 4) * 2);
            const envelope = Math.exp(-(u * u * 0.4 + v * v * 0.8));
            shade = 6 + Math.pow((ripple + 1) / 2, 3) * envelope * 220;
          } else {
            const curve = Math.pow(Math.max(0, 1 - u * u), 0.72);
            const opening = curve * 0.53;
            const inside = Math.abs(v + u * 0.05) < opening && Math.abs(u) < 1;
            const r = Math.hypot(u * 1.04, v);
            const angle = Math.atan2(v, u);
            const lidDistance = Math.abs(Math.abs(v + u * 0.05) - opening);
            shade = 5 + 17 * Math.exp(-(u * u + v * v) * 1.5);
            shade += 44 * Math.exp(-Math.pow((v + curve * 0.68 + 0.03) * 19, 2)) * curve;
            shade += 27 * Math.exp(-Math.pow((v - curve * 0.7 - 0.08) * 15, 2)) * curve;
            if (inside) {
              shade = 150 - 68 * Math.abs(u) - 48 * Math.abs(v) / Math.max(0.01, opening);
              if (r < 0.48) {
                const fibers = Math.sin(angle * 87 + Math.sin(r * 46) * 2) * Math.sin(angle * 31 - r * 53);
                shade = 75 + fibers * 45 + 58 * Math.sin(r / 0.48 * Math.PI);
                shade *= 0.5 + 0.5 * Math.min(1, (0.48 - r) * 22);
              }
              if (r < 0.205) shade = 3;
              if (Math.hypot(u + 0.11, v + 0.16) < 0.064) shade = 250;
              if (Math.hypot(u - 0.17, v - 0.12) < 0.025) shade = 185;
              shade *= 0.6 + 0.4 * Math.min(1, lidDistance * 25);
            }
            if (Math.abs(u) < 1.1) shade += 42 * Math.exp(-Math.pow(lidDistance * 45, 2));
          }
          const offset = (y * canvas.width + x) * 4;
          const light = Math.max(0, Math.min(255, shade + noise * 13));
          data.data[offset] = light;
          data.data[offset + 1] = light * 0.96;
          data.data[offset + 2] = light * 0.85;
          data.data[offset + 3] = 255;
        }
      }
      context.putImageData(data, 0, 0);
      return canvas;
    }
  };
})();
