/* =====================================================================
   BIOBIM CLIMATE ENGINE
   ---------------------------------------------------------------------
   Un mismo modelo arquitectónico atraviesa seis niveles de lectura:
     01 LUGAR → 02 SOL → 03 VIENTO → 04 TÉRMICO → 05 ACÚSTICA → 06 CFD → SÍNTESIS

   Todo el estado depende de una sola variable de tiempo T ∈ [0, 7):
     parte entera  = herramienta (0–5) o síntesis (6)
     parte decimal = avance dentro de ella: análisis → decisión → nueva geometría
   La geometría es una función continua de T: el edificio nunca se reinicia.

   Modelo CONCEPTUAL e ILUSTRATIVO. La geometría solar es real (Medellín,
   6,25° N, Duffie & Beckman); los campos térmico, acústico y de flujo son
   representaciones didácticas, no resultados de simulación.
   ===================================================================== */
(() => {
  "use strict";

  const root = document.getElementById("engine");
  if (!root) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const TOOLS = Object.fromEntries((window.BIOBIM_TOOLS || []).map((t) => [t.id, t]));
  const ICONS = window.BIOBIM_ICONS || {};
  const PHASES = window.BIOBIM_PHASES || [
    { name: "Prefactibilidad" }, { name: "Idea básica" }, { name: "Anteproyecto" }, { name: "Proyecto" },
  ];

  /* ------------------------------------------------------------------
     Guion pedagógico: una pregunta, qué entra, qué hace, qué sale,
     qué aprendo y la decisión que transforma la geometría.
     ------------------------------------------------------------------ */
  const STEPS = [
    {
      tool: "lugar", short: "Lugar", kicker: "Lectura 01 · Sitio",
      q: "¿Dónde estamos diseñando?",
      in: "Contexto + clima + sitio.",
      does: "Lee las condiciones: norte, trayectoria solar, vecinos, vegetación y viento.",
      out: "Criterios iniciales de diseño.",
      learn: "Antes de diseñar, entendemos dónde estamos.",
      decision: "Ubicar la huella del proyecto con las condiciones del sitio.",
      cycle: ["Sitio", "Sol", "Viento", "Contexto", "Condiciones de diseño"],
      phases: [0], demand: 1, scale: 0,
      legend: "☀ trayectoria solar · ➜ dirección del viento · ▲ norte · ▢ contexto",
    },
    {
      tool: "solar", short: "Sol", kicker: "Lectura 02 · Volumen",
      q: "¿Cómo se relaciona la forma con el sol?",
      in: "Orientación + geometría.",
      does: "Traza la trayectoria solar, la altitud, el azimut y las sombras.",
      out: "Decisiones de orientación y protección.",
      learn: "Cambiar la orientación cambia la relación del edificio con el sol.",
      decision: "Girar el eje largo a oriente-occidente (orientación B).",
      cycle: ["Análisis", "Decisión", "Nueva geometría"],
      phases: [1, 2], demand: 2, scale: 0.2,
      legend: "☀ posición solar · — rayos al volumen · ▨ sombra proyectada · naranja = fachada expuesta",
    },
    {
      tool: "ventilacion", short: "Viento", kicker: "Lectura 03 · Planta",
      q: "¿Por dónde entra y sale el aire?",
      in: "Geometría + dirección del viento.",
      does: "Analiza el recorrido del aire alrededor y a través del volumen.",
      out: "Patrones de flujo: entrada, recorrido y salida.",
      learn: "Qué decisiones de forma favorecen la ventilación natural.",
      decision: "Abrir vanos opuestos y perforar el volumen.",
      cycle: ["Análisis", "Decisión", "Nueva geometría"],
      phases: [1, 2], demand: 3, scale: 0.4,
      legend: "➜ partículas de aire · entrada → flujo → salida · ventilación cruzada",
    },
    {
      tool: "termico", short: "Térmico", kicker: "Lectura 04 · Envolvente",
      q: "¿Cómo responde el espacio al sol y al aire?",
      in: "Envolvente + radiación + ocupantes.",
      does: "Lee en sección la condición térmica del recinto.",
      out: "Estrategias de envolvente y protección solar.",
      learn: "Cada decisión de diseño produce una respuesta ambiental.",
      decision: "Agregar alero en cada piso: antes y después.",
      cycle: ["Análisis", "Decisión", "Nueva geometría"],
      phases: [2, 3], demand: 4, scale: 0.62,
      legend: "▭ sección · ☀ radiación por la ventana · rojo = más cálido, azul = más fresco (ilustrativo)",
    },
    {
      tool: "acustico", short: "Acústica", kicker: "Lectura 05 · Recinto",
      q: "¿Cómo se comporta el sonido en el recinto?",
      in: "Forma del recinto + superficies.",
      does: "Sigue el sonido de la fuente al oyente: reflexión y absorción.",
      out: "Superficies y materiales adecuados al uso.",
      learn: "La forma y las superficies modifican el comportamiento acústico.",
      decision: "Cambiar superficies duras por absorbentes.",
      cycle: ["Análisis", "Decisión", "Nueva geometría"],
      phases: [2, 3], demand: 5, scale: 0.8,
      legend: "◎ ondas desde la fuente · reflexión en superficies duras · absorción en paneles",
    },
    {
      tool: "cfd", short: "CFD", kicker: "Lectura 06 · Simulación",
      q: "¿El espacio crítico ventila como esperamos?",
      in: "Una pregunta concreta + el espacio crítico.",
      does: "Simula el flujo de aire en un volumen de análisis con malla.",
      out: "Zonas de velocidad, recirculaciones y líneas de flujo.",
      learn: "No hay que simular todo: se selecciona, se simula y se interpreta.",
      decision: "Modificar la abertura y volver al modelo.",
      cycle: ["Pregunta", "Seleccionar", "Simular", "Interpretar", "Decisión"],
      phases: [2, 3], demand: 6, scale: 1,
      legend: "▦ volumen de análisis y malla · ➜ vectores y líneas de flujo · ↻ recirculación (ilustrativo)",
    },
    {
      tool: null, short: "Síntesis", kicker: "Seis lecturas · un modelo",
      name: "Síntesis",
      q: "¿Qué cambió en el proyecto?",
      in: "Las seis lecturas sobre el mismo modelo.",
      does: "Combina sitio, sol, viento, condición térmica, acústica y simulación.",
      out: "Un modelo BIM informado por el clima.",
      learn: "Diseñar, analizar, aprender, decidir e iterar.",
      decision: "Volver al modelo y seguir iterando.",
      cycle: ["Diseñar", "Analizar", "Aprender", "Decidir", "Iterar"],
      phases: [0, 1, 2, 3], demand: 0, scale: null,
      legend: "Todas las capas sobre el mismo modelo",
    },
  ];
  const N_TOOLS = 6;
  const N_STEPS = STEPS.length; // 7 (incluye la síntesis)

  /* ------------------------------------------------------------------
     Utilidades
     ------------------------------------------------------------------ */
  const rad = Math.PI / 180;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const seg = (T, a, b) => ease(clamp((T - a) / (b - a)));      // avance suavizado en [a, b]
  const win = (T, a, b, f = 0.05) => Math.min(seg(T, a, a + f), 1 - seg(T, b - f, b)); // ventana con fundidos

  // Sol real (misma formulación que la carta solar del sitio)
  const LAT = 6.25 * rad;
  const decl = (n) => 23.44 * Math.sin((2 * Math.PI / 365) * (284 + n)) * rad;
  function sunAt(n, h) {
    const d = decl(n), H = (h - 12) * 15 * rad;
    const alt = Math.asin(Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.cos(H));
    const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(LAT) - Math.tan(d) * Math.cos(LAT)) + Math.PI;
    return { alt, az, x: Math.sin(az) * Math.cos(alt), y: Math.cos(az) * Math.cos(alt), z: Math.sin(alt) };
  }

  /* ------------------------------------------------------------------
     Canvas, cámara y proyección isométrica (x = este, y = norte, z = arriba)
     ------------------------------------------------------------------ */
  const cv = $("#engCanvas");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, DPR = 1, S0 = 1;
  const cam = { z: 1, x: 0, y: 0, h: 0 };   // h: altura (m) que queda en el centro de la vista
  const CI = Math.cos(Math.PI / 6), SI = 0.5;
  function resize() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    S0 = Math.min(W / 118, H / 78);
  }
  new ResizeObserver(resize).observe(cv);
  const scale = () => S0 * cam.z;
  const P = (x, y, z = 0) => {
    const s = scale(), X = x - cam.x, Y = y - cam.y;
    return [W / 2 + (X + Y) * CI * s, H * 0.6 + ((X - Y) * SI - (z - cam.h)) * s];
  };
  // Transformación afín para dibujar en un plano vertical x = x0 (coordenadas: s = y, z)
  function planeX(x0) {
    const o = P(x0, 0, 0), u = P(x0, 1, 0), v = P(x0, 0, 1);
    ctx.setTransform(DPR * (u[0] - o[0]), DPR * (u[1] - o[1]), DPR * (v[0] - o[0]), DPR * (v[1] - o[1]), DPR * o[0], DPR * o[1]);
  }
  // Plano horizontal z = z0 (coordenadas: x, y)
  function planeZ(z0) {
    const o = P(0, 0, z0), u = P(1, 0, z0), v = P(0, 1, z0);
    ctx.setTransform(DPR * (u[0] - o[0]), DPR * (u[1] - o[1]), DPR * (v[0] - o[0]), DPR * (v[1] - o[1]), DPR * o[0], DPR * o[1]);
  }
  const screen = () => ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  /* ------------------------------------------------------------------
     Paleta (sigue el tema claro / oscuro del sitio)
     ------------------------------------------------------------------ */
  const hexRgb = (h) => {
    h = h.trim().replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return Number.isNaN(n) ? [200, 200, 200] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  let pal;
  function palette() {
    const cs = getComputedStyle(document.documentElement);
    const v = (n, d) => hexRgb(cs.getPropertyValue(n) || d);
    const light = document.documentElement.dataset.theme === "light";
    pal = {
      light,
      sun: v("--sun", "#ffb547"), wind: v("--wind", "#4fd1e8"), heat: v("--heat", "#ff6b5b"),
      sound: v("--sound", "#b58cff"), flow: v("--flow", "#5b8cff"), leaf: v("--leaf", "#6fcf8e"),
      text: v("--text", "#e8f1ec"), muted: v("--muted", "#93a79d"), bg: v("--bg", "#0b1512"),
      base: light ? [246, 243, 234] : [212, 222, 216],
      ctx: light ? [214, 210, 198] : [120, 136, 128],
      ground: light ? [20, 50, 40] : [220, 240, 230],
      shadow: light ? "rgba(20,40,30,0.2)" : "rgba(0,0,0,0.4)",
      edge: light ? "rgba(20,40,30,0.4)" : "rgba(8,16,12,0.6)",
    };
  }
  palette();
  new MutationObserver(palette).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ------------------------------------------------------------------
     Primitivas de dibujo
     ------------------------------------------------------------------ */
  function poly(pts, fill, stroke, lw = 0.8) {
    if (!pts.length) return;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }
  function line(a, b, stroke, lw = 1, dash) {
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
    ctx.strokeStyle = stroke; ctx.lineWidth = lw;
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    if (dash) ctx.setLineDash([]);
  }
  function arrowHead(a, b, color, size = 6) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    ctx.beginPath(); ctx.moveTo(b[0], b[1]);
    ctx.lineTo(b[0] - size * Math.cos(ang - 0.5), b[1] - size * Math.sin(ang - 0.5));
    ctx.lineTo(b[0] - size * Math.cos(ang + 0.5), b[1] - size * Math.sin(ang + 0.5));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  function hull(pts) {
    pts = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of pts.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  const inPoly = (pt, vs) => {
    let ins = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const [xi, yi] = vs[i], [xj, yj] = vs[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };

  // Etiquetas (se dibujan al final, siempre legibles)
  let labels = [];
  const label = (pt, text, color, a = 1, dx = 14, dy = -18) => { if (a > 0.02) labels.push({ pt, text, color, a, dx, dy }); };
  function drawLabels() {
    screen();
    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.textBaseline = "middle";
    for (const L of labels) {
      const [x, y] = L.pt, tx = x + L.dx, ty = y + L.dy;
      const w = ctx.measureText(L.text).width + 12;
      ctx.globalAlpha = L.a;
      line([x, y], [tx, ty], rgba(L.color, 0.8), 1);
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fillStyle = rgba(L.color); ctx.fill();
      // La etiqueta nunca se sale del lienzo (importante en pantallas angostas)
      const bx = clamp(L.dx >= 0 ? tx : tx - w, 6, W - w - 6);
      ctx.fillStyle = rgba(pal.bg, 0.86);
      ctx.strokeStyle = rgba(L.color, 0.7); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, ty - 9, w, 18, 5) : ctx.rect(bx, ty - 9, w, 18);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba(L.color); ctx.textAlign = "left";
      ctx.fillText(L.text, bx + 6, ty + 0.5);
    }
    ctx.globalAlpha = 1;
    labels = [];
  }

  /* ------------------------------------------------------------------
     Geometría continua: el mismo edificio evoluciona con T
     ------------------------------------------------------------------ */
  const B_L = 30, B_D = 12, B_H = 9, FLOOR = 3, GAP_MAX = 4;
  const NEIGHBORS = [[-27, 24, 9, 8, 10], [25, 25, 10, 8, 15], [-26, -24, 8, 10, 7], [27, -22, 9, 9, 11], [2, 31, 14, 5, 6]];
  const TREES = [[-14, 21], [-8, 25], [12, -23], [17, -27], [-31, 6], [32, 4], [-18, -27], [9, 27], [-33, -8]];

  function geomAt(T) {
    const g = {};
    g.foot = seg(T, 0.78, 0.92);                       // 01 · decisión: huella del proyecto
    g.h = B_H * seg(T, 1.0, 1.16);                      // 02 · aparece el volumen
    g.theta = 90 - 90 * seg(T, 1.5, 1.72);             // 02 · decisión: orientación A → B
    g.ghost = win(T, 1.38, 1.98, 0.06);                 // 02 · comparación A vs B
    g.open = seg(T, 2.46, 2.58);                        // 03 · decisión: aberturas
    g.gap = GAP_MAX * seg(T, 2.56, 2.74);               // 03 · decisión: perforación
    g.over = seg(T, 3.5, 3.66);                         // 04 · decisión: alero por piso
    g.absorb = seg(T, 4.5, 4.62);                       // 05 · decisión: superficies absorbentes
    g.section = T >= 3 && T < 5.05 ? seg(T, 3.02, 3.14) * (1 - seg(T, 4.93, 5.03)) : 0;
    let a = 1;
    a = lerp(a, 0.3, seg(T, 3.0, 3.12));
    a = lerp(a, 0.14, seg(T, 5.0, 5.1));
    a = lerp(a, 1, seg(T, 6.0, 6.12));
    g.alpha = a;
    g.cfdOpen = seg(T, 5.72, 5.84);                     // 06 · decisión: abertura modificada
    return g;
  }
  // Bloques del edificio (con perforación central)
  function blocks(g) {
    const th = g.theta * rad, a = [Math.cos(th), Math.sin(th)], b = [-Math.sin(th), Math.cos(th)];
    if (g.gap < 0.25) return { a, b, list: [{ u: 0, L: B_L }] };
    const Lb = (B_L - g.gap) / 2, u = g.gap / 2 + Lb / 2;
    return { a, b, Lb, list: [{ u: -u, L: Lb }, { u, L: Lb, east: true }] };
  }
  const EAST = { x: (GAP_MAX / 2 + (B_L - GAP_MAX) / 4), Lb: (B_L - GAP_MAX) / 2 }; // bloque oriente en su estado final

  /* ------------------------------------------------------------------
     Caja genérica (vecinos y bloques del edificio)
     ------------------------------------------------------------------ */
  function boxGeom(cx, cy, L, D, Hh, a, b, z0 = 0) {
    const c = (sx, sy) => [cx + a[0] * sx * L / 2 + b[0] * sy * D / 2, cy + a[1] * sx * L / 2 + b[1] * sy * D / 2];
    const g = [c(-1, -1), c(1, -1), c(1, 1), c(-1, 1)];
    return {
      cx, cy, L, D, H: Hh, z0, a, b, g,
      faces: [
        { p: [g[1], g[2]], n: a, len: D, long: false },
        { p: [g[3], g[0]], n: [-a[0], -a[1]], len: D, long: false },
        { p: [g[2], g[3]], n: b, len: L, long: true },
        { p: [g[0], g[1]], n: [-b[0], -b[1]], len: L, long: true },
      ],
    };
  }
  function shadowOf(bx, sun, alpha) {
    if (sun.alt < 0.05 || bx.H < 0.3 || alpha < 0.02) return;
    const k = bx.H / Math.max(Math.tan(sun.alt), 0.15), hx = sun.x / Math.cos(sun.alt), hy = sun.y / Math.cos(sun.alt);
    const pts = [];
    for (const v of bx.g) { pts.push(P(v[0], v[1], bx.z0)); pts.push(P(v[0] - hx * k, v[1] - hy * k, 0)); }
    ctx.globalAlpha = alpha;
    poly(hull(pts), pal.shadow);
    ctx.globalAlpha = 1;
  }
  // Dibuja una caja; o = { base, alpha, sun, heat, detail, g, wire, hl }
  function drawBox(bx, o) {
    const sunUp = o.sun && o.sun.alt > 0.02;
    const z0 = bx.z0, z1 = bx.z0 + bx.H;
    if (bx.H < 0.05) return null;
    for (const f of bx.faces) {
      if (f.n[0] - f.n[1] <= 0) continue; // cara oculta al observador
      const inc = sunUp ? Math.max(0, o.sun.x * f.n[0] + o.sun.y * f.n[1]) : 0;
      let col = mix(o.base, [o.base[0] * 0.62, o.base[1] * 0.62, o.base[2] * 0.62], 1 - (0.55 + 0.45 * inc));
      if (o.heat) col = mix(col, pal.heat, clamp(inc * o.heat * (o.g ? 1 - 0.7 * o.g.over * (f.long ? 1 : 0.4) : 1)));
      if (o.hl) col = mix(col, o.hl, 0.35);
      const [A, B] = f.p;
      ctx.globalAlpha = o.alpha;
      poly([P(A[0], A[1], z0), P(B[0], B[1], z0), P(B[0], B[1], z1), P(A[0], A[1], z1)], rgba(col), pal.edge);
      if (o.detail && o.g) facadeDetail(bx, f, o.g, o.alpha);
    }
    const roofInc = sunUp ? o.sun.z : 0;
    let rc = mix(o.base, [255, 255, 255], 0.08 * roofInc);
    if (o.heat) rc = mix(rc, pal.heat, roofInc * 0.22 * o.heat);
    if (o.hl) rc = mix(rc, o.hl, 0.35);
    ctx.globalAlpha = o.alpha;
    poly(bx.g.map((v) => P(v[0], v[1], z1)), rgba(rc), pal.edge);
    ctx.globalAlpha = 1;
    if (o.wire) {
      ctx.globalAlpha = o.wire;
      const e = rgba(o.hl || pal.muted, 0.9);
      for (let i = 0; i < 4; i++) {
        const A = bx.g[i], B = bx.g[(i + 1) % 4];
        line(P(A[0], A[1], z0), P(B[0], B[1], z0), e, 1);
        line(P(A[0], A[1], z1), P(B[0], B[1], z1), e, 1);
        line(P(A[0], A[1], z0), P(A[0], A[1], z1), e, 1);
      }
      ctx.globalAlpha = 1;
    }
    const sil = [];
    for (const v of bx.g) { sil.push(P(v[0], v[1], z0)); sil.push(P(v[0], v[1], z1)); }
    return { poly: hull(sil), depth: bx.cx - bx.cy };
  }
  // Pisos, ventanas y aleros en las fachadas visibles del edificio
  function facadeDetail(bx, f, g, alpha) {
    const [A, B] = f.p;
    const at = (t, z, off = 0) => P(A[0] + (B[0] - A[0]) * t + f.n[0] * off, A[1] + (B[1] - A[1]) * t + f.n[1] * off, z);
    ctx.globalAlpha = alpha * 0.5;
    for (let z = FLOOR; z < bx.H - 0.1; z += FLOOR) line(at(0, z), at(1, z), pal.edge, 0.6);
    ctx.globalAlpha = alpha;
    if (f.long && g.open > 0.02) {
      const nwin = Math.max(2, Math.round(f.len / 7));
      for (let fl = 0; fl < bx.H / FLOOR - 0.01; fl++) {
        for (let k = 0; k < nwin; k++) {
          const tc = (k + 0.5) / nwin, hw = (1.1 / f.len) * g.open;
          const z0 = fl * FLOOR + 0.9, z1 = fl * FLOOR + 2.3;
          poly([at(tc - hw, z0, 0.02), at(tc + hw, z0, 0.02), at(tc + hw, z1, 0.02), at(tc - hw, z1, 0.02)],
            rgba(pal.light ? [40, 70, 90] : [20, 40, 50], 0.85 * g.open));
        }
      }
    }
    if (f.long && g.over > 0.02) {
      for (let z = FLOOR; z <= bx.H + 0.01; z += FLOOR) {
        const off = 1.2 * g.over;
        poly([at(0, z), at(1, z), at(1, z, off), at(0, z, off)], rgba(pal.light ? [255, 255, 255] : [236, 244, 240], 0.9), pal.edge, 0.6);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------
     Capas del sitio
     ------------------------------------------------------------------ */
  function drawGround(a, contours) {
    const R = 40;
    const plate = [P(-R, -R), P(R, -R), P(R, R), P(-R, R)];
    ctx.globalAlpha = a;
    poly(plate, rgba(pal.ground, pal.light ? 0.05 : 0.035), rgba(pal.ground, 0.12));
    if (contours > 0.01) {
      ctx.globalAlpha = a * contours;
      for (let i = 1; i <= 7; i++) {
        const pts = [];
        for (let k = 0; k <= 40; k++) {
          const t = (k / 40) * Math.PI * 2, r = 10 + i * 4.2 + Math.sin(t * 3 + i) * 1.6;
          const x = -8 + Math.cos(t) * r * 1.15, y = 6 + Math.sin(t) * r;
          if (Math.abs(x) < R && Math.abs(y) < R) pts.push(P(x, y));
        }
        ctx.beginPath();
        pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = rgba(pal.ground, 0.14); ctx.lineWidth = 1; ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function drawNorth(a) {
    if (a < 0.02) return;
    ctx.globalAlpha = a;
    const p0 = P(36, -14), p1 = P(36, -6);
    line(p0, p1, rgba(pal.sun), 2); arrowHead(p0, p1, rgba(pal.sun), 7);
    ctx.font = "700 11px 'JetBrains Mono', monospace"; ctx.fillStyle = rgba(pal.sun); ctx.textAlign = "center";
    const t = P(36, -2.5); ctx.fillText("N", t[0], t[1]);
    ctx.globalAlpha = 1;
  }
  function drawTree(x, y, a, sun) {
    const top = P(x, y, 4.2), base = P(x, y, 0), r = 2.3 * scale();
    ctx.globalAlpha = a;
    if (sun && sun.alt > 0.05) {
      const k = 4 / Math.max(Math.tan(sun.alt), 0.2);
      const s = P(x - sun.x / Math.cos(sun.alt) * k, y - sun.y / Math.cos(sun.alt) * k, 0);
      ctx.beginPath(); ctx.ellipse(s[0], s[1], r * 0.95, r * 0.5, 0, 0, Math.PI * 2); ctx.fillStyle = pal.shadow; ctx.fill();
    }
    line(base, top, rgba(pal.muted, 0.7), 1.4);
    ctx.beginPath(); ctx.arc(top[0], top[1], r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(pal.leaf, pal.light ? 0.55 : 0.42); ctx.fill();
    ctx.strokeStyle = rgba(pal.leaf, 0.8); ctx.lineWidth = 1; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function sunPoint(sun, R = 44) { return P(sun.x * R, sun.y * R, Math.max(0, sun.z) * R * 0.85); }
  function drawSunArc(a, day) {
    if (a < 0.02) return;
    ctx.globalAlpha = a;
    ctx.beginPath();
    let first = true;
    for (let h = 5.8; h <= 18.2; h += 0.2) {
      const s = sunAt(day, h);
      if (s.alt < 0) continue;
      const p = sunPoint(s);
      if (first) { ctx.moveTo(p[0], p[1]); first = false; } else ctx.lineTo(p[0], p[1]);
    }
    ctx.strokeStyle = rgba(pal.sun, 0.75); ctx.lineWidth = 1.4; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  function drawSunGlyph(sun, a) {
    if (a < 0.02 || sun.alt <= 0) return;
    const [x, y] = sunPoint(sun);
    ctx.globalAlpha = a;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, 24);
    gr.addColorStop(0, rgba(pal.sun, 0.75)); gr.addColorStop(1, rgba(pal.sun, 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba(pal.sun); ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  function drawWindVectors(a, t, flow) {
    if (a < 0.02) return;
    ctx.globalAlpha = a;
    for (let x = -30; x <= 30; x += 10) {
      for (let y = -30; y <= 30; y += 10) {
        const w = Math.sin(t * 1.3 + x * 0.2 + y * 0.15) * 0.35;
        const d = [flow[0] + w * flow[1], flow[1] - w * flow[0]];
        const L = 3.2 + Math.sin(t * 2 + x + y) * 0.6;
        const p0 = P(x - d[0] * L / 2, y - d[1] * L / 2, 0.5), p1 = P(x + d[0] * L / 2, y + d[1] * L / 2, 0.5);
        line(p0, p1, rgba(pal.wind, 0.8), 1.4); arrowHead(p0, p1, rgba(pal.wind, 0.9), 5);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------
     Viento: partículas que rodean, atraviesan vanos y la perforación
     ------------------------------------------------------------------ */
  const FLOW = [0, -1];               // viento desde el norte, hacia el sur
  const WIND_R = 38;
  const PARTS = Array.from({ length: 170 }, () => ({ x: 0, y: 0, tr: [], v: 1 }));
  function spawn(p, anywhere) {
    const q = [FLOW[1], -FLOW[0]], s = (Math.random() * 2 - 1) * WIND_R;
    const back = anywhere ? (Math.random() * 2 - 1) * WIND_R : -WIND_R;
    p.x = FLOW[0] * back + q[0] * s; p.y = FLOW[1] * back + q[1] * s; p.tr = []; p.v = 0.8 + Math.random() * 0.4;
  }
  PARTS.forEach((p) => spawn(p, true));
  function stepWind(dt, bl, g) {
    const V = 18;
    for (const p of PARTS) {
      let sp = V * p.v;
      p.x += FLOW[0] * sp * dt; p.y += FLOW[1] * sp * dt;
      for (const k of bl.list) {
        const c = [bl.a[0] * k.u, bl.a[1] * k.u];
        const dx = p.x - c[0], dy = p.y - c[1];
        let la = dx * bl.a[0] + dy * bl.a[1], lb = dx * bl.b[0] + dy * bl.b[1];
        const hl = k.L / 2 + 1, hd = B_D / 2 + 1;
        if (Math.abs(la) < hl && Math.abs(lb) < hd) {
          // ¿pasa por un vano? (ventilación cruzada cuando hay aberturas opuestas)
          const nwin = Math.max(2, Math.round(k.L / 7));
          const col = ((la + k.L / 2) / k.L) * nwin;
          const inWin = g.open > 0.5 && Math.abs(col - Math.floor(col) - 0.5) < 0.22 && Math.abs(bl.b[1]) > 0.6;
          if (inWin) { p.inside = true; continue; }
          const px = hl - Math.abs(la), py = hd - Math.abs(lb), slide = V * dt * 0.9;
          if (px < py) { la = Math.sign(la || 1) * hl; lb += Math.sign(lb || 1) * slide; }
          else { lb = Math.sign(lb || 1) * hd; la += Math.sign(la || 1) * slide; }
          p.x = c[0] + bl.a[0] * la + bl.b[0] * lb;
          p.y = c[1] + bl.a[1] * la + bl.b[1] * lb;
        }
      }
      p.tr.push([p.x, p.y]);
      if (p.tr.length > 14) p.tr.shift();
      if (p.x * p.x + p.y * p.y > (WIND_R + 4) ** 2 && p.x * FLOW[0] + p.y * FLOW[1] > 0) spawn(p, false);
    }
  }
  function drawWind(a, sils) {
    if (a < 0.02) return;
    ctx.lineCap = "round";
    for (const p of PARTS) {
      if (p.tr.length < 2) continue;
      const depth = p.x - p.y;
      ctx.beginPath();
      let n = 0;
      for (const [x, y] of p.tr) {
        const sp = P(x, y, 1.6);
        if (sils.some((s) => depth < s.depth && inPoly(sp, s.poly))) { n = 0; continue; }
        if (n++) ctx.lineTo(sp[0], sp[1]); else ctx.moveTo(sp[0], sp[1]);
      }
      ctx.globalAlpha = a * (0.45 + 0.4 * p.v);
      ctx.strokeStyle = rgba(pal.wind); ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------------
     04 Térmico y 05 Acústica: sección por el bloque oriente (plano x = EAST.x)
     Coordenadas del plano: s = norte (m), z = altura (m). Recinto: piso 2 (z 3–6).
     ------------------------------------------------------------------ */
  const RS = { s0: -B_D / 2, s1: B_D / 2, z0: FLOOR, z1: 2 * FLOOR };
  const WIN_S = { z0: 3.9, z1: 5.5 };   // ventana sur
  const WIN_N = { z0: 4.4, z1: 5.5 };   // ventana norte
  function sectionFrame(a) {
    planeX(EAST.x);
    ctx.globalAlpha = a;
    // Corte del bloque completo (3 pisos) y recinto resaltado
    ctx.fillStyle = rgba(pal.bg, pal.light ? 0.7 : 0.78);
    ctx.fillRect(RS.s0, 0, B_D, B_H);
    ctx.lineWidth = 0.14; ctx.strokeStyle = rgba(pal.text, 0.8);
    for (let z = 0; z <= B_H + 0.01; z += FLOOR) { ctx.beginPath(); ctx.moveTo(RS.s0, z); ctx.lineTo(RS.s1, z); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(RS.s0, 0); ctx.lineTo(RS.s0, B_H); ctx.moveTo(RS.s1, 0); ctx.lineTo(RS.s1, B_H); ctx.stroke();
    ctx.globalAlpha = 1;
    screen();
  }
  // Rayos solares que entran por la ventana sur, con y sin alero
  function thermal(a, g, t) {
    if (a < 0.02) return;
    const sun = sunAt(355, 10.5);                         // 21 dic, media mañana: sol bajo del sur
    const ds = -sun.y, dz = -sun.z;                       // dirección del rayo en el plano (hacia +s y abajo)
    const nrm = Math.hypot(ds, dz), us = ds / nrm, uz = dz / nrm;
    const over = 1.2 * g.over;
    let lit = 0, sMin = Infinity, sMax = -Infinity, nRays = 7;
    const rays = [];
    for (let i = 0; i < nRays; i++) {
      const zw = lerp(WIN_S.z0 + 0.1, WIN_S.z1 - 0.1, i / (nRays - 1));
      // retroceder hasta el plano del alero (z = 6)
      const tb = (RS.z1 - zw) / -uz, sAtOver = RS.s0 - us * tb;
      const blocked = over > 0.02 && sAtOver > RS.s0 - over;
      const tf = (zw - RS.z0) / -uz, sFloor = RS.s0 + us * tf;
      const start = [RS.s0 - us * 9, zw - uz * 9];
      rays.push({ zw, blocked, sFloor, start });
      if (!blocked) { lit++; sMin = Math.min(sMin, sFloor); sMax = Math.max(sMax, sFloor); }
    }
    const I = lit / nRays;                                 // fracción de radiación que entra (geométrica)
    planeX(EAST.x);
    ctx.globalAlpha = a;
    // Campo térmico abstracto
    const gr = ctx.createLinearGradient(RS.s0, 0, RS.s1, 0);
    gr.addColorStop(0, rgba(pal.heat, 0.18 + 0.6 * I));
    gr.addColorStop(0.55, rgba(pal.heat, 0.08 + 0.3 * I));
    gr.addColorStop(1, rgba(pal.wind, 0.32));
    ctx.fillStyle = gr; ctx.fillRect(RS.s0, RS.z0, B_D, FLOOR);
    if (lit) {
      const pw = 0.12 + 0.06 * Math.sin(t * 3);
      ctx.fillStyle = rgba(pal.sun, 0.55 + pw); ctx.fillRect(Math.max(RS.s0, sMin - 0.2), RS.z0, Math.min(RS.s1, sMax + 0.2) - Math.max(RS.s0, sMin - 0.2), 0.18);
    }
    // Ventanas
    ctx.fillStyle = rgba(pal.wind, 0.5);
    ctx.fillRect(RS.s0 - 0.12, WIN_S.z0, 0.24, WIN_S.z1 - WIN_S.z0);
    ctx.fillRect(RS.s1 - 0.12, WIN_N.z0, 0.24, WIN_N.z1 - WIN_N.z0);
    // Aleros (decisión)
    if (over > 0.02) {
      ctx.fillStyle = rgba(pal.text, 0.9);
      for (let z = FLOOR; z <= B_H + 0.01; z += FLOOR) ctx.fillRect(RS.s0 - over, z - 0.09, over, 0.18);
    }
    // Rayos (animados como pulsos)
    ctx.lineWidth = 0.08; ctx.lineCap = "round";
    for (const r of rays) {
      ctx.strokeStyle = rgba(pal.sun, r.blocked ? 0.22 : 0.9);
      ctx.setLineDash(r.blocked ? [0.25, 0.3] : []);
      ctx.beginPath(); ctx.moveTo(r.start[0], r.start[1]);
      if (r.blocked) {
        const tb = (RS.z1 - r.start[1]) / -uz;
        ctx.lineTo(r.start[0] + us * tb, RS.z1 + 0.1);
      } else { ctx.lineTo(RS.s0, r.zw); ctx.lineTo(r.sFloor, RS.z0); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // Ocupante
    const ox = 1.8;
    ctx.strokeStyle = rgba(pal.text, 0.9); ctx.lineWidth = 0.12;
    ctx.beginPath(); ctx.moveTo(ox, RS.z0); ctx.lineTo(ox, RS.z0 + 1.1); ctx.stroke();
    ctx.beginPath(); ctx.arc(ox, RS.z0 + 1.38, 0.24, 0, Math.PI * 2); ctx.fillStyle = rgba(pal.text, 0.9); ctx.fill();
    // Aire que entra por la ventana norte (ventilación cruzada del paso 03)
    ctx.strokeStyle = rgba(pal.wind, 0.85); ctx.lineWidth = 0.09;
    for (let k = 0; k < 3; k++) {
      const ph = ((t * 0.35 + k / 3) % 1), sx = lerp(RS.s1, RS.s0 + 0.6, ph), zz = 4.9 + Math.sin(ph * Math.PI * 2 + k) * 0.25;
      ctx.beginPath(); ctx.moveTo(sx + 0.9, zz); ctx.lineTo(sx, zz); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    screen();
    // Etiquetas
    const P3 = (s, z) => P(EAST.x, s, z);
    label(P3(RS.s0 - 2.4, WIN_S.z1 + 1.2), "RADIACIÓN SOLAR", pal.sun, a, -14, -20);
    label(P3(1.8, RS.z0 + 1.4), "OCUPANTE", pal.text, a * 0.9, 16, -16);
    label(P3(RS.s1 - 0.5, 5), "AIRE", pal.wind, a * 0.9, 16, 12);
    label(P3(RS.s0 + 0.6, RS.z0 + 0.1), g.over > 0.5 ? "DESPUÉS · CON ALERO" : "ANTES · SIN PROTECCIÓN", g.over > 0.5 ? pal.wind : pal.heat, a, -12, 26);
    return I;
  }
  // Ondas sonoras: directas, reflejadas (fuentes imagen) y absorbidas
  function acoustic(a, g, t, soft, labels = true) {
    if (a < 0.02) return;
    const src = [-3.2, RS.z0 + 1.5], lst = [3.4, RS.z0 + 1.3];
    const refl = lerp(0.62, 0.12, soft);                 // coeficiente de reflexión (ilustrativo)
    const images = [
      [src[0], 2 * RS.z1 - src[1]], [src[0], 2 * RS.z0 - src[1]],
      [2 * RS.s0 - src[0], src[1]], [2 * RS.s1 - src[0], src[1]],
    ];
    planeX(EAST.x);
    ctx.globalAlpha = a;
    ctx.save();
    ctx.beginPath(); ctx.rect(RS.s0, RS.z0, B_D, FLOOR); ctx.clip();
    ctx.fillStyle = rgba(pal.sound, 0.08); ctx.fillRect(RS.s0, RS.z0, B_D, FLOOR);
    const ring = (c, r, alpha) => { ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, Math.PI * 2); ctx.strokeStyle = rgba(pal.sound, alpha); ctx.stroke(); };
    ctx.lineWidth = 0.09;
    for (let k = 0; k < 5; k++) {
      const r = ((t * 2.6 + k * 1.9) % 9.5) + 0.2, fade = 1 - r / 9.5;
      ring(src, r, 0.85 * fade);
      for (const im of images) {
        const d = Math.hypot(im[0] - src[0], im[1] - src[1]);
        if (r > d / 2) ring(im, r, refl * fade * 0.9);
      }
    }
    ctx.restore();
    // Paneles absorbentes (decisión)
    if (soft > 0.02) {
      ctx.fillStyle = rgba(pal.sound, 0.75 * soft);
      ctx.fillRect(RS.s0 + 0.6, RS.z1 - 0.28, B_D - 1.2, 0.28);
      ctx.fillRect(RS.s1 - 0.28, RS.z0 + 0.8, 0.28, 1.6);
      ctx.fillRect(RS.s0, RS.z0 + 0.8, 0.28, 1.2);
    }
    // Fuente y oyente
    const person = (p, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = 0.12;
      ctx.beginPath(); ctx.moveTo(p[0], RS.z0); ctx.lineTo(p[0], p[1] - 0.3); ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 0.24, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    };
    person(src, rgba(pal.sound)); person(lst, rgba(pal.text, 0.9));
    ctx.globalAlpha = 1;
    screen();
    if (!labels) return;
    const P3 = (s, z) => P(EAST.x, s, z);
    label(P3(src[0], src[1] + 0.4), "FUENTE", pal.sound, a, -12, -22);
    label(P3(0, RS.z1 - 0.1), soft > 0.5 ? "ABSORCIÓN" : "REFLEXIÓN", soft > 0.5 ? pal.leaf : pal.sound, a, 14, -22);
    label(P3(lst[0], lst[1] + 0.4), "OYENTE", pal.text, a, 16, -14);
    label(P3(RS.s0 + 0.4, RS.z0 + 0.2), soft > 0.5 ? "SUPERFICIES ABSORBENTES" : "SUPERFICIES DURAS", soft > 0.5 ? pal.leaf : pal.heat, a, -12, 26);
  }

  /* ------------------------------------------------------------------
     06 CFD conceptual: volumen de análisis en el recinto crítico
     Campo de velocidades por superposición (fuente + sumidero + vórtice):
     representación didáctica, no una solución de las ecuaciones de flujo.
     ------------------------------------------------------------------ */
  const BOX = { x0: EAST.x - EAST.Lb / 2, x1: EAST.x + EAST.Lb / 2, y0: -B_D / 2, y1: B_D / 2, z0: FLOOR, z1: 2 * FLOOR, zc: 4.3 };
  function field(k) {
    return {
      xi: lerp(EAST.x - 2.8, EAST.x - 1.4, k),     // entrada (fachada norte)
      xo: lerp(EAST.x + 4, EAST.x - 1.0, k),       // salida (fachada sur): se reubica y amplía
      m: lerp(5.5, 7.5, k),
      vx: EAST.x - 4.1, vy: -3.2, G: lerp(10, 1.5, k),
    };
  }
  function vel(x, y, F) {
    let u = 0, v = 0;
    let dx = x - F.xi, dy = y - (BOX.y1 + 0.5), r2 = dx * dx + dy * dy + 0.35;
    u += (F.m * dx) / r2; v += (F.m * dy) / r2;
    dx = x - F.xo; dy = y - (BOX.y0 - 0.5); r2 = dx * dx + dy * dy + 0.35;
    u -= (F.m * dx) / r2; v -= (F.m * dy) / r2;
    dx = x - F.vx; dy = y - F.vy; r2 = dx * dx + dy * dy + 0.9;
    u += (F.G * -dy) / r2; v += (F.G * dx) / r2;
    const m = 0.7;                                     // amortiguación en muros laterales
    if (x - BOX.x0 < m && u < 0) u *= (x - BOX.x0) / m;
    if (BOX.x1 - x < m && u > 0) u *= (BOX.x1 - x) / m;
    return [u, v];
  }
  const inBox = (x, y) => x > BOX.x0 && x < BOX.x1 && y > BOX.y0 && y < BOX.y1;
  function streamlines(F) {
    const seeds = [];
    for (let i = 0; i < 7; i++) seeds.push([F.xi - 1.4 + (i / 6) * 2.8, BOX.y1 - 0.15]);
    for (const r of [1.1, 1.9, 2.6]) seeds.push([F.vx + r, F.vy]);
    return seeds.map(([x, y]) => {
      const pts = [[x, y]];
      for (let n = 0; n < 240; n++) {
        const [u, v] = vel(x, y, F), s = Math.hypot(u, v) || 1, h = 0.14;
        const [u2, v2] = vel(x + (u / s) * h * 0.5, y + (v / s) * h * 0.5, F), s2 = Math.hypot(u2, v2) || 1;
        x += (u2 / s2) * h; y += (v2 / s2) * h;
        if (!inBox(x, y)) break;
        pts.push([x, y, s2]);
      }
      return pts;
    });
  }
  const speedCol = (s) => (s < 0.5 ? mix(pal.flow, pal.wind, s * 2) : mix(pal.wind, pal.light ? [10, 50, 110] : [255, 255, 255], (s - 0.5) * 1.4));
  const CFD_PARTS = Array.from({ length: 70 }, () => ({ x: 0, y: 0, age: 0 }));
  const cfdSpawn = (p, F) => { p.x = F.xi + (Math.random() - 0.5) * 2.4; p.y = BOX.y1 - 0.2; p.age = Math.random() * 4; };
  let lastK = -1, lines = [];
  function cfd(T, t, dt) {
    const sel = seg(T, 5.0, 5.12), boxA = seg(T, 5.32, 5.42), mesh = seg(T, 5.36, 5.5), sim = seg(T, 5.42, 5.6);
    const k = seg(T, 5.72, 5.84), fin = 1 - seg(T, 5.93, 6.05);
    const F = field(k);
    if (Math.abs(k - lastK) > 0.02 || !lines.length) { lines = streamlines(F); lastK = k; }
    const aBox = boxA * fin;
    if (aBox > 0.02) {
      // Volumen de análisis y malla conceptual
      const c = (x, y, z) => P(x, y, z);
      ctx.globalAlpha = aBox;
      const e = rgba(pal.flow, 0.95);
      const X = [BOX.x0, BOX.x1], Y = [BOX.y0, BOX.y1], Z = [BOX.z0, BOX.z1];
      for (const z of Z) { line(c(X[0], Y[0], z), c(X[1], Y[0], z), e, 1.2); line(c(X[1], Y[0], z), c(X[1], Y[1], z), e, 1.2); line(c(X[1], Y[1], z), c(X[0], Y[1], z), e, 1.2); line(c(X[0], Y[1], z), c(X[0], Y[0], z), e, 1.2); }
      for (const x of X) for (const y of Y) line(c(x, y, Z[0]), c(x, y, Z[1]), e, 1.2);
      ctx.globalAlpha = aBox * mesh * 0.5;
      const mc = rgba(pal.flow, 0.7);
      for (let x = BOX.x0; x <= BOX.x1 + 0.01; x += 1) line(c(x, BOX.y0, BOX.z0), c(x, BOX.y1, BOX.z0), mc, 0.6);
      for (let y = BOX.y0; y <= BOX.y1 + 0.01; y += 1) line(c(BOX.x0, y, BOX.z0), c(BOX.x1, y, BOX.z0), mc, 0.6);
      for (let z = BOX.z0; z <= BOX.z1 + 0.01; z += 1) line(c(BOX.x0, BOX.y1, z), c(BOX.x1, BOX.y1, z), mc, 0.6);
      for (let x = BOX.x0; x <= BOX.x1 + 0.01; x += 1) line(c(x, BOX.y1, BOX.z0), c(x, BOX.y1, BOX.z1), mc, 0.6);
      ctx.globalAlpha = 1;
      // Aberturas de entrada y salida
      const wo = lerp(1.4, 2.4, k);
      ctx.globalAlpha = aBox;
      line(c(F.xi - 1.4, BOX.y1, BOX.zc), c(F.xi + 1.4, BOX.y1, BOX.zc), rgba(pal.wind), 4);
      line(c(F.xo - wo, BOX.y0, BOX.zc), c(F.xo + wo, BOX.y0, BOX.zc), rgba(k > 0.5 ? pal.leaf : pal.wind), 4);
      ctx.globalAlpha = 1;
    }
    const aSim = sim * fin;
    if (aSim > 0.02) {
      planeZ(BOX.zc);
      // Vectores
      ctx.globalAlpha = aSim * 0.8;
      for (let x = BOX.x0 + 0.7; x < BOX.x1; x += 1.3) {
        for (let y = BOX.y0 + 0.7; y < BOX.y1; y += 1.3) {
          const [u, v] = vel(x, y, F), s = Math.hypot(u, v), sn = clamp(s / 3.2);
          const L = 0.25 + sn * 0.7;
          ctx.strokeStyle = rgba(speedCol(sn)); ctx.lineWidth = 0.07;
          ctx.beginPath(); ctx.moveTo(x - (u / s) * L / 2, y - (v / s) * L / 2); ctx.lineTo(x + (u / s) * L / 2, y + (v / s) * L / 2); ctx.stroke();
        }
      }
      // Líneas de flujo (se dibujan progresivamente)
      ctx.lineWidth = 0.09; ctx.lineCap = "round";
      for (const pts of lines) {
        const n = Math.floor(pts.length * clamp(sim * 1.1));
        for (let i = 1; i < n; i++) {
          ctx.globalAlpha = aSim;
          ctx.strokeStyle = rgba(speedCol(clamp((pts[i][2] || 1) / 3.2)));
          ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke();
        }
      }
      // Partículas
      for (const p of CFD_PARTS) {
        if (!p.x) cfdSpawn(p, F);
        const [u, v] = vel(p.x, p.y, F), s = Math.hypot(u, v) || 1;
        p.x += (u / s) * dt * (0.8 + clamp(s / 3.2) * 2.2); p.y += (v / s) * dt * (0.8 + clamp(s / 3.2) * 2.2); p.age += dt;
        if (!inBox(p.x, p.y) || p.age > 6) cfdSpawn(p, F);
        ctx.globalAlpha = aSim; ctx.fillStyle = pal.light ? "#0a3270" : "#fff";
        ctx.beginPath(); ctx.arc(p.x, p.y, 0.08, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      screen();
    }
    // Etiquetas del proceso CFD
    const room = (x, y) => P(x, y, BOX.z1);
    label(P(0, 0, B_H), "TODO EL EDIFICIO", pal.muted, win(T, 5.0, 5.14, 0.03), -14, -26);
    label(P(EAST.x, 0, B_H), "SECTOR", pal.flow, win(T, 5.12, 5.24, 0.03), 14, -26);
    label(room(EAST.x, 0), "RECINTO CRÍTICO", pal.flow, win(T, 5.22, 5.34, 0.03), 14, -26);
    label(room(BOX.x1, BOX.y0), "VOLUMEN DE ANÁLISIS · MALLA", pal.flow, win(T, 5.32, 5.46, 0.03), 14, 18);
    const interp = win(T, 5.58, 5.96, 0.04);
    label(P(F.xi, BOX.y1 - 2, BOX.zc), "ALTA VELOCIDAD", pal.wind, interp, -14, -22);
    label(P(BOX.x1 - 1.2, BOX.y1 - 1.2, BOX.zc), "BAJA VELOCIDAD", pal.flow, interp, 14, -18);
    label(P(F.vx, F.vy, BOX.zc), "RECIRCULACIÓN", pal.heat, interp * (1 - k), -14, 24);
    label(P(F.xo, BOX.y0, BOX.zc), k > 0.5 ? "ABERTURA MODIFICADA" : "SALIDA", k > 0.5 ? pal.leaf : pal.wind, win(T, 5.44, 5.96, 0.04), 14, 22);
    return { sel, fin };
  }

  /* ------------------------------------------------------------------
     Render de un fotograma para un valor de T
     ------------------------------------------------------------------ */
  let clock = 0;
  const CAM = [
    { z: 1, x: 0, y: 0, h: 0 }, { z: 1.15, x: 0, y: 0, h: 0 }, { z: 1.12, x: 0, y: 0, h: 0 },
    { z: 3.0, x: EAST.x, y: 0, h: 4.6 }, { z: 3.1, x: EAST.x, y: 0, h: 4.6 }, { z: 1.6, x: EAST.x, y: 0, h: 3 },
    { z: 1, x: 0, y: 0, h: 0 }, { z: 1, x: 0, y: 0, h: 0 },
  ];
  function camAt(T) {
    const s = Math.min(Math.floor(T), 6), p = T - s, k = seg(p, 0.86, 1);
    const A = CAM[s], B = CAM[s + 1];
    let z = lerp(A.z, B.z, k);
    if (s === 5) z += 0.9 * seg(T, 5.14, 5.42) * (1 - k);    // la cámara se acerca al recinto crítico
    return { z, x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), h: lerp(A.h, B.h, k) };
  }
  let soundManual = null; // null = automático; 0 duras; 1 absorbentes
  function render(T, dt) {
    if (!W) return;
    Object.assign(cam, camAt(T));
    screen();
    ctx.clearRect(0, 0, W, H);
    const g = geomAt(T);
    const step = Math.min(Math.floor(T), 6);
    const fin = T >= 6 ? T - 6 : 0;                            // avance de la síntesis
    const F = (a, b) => seg(fin, a, b);                        // capas que reaparecen en la síntesis

    // Visibilidad de capas
    const focus = 1 - 0.65 * seg(T, 3.0, 3.1) * (1 - seg(T, 6.0, 6.1));
    const L = {
      contours: T < 1 ? seg(T, 0.02, 0.12) : lerp(0.35, 1, F(0.14, 0.22)),
      north: seg(T, 0.12, 0.2) * (T >= 2.95 && T < 6 ? 1 - seg(T, 2.95, 3.05) : 1) * (T >= 6 ? F(0.14, 0.22) : 1),
      arc: T < 1 ? seg(T, 0.24, 0.34) : T < 2 ? 0.45 : F(0.22, 0.3) * 0.6,
      ctx: seg(T, 0.38, 0.48) * focus,
      trees: seg(T, 0.44, 0.54) * focus,
      vectors: T < 1 ? seg(T, 0.56, 0.66) * (1 - seg(T, 0.96, 1)) : 0,
      shadows: T < 1 ? 0 : T < 3 ? seg(T, 1.06, 1.16) : T < 6 ? 0.35 : F(0.3, 0.36),
      heat: T < 1 ? 0 : T < 2 ? seg(T, 1.1, 1.2) : T < 3 ? 0.55 : T < 6 ? 0 : F(0.42, 0.48),
      wind: (T >= 2 && T < 3 ? seg(T, 2.0, 2.08) * (1 - seg(T, 2.94, 3)) : 0) + F(0.36, 0.42),
      thermal: T >= 3 && T < 4.05 ? seg(T, 3.1, 3.2) * (1 - seg(T, 3.95, 4.05)) : 0,
      acoustic: T >= 3.95 && T < 5 ? seg(T, 4.02, 4.1) * (1 - seg(T, 4.93, 5)) : F(0.48, 0.54) * 0.55,
    };
    const hour = T < 1 ? 6.5 + ((clock * 1.4) % 11) : T < 2 ? 7 + ((clock * 1.4) % 10) : 10;
    const day = 80;
    const sun = sunAt(day, hour);

    // Sitio
    drawGround(seg(T, 0, 0.06), L.contours);
    drawNorth(L.north);
    drawWindVectors(L.vectors, clock, FLOW);
    // Huella (01 · decisión)
    const bl = blocks(g);
    if (g.foot > 0.02 && g.h < 0.3) {
      ctx.globalAlpha = g.foot;
      for (const k of bl.list) {
        const bx = boxGeom(bl.a[0] * k.u, bl.a[1] * k.u, k.L, B_D, 0, bl.a, bl.b);
        poly(bx.g.map((v) => P(v[0], v[1], 0.05)), rgba(pal.leaf, 0.18), rgba(pal.leaf, 0.95), 1.6);
      }
      ctx.globalAlpha = 1;
      label(P(0, -B_L / 2, 0), "HUELLA DEL PROYECTO", pal.leaf, g.foot * (T < 1 ? 1 : 0), 16, 20);
    }
    // Sombras
    const nb = NEIGHBORS.map(([x, y, l, d, h]) => boxGeom(x, y, l, d, h, [1, 0], [0, 1]));
    const bb = bl.list.map((k) => boxGeom(bl.a[0] * k.u, bl.a[1] * k.u, k.L, B_D, g.h, bl.a, bl.b));
    if (L.shadows > 0.02) { for (const b of nb) shadowOf(b, sun, L.shadows * L.ctx); for (const b of bb) shadowOf(b, sun, L.shadows); }
    // Árboles detrás / contexto y edificio ordenados por profundidad
    for (const [x, y] of TREES) if (x - y < 0) drawTree(x, y, L.trees, L.shadows > 0.1 ? sun : null);
    // Comparación A vs B (fantasma de la orientación A)
    if (g.ghost > 0.02 && g.theta < 60) {
      const gA = boxGeom(0, 0, B_L, B_D, B_H, [0, 1], [-1, 0]);
      ctx.globalAlpha = g.ghost * 0.9; ctx.setLineDash([4, 4]);
      for (let i = 0; i < 4; i++) {
        const A = gA.g[i], B = gA.g[(i + 1) % 4];
        line(P(A[0], A[1], 0), P(B[0], B[1], 0), rgba(pal.heat, 0.9), 1.2);
        line(P(A[0], A[1], B_H), P(B[0], B[1], B_H), rgba(pal.heat, 0.9), 1.2);
        line(P(A[0], A[1], 0), P(A[0], A[1], B_H), rgba(pal.heat, 0.6), 1);
      }
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      label(P(0, B_L / 2, B_H), "ORIENTACIÓN A · EJE NORTE-SUR", pal.heat, g.ghost, -16, -22);
    }
    const items = [
      ...nb.map((b) => ({ b, kind: "ctx" })),
      ...bb.map((b, i) => ({ b, kind: "bld", east: !!bl.list[i].east })),
    ].sort((p, q) => (p.b.cx - p.b.cy) - (q.b.cx - q.b.cy));
    const sils = [];
    const cfdSel = T >= 5 && T < 6.05 ? seg(T, 5.12, 5.2) * (1 - seg(T, 5.95, 6.05)) : 0;
    for (const it of items) {
      if (it.kind === "ctx") {
        if (L.ctx > 0.02) drawBox(it.b, { base: pal.ctx, alpha: 0.55 * L.ctx, sun: L.shadows > 0.05 ? sun : null });
        continue;
      }
      const hl = cfdSel > 0 && it.east ? pal.flow : null;
      const alpha = g.alpha * (cfdSel > 0 && !it.east ? 1 - 0.5 * cfdSel : 1) + (hl ? 0.18 * cfdSel : 0);
      const s = drawBox(it.b, {
        base: pal.base, alpha: clamp(alpha), sun: T >= 1 ? sun : null, heat: L.heat, detail: true, g, hl,
        wire: T >= 3 && T < 6.1 ? 0.35 + 0.4 * cfdSel * (it.east ? 1 : 0) : 0,
      });
      if (s && g.alpha > 0.6) sils.push(s);
    }
    for (const [x, y] of TREES) if (x - y >= 0) drawTree(x, y, L.trees, L.shadows > 0.1 ? sun : null);

    // 02 · Sol: arco, posición, rayos al volumen y altitud / azimut
    drawSunArc(L.arc, day);
    const sunA = T < 1 ? seg(T, 0.26, 0.34) : T < 2 ? 1 : 0;
    drawSunGlyph(sun, sunA + F(0.22, 0.3) * 0.8);
    if (T >= 1 && T < 2 && g.h > 1) {
      const sp = sunPoint(sun);
      ctx.globalAlpha = seg(T, 1.16, 1.26) * 0.7;
      for (const b of bb) for (const f of b.faces) {
        if (sun.x * f.n[0] + sun.y * f.n[1] <= 0.05) continue;
        const [A, B] = f.p;
        for (const tt of [0.25, 0.75]) line(sp, P(A[0] + (B[0] - A[0]) * tt, A[1] + (B[1] - A[1]) * tt, g.h * 0.6), rgba(pal.sun, 0.7), 0.8, [3, 4]);
      }
      ctx.globalAlpha = 1;
      label(sp, `ALTITUD ${Math.round(sun.alt / rad)}° · AZIMUT ${Math.round(sun.az / rad)}°`, pal.sun, seg(T, 1.18, 1.28), -16, 22);
      label(P(0, 0, g.h), g.theta > 45 ? "ORIENTACIÓN A" : "ORIENTACIÓN B · EJE ORIENTE-OCCIDENTE", g.theta > 45 ? pal.heat : pal.leaf, seg(T, 1.2, 1.3), 16, -30);
    }
    // 03 · Viento
    stepWind(dt, bl, g);
    drawWind(L.wind, sils);
    if (T >= 2 && T < 3) {
      const a0 = seg(T, 2.1, 2.2), ad = seg(T, 2.6, 2.7);
      label(P(-10, B_D / 2 + 8, 1.6), "VIENTO", pal.wind, a0, -14, -20);
      label(P(bl.list[0].u * bl.a[0] - 3, B_D / 2, 5), "ENTRADA", pal.wind, ad, -14, -22);
      if (bl.list.length > 1) label(P(0, 0, 2), "FLUJO POR LA PERFORACIÓN", pal.wind, ad, 16, -26);
      label(P(EAST.x, -B_D / 2, 4), "SALIDA · VENTILACIÓN CRUZADA", pal.leaf, seg(T, 2.72, 2.8), 16, 22);
      if (g.open < 0.5) label(P(0, B_D / 2, g.h), "EL VOLUMEN BLOQUEA EL AIRE", pal.heat, win(T, 2.2, 2.46, 0.04), 16, -26);
    }
    // 04 · Térmico y 05 · Acústica en sección
    const secA = g.section * (1 - F(0, 0.1));
    if (secA > 0.02) {
      sectionFrame(secA);
      label(P(EAST.x, RS.s1, B_H), "SECCIÓN POR EL RECINTO", pal.text, secA * (T < 3.5 ? 1 : 0), 16, -24);
    }
    thermal(L.thermal, g, clock);
    let soft = soundManual == null ? g.absorb : soundManual;
    if (T >= 6) soft = 1;
    if (L.acoustic > 0.02 && T >= 6) sectionFrame(L.acoustic * 0.8);
    acoustic(L.acoustic, g, clock, soft, T < 6);
    // 06 · CFD
    if (T >= 5 && T < 6.1) cfd(T, clock, dt);
    if (T >= 6) {
      // Síntesis: el volumen de análisis reaparece como capa
      const aM = F(0.54, 0.6) * 0.6;
      if (aM > 0.02) {
        ctx.globalAlpha = aM;
        const X = [BOX.x0, BOX.x1], Y = [BOX.y0, BOX.y1];
        for (const z of [BOX.z0, BOX.z1]) for (let i = 0; i < 4; i++) {
          const c1 = [[X[0], Y[0]], [X[1], Y[0]], [X[1], Y[1]], [X[0], Y[1]]];
          line(P(c1[i][0], c1[i][1], z), P(c1[(i + 1) % 4][0], c1[(i + 1) % 4][1], z), rgba(pal.flow), 1);
        }
        ctx.globalAlpha = 1;
      }
    }
    // Etiquetas de la lectura del sitio (01)
    if (T < 1) {
      label(P(36, -6), "NORTE", pal.sun, seg(T, 0.14, 0.2) * (1 - seg(T, 0.9, 1)), 14, -10);
      const s0 = sunAt(day, 9);
      label(sunPoint(s0), "TRAYECTORIA SOLAR · 21 MAR", pal.sun, seg(T, 0.3, 0.38) * (1 - seg(T, 0.9, 1)), 14, -16);
      label(P(-27, 24, 10), "CONTEXTO", pal.muted, seg(T, 0.44, 0.52) * (1 - seg(T, 0.9, 1)), -12, -18);
      label(P(-14, 21, 4.2), "VEGETACIÓN", pal.leaf, seg(T, 0.5, 0.58) * (1 - seg(T, 0.9, 1)), -14, 20);
      label(P(20, 20, 0.5), "VIENTO", pal.wind, seg(T, 0.62, 0.7) * (1 - seg(T, 0.9, 1)), 14, -16);
    }
    drawLabels();
    return { g, step, soft };
  }

  /* ------------------------------------------------------------------
     Interfaz: navegación, panel, fases y controles
     ------------------------------------------------------------------ */
  const nav = $("#engNav");
  nav.innerHTML = STEPS.map((s, i) => {
    const t = TOOLS[s.tool];
    const c = t ? t.color : "var(--sun)";
    const n = i < N_TOOLS ? String(i + 1).padStart(2, "0") : "Σ";
    return `<li><button class="eng-nav-btn" data-i="${i}" style="--c:${c}" aria-label="${n} ${s.short}">
      <span class="mono">${n}</span><b>${s.short}</b><i class="eng-nav-prog"></i></button></li>`;
  }).join("");
  $("#engPhases").innerHTML = PHASES.map((p, i) => `<li data-p="${i}" style="--pc:${p.color || "var(--sun)"}">${p.name}</li>`).join("");
  $("#engDemand").innerHTML = Array.from({ length: 6 }, (_, i) => `<i data-d="${i + 1}"></i>`).join("");
  const summaryWords = ["Sitio", "Sol", "Viento", "Térmico", "Acústica", "CFD", "Decisión", "Modelo BIM", "Iterar"];
  $("#engSummary").innerHTML = summaryWords.map((w, i) => `<li data-i="${i}">${w}</li>`).join("");
  const loopWords = ["Diseñar", "Analizar", "Aprender", "Decidir", "Iterar", "Diseñar"];

  let shownStep = -1, shownPhase = -1;
  function subPhase(step, p) {
    if (step === 5) return p < 0.12 ? 0 : p < 0.42 ? 1 : p < 0.6 ? 2 : p < 0.72 ? 3 : 4;
    if (step === 0) return p < 0.22 ? 0 : p < 0.36 ? 1 : p < 0.58 ? 2 : p < 0.76 ? 3 : 4;
    if (step === 6) return Math.floor((clock / 2.2) % 5);
    return p < 0.45 ? 0 : p < 0.72 ? 1 : 2;
  }
  function updatePanel(step, p) {
    if (step !== shownStep) {
      shownStep = step;
      const s = STEPS[step], t = TOOLS[s.tool];
      const color = t ? t.color : "var(--sun)";
      root.style.setProperty("--ec", color);
      $("#engIcon").innerHTML = t && ICONS[t.id] ? ICONS[t.id] : `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="6"/><path d="M4 30c5-8 27-8 32 0"/></svg>`;
      $("#engIcon").style.setProperty("--c", color);
      $("#engKicker").textContent = s.kicker;
      $("#engName").textContent = t ? t.nombre : s.name;
      $("#engQ").textContent = s.q;
      $("#engIn").textContent = s.in;
      $("#engDoes").textContent = s.does;
      $("#engOut").textContent = s.out;
      $("#engLearn").textContent = s.learn;
      $("#engDecision").innerHTML = `<b>Decisión:</b> ${s.decision}`;
      $("#engLegend").textContent = s.legend;
      $("#engCycle").innerHTML = s.cycle.map((c) => `<li>${c}</li>`).join("");
      $("#engCount").textContent = step < N_TOOLS ? `${String(step + 1).padStart(2, "0")} / 06` : "Síntesis";
      $("#engToggleRow").hidden = step !== 4;
      const ob = $("#engOpenTool");
      ob.hidden = !t;
      if (t) ob.dataset.openTool = t.id;
      $$(".eng-nav-btn", nav).forEach((b, i) => { b.classList.toggle("is-on", i === step); b.classList.toggle("is-past", i < step); b.setAttribute("aria-current", i === step ? "step" : "false"); });
      $$("#engPhases li").forEach((li) => li.classList.toggle("is-on", s.phases.includes(+li.dataset.p)));
      $$("#engDemand i").forEach((i) => i.classList.toggle("is-on", +i.dataset.d <= s.demand));
      $("#engScale").style.left = s.scale == null ? "50%" : `${s.scale * 100}%`;
      $("#engScale").parentElement.parentElement.style.opacity = s.scale == null ? 0.35 : 1;
      $("#engLive").textContent = `${s.kicker}. ${t ? t.nombre : s.name}. ${s.q}`;
      shownPhase = -1;
    }
    const sp = subPhase(step, p);
    if (sp !== shownPhase) {
      shownPhase = sp;
      $$("#engCycle li").forEach((li, i) => { li.classList.toggle("is-on", i === sp); li.classList.toggle("is-past", i < sp); });
    }
    const prog = $(".eng-nav-btn.is-on .eng-nav-prog", nav);
    if (prog) prog.style.transform = `scaleX(${clamp(p)})`;
    // Síntesis: tarjeta final y animación de resumen (≈ 12 s)
    const finOn = step === 6 && p > 0.58;
    root.classList.toggle("show-finale", finOn);
    if (finOn) {
      const k = Math.floor((clock / 1.35) % summaryWords.length);
      $$("#engSummary li").forEach((li, i) => { li.classList.toggle("is-on", i === k); li.classList.toggle("is-past", i < k); });
      const w = Math.floor((clock / 1.6) % (loopWords.length - 1));
      $("#engLoop").innerHTML = loopWords.map((x, i) => `<span class="${i === w || (w === 0 && i === loopWords.length - 1) ? "on" : ""}">${x}</span>`).join(" → ");
    }
  }

  /* ------------------------------------------------------------------
     Control: la animación vive en una ventana a pantalla completa
     (#engModal) y avanza por tiempo; ya no depende del scroll de la página.
     ------------------------------------------------------------------ */
  const modal = document.getElementById("engModal");
  document.body.appendChild(modal);                        // fuera de la vista: queda por encima del menú y del botón flotante
  let T = 0, playing = false, visible = false, open = false;
  const STEP_DUR = 11;                                     // segundos por herramienta
  const FINALE_HOLD = 16;                                  // segundos de la síntesis final
  const playBtn = $("#engPlay");
  function setPlaying(v) {
    playing = v;
    playBtn.classList.toggle("playing", v);
    playBtn.setAttribute("aria-label", v ? "Pausar recorrido" : "Reproducir recorrido");
    $("#engPlayText").textContent = v ? "Pausar" : (T >= N_STEPS - 0.05 ? "Ver de nuevo" : "Reproducir");
  }
  const goStep = (i) => { T = clamp(i, 0, N_STEPS - 1) + 0.02; };

  // Presentación en la página: duración, iconos y accesos directos a cada herramienta
  const total = N_TOOLS * STEP_DUR + FINALE_HOLD;
  $("#engDur").textContent = `≈ ${Math.floor(total / 60)} min ${Math.round(total % 60)} s`;
  const tcol = (s) => (TOOLS[s.tool] ? TOOLS[s.tool].color : "var(--sun)");
  $("#engPosterIcons").innerHTML = STEPS.slice(0, N_TOOLS).map((s, i) => `<i style="--c:${tcol(s)};--k:${i}">${ICONS[s.tool] || ""}</i>`).join("");
  $("#engJump").innerHTML = STEPS.slice(0, N_TOOLS).map((s, i) => {
    const t = TOOLS[s.tool];
    return `<li><button data-i="${i}" style="--c:${tcol(s)}"><span class="tool-ic">${ICONS[s.tool] || ""}</span>
      <span class="eng-jump-t"><span class="mono">${String(i + 1).padStart(2, "0")} · ${s.kicker.split("·")[1].trim()}</span><b>${t ? t.nombre : s.short}</b></span>
      <svg viewBox="0 0 24 24" class="eng-jump-go" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></button></li>`;
  }).join("");

  let lastFocus = null;
  function openEngine(step = 0) {
    lastFocus = document.activeElement;
    open = true;
    modal.hidden = false;
    document.body.classList.add("eng-lock");
    goStep(step);
    if (step === 0) T = 0;
    setPlaying(true);
    requestAnimationFrame(() => { modal.classList.add("is-open"); resize(); });
    $("#engClose").focus({ preventScroll: true });
  }
  function closeEngine() {
    if (!open) return;
    open = false;
    setPlaying(false);
    modal.classList.remove("is-open");
    document.body.classList.remove("eng-lock");
    setTimeout(() => { if (!open) modal.hidden = true; }, 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $("#engOpen").addEventListener("click", () => openEngine(0));
  $("#engJump").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) openEngine(+b.dataset.i); });
  $("#engClose").addEventListener("click", closeEngine);
  // Los enlaces que cambian de vista cierran la ventana
  modal.addEventListener("click", (e) => { if (e.target.closest("a[data-view-link]")) closeEngine(); });
  addEventListener("keydown", (e) => {
    if (!open || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector("dialog[open]")) return;       // la ficha de una herramienta está encima
    if (e.key === "Escape") { e.preventDefault(); closeEngine(); }
    else if (e.key === " " && !e.target.closest("button, a")) { e.preventDefault(); playBtn.click(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); goStep(Math.floor(T) + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goStep(Math.floor(T) - 1); }
    else if (e.key === "Tab") {                                   // el foco no sale de la ventana
      const f = [...modal.querySelectorAll("button, a[href]")].filter((x) => !x.hidden && x.offsetParent);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  nav.addEventListener("click", (e) => {
    const b = e.target.closest(".eng-nav-btn");
    if (b) goStep(+b.dataset.i);
  });
  playBtn.addEventListener("click", () => {
    if (!playing && T >= N_STEPS - 0.05) T = 0;
    setPlaying(!playing);
  });
  $("#engReplay").addEventListener("click", () => { T = 0; setPlaying(true); });
  $$(".eng-toggle").forEach((b) => b.addEventListener("click", () => {
    soundManual = b.dataset.surf === "soft" ? 1 : 0;
    $$(".eng-toggle").forEach((x) => x.setAttribute("aria-pressed", x === b));
  }));
  // Deslizar en pantallas táctiles
  let tx0 = null;
  root.addEventListener("touchstart", (e) => { tx0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener("touchend", (e) => {
    if (tx0 == null) return;
    const dx = e.changedTouches[0].clientX - tx0; tx0 = null;
    if (Math.abs(dx) > 50) goStep(Math.floor(T) + (dx < 0 ? 1 : -1));
  }, { passive: true });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) resize(); }, { threshold: 0.05 }).observe(root);

  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (open && visible && W) {
      clock += dt;
      if (playing) {
        const before = Math.floor(T);
        T += dt / (T >= N_STEPS - 1 ? FINALE_HOLD : STEP_DUR);
        if (T >= N_STEPS) { T = N_STEPS - 0.0001; setPlaying(false); }   // se queda en la síntesis
        if (Math.floor(T) !== before) soundManual = null;
      }
      const step = Math.min(Math.floor(T), N_STEPS - 1);
      if (step !== shownStep) soundManual = null, $$(".eng-toggle").forEach((x) => x.setAttribute("aria-pressed", x.dataset.surf === "hard"));
      const r = render(T, dt);
      updatePanel(step, T - step);
      // El botón de superficies refleja el estado automático mientras el usuario no elija
      if (r && step === 4 && soundManual == null) {
        const soft = r.soft > 0.5;
        $$(".eng-toggle").forEach((x) => x.setAttribute("aria-pressed", (x.dataset.surf === "soft") === soft));
      }
    }
    requestAnimationFrame(loop);
  }
  resize();
  requestAnimationFrame(loop);
})();
