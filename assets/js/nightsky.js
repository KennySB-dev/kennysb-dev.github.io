(function () {
  const canvas = document.createElement("canvas");
  canvas.className = "night-sky-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const layer = document.querySelector(".bg-layer");
  if (layer) {
    layer.appendChild(canvas);
  } else {
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  let stars = [];
  let meteors = [];
  let mouse = { x: 0, y: 0 };
  let offset = { x: 0, y: 0 };
  let running = true;
  const ACCENT = "rgba(167, 139, 250, 0.9)";
  const ACCENT_SOFT = "rgba(192, 132, 252, 0.35)";

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 2200);
    stars = [];
    for (let i = 0; i < count; i++) {
      const big = Math.random() < 0.06;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: big ? 1.2 + Math.random() * 0.6 : 0.3 + Math.random() * 0.7,
        a: big ? 0.85 + Math.random() * 0.15 : 0.2 + Math.random() * 0.55,
        speed: 0.0005 + Math.random() * 0.0022,
        phase: Math.random() * Math.PI * 2,
        tint: Math.random() < 0.14,
        depth: big ? 1 : 0.35 + Math.random() * 0.4
      });
    }
  }

  function drawNebula() {
    const step = 3;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const nx = (x - w * 0.08) / (w * 0.7);
        const ny = (y - h * 0.92) / (h * 0.55);
        const dist = nx * nx + ny * ny;
        const d = Math.exp(-dist * 3.2);
        const n = (Math.sin(x * 0.021 + y * 0.017) * 0.5 + 0.5) *
                  (Math.sin(x * 0.009 - y * 0.013) * 0.5 + 0.5);
        const v = d * (0.15 + n * 0.85);
        if (v > 0.22 && Math.random() < v * 0.55) {
          ctx.fillStyle = ACCENT_SOFT;
          ctx.globalAlpha = Math.min(0.55, v * 0.7);
          ctx.fillRect(x, y, step, step);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    drawNebula();

    offset.x += (mouse.x - offset.x) * 0.04;
    offset.y += (mouse.y - offset.y) * 0.04;

    for (const s of stars) {
      const tw = Math.sin(t * s.speed + s.phase);
      if (tw < -0.72 && s.r <= 1) continue;
      const x = s.x + offset.x * s.depth * 14;
      const y = s.y + offset.y * s.depth * 14;
      ctx.fillStyle = s.tint ? ACCENT : "#ffffff";
      ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.max(0, tw));
      const r = s.r;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      if (s.r > 1.05) {
        ctx.fillRect(x - r * 2.6, y - 0.6, r * 5.2, 1.2);
        ctx.fillRect(x - 0.6, y - r * 2.6, 1.2, r * 5.2);
      }
    }
    ctx.globalAlpha = 1;

    if (Math.random() < 0.004 && meteors.length < 2) {
      const fromLeft = Math.random() < 0.5;
      const angle = (12 + Math.random() * 22) * Math.PI / 180;
      const speed = 2.2 + Math.random() * 2.8;
      meteors.push({
        x: fromLeft ? Math.random() * w * 0.4 : w * 0.4 + Math.random() * w * 0.5,
        y: Math.random() * h * 0.45,
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 50 + Math.random() * 45,
        max: 50 + Math.random() * 45
      });
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.life--;
      if (m.life <= 0) {
        meteors.splice(i, 1);
        continue;
      }
      const len = 10 + (1 - m.life / m.max) * 18;
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = Math.min(1, m.life / 35);
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * len, m.y - m.vy * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  function onMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mouse.x = (e.clientX / w - 0.5) * 2;
    mouse.y = (e.clientY / h - 0.5) * 2;
  }

  function onVisibility() {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(draw);
  } else {
    drawNebula();
    for (const s of stars) {
      ctx.fillStyle = s.tint ? ACCENT : "#ffffff";
      ctx.globalAlpha = s.a * 0.7;
      ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    }
    ctx.globalAlpha = 1;
  }
})();
