/* =====================================================================
   INTRO DE ENTRADA · BIOBIM Lab (≈ 6 s)
   El símbolo como ecosistema vivo: clima → información → forma → decisión.
     0.0–1.5 s  oscuridad; la geometría aparece como información (nodos, trazo fino)
     1.5–3.5 s  viento, sol, acústica y ventilación activan el símbolo
     3.5–5.0 s  las fuerzas convergen: las partículas revelan el logotipo
     5.0–6.0 s  logotipo definido + BIOBIM + lema → la página
   La geometría final es exactamente la de la marca (retícula 32 × 32).
   Se puede saltar (botón, Escape o cualquier tecla). Si algo falla, el CSS
   oculta la intro por sí solo a los 12 s.
   ===================================================================== */
(() => {
  "use strict";
  const intro = document.getElementById("intro");
  if (!intro) return;
  // Al volver del territorio 3D no se repite la intro
  if (/territorio.html/.test(document.referrer)) { document.body.classList.remove("intro-lock"); intro.remove(); return; }
  const cv = intro.querySelector("#introCanvas");
  const ctx = cv.getContext("2d");
  const lc = document.createElement("canvas");            // capa del logotipo (con su máscara)
  const lx = lc.getContext("2d");
  const bc = document.createElement("canvas");            // capa reducida para el resplandor
  const bx = bc.getContext("2d");

  // Paleta: negro profundo, blanco, azul verdoso y acentos cálidos (colores exactos de la marca)
  const BG = "#040706", SUN = "#FFB547", ARC = "#6FCF8E", TEAL = "134,214,204", WHITE = "236,244,240", WARM = "255,190,110";

  /* ------------------------------------------------------------------
     CONFIGURACIÓN · estilo de la intro
       "impacto": logo más grande, haz intenso, resplandor, onda expansiva,
                  destello y salida atravesando el sol (por defecto)
       "sutil":   la versión contenida, sin golpe ni salida por el sol
     ------------------------------------------------------------------ */
  const STYLE = "impacto";
  const FX = STYLE === "impacto"
    ? { scale: 0.38, particles: 1.25, beam: 1.7, bloom: true, shock: true, dive: true }
    : { scale: 0.3, particles: 1, beam: 1, bloom: false, shock: false, dive: false };

  // Utilidades de tiempo
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const seg = (t, a, b) => ease(clamp((t - a) / (b - a)));
  const win = (t, a, b, f = 0.5) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));

  /* ------------------------------------------------------------------
     Geometría de la marca (retícula 32 × 32)
     Arco: M2.5 25 C8 16.5 24 16.5 29.5 25 · trazo 3.2 · sol: (16, 17.5) r 8.4 · corte: banda de 6
     ------------------------------------------------------------------ */
  const SUN_C = [16, 17.5], SUN_R = 8.4, ARC_W = 3.2, CUT_W = 6;
  const bez = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const arcPt = (t, w = 0) => [bez(t, 2.5, 8, 24, 29.5), bez(t, 25, 16.5 + w * 0.6, 16.5 - w * 0.4, 25)];
  const ARC_TABLE = Array.from({ length: 81 }, (_, i) => arcPt(i / 80));
  function arcY(x) {                                         // altura del arco en x (retícula)
    if (x <= 2.5 || x >= 29.5) return 25;
    for (let i = 1; i < ARC_TABLE.length; i++) {
      const [x1, y1] = ARC_TABLE[i];
      if (x1 >= x) { const [x0, y0] = ARC_TABLE[i - 1]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); }
    }
    return 25;
  }

  /* ------------------------------------------------------------------
     Cámara y lienzo
     ------------------------------------------------------------------ */
  let W = 0, H = 0, DPR = 1, S = 1, CX = 0, CY = 0, cam = 1, drift = 0;
  let zk = 1, pv = null;                                    // zoom de salida alrededor del sol (vectorial)
  const P = (x, y) => {
    const bx = CX + drift * S + (x - 16) * S * cam, by = CY + (y - 17.8) * S * cam;
    return zk === 1 || !pv ? [bx, by] : [pv[0] + (bx - pv[0]) * zk, pv[1] + (by - pv[1]) * zk];
  };
  function resize() {
    DPR = Math.min(3, window.devicePixelRatio || 1);
    W = intro.clientWidth || innerWidth; H = intro.clientHeight || innerHeight;   // el lienzo llena la intro (CSS inset: 0)
    for (const c of [cv, lc]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); }
    S = Math.min(W, H * 1.15) * FX.scale / 32;
    CX = W / 2; CY = H * 0.43;
    // El texto se ubica bajo el logotipo en su encuadre final
    const type = intro.querySelector("#introType");
    type.style.top = `${CY + (26.6 - 17.8) * S + Math.max(22, S * 3.2)}px`;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(intro);

  /* ------------------------------------------------------------------
     Partículas: primero viento, al final revelan el logotipo
     ------------------------------------------------------------------ */
  const rnd = (a, b) => a + Math.random() * (b - a);
  const N = Math.round(clamp((W * H) / 9000, 90, 170) * FX.particles);
  const parts = Array.from({ length: N }, (_, i) => {
    const toSun = i % 5 < 2;                                 // 40 % termina en el sol, 60 % en el arco
    let tx, ty;
    if (toSun) {
      do { const a = rnd(0, Math.PI * 2), r = SUN_R * Math.sqrt(Math.random()) * 0.96; tx = SUN_C[0] + r * Math.cos(a); ty = SUN_C[1] + r * Math.sin(a); }
      while (ty > arcY(tx) - CUT_W / 2 - 0.2);                // solo la parte visible del sol
    } else {
      const t = rnd(0.02, 0.98), [ax, ay] = arcPt(t);
      tx = ax; ty = ay + rnd(-ARC_W / 2, ARC_W / 2) * 0.8;
    }
    return {
      i, x: rnd(-34, 64), y: rnd(2, 34), z: rnd(0.35, 1), toSun, tx, ty,
      delay: rnd(0, 0.55), sx: 0, sy: 0, px: null, py: null, grabbed: false,
    };
  });
  // Desplazamiento de las líneas de corriente sobre el arco (comportamiento aerodinámico)
  function streamY(x, y) {
    const a = arcY(x), hump = 25 - a;
    if (y <= a) return y - hump * Math.exp(-(a - y) / 6);   // por encima: el flujo se curva sobre la forma
    return y + hump * 0.3 * Math.exp(-(y - a) / 4);         // por debajo: ventilación que "respira"
  }

  /* ------------------------------------------------------------------
     Dibujo del logotipo (capa con máscara), idéntico a la marca al final
     ------------------------------------------------------------------ */
  function arcPath(c, w) {
    const p0 = P(2.5, 25), p1 = P(8, 16.5 + w * 0.6), p2 = P(24, 16.5 - w * 0.4), p3 = P(29.5, 25);
    c.beginPath(); c.moveTo(...p0); c.bezierCurveTo(...p1, ...p2, ...p3);
  }
  function drawLogo(o) {
    lx.setTransform(DPR, 0, 0, DPR, 0, 0);
    lx.clearRect(0, 0, W, H);
    lx.globalCompositeOperation = "source-over";
    const [sx, sy] = P(...SUN_C), r = SUN_R * S * cam * zk;
    // Contorno del sol como información
    if (o.sunLine > 0.01) {
      lx.beginPath(); lx.arc(sx, sy, r, 0, Math.PI * 2);
      lx.strokeStyle = `rgba(${WHITE},${0.55 * o.sunLine})`; lx.lineWidth = 1; lx.stroke();
    }
    // Disco solar iluminado progresivamente desde la luz (arriba a la derecha)
    if (o.sunFill > 0.01) {
      const g = lx.createLinearGradient(sx + r, sy - r, sx - r, sy + r);
      const lit = o.lit;
      g.addColorStop(0, SUN);
      g.addColorStop(clamp(lit * 1.05), SUN);
      g.addColorStop(clamp(lit * 1.05 + 0.25), `rgba(255,181,71,${0.35 + 0.65 * lit})`);
      g.addColorStop(1, `rgba(255,181,71,${0.25 + 0.75 * lit})`);
      lx.globalAlpha = o.sunFill;
      lx.beginPath(); lx.arc(sx, sy, r, 0, Math.PI * 2); lx.fillStyle = g; lx.fill();
      lx.globalAlpha = 1;
    }
    // Máscara de la marca: el horizonte oculta la parte baja del sol
    lx.globalCompositeOperation = "destination-out";
    arcPath(lx, o.wob);
    const b3 = P(29.5, 60), b0 = P(2.5, 60);
    lx.lineTo(...b3); lx.lineTo(...b0); lx.closePath(); lx.fill();
    arcPath(lx, o.wob); lx.lineWidth = CUT_W * S * cam * zk; lx.lineCap = "round"; lx.stroke();
    lx.globalCompositeOperation = "source-over";
    // Arco: primero trazo fino (información), luego el trazo exacto de la marca
    if (o.arcLine > 0.01) {
      arcPath(lx, o.wob);
      lx.strokeStyle = `rgba(${TEAL},${0.7 * o.arcLine})`; lx.lineWidth = 1.2; lx.lineCap = "round";
      const len = 32 * S * cam * zk;
      lx.setLineDash([len * o.arcDraw, len * 2]); lx.stroke(); lx.setLineDash([]);
    }
    if (o.arcSolid > 0.01) {
      arcPath(lx, o.wob);
      lx.globalAlpha = o.arcSolid; lx.strokeStyle = ARC; lx.lineWidth = ARC_W * S * cam * zk; lx.lineCap = "round"; lx.stroke();
      lx.globalAlpha = 1;
    }
    // Borde del arco iluminado por el sol
    if (o.rim > 0.01) {
      arcPath(lx, o.wob);
      lx.save(); lx.translate(0.35 * S, -ARC_W * 0.45 * S * cam * zk);
      lx.strokeStyle = `rgba(${WARM},${0.55 * o.rim})`; lx.lineWidth = Math.max(1, 0.5 * S); lx.stroke();
      lx.restore();
    }
    ctx.save();
    if (o.blur > 0.05) ctx.filter = `blur(${o.blur.toFixed(2)}px)`;   // profundidad de campo inicial
    ctx.drawImage(lc, 0, 0, W, H);
    ctx.restore();
    if (FX.bloom && o.bloom > 0.01) {
      // Resplandor (bloom) suave: capa a 1/4 de resolución con desenfoque real (barato por ser pequeña).
      // Se suma por debajo de la intensidad del trazo para no ensuciar el borde nítido del arco.
      const bw = Math.max(2, Math.round(W / 4)), bh = Math.max(2, Math.round(H / 4));
      if (bc.width !== bw || bc.height !== bh) { bc.width = bw; bc.height = bh; }
      bx.setTransform(1, 0, 0, 1, 0, 0);
      bx.clearRect(0, 0, bw, bh);
      bx.filter = `blur(${Math.max(2, S * 0.35).toFixed(1)}px)`;
      bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = "high";
      bx.drawImage(lc, 0, 0, bw, bh);
      bx.filter = "none";
      ctx.save();
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.38 * o.bloom;
      ctx.drawImage(bc, 0, 0, W, H);
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------------
     Fuerzas ambientales (actúan sobre la geometría)
     ------------------------------------------------------------------ */
  // BIM: nodos y aristas que construyen el símbolo
  const ARC_NODES = Array.from({ length: 11 }, (_, i) => arcPt(i / 10));
  const SUN_NODES = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (i / 8) * Math.PI;                    // mitad superior
    return [SUN_C[0] + SUN_R * Math.cos(a), SUN_C[1] + SUN_R * Math.sin(a)];
  }).filter(([x, y]) => y < arcY(x) - CUT_W / 2);
  function bim(t, a) {
    if (a < 0.01) return;
    ctx.lineWidth = 1;
    // Retícula tenue (modelo)
    ctx.strokeStyle = `rgba(${TEAL},${0.07 * a})`;
    for (let x = 0; x <= 32; x += 4) { ctx.beginPath(); ctx.moveTo(...P(x, 6)); ctx.lineTo(...P(x, 30)); ctx.stroke(); }
    for (let y = 6; y <= 30; y += 4) { ctx.beginPath(); ctx.moveTo(...P(0, y)); ctx.lineTo(...P(32, y)); ctx.stroke(); }
    // Aristas: arco, sol y triangulación entre ambos
    const shown = (i, base) => clamp((t - base - i * 0.07) / 0.35);
    ctx.strokeStyle = `rgba(${TEAL},${0.4 * a})`;
    ARC_NODES.forEach((p, i) => { if (i && shown(i, 0.35) > 0) { ctx.beginPath(); ctx.moveTo(...P(...ARC_NODES[i - 1])); ctx.lineTo(...P(...p)); ctx.stroke(); } });
    SUN_NODES.forEach((p, i) => {
      if (shown(i, 0.7) <= 0) return;
      if (i) { ctx.beginPath(); ctx.moveTo(...P(...SUN_NODES[i - 1])); ctx.lineTo(...P(...p)); ctx.stroke(); }
      let best = ARC_NODES[0], d = 1e9;
      for (const q of ARC_NODES) { const dd = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2; if (dd < d) { d = dd; best = q; } }
      ctx.strokeStyle = `rgba(${TEAL},${0.18 * a})`;
      ctx.beginPath(); ctx.moveTo(...P(...p)); ctx.lineTo(...P(...best)); ctx.stroke();
      ctx.strokeStyle = `rgba(${TEAL},${0.4 * a})`;
    });
    // Nodos
    for (const [i, p] of [...ARC_NODES.map((p, i) => [i, p]), ...SUN_NODES.map((p, i) => [i + 3, p])]) {
      const s = shown(i, 0.3);
      if (s <= 0) continue;
      const [x, y] = P(...p);
      ctx.fillStyle = `rgba(${WHITE},${0.85 * a * s})`;
      ctx.beginPath(); ctx.arc(x, y, 1.6 + (1 - s) * 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Sol: haz de luz cálida, suelo tenue y sombra proyectada
  function sunlight(a) {
    if (a < 0.01) return;
    const [sx, sy] = P(...SUN_C), r = SUN_R * S * cam * zk;
    // Haz volumétrico desde arriba a la derecha
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const ox = sx + W * 0.7, oy = sy - H * 0.8, ang = Math.atan2(sy - oy, sx - ox), nx = -Math.sin(ang), ny = Math.cos(ang);
    const g = ctx.createLinearGradient(ox, oy, sx, sy);
    g.addColorStop(0, `rgba(${WARM},0)`); g.addColorStop(0.75, `rgba(${WARM},${0.07 * a * FX.beam})`); g.addColorStop(1, `rgba(${WARM},${0.16 * a * FX.beam})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(ox + nx * r * 0.4, oy + ny * r * 0.4); ctx.lineTo(sx + nx * r * 1.3, sy + ny * r * 1.3);
    ctx.lineTo(sx - nx * r * 1.3, sy - ny * r * 1.3); ctx.lineTo(ox - nx * r * 0.4, oy - ny * r * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // Suelo y sombra geométrica del sol (hacia abajo a la izquierda)
    const [gx, gy] = P(16, 30.5);
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 2.6);
    glow.addColorStop(0, `rgba(${TEAL},${0.1 * a})`); glow.addColorStop(1, `rgba(${TEAL},0)`);
    ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(gx, gy, r * 2.6, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(0,0,0,${0.55 * a})`;
    ctx.beginPath(); ctx.ellipse(gx - r * 0.9, gy + r * 0.05, r * 1.05, r * 0.2, -0.08, 0, Math.PI * 2); ctx.fill();
  }
  // Acústica: ondas finas que se propagan alrededor del sol (mitad superior)
  function acoustic(t, a) {
    if (a < 0.01) return;
    const [sx, sy] = P(...SUN_C);
    for (let k = 0; k < 3; k++) {
      const p = ((t - 1.9 + k * 0.5) % 1.5) / 1.5;
      if (p < 0) continue;
      const rr = (SUN_R + 1.5 + p * 9) * S * cam * zk;
      ctx.beginPath(); ctx.arc(sx, sy, rr, Math.PI * 1.08, Math.PI * 1.92);
      ctx.strokeStyle = `rgba(${WHITE},${0.32 * a * (1 - p)})`; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  // Ventilación: un flujo que conecta los extremos del arco por debajo y "respira"
  function ventilation(t, a) {
    if (a < 0.01) return;
    const p0 = P(3.2, 27.2), c = P(16, 30.8 + Math.sin(t * 2.2) * 0.4), p1 = P(28.8, 27.2);
    ctx.beginPath(); ctx.moveTo(...p0); ctx.quadraticCurveTo(...c, ...p1);
    ctx.strokeStyle = `rgba(${TEAL},${0.55 * a})`; ctx.lineWidth = 1.2; ctx.lineCap = "round";
    ctx.setLineDash([3, 9]); ctx.lineDashOffset = -t * 38; ctx.stroke(); ctx.setLineDash([]);
  }
  // Viento y convergencia de partículas
  function particles(t, dt, wind, conv) {
    const V = 9.5;
    for (const p of parts) {
      let X, Y, alpha, col;
      if (conv <= 0 || t < 3.5 + p.delay) {
        p.x += V * p.z * dt;
        if (p.x > 64) { p.x = -34; p.px = null; }
        X = p.x; Y = streamY(p.x, p.y);
        alpha = wind * (0.25 + 0.6 * p.z); col = WHITE;
        p.sx = X; p.sy = Y;
      } else {
        // Convergencia: cada partícula viaja a su punto del logotipo
        const k = ease(clamp((t - 3.5 - p.delay) / 1.05));
        X = p.sx + (p.tx - p.sx) * k; Y = p.sy + (p.ty - p.sy) * k;
        alpha = (0.35 + 0.6 * p.z) * (1 - seg(t, 4.75, 5.25));
        col = k > 0.6 ? (p.toSun ? WARM : TEAL) : WHITE;
      }
      if (FX.shock && t >= 5.0 && p.i % 3 === 0) {          // chispas que salen con la onda expansiva
        const k = clamp((t - 5.0) / 0.9), dx = p.tx - SUN_C[0], dy = p.ty - SUN_C[1], d = Math.hypot(dx, dy) || 1;
        X = p.tx + (dx / d) * k * 14 * p.z; Y = p.ty + (dy / d) * k * 14 * p.z;
        alpha = (1 - k) * 0.9; col = p.toSun ? WARM : TEAL;
      }
      if (alpha < 0.01) { p.px = null; continue; }
      const [x, y] = P(X, Y);
      if (p.px != null && Math.abs(x - p.px) < 60) {
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(${col},${alpha * 0.55})`; ctx.lineWidth = 0.6 + p.z * 0.9; ctx.stroke();
      }
      ctx.fillStyle = `rgba(${col},${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, 0.5 + p.z * 1.1, 0, Math.PI * 2); ctx.fill();
      p.px = x; p.py = y;
    }
  }

  // Impacto: onda expansiva de luz desde el sol cuando el símbolo queda definido
  function shockwave(t) {
    if (!FX.shock || t < 5.0 || t > 6.2) return;
    const [sx, sy] = P(...SUN_C), far = Math.hypot(W, H);
    for (const [delay, w, col, amp] of [[0, 3, WHITE, 0.55], [0.12, 1.5, TEAL, 0.4], [0.22, 1, WARM, 0.35]]) {
      const k = clamp((t - 5.0 - delay) / 1.0);
      if (k <= 0 || k >= 1) continue;
      const r = SUN_R * S * cam * zk + ease(k) * far * 0.75;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${col},${amp * (1 - k)})`; ctx.lineWidth = w * (1 + (1 - k) * 2); ctx.stroke();
    }
  }

  /* ------------------------------------------------------------------
     SONIDO · firma sonora sintetizada (Web Audio, sin archivos)
       drone grave → viento → "pings" acústicos → subida → golpe BIOBIM
       (dos notas cálidas + acorde que se abre) → salida por el sol
     Los navegadores bloquean el audio hasta que la persona interactúa:
     se activa con el botón "Activar sonido" o con un clic sobre la intro,
     y se sincroniza con el punto en que va la animación.
     ------------------------------------------------------------------ */
  const SOUND = true;
  let tNow = 0;
  const sound = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!SOUND || !AC) return null;
    let ac = null, master = null, verb = null, noiseBuf = null, started = false, muted = false;
    const LEVEL = 0.85;

    function build() {
      ac = new AC();
      master = ac.createGain(); master.gain.value = LEVEL;
      const comp = ac.createDynamicsCompressor();
      master.connect(comp); comp.connect(ac.destination);
      // Reverberación generada (impulso de ruido que decae)
      verb = ac.createConvolver();
      const len = Math.floor(ac.sampleRate * 2.6), imp = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = imp.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      verb.buffer = imp;
      const wet = ac.createGain(); wet.gain.value = 0.45;
      verb.connect(wet); wet.connect(master);
      // Ruido blanco reutilizable
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    }
    // Envolvente: sube a `peak` en `a` s, se mantiene `h` s y cae en `r` s
    function env(g, t0, a, peak, h, r) {
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + a);
      g.gain.setValueAtTime(peak, t0 + a + h);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + h + r);
    }
    function tone(freq, t0, { type = "sine", a = 0.01, peak = 0.2, h = 0, r = 1, glide = null, send = 0.4, pan = 0 } = {}) {
      const o = ac.createOscillator(), g = ac.createGain(), p = ac.createStereoPanner();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + a + h + r * 0.6);
      env(g, t0, a, peak, h, r);
      p.pan.value = pan;
      o.connect(g); g.connect(p); p.connect(master);
      if (send) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(verb); }
      o.start(t0); o.stop(t0 + a + h + r + 0.1);
    }
    function noise(t0, dur, { type = "bandpass", f0 = 800, f1 = 800, q = 0.8, peak = 0.08, a = 0.4, r = 0.6, pan0 = 0, pan1 = 0, send = 0.2 } = {}) {
      const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), p = ac.createStereoPanner();
      src.buffer = noiseBuf; src.loop = true;
      f.type = type; f.Q.value = q;
      f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      p.pan.setValueAtTime(pan0, t0); p.pan.linearRampToValueAtTime(pan1, t0 + dur);
      env(g, t0, a, peak, Math.max(0, dur - a - r), r);
      src.connect(f); f.connect(g); g.connect(p); p.connect(master);
      if (send) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(verb); }
      src.start(t0); src.stop(t0 + dur + 0.1);
    }

    // Programa el guion desde el tiempo actual de la intro (lo ya pasado se omite)
    function schedule(tIntro) {
      const base = ac.currentTime + 0.05 - tIntro;          // tiempo de audio para el instante T de la intro
      const at = (T) => base + T;
      const ahead = (T) => T >= tIntro - 0.05;
      // 1 · Drone grave que crece con la aparición
      const from = Math.max(0, tIntro);
      if (from < 6.0) {
        for (const [f, peak] of [[55, 0.16], [82.41, 0.09], [110, 0.04]]) {
          const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
          o.type = f === 110 ? "triangle" : "sine"; o.frequency.value = f;
          lp.type = "lowpass"; lp.frequency.value = 420;
          const t0 = at(from);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(peak, t0 + Math.max(0.4, 1.5 - from));
          g.gain.linearRampToValueAtTime(peak * 1.2, at(Math.max(from + 0.5, 3.5)));
          g.gain.linearRampToValueAtTime(peak * 0.5, at(Math.max(from + 0.6, 5.0)));
          g.gain.exponentialRampToValueAtTime(0.0001, at(Math.max(from + 0.8, 6.9)));
          o.connect(lp); lp.connect(g); g.connect(master);
          o.start(t0); o.stop(at(Math.max(from + 1, 7.0)));
        }
      }
      // 2 · Viento: ruido filtrado que cruza de izquierda a derecha
      if (tIntro < 4.2) {
        const s = Math.max(1.3, tIntro);
        noise(at(s), 4.3 - s, { f0: 450, f1: 1700, q: 0.9, peak: 0.07, a: 0.7, r: 0.8, pan0: -0.6, pan1: 0.6, send: 0.3 });
      }
      // 3 · "Pings" acústicos, uno por cada onda que sale del sol
      [1.9, 2.4, 2.9, 3.4].forEach((T, k) => {
        if (!ahead(T)) return;
        tone(1318.5, at(T), { peak: 0.045, a: 0.005, r: 1.3, send: 0.7, pan: -0.2 + k * 0.13 });
        tone(1975.5, at(T + 0.01), { peak: 0.018, a: 0.005, r: 0.9, send: 0.7 });
      });
      // 4 · Subida de tensión durante la convergencia
      if (tIntro < 5.0) {
        const s = Math.max(3.5, tIntro), d = 5.0 - s;
        if (d > 0.1) {
          tone(110, at(s), { type: "sawtooth", a: d * 0.8, peak: 0.035, h: 0, r: d * 0.25, glide: 220, send: 0.2 });
          noise(at(s), d, { type: "highpass", f0: 1500, f1: 6000, q: 0.5, peak: 0.045, a: d * 0.85, r: 0.12, send: 0.1 });
        }
      }
      // 5 · Golpe BIOBIM: impacto grave + dos notas cálidas + acorde que se abre
      if (ahead(5.0)) {
        tone(120, at(5.0), { peak: 0.75, a: 0.005, r: 1.4, glide: 42, send: 0.25 });                 // golpe sub
        noise(at(5.0), 0.25, { type: "lowpass", f0: 1400, f1: 300, peak: 0.22, a: 0.004, r: 0.2, send: 0.3 });
        tone(196.0, at(5.0), { type: "triangle", peak: 0.16, a: 0.01, h: 0.15, r: 1.6, send: 0.5 });   // sol (G3)
        tone(261.63, at(5.22), { type: "triangle", peak: 0.18, a: 0.01, h: 0.2, r: 2.0, send: 0.55 }); // do (C4)
      }
      if (ahead(5.35)) {
        [261.63, 329.63, 392.0, 587.33].forEach((f, k) =>
          tone(f, at(5.35 + k * 0.04), { peak: 0.045, a: 0.6, h: 0.7, r: 1.8, send: 0.7, pan: -0.3 + k * 0.2 }));
        tone(1046.5, at(5.5), { peak: 0.012, a: 0.8, h: 0.5, r: 1.6, send: 0.8 });
        tone(1568.0, at(5.6), { peak: 0.008, a: 0.8, h: 0.4, r: 1.6, send: 0.8 });
      }
      // 6 · Salida atravesando el sol
      if (FX.dive && ahead(6.3)) noise(at(6.3), 0.7, { f0: 300, f1: 4200, q: 0.7, peak: 0.1, a: 0.45, r: 0.25, send: 0.4 });
    }

    function ui() { /* sin controles visibles: el sonido siempre está activo */ }
    // ¿El navegador deja sonar audio sin interacción? (visitantes recurrentes, sitio con sonido permitido…)
    async function canAutoplay() {
      try {
        if (navigator.getAutoplayPolicy && navigator.getAutoplayPolicy("audiocontext") === "disallowed") return false;
        if (!ac) build();
        if (ac.state === "running") return true;
        return await Promise.race([ac.resume().then(() => ac.state === "running"), new Promise((r) => setTimeout(() => r(false), 250))]);
      } catch (e) { return false; }
    }
    // Desbloquea y programa el sonido (debe llamarse dentro de un clic o toque)
    function enable() {
      if (started) return;
      try { if (!ac) build(); } catch (e) { return; }
      ac.resume().then(() => {
        if (started || done) return;
        started = true; schedule(tNow);
        if (muted) master.gain.value = 0;
        ui();
      }).catch(() => {});
    }
    function toggle() {
      muted = !muted;
      if (master) master.gain.setTargetAtTime(muted ? 0 : LEVEL, ac.currentTime, 0.06);
      if (!started && !muted) enable();
      ui();
    }
    function stop() {
      if (!ac) return;
      try {
        master.gain.setTargetAtTime(0, ac.currentTime, 0.35);   // la cola del acorde entra suave a la página
        setTimeout(() => ac.close(), 2200);
      } catch (e) { /* sin audio */ }
    }
    ui();
    return { enable, toggle, stop, canAutoplay };
  })();
  if (sound) {
    // Si el navegador bloqueó el audio, el primer clic, toque o tecla lo activa (sincronizado)
    const unlock = () => sound.enable();
    for (const ev of ["pointerdown", "touchstart"]) document.addEventListener(ev, unlock, { once: true, passive: true });
  }

  /* ------------------------------------------------------------------
     Guion y bucle
     ------------------------------------------------------------------ */
  const T_TYPE = 5.05, T_CLAIM = 5.4;
  const T_DIVE = FX.dive ? 6.3 : Infinity, T_OUT = FX.dive ? 6.75 : 6.25, T_END = FX.dive ? 7.35 : 6.9;
  let t0 = null, last = 0, done = false, raf = 0;
  function frame(now) {
    if (done) return;
    if (t0 == null) { t0 = now; last = now; }
    const t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000);
    tNow = t;
    last = now;
    // Cámara: acercamiento muy lento con una leve deriva
    cam = 0.8 + 0.2 * ease(clamp(t / 5.2));
    drift = (1 - ease(clamp(t / 5.2))) * 1.4;
    if (FX.shock && t > 5.0 && t < 5.5) cam *= 1 + 0.035 * Math.sin((Math.PI * (t - 5.0)) / 0.5);   // empuje de cámara
    if (t >= T_DIVE) {                                       // la cámara atraviesa el sol (vectorial, nítido)
      if (!pv) { zk = 1; pv = P(...SUN_C); }
      const k = clamp((t - T_DIVE) / (T_END - T_DIVE));
      zk = 1 + 22 * k * k * k;
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

    const forces = win(t, 1.5, 3.9, 0.6);
    const conv = seg(t, 3.5, 5.0);
    sunlight(forces * 0.9 + conv * 0.25 * (1 - seg(t, 5, 5.8)));
    bim(t, win(t, 0.25, 4.3, 0.6));
    ventilation(t, win(t, 1.9, 3.9, 0.5));
    acoustic(t, win(t, 2.0, 3.9, 0.5));
    particles(t, dt, win(t, 0.9, 3.9, 0.7), conv);
    drawLogo({
      sunLine: win(t, 0.6, 4.9, 0.7),
      sunFill: seg(t, 1.8, 3.0) * 0.55 + seg(t, 4.5, 5.2) * 0.45,
      lit: seg(t, 1.9, 3.6) * 0.8 + seg(t, 4.5, 5.2) * 0.2,
      arcLine: win(t, 0.5, 5.0, 0.6),
      arcDraw: seg(t, 0.55, 1.9),
      arcSolid: seg(t, 4.55, 5.2),
      rim: win(t, 2.0, 4.6, 0.6),
      wob: win(t, 1.5, 3.6, 0.6) * 0.45 * Math.sin(t * 3.2),   // respuesta leve al viento; 0 al final
      blur: 3.2 * (1 - seg(t, 0, 1.6)),
      bloom: seg(t, 4.9, 5.3),
    });
    shockwave(t);
    // Viñeta suave (profundidad)
    const v = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H * 0.45, Math.max(W, H) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);

    if (FX.shock && t >= 5.0) intro.classList.add("s-flash");
    if (t >= T_TYPE) intro.classList.add("s-type");
    if (t >= T_DIVE) intro.classList.add("s-dive");
    if (t >= T_CLAIM) intro.classList.add("s-claim");
    if (t >= T_OUT) intro.classList.add("s-out");
    if (t >= T_END) return finish();
    raf = requestAnimationFrame(frame);
  }
  // Seguro: si el navegador pausa la animación (pestaña en segundo plano), la página se libera igual
  let failsafe = 0, running = false;
  function start() {
    if (running || done) return;
    running = true;
    raf = requestAnimationFrame(frame);
    failsafe = setTimeout(() => finish(), 10000);
  }
  // La animación sale siempre; el sonido suena de inmediato si el navegador lo permite
  start();
  if (sound) sound.canAutoplay().then((ok) => { if (ok) sound.enable(); });

  function finish() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(failsafe);
    if (sound) sound.stop();
    ro.disconnect();
    document.removeEventListener("keydown", onKey);
    document.body.classList.remove("intro-lock");
    intro.remove();
    window.dispatchEvent(new Event("resize")); // recoloca indicadores que dependen del tamaño
  }
  function skip() {
    if (done || intro.classList.contains("s-out")) return;
    intro.classList.add("s-out");
    setTimeout(finish, 600);
  }
  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") return skip();                     // Escape salta la intro
    if (sound) sound.enable();                                 // cualquier otra tecla activa el sonido si estaba bloqueado
  }
  intro.querySelector("#introSkip").addEventListener("click", skip);
  document.addEventListener("keydown", onKey);
})();
