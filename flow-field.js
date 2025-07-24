(function () {
  'use strict';
  const mount = document.getElementById('flow-canvas');
  const pause = document.getElementById('flow-pause');
  let userPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let particles = [];
  let time = 0;
  if (!window.p5) { mount.textContent = 'The drawing engine could not load. Reload to try again.'; return; }
  const instance = new p5(p => {
    function restart() {
      p.background('#101110');
      particles = Array.from({ length: 500 }, () => ({ x: p.random(p.width), y: p.random(p.height), age: p.random(200) }));
      if (userPaused) p.redraw();
    }
    function syncPlayback() {
      pause.textContent = userPaused ? 'Resume' : 'Pause';
      pause.setAttribute('aria-pressed', userPaused);
      if (document.hidden || userPaused) p.noLoop(); else p.loop();
    }
    p.setup = () => {
      const canvas = p.createCanvas(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight));
      canvas.parent(mount);
      canvas.elt.setAttribute('role', 'img');
      canvas.elt.setAttribute('aria-label', '500 particles following a flow field.');
      canvas.mousePressed(restart);
      p.pixelDensity(1);
      p.frameRate(30);
      restart();
      syncPlayback();
      pause.addEventListener('click', () => { userPaused = !userPaused; syncPlayback(); });
      document.getElementById('flow-reset').addEventListener('click', restart);
      document.getElementById('flow-export').addEventListener('click', () => p.saveCanvas('death-of-pixels-flow', 'png'));
      document.addEventListener('visibilitychange', syncPlayback);
    };
    p.draw = () => {
      const ink = p.color(document.getElementById('flow-color').value);
      ink.setAlpha(45);
      p.stroke(ink);
      p.strokeWeight(0.65);
      for (const particle of particles) {
        const angle = p.noise(particle.x / 260, particle.y / 260, time) * Math.PI * 4;
        const nextX = particle.x + Math.cos(angle) * 2;
        const nextY = particle.y + Math.sin(angle) * 2;
        p.line(particle.x, particle.y, nextX, nextY);
        particle.x = nextX;
        particle.y = nextY;
        particle.age++;
        if (nextX < 0 || nextX >= p.width || nextY < 0 || nextY >= p.height || particle.age > 600) {
          particle.x = p.random(p.width);
          particle.y = p.random(p.height);
          particle.age = 0;
        }
      }
      time += 0.001;
    };
    p.windowResized = () => {
      p.resizeCanvas(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight));
      restart();
    };
  });
  window.addEventListener('pagehide', event => { if (!event.persisted) instance.remove(); else instance.noLoop(); });
  window.addEventListener('pageshow', event => { if (event.persisted && !userPaused) instance.loop(); });
})();
