/* =====================================================================
   BIOBIM Lab · interacciones
   ===================================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TOOLS = window.BIOBIM_TOOLS || [];
  const toolById = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
  };

  /* ------------------------------------------------------------------
     Tema
     ------------------------------------------------------------------ */
  const root = document.documentElement;
  const savedTheme = store.get("biobim-theme");
  const initialTheme = savedTheme || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  root.dataset.theme = initialTheme;
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    store.set("biobim-theme", next);
  });

  $("#year").textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Nav: menú móvil, ocultar al bajar, progreso de scroll
     ------------------------------------------------------------------ */
  const nav = $("#nav");
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open);
    navLinks.classList.toggle("open", open);
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) { burger.setAttribute("aria-expanded", "false"); navLinks.classList.remove("open"); }
  });

  const progressBar = $("#progressBar");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("is-hidden", y > lastY && y > 400 && !navLinks.classList.contains("open"));
    lastY = y;
    updateTimelineLine();
    parallaxContours(y);
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* Sección activa en el nav */
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      $$(".nav-links a").forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["proceso", "herramientas", "investigacion"].forEach((id) => { const el = document.getElementById(id); if (el) sectionObs.observe(el); });

  /* ------------------------------------------------------------------
     Cambio de vista: Laboratorio ↔ Portafolio
     ------------------------------------------------------------------ */
  const views = { lab: $("#view-lab"), tools: $("#view-tools"), portfolio: $("#view-portfolio") };
  const VIEW_HASH = { lab: "#inicio", tools: "#herramientas", portfolio: "#portafolio" };
  const TOOL_SECTIONS = ["herramientas", "fases", "mapa", "criterios", "catalogo", "ecosistema"];
  const vsBtns = $$(".vs-btn");
  const vsPill = $(".vs-pill");
  let currentView = "lab";
  const wipe = document.createElement("div");
  wipe.className = "view-wipe";
  document.body.appendChild(wipe);

  function placePill() {
    const on = vsBtns.find((b) => b.dataset.view === currentView);
    if (!on) return;
    vsPill.style.width = on.offsetWidth + "px";
    vsPill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  }

  function showView(name, { x, y, hash, instant } = {}) {
    if (!views[name]) return;
    const same = name === currentView;
    const go = () => {
      if (!same) {
        Object.entries(views).forEach(([k, el]) => {
          el.hidden = k !== name;
          el.classList.toggle("is-active", k === name);
        });
        views[name].classList.remove("entering");
        void views[name].offsetWidth;
        views[name].classList.add("entering");
        currentView = name;
        vsBtns.forEach((b) => {
          const on = b.dataset.view === name;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on);
        });
        placePill();
        observeReveals(views[name]);
      }
      const target = hash && document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: same && !instant ? "smooth" : "auto" });
      else if (!same) scrollTo({ top: 0, behavior: "auto" });
    };
    if (same || instant || reduceMotion) return go();
    wipe.style.setProperty("--wx", (x ?? innerWidth / 2) + "px");
    wipe.style.setProperty("--wy", (y ?? 60) + "px");
    wipe.classList.remove("run");
    void wipe.offsetWidth;
    wipe.classList.add("run");
    setTimeout(go, 380);
  }

  document.addEventListener("click", (e) => {
    const vBtn = e.target.closest("[data-view]");
    if (vBtn) {
      e.preventDefault();
      const name = vBtn.dataset.view;
      history.pushState(null, "", VIEW_HASH[name] || "#inicio");
      showView(name, { x: e.clientX, y: e.clientY });
      return;
    }
    const link = e.target.closest("a[data-view-link]");
    if (link) {
      const hash = (link.getAttribute("href") || "").slice(1);
      e.preventDefault();
      history.pushState(null, "", "#" + hash);
      showView(link.dataset.viewLink, { x: e.clientX, y: e.clientY, hash });
    }
  });

  function routeFromHash(instant) {
    const h = location.hash.slice(1);
    if (h === "portafolio" || h === "contacto") showView("portfolio", { instant, hash: h === "contacto" ? h : null });
    else if (TOOL_SECTIONS.includes(h)) showView("tools", { instant, hash: h === "herramientas" ? null : h });
    else showView("lab", { instant, hash: h || null });
  }
  addEventListener("popstate", () => routeFromHash(false));
  addEventListener("resize", placePill);

  /* ------------------------------------------------------------------
     Reveal on scroll + contadores
     ------------------------------------------------------------------ */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      $$(".counter", en.target).forEach(runCounter);
      if (en.target.classList.contains("counter")) runCounter(en.target);
      revealObs.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  function observeReveals(scope = document) {
    $$(".reveal:not(.in)", scope).forEach((el) => revealObs.observe(el));
  }

  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const pre = el.dataset.prefix || "";
    const suf = el.dataset.suffix || "";
    const dur = reduceMotion ? 0 : 1600;
    const t0 = performance.now();
    const tick = (t) => {
      const p = dur ? Math.min(1, (t - t0) / dur) : 1;
      const v = to * (1 - Math.pow(1 - p, 4));
      el.textContent = pre + v.toFixed(dec).replace(".", ",") + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     Microinteracciones: spotlight, tilt, magnético, glow del cursor
     ------------------------------------------------------------------ */
  const glow = $(".cursor-glow");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer && !reduceMotion) {
    addEventListener("pointermove", (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    }, { passive: true });

    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".card, .tilt");
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
        if (card.classList.contains("tilt") || card.classList.contains("tool")) {
          card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 6}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-4px)`;
        }
      }
      const mag = e.target.closest(".magnetic");
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`;
      }
    }, { passive: true });

    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest(".tilt, .tool");
      if (card && !card.contains(e.relatedTarget)) card.style.transform = "";
      const mag = e.target.closest(".magnetic");
      if (mag && !mag.contains(e.relatedTarget)) mag.style.transform = "";
    });
  }

  /* ------------------------------------------------------------------
     Curvas de nivel del hero (generadas)
     ------------------------------------------------------------------ */
  const contourGroup = $("#contourGroup");
  (function buildContours() {
    const centers = [
      { x: 900, y: 300, n: 14, s: 1 },
      { x: 180, y: 640, n: 10, s: 2.3 },
    ];
    let html = "";
    centers.forEach((c) => {
      for (let i = 1; i <= c.n; i++) {
        const base = i * 34;
        let d = "";
        const steps = 90;
        for (let k = 0; k <= steps; k++) {
          const a = (k / steps) * Math.PI * 2;
          const r = base + Math.sin(a * 3 + c.s + i * 0.35) * (6 + i * 1.6) + Math.cos(a * 5 - i * 0.2) * (3 + i * 0.8);
          const x = c.x + Math.cos(a) * r * 1.25;
          const y = c.y + Math.sin(a) * r;
          d += (k ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
        }
        html += `<path d="${d}Z" style="opacity:${(1 - i / (c.n + 3)).toFixed(2)}"/>`;
      }
    });
    contourGroup.innerHTML = html;
  })();
  function parallaxContours(y) {
    if (reduceMotion || currentView !== "lab" || y > innerHeight * 1.2) return;
    contourGroup.style.transform = `translateY(${y * 0.25}px) rotate(${y * 0.01}deg)`;
  }

  /* ------------------------------------------------------------------
     Carta solar interactiva (Medellín, 6.25° N)
     ------------------------------------------------------------------ */
  (function sunPath() {
    const LAT = 6.25 * Math.PI / 180;
    const C = 160, R = 130;
    const svg = $("#spSvg");
    const sun = $("#spSun"), sunGlow = $("#spSunGlow"), ray = $("#spRay"), shadow = $("#spShadow");
    const hourIn = $("#spHour");
    const out = { d: $("#spD"), t: $("#spT"), alt: $("#spAlt"), az: $("#spAz"), sh: $("#spSh") };
    let doy = 80;          // día del año (continuo)
    let holding = false;   // el usuario está arrastrando la hora
    const rad = Math.PI / 180;
    // Recorrido automático: 3 fechas clave × 3 horas clave
    const KEY_DAYS = [172, 80, 355];   // 21 Jun, 21 Mar, 21 Dic
    const KEY_HOURS = [9, 12, 15];
    const HOLD = 0.9;                  // segundos quieto en cada punto
    const MOVE = 0.55;                 // segundos de transición entre puntos

    const decl = (n) => 23.44 * Math.sin((2 * Math.PI / 365) * (284 + n)) * rad;
    function sunPos(n, hour) {
      const d = decl(n);
      const H = (hour - 12) * 15 * rad;
      const sinAlt = Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.cos(H);
      const alt = Math.asin(sinAlt);
      let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(LAT) - Math.tan(d) * Math.cos(LAT)) + Math.PI;
      return { alt, az };
    }
    const toXY = (alt, az) => {
      const r = R * (1 - alt / (Math.PI / 2));
      return [C + r * Math.sin(az), C - r * Math.cos(az)];
    };

    // Rejilla polar
    let g = "";
    [0, 30, 60].forEach((a) => {
      g += `<circle cx="${C}" cy="${C}" r="${R * (1 - a / 90)}" class="sp-grid-c ${a === 0 ? "outer" : ""}"/>`;
    });
    for (let a = 0; a < 360; a += 30) {
      const [x, y] = [C + R * Math.sin(a * rad), C - R * Math.cos(a * rad)];
      g += `<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" class="sp-grid-l"/>`;
    }
    [["N", 0], ["E", 90], ["S", 180], ["O", 270]].forEach(([t, a]) => {
      const r = R + 14;
      g += `<text x="${C + r * Math.sin(a * rad)}" y="${C - r * Math.cos(a * rad)}" class="sp-grid-t ${t === "N" ? "n" : ""}">${t}</text>`;
    });
    g += `<text x="${C + 4}" y="${C - R * (2 / 3) - 6}" class="sp-grid-t" style="font-size:8px;text-anchor:start">30°</text>`;
    g += `<text x="${C + 4}" y="${C - R / 3 - 6}" class="sp-grid-t" style="font-size:8px;text-anchor:start">60°</text>`;
    $("#spGrid").innerHTML = g;

    // Trayectorias
    const days = [172, 80, 355];
    let p = "";
    days.forEach((n) => {
      let d = "";
      let first = true;
      for (let h = 5; h <= 19; h += 0.1) {
        const s = sunPos(n, h);
        if (s.alt < 0) continue;
        const [x, y] = toXY(s.alt, s.az);
        d += (first ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
        first = false;
      }
      p += `<path d="${d}" class="sp-path" data-doy="${n}"/>`;
      for (let h = 7; h <= 17; h++) {
        const s = sunPos(n, h);
        const [x, y] = toXY(s.alt, s.az);
        p += `<circle cx="${x}" cy="${y}" r="1.6" class="sp-hourdot"/>`;
      }
    });
    p += `<path id="spNow" class="sp-path now" d=""/>`;
    $("#spPaths").innerHTML = p;
    const nowPath = $("#spNow");

    // Trayectoria del día actual (se redibuja a medida que avanza la fecha)
    let lastPathDoy = -1;
    function drawNowPath() {
      if (Math.abs(doy - lastPathDoy) < 0.25) return;
      lastPathDoy = doy;
      let d = "", first = true;
      for (let h = 5; h <= 19; h += 0.1) {
        const s = sunPos(doy, h);
        if (s.alt < 0) continue;
        const [x, y] = toXY(s.alt, s.az);
        d += (first ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
        first = false;
      }
      nowPath.setAttribute("d", d);
    }
    const fmtDate = (n) => {
      const dt = new Date(2026, 0, 1);
      dt.setDate(dt.getDate() + Math.round(n) - 1); // n = día del año (1 = 1 ene)
      return `${dt.getDate()} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][dt.getMonth()]}`;
    };
    const dayDist = (a, b) => { const x = Math.abs(a - b) % 365; return Math.min(x, 365 - x); };

    // Huella del edificio (rectángulo 24 x 40, altura ficticia 30)
    const B = { x: 148, y: 140, w: 24, h: 40, H: 30 };
    const corners = [[B.x, B.y], [B.x + B.w, B.y], [B.x + B.w, B.y + B.h], [B.x, B.y + B.h]];

    function hull(pts) {
      pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      for (const pt of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], pt) <= 0) lo.pop(); lo.push(pt); }
      for (const pt of pts.reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], pt) <= 0) up.pop(); up.push(pt); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    }

    function render() {
      const hour = parseFloat(hourIn.value);
      const s = sunPos(doy, hour);
      drawNowPath();
      // Resalta la fecha de referencia más cercana (21 Mar también cubre el equinoccio de septiembre)
      $$(".sp-months .seg").forEach((b) => {
        const ref = +b.dataset.doy;
        const near = dayDist(doy, ref) < 18 || (ref === 80 && dayDist(doy, 266) < 18);
        b.classList.toggle("is-on", near);
        b.setAttribute("aria-checked", near);
      });
      const hh = Math.floor(hour), mm = Math.floor((hour - hh) * 60);
      out.d.textContent = fmtDate(doy);
      out.t.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

      if (s.alt <= 0.01) {
        sun.setAttribute("opacity", 0); sunGlow.setAttribute("opacity", 0);
        shadow.setAttribute("points", ""); ray.setAttribute("opacity", 0);
        out.alt.textContent = "bajo horizonte"; out.az.textContent = "—"; out.sh.textContent = "—";
        return;
      }
      const [x, y] = toXY(s.alt, s.az);
      sun.setAttribute("opacity", 1); sunGlow.setAttribute("opacity", 1); ray.setAttribute("opacity", 0.7);
      sun.setAttribute("cx", x); sun.setAttribute("cy", y);
      sunGlow.setAttribute("cx", x); sunGlow.setAttribute("cy", y);
      ray.setAttribute("x2", x); ray.setAttribute("y2", y);

      // Sombra proyectada: dirección opuesta al azimut, longitud H / tan(alt)
      const L = Math.min(B.H / Math.tan(s.alt), 140);
      const dx = -Math.sin(s.az) * L, dy = Math.cos(s.az) * L;
      const pts = hull(corners.concat(corners.map(([cx, cy]) => [cx + dx, cy + dy])));
      shadow.setAttribute("points", pts.map((q) => q.join(",")).join(" "));

      const ratio = 1 / Math.tan(s.alt);
      out.alt.textContent = (s.alt / rad).toFixed(1) + "°";
      out.az.textContent = (s.az / rad).toFixed(0) + "°";
      out.sh.textContent = ratio > 9.9 ? "> 10 h" : ratio.toFixed(2) + " h";
    }

    // Secuencia: para cada fecha clave recorre 09:00 → 12:00 → 15:00 y salta a la siguiente fecha.
    // Las fechas y la hora del usuario solo reposicionan: la animación nunca se detiene.
    const STEPS = KEY_DAYS.flatMap((d) => KEY_HOURS.map((h) => ({ d, h })));
    let step = STEPS.findIndex((s) => s.d === 80 && s.h === 9);
    let from = { ...STEPS[step] }, to = { ...STEPS[step] };
    let phase = "hold", clock = 0;
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const moveTo = (i) => {
      step = (i + STEPS.length) % STEPS.length;
      from = { d: doy, h: parseFloat(hourIn.value) };
      to = { ...STEPS[step] };
      phase = "move"; clock = 0;
    };
    doy = from.d; hourIn.value = from.h;

    $$(".sp-months .seg").forEach((b) => b.addEventListener("click", () => {
      const hi = KEY_HOURS.indexOf(to.h);
      moveTo(KEY_DAYS.indexOf(+b.dataset.doy) * KEY_HOURS.length + (hi < 0 ? 0 : hi));
    }));
    const release = () => {
      if (!holding) return;
      holding = false;
      from = to = { d: doy, h: parseFloat(hourIn.value) };
      phase = "hold"; clock = 0;
    };
    hourIn.addEventListener("pointerdown", () => { holding = true; });
    addEventListener("pointerup", release);
    hourIn.addEventListener("change", release);
    hourIn.addEventListener("input", render);

    let last = performance.now();
    let visible = true;
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(svg);
    function loop(t) {
      const dt = Math.min((t - last) / 1000, 0.25); last = t;
      if (visible && currentView === "lab" && !holding) {
        clock += dt;
        if (phase === "hold" && clock >= HOLD) moveTo(step + 1);
        else if (phase === "move") {
          const p = ease(Math.min(clock / MOVE, 1));
          doy = from.d + (to.d - from.d) * p;
          hourIn.value = from.h + (to.h - from.h) * p;
          if (clock >= MOVE) { phase = "hold"; clock = 0; }
        }
        render();
      }
      requestAnimationFrame(loop);
    }
    render();
    requestAnimationFrame(loop);
  })();

  /* ------------------------------------------------------------------
     Curva de esfuerzo (Tradicional vs BIOBIM)
     ------------------------------------------------------------------ */
  (function effortCurve() {
    const box = $("#effort");
    const btns = $$(".tg", box);
    const pill = $(".tg-pill", box);
    const note = $("#efNote");
    const label = $("#efLabel");
    const phases = ["Prefactibilidad", "Idea básica", "Anteproyecto", "Proyecto", "Construcción"];
    const notes = {
      trad: {
        base: "En el proceso tradicional el esfuerzo de verificación ambiental se concentra en proyecto y construcción, cuando cambiar la forma ya es costoso.",
        0: "El clima se considera de forma general; el lote se ocupa por normativa y criterio empírico.",
        1: "Volumetría y orientación se definen por experiencia; las estrategias se aplican de forma cualitativa.",
        2: "El proyecto se desarrolla en el software de diseño. La bioclimática aún no se verifica.",
        3: "La verificación llega en otro software: hay que reconstruir el modelo en cada revisión.",
        4: "Los problemas de confort aparecen en obra, donde corregir es más caro.",
      },
      bio: {
        base: "Con BIOBIM el esfuerzo se desplaza hacia el inicio, donde cada decisión tiene mayor impacto en el desempeño y menor costo de cambio.",
        0: "Análisis climático sistemático del sitio antes de definir la forma.",
        1: "Radiación solar y viento ajustan la volumetría inicial con datos.",
        2: "Se verifican radiación, viento y confort térmico dentro del mismo flujo BIM, sin reconstruir.",
        3: "Iteraciones ágiles hasta el proyecto final: se valida, no se descubre.",
        4: "La obra ejecuta decisiones que ya fueron validadas.",
      },
    };
    let mode = "trad";
    let band = null;

    function placeTgPill() {
      const on = btns.find((b) => b.dataset.mode === mode);
      pill.style.width = on.offsetWidth + "px";
      pill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
    }
    function update() {
      box.classList.toggle("bio", mode === "bio");
      btns.forEach((b) => { const on = b.dataset.mode === mode; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); });
      label.textContent = mode === "bio" ? "Esfuerzo bioclimático · BIOBIM" : "Esfuerzo bioclimático · tradicional";
      note.textContent = band == null ? notes[mode].base : `${phases[band]}: ${notes[mode][band]}`;
      placeTgPill();
      // re-dibujar la curva activa
      const path = $(mode === "bio" ? ".ef-bio" : ".ef-trad", box);
      box.classList.remove("drawn");
      path.getBoundingClientRect();
      requestAnimationFrame(() => box.classList.add("drawn"));
    }
    btns.forEach((b) => b.addEventListener("click", () => { mode = b.dataset.mode; update(); }));
    $$("#efBands rect").forEach((r) => {
      const set = () => {
        band = +r.dataset.i;
        $$("#efBands rect").forEach((x) => x.classList.toggle("is-on", x === r));
        note.textContent = `${phases[band]}: ${notes[mode][band]}`;
      };
      r.addEventListener("mouseenter", set);
      r.addEventListener("click", set);
    });
    $("#efBands").addEventListener("mouseleave", () => {
      band = null;
      $$("#efBands rect").forEach((x) => x.classList.remove("is-on"));
      note.textContent = notes[mode].base;
    });
    new IntersectionObserver(([en], obs) => {
      if (en.isIntersecting) { update(); obs.disconnect(); }
    }, { threshold: 0.35 }).observe(box);
    addEventListener("resize", placeTgPill);
    placeTgPill();
  })();

  /* ------------------------------------------------------------------
     Proceso BIOBIM: anillo + etapas + comparación
     ------------------------------------------------------------------ */
  const STAGES = [
    {
      phase: "Prefactibilidad",
      title: "Requerimientos del proyecto",
      short: "Requerimientos",
      color: "var(--leaf)",
      trad: "Se evalúa la ocupación del lote según normativa y criterio empírico del equipo. El clima se considera de forma general, sin un análisis climático sistemático del sitio.",
      bio: "Se analiza el clima del sitio (temperatura, humedad, viento, radiación solar) de forma sistemática desde el inicio, mediante una herramienta de análisis climático, antes de definir la forma del proyecto.",
      tools: ["lugar"],
      tradTools: ["Normativa", "Criterio empírico"],
    },
    {
      phase: "Idea básica",
      title: "Definición de estrategias",
      short: "Estrategias",
      color: "var(--sun)",
      trad: "La volumetría y la orientación se definen por experiencia del diseñador y criterios formales; las estrategias bioclimáticas, si se consideran, se aplican de forma cualitativa, sin verificación cuantitativa.",
      bio: "Se priorizan las estrategias según su exigencia técnica, desde la orientación, casi obligatoria, hasta las que requieren simulación. Radiación solar y viento ajustan la volumetría inicial con datos.",
      tools: ["solar", "ventilacion"],
      tradTools: ["Experiencia del diseñador", "Criterios formales"],
    },
    {
      phase: "Anteproyecto · Proyecto",
      title: "Montaje y validación",
      short: "Validación",
      color: "var(--wind)",
      trad: "El proyecto se detalla en el software de diseño; la verificación bioclimática, cuando existe, se hace aparte en otro software, lo que obliga a reconstruir el modelo y llega tarde para influir en la forma.",
      bio: "El proyecto se ajusta dentro del mismo flujo BIM. En cada ciclo aparecen las herramientas de verificación sin reconstruir el modelo, validando decisiones de forma ágil hasta el proyecto final.",
      tools: ["solar", "ventilacion", "cfd", "termico", "acustico"],
      tradTools: ["Software externo", "Reconstruir el modelo"],
    },
  ];

  (function processRing() {
    const segG = $("#ringSegs");
    const C = 180, R = 150;
    const polar = (a, r) => [C + r * Math.sin(a * Math.PI / 180), C - r * Math.cos(a * Math.PI / 180)];
    const arc = (a0, a1, r) => {
      const [x0, y0] = polar(a0, r), [x1, y1] = polar(a1, r);
      return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
    };
    let html = "";
    STAGES.forEach((s, i) => {
      const a0 = i * 120 + 6, a1 = (i + 1) * 120 - 6, am = (a0 + a1) / 2;
      const [nx, ny] = polar(am, R);
      const [tx, ty] = polar(am, 107);
      const [ax0, ay0] = polar(a1 - 2, R + 30), [ax1, ay1] = polar(a1 + 10, R + 30);
      html += `<g class="ring-seg" data-stage="${i}" role="tab" tabindex="0" aria-label="Etapa ${i + 1}: ${s.title}">
        <path class="arc" d="${arc(a0, a1, R)}" style="stroke:${s.color}"/>
        <path class="arr" d="M${ax0} ${ay0} A${R + 30} ${R + 30} 0 0 1 ${ax1} ${ay1}" marker-end="url(#arrowHead)"/>
        <text x="${nx}" y="${ny}" class="n">0${i + 1}</text>
        <text x="${tx}" y="${ty}">${s.short}</text>
      </g>`;
    });
    segG.innerHTML = html;
  })();

  (function stages() {
    const tabs = $$(".st-tab");
    const body = $("#stageBody");
    const sw = $("#compareSwitch");
    const swLabel = $("#swLabel");
    let stage = 0;
    let auto = !reduceMotion;

    function render() {
      const s = STAGES[stage];
      const bio = sw.checked;
      tabs.forEach((t, i) => { const on = i === stage; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", on); t.style.setProperty("--stc", STAGES[i].color); });
      $$(".ring-seg").forEach((g, i) => { g.classList.toggle("is-on", i === stage); g.setAttribute("aria-selected", i === stage); });
      swLabel.textContent = bio ? "Con BIOBIM" : "Tradicional";
      body.classList.toggle("trad", !bio);
      $("#stPhase").textContent = `Etapa 0${stage + 1} · ${s.phase}`;
      $("#stTitle").textContent = s.title;
      $("#stText").textContent = bio ? s.bio : s.trad;
      $("#stTools").innerHTML = bio
        ? s.tools.map((id) => { const t = toolById[id]; return t ? `<button class="chip" style="--c:${t.color}" data-open-tool="${id}"><i></i>${t.nombre}</button>` : ""; }).join("")
        : s.tradTools.map((n) => `<span class="chip off" style="--c:var(--heat)"><i></i>${n}</span>`).join("");
      body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
    }
    const setStage = (i) => { stage = i; render(); };
    tabs.forEach((t, i) => t.addEventListener("click", () => { auto = false; setStage(i); }));
    $("#ringSegs").addEventListener("click", (e) => { const g = e.target.closest(".ring-seg"); if (g) { auto = false; setStage(+g.dataset.stage); } });
    $("#ringSegs").addEventListener("keydown", (e) => {
      const g = e.target.closest(".ring-seg");
      if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); auto = false; setStage(+g.dataset.stage); }
    });
    sw.addEventListener("change", () => { auto = false; render(); });

    // Recorrido automático suave mientras el usuario no interactúa
    let inView = false;
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: 0.4 }).observe($(".process"));
    setInterval(() => { if (auto && inView && currentView === "lab") setStage((stage + 1) % STAGES.length); }, 5200);
    render();
  })();

  /* ------------------------------------------------------------------
     Herramientas: tarjetas, filtros y modal
     ------------------------------------------------------------------ */
  const ICONS = {
    lugar: `<svg viewBox="0 0 40 40"><path class="ic-contour" d="M4 30c4-10 28-10 32 0"/><path class="ic-contour" d="M10 30c3-5 17-5 20 0"/><path d="M20 6c-4 0-7 3-7 7 0 5 7 11 7 11s7-6 7-11c0-4-3-7-7-7z"/><circle cx="20" cy="13" r="2.4"/></svg>`,
    solar: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="6.5"/><g class="ic-rays"><path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.5 3.5M31.3 8.7l-3.5 3.5M12.2 27.8l-3.5 3.5"/></g></svg>`,
    ventilacion: `<svg viewBox="0 0 40 40"><g class="ic-wind"><path d="M4 14h20a5 5 0 1 0-5-5"/><path d="M4 21h28a5 5 0 1 1-5 5"/><path d="M4 28h12"/></g></svg>`,
    termico: `<svg viewBox="0 0 40 40"><rect class="ic-therm-fill" x="17.5" y="10" width="5" height="20" rx="2.5"/><path d="M15 24V8a5 5 0 0 1 10 0v16a8 8 0 1 1-10 0z"/><path d="M29 10h5M29 16h5M29 22h3"/></svg>`,
    acustico: `<svg viewBox="0 0 40 40"><path d="M6 16h6l8-7v22l-8-7H6z"/><path class="ic-wave" d="M25 15a7 7 0 0 1 0 10"/><path class="ic-wave" d="M29 11a13 13 0 0 1 0 18"/><path class="ic-wave" d="M33 7a19 19 0 0 1 0 26"/></svg>`,
    cfd: `<svg viewBox="0 0 40 40"><rect x="16" y="16" width="10" height="16" rx="1"/><path class="ic-stream" d="M2 12c8 0 12 0 16-2s12-2 20 0"/><path class="ic-stream" d="M2 20c6 0 10 -6 14 -6"/><path class="ic-stream" d="M26 14c4 0 6 6 12 6"/><path class="ic-stream" d="M2 34h36"/></svg>`,
  };

  /* Fases del proyecto arquitectónico y criterios bioclimáticos de cada una */
  const PHASES = [
    {
      name: "Prefactibilidad", alt: "Fase de estudio previo", color: "var(--ph0)", stage: 1,
      scope: "Investigación inicial, análisis del lugar y definición del programa. Se recopilan datos de campo, se revisa la normativa, se evalúa la viabilidad y se establecen las necesidades y requisitos del cliente.",
      result: "Información detallada sobre el lugar, comprensión de limitaciones y oportunidades, y un programa de requisitos.",
      criterios: ["orientacion", "clima", "certificacion"],
    },
    {
      name: "Idea básica", alt: "Fase de prediseño", color: "var(--ph1)", stage: 2,
      scope: "Desarrollo de ideas y conceptos iniciales en respuesta a los datos recopilados en la prefactibilidad.",
      result: "Conceptos de diseño y esquemas iniciales que muestran la disposición general y la forma del edificio.",
      criterios: ["soleamiento", "clima", "ventilacion", "orientacion", "certificacion"],
    },
    {
      name: "Anteproyecto", alt: "Fase de diseño", color: "var(--ph2)", stage: 3,
      scope: "Refinamiento del diseño conceptual, con detalles más específicos sobre materiales, estructuras y sistemas.",
      result: "Planos detallados y especificaciones que definen claramente el diseño para su construcción.",
      criterios: ["soleamiento", "ventilacion", "iluminacion", "temperatura", "materiales", "acustica", "certificacion"],
    },
    {
      name: "Proyecto", alt: "Fase de posdiseño", color: "var(--ph3)", stage: 3,
      scope: "Preparación de dibujos técnicos y documentos necesarios para la construcción.",
      result: "Conjunto completo de documentos de construcción listos para la licitación o construcción.",
      criterios: ["materiales", "acustica", "certificacion"],
    },
  ];

  const CRITERIA = {
    orientacion: { n: "Orientación", i: `<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>` },
    soleamiento: { n: "Soleamiento", i: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>` },
    clima: { n: "Clima", i: `<circle cx="9" cy="10" r="3.2"/><path d="M9 3v1.5M3 10h1.5M4.8 5.8l1 1M13.2 5.8l-1 1"/><path d="M16 12v10M12.5 14l7 6M19.5 14l-7 6"/>` },
    ventilacion: { n: "Ventilación", i: `<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h16a3 3 0 1 1-3 3"/><path d="M3 19h7"/>` },
    iluminacion: { n: "Iluminación", i: `<path d="M3 17h18"/><path d="M7 17a5 5 0 0 1 10 0"/><path d="M12 4v4M5 9l2 2M19 9l-2 2"/>` },
    temperatura: { n: "Temperatura", i: `<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 10v6"/>` },
    acustica: { n: "Acústica", i: `<path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h0"/>` },
    materiales: { n: "Materiales", i: `<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9l6-6M3 15l12-12M3 21L21 3M9 21l12-12M15 21l6-6"/>` },
    energia: { n: "Energía", i: `<circle cx="12" cy="12" r="9"/><path d="M13 6l-4 7h4l-2 5"/>` },
    certificacion: { n: "Certificación", i: `<path d="M12 2l2.4 2 3.1-.3.7 3 2.6 1.8-1.3 2.8 1.3 2.8-2.6 1.8-.7 3-3.1-.3L12 22l-2.4-2-3.1.3-.7-3L3.2 15.5 4.5 12.7 3.2 9.9l2.6-1.8.7-3 3.1.3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>` },
  };
  const critIcon = (k) => `<svg viewBox="0 0 24 24" class="ci">${CRITERIA[k].i}</svg>`;

  const ORDERED = TOOLS.slice().sort((a, b) => (a.orden || 99) - (b.orden || 99));
  const isLive = (t) => !!(t.url && t.url.trim());
  const phaseList = (idx) => idx.map((i) => PHASES[i].name).join(" · ");
  const toolsInPhase = (p) => ORDERED.filter((t) => t.entra.includes(p) || (t.puede || []).includes(p));

  /* Adelanto en la vista Laboratorio */
  $("#teaserOrder").innerHTML = ORDERED.map((t) => `
    <li style="--c:${t.color}" data-open-tool="${t.id}">
      <span class="to-n">${t.orden}</span>
      <span class="tool-ic">${ICONS[t.id]}</span>
      <span class="to-t"><b>${t.nombre}</b><small>Entra en ${PHASES[t.entra[0]].name}</small></span>
    </li>`).join("");

  /* 01 · Fases: chevrons + tarjeta */
  let phaseSel = 0;
  const chevrons = $("#chevrons");
  chevrons.innerHTML = PHASES.map((p, i) => `
    <button class="chev" role="tab" data-p="${i}" style="--pc:${p.color}">
      <span class="mono">0${i + 1}</span><b>${p.name}</b><small>${p.alt}</small>
    </button>`).join("");

  function setPhase(i) {
    phaseSel = i;
    const p = PHASES[i];
    $$(".chev", chevrons).forEach((b, k) => { b.classList.toggle("is-on", k === i); b.setAttribute("aria-selected", k === i); });
    const card = $("#phaseCard");
    card.style.setProperty("--pc", p.color);
    $("#pcKicker").textContent = `Fase 0${i + 1} · ${p.alt} · Etapa BIOBIM 0${p.stage}`;
    $("#pcTitle").textContent = p.name;
    $("#pcScope").textContent = p.scope;
    $("#pcResult").textContent = p.result;
    $("#pcCriteria").innerHTML = p.criterios.map((k) => `<span class="crit-chip">${critIcon(k)}${CRITERIA[k].n}</span>`).join("");
    $("#pcTools").innerHTML = toolsInPhase(i).map((t) => {
      const core = t.entra.includes(i);
      return `<button class="pc-tool ${core ? "" : "opt"}" style="--c:${t.color}" data-open-tool="${t.id}">
        <span class="tool-ic">${ICONS[t.id]}</span>
        <span><b>${t.orden}. ${t.nombre}</b><small>${core ? "Entra" : "Puede entrar como apoyo"}</small></span>
      </button>`;
    }).join("");
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
    $$("[data-col]").forEach((el) => el.classList.toggle("col-on", +el.dataset.col === i));
  }
  chevrons.addEventListener("click", (e) => { const b = e.target.closest(".chev"); if (b) setPhase(+b.dataset.p); });

  /* 02 · Mapa de implementación */
  const mapGrid = $("#mapGrid");
  let mapHtml = `<div class="mg-corner mono tiny">Orden · herramienta</div>` +
    PHASES.map((p, i) => `<button class="mg-head" data-col="${i}" style="--pc:${p.color}"><b>${p.name}</b><small>${p.alt}</small></button>`).join("");
  ORDERED.forEach((t) => {
    const state = PHASES.map((_, i) => (t.entra.includes(i) ? "core" : (t.puede || []).includes(i) ? "opt" : ""));
    const first = state.indexOf("core");
    mapHtml += `<button class="mg-tool" data-row="${t.id}" data-open-tool="${t.id}" style="--c:${t.color}">
        <span class="to-n">${t.orden}</span><span class="tool-ic">${ICONS[t.id]}</span><b>${t.nombre}</b>
      </button>`;
    state.forEach((s, i) => {
      const l = !state[i - 1], r = !state[i + 1];
      mapHtml += `<div class="mg-cell" data-row="${t.id}" data-col="${i}" style="--c:${t.color}">
        ${s ? `<span class="bar ${s} ${l ? "l" : ""} ${r ? "r" : ""}" title="${s === "core" ? "Entra" : "Puede entrar"} en ${PHASES[i].name}">${i === first ? `<i class="start"></i>` : ""}</span>` : ""}
      </div>`;
    });
  });
  mapGrid.innerHTML = mapHtml;
  mapGrid.addEventListener("click", (e) => { const h = e.target.closest(".mg-head"); if (h) setPhase(+h.dataset.col); });
  mapGrid.addEventListener("pointerover", (e) => {
    const el = e.target.closest("[data-row]");
    mapGrid.classList.toggle("has-focus", !!el);
    $$("[data-row]", mapGrid).forEach((x) => x.classList.toggle("row-on", !!el && x.dataset.row === el.dataset.row));
  });
  mapGrid.addEventListener("pointerleave", () => { mapGrid.classList.remove("has-focus"); $$(".row-on", mapGrid).forEach((x) => x.classList.remove("row-on")); });

  /* 03 · Criterios por fase */
  $("#critTable").innerHTML = `
    <thead><tr><th>Criterio</th>${PHASES.map((p, i) => `<th data-col="${i}" style="--pc:${p.color}">${p.name}</th>`).join("")}<th>Herramienta BIOBIM</th></tr></thead>
    <tbody>${Object.keys(CRITERIA).map((k) => {
      const tools = ORDERED.filter((t) => t.criterios.includes(k));
      return `<tr>
        <th scope="row"><span class="crit-name">${critIcon(k)}${CRITERIA[k].n}</span></th>
        ${PHASES.map((p, i) => `<td data-col="${i}" style="--pc:${p.color}">${p.criterios.includes(k) ? `<span class="cdot" title="${CRITERIA[k].n} en ${p.name}"></span>` : `<span class="cnone"></span>`}</td>`).join("")}
        <td class="ctools">${tools.length
          ? tools.map((t) => `<button class="chip" style="--c:${t.color}" data-open-tool="${t.id}"><i></i>${t.nombre}</button>`).join("")
          : `<span class="muted small">Software especializado</span>`}</td>
      </tr>`;
    }).join("")}</tbody>`;

  /* Ruta de implementación */
  (function route() {
    const steps = $("#routeSteps");
    const note = $("#routeNote");
    const title = $("#routeTitle");
    const playBtn = $("#routePlay");
    steps.innerHTML = ORDERED.map((t) => `
      <li><button class="rstep" data-id="${t.id}" style="--c:${t.color}">
        <span class="to-n">${t.orden}</span><span class="tool-ic">${ICONS[t.id]}</span><b>${t.nombre}</b>
      </button></li>`).join("");
    const strip = document.createElement("div");
    strip.className = "route-strip";
    strip.innerHTML = PHASES.map((p, i) => `<div class="rs-seg" data-i="${i}" style="--pc:${p.color}"><span></span><small>${p.name}</small></div>`).join("");
    steps.after(strip);

    let cur = -1, timer = null;
    function show(k) {
      cur = k;
      const t = ORDERED[k];
      $$(".rstep", steps).forEach((b, i) => { b.classList.toggle("is-on", i === k); b.classList.toggle("is-past", i < k); });
      steps.style.setProperty("--prog", ORDERED.length > 1 ? k / (ORDERED.length - 1) : 0);
      $$(".rs-seg", strip).forEach((s, i) => {
        s.classList.toggle("core", t.entra.includes(i));
        s.classList.toggle("opt", (t.puede || []).includes(i));
        s.style.setProperty("--c", t.color);
      });
      title.textContent = `Paso ${t.orden} · ${t.nombre}`;
      const deps = (t.usa || []).map((id) => toolById[id]).filter(Boolean);
      $$(".rstep", steps).forEach((b) => b.classList.toggle("is-dep", deps.some((d) => d.id === b.dataset.id)));
      note.innerHTML = `<b>Entra en ${phaseList(t.entra)}</b>${t.puede && t.puede.length ? ` · puede entrar en ${phaseList(t.puede)}` : ""}. ${t.porque}` +
        `<span class="route-deps">${deps.length ? `Usa resultados de: ${deps.map((d) => `<i style="--c:${d.color}">${d.orden}. ${d.nombre}</i>`).join("")}` : "No depende de otra herramienta: es el punto de partida."}</span>`;
    }
    function stop() { clearInterval(timer); timer = null; playBtn.classList.remove("playing"); $("span", playBtn).textContent = "Recorrer la ruta"; }
    steps.addEventListener("click", (e) => { const b = e.target.closest(".rstep"); if (b) { stop(); show(ORDERED.findIndex((t) => t.id === b.dataset.id)); } });
    playBtn.addEventListener("click", () => {
      if (timer) return stop();
      playBtn.classList.add("playing");
      $("span", playBtn).textContent = "Pausar";
      show(cur < 0 || cur >= ORDERED.length - 1 ? 0 : cur + 1);
      timer = setInterval(() => { if (cur >= ORDERED.length - 1) return stop(); show(cur + 1); }, 2600);
    });
    show(0);
  })();

  /* 04 · Catálogo */
  const grid = $("#toolsGrid");
  grid.innerHTML = ORDERED.map((t, i) => {
    const live = isLive(t);
    const phases = t.entra.concat(t.puede || []).join(" ");
    return `
    <article class="tool card reveal" style="--c:${t.color}; --d:${i * 0.07}s" data-phases="${phases}" data-open-tool="${t.id}" tabindex="0" role="button" aria-label="${t.nombre}: ver detalle">
      <div class="tool-top">
        <div class="tool-ic">${ICONS[t.id] || ICONS.solar}</div>
      </div>
      <span class="tool-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></span>
      <div>
        <span class="tool-n">PASO 0${t.orden} / 0${TOOLS.length}</span>
        <h3>${t.nombre}</h3>
      </div>
      <p>${t.resumen}</p>
      <div class="tool-phases">${PHASES.map((p, k) => `<span class="${t.entra.includes(k) ? "core" : (t.puede || []).includes(k) ? "opt" : ""}" title="${p.name}"></span>`).join("")}</div>
      <div class="tool-meta">
        <span class="stage-tag">ENTRA EN · ${phaseList(t.entra).toUpperCase()}</span>
        <span class="status ${live ? "live" : ""}"><i></i>${live ? "Disponible" : "Próximamente"}</span>
      </div>
    </article>`;
  }).join("");

  $$("#toolFilters .filter").forEach((b) => b.addEventListener("click", () => {
    $$("#toolFilters .filter").forEach((x) => x.classList.toggle("is-on", x === b));
    const f = b.dataset.f;
    $$(".tool", grid).forEach((c) => c.classList.toggle("dim", f !== "all" && !c.dataset.phases.split(" ").includes(f)));
  }));

  setPhase(0);

  const modal = $("#toolModal");
  function openTool(id) {
    const t = toolById[id];
    if (!t) return;
    const live = !!(t.url && t.url.trim());
    $(".md-inner", modal).style.setProperty("--c", t.color);
    $("#mdIcon").innerHTML = `<div class="tool-ic" style="--c:${t.color}">${ICONS[t.id]}</div>`;
    $("#mdStage").textContent = `Paso 0${t.orden} · Entra en ${phaseList(t.entra)}`;
    const mdDeps = (t.usa || []).map((id) => toolById[id]).filter(Boolean).map((d) => d.nombre);
    $("#mdWhy").textContent = (t.porque || "") + (mdDeps.length ? ` Usa resultados de: ${mdDeps.join(", ")}.` : "");
    $("#mdTitle").textContent = t.nombre;
    $("#mdDesc").textContent = t.descripcion;
    $("#mdIn").innerHTML = t.entradas.map((x) => `<li>${x}</li>`).join("");
    $("#mdOut").innerHTML = t.salidas.map((x) => `<li>${x}</li>`).join("");
    $("#mdLearn").textContent = t.aprendes;
    $("#mdActions").innerHTML = live
      ? `<a class="btn btn-primary" href="${t.url}" target="_blank" rel="noopener">Abrir herramienta <svg viewBox="0 0 24 24"><path d="M7 17L17 7M8 7h9v9"/></svg></a>`
      : `<span class="btn btn-ghost" aria-disabled="true">Abrir herramienta</span><span class="note">Esta herramienta estará disponible pronto.</span>`;
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open-tool]");
    if (el) openTool(el.dataset.openTool);
  });
  grid.addEventListener("keydown", (e) => {
    const el = e.target.closest(".tool");
    if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openTool(el.dataset.openTool); }
  });
  $("#mdClose").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  /* ------------------------------------------------------------------
     Maestría a fondo: pestañas, ritmos, metodología y selección
     ------------------------------------------------------------------ */
  (function master() {
    const box = $("#maestria");
    if (!box) return;
    const SVGNS = "http://www.w3.org/2000/svg";

    // Pestañas con indicador deslizante
    const tabs = $$(".msc-tab", box);
    const ink = $(".msc-ink", box);
    const placeInk = () => {
      const on = tabs.find((t) => t.classList.contains("is-on"));
      if (!on || !on.offsetWidth) return;
      ink.style.width = on.offsetWidth + "px";
      ink.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    tabs.forEach((t) => t.addEventListener("click", () => {
      tabs.forEach((x) => { const on = x === t; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", on); });
      $$(".msc-panel", box).forEach((p) => {
        const on = p.dataset.panel === t.dataset.t;
        p.hidden = !on;
        p.classList.toggle("is-on", on);
      });
      placeInk();
      t.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
    }));
    addEventListener("resize", placeInk);
    new IntersectionObserver(([en]) => { if (en.isIntersecting) placeInk(); }).observe(box);

    // Ritmos: diseño BIM vs asesoría bioclimática
    const X0 = 110, X1 = 400, YD = 36, YA = 124;
    const designTicks = [];
    for (let x = X0; x <= X1; x += 24) designTicks.push(x);
    const el = (tag, attrs) => { const n = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    const gD = $("#syDesign"), gA = $("#syAdvice"), gL = $("#syLinks");
    designTicks.forEach((x) => gD.appendChild(el("circle", { cx: x, cy: YD, r: 5, class: "sy-dot d" })));
    const MODES = {
      trad: {
        advice: [300, 385],
        links: [[134, 300], [158, 300], [182, 300], [326, 385]],
        label: "Tradicional",
        note: "La asesoría llega en consultas puntuales y tardías: muchas decisiones de diseño ya se tomaron sin información bioclimática.",
      },
      sync: {
        advice: [134, 182, 230, 278, 326, 374],
        links: [[134, 134], [182, 182], [230, 230], [278, 278], [326, 326], [374, 374]],
        label: "Con la metodología",
        note: "La revisión bioclimática acompaña cada ciclo del modelo BIM: la información llega mientras la forma todavía se puede cambiar.",
      },
    };
    function drawSync(mode) {
      const m = MODES[mode];
      gA.innerHTML = ""; gL.innerHTML = "";
      m.links.forEach(([xd, xa], i) => {
        const p = el("path", { d: `M${xd} ${YD + 6} C ${xd} ${(YD + YA) / 2}, ${xa} ${(YD + YA) / 2}, ${xa} ${YA - 7}`, class: `sy-link ${mode}` });
        p.style.animationDelay = i * 0.08 + "s";
        gL.appendChild(p);
      });
      m.advice.forEach((x, i) => {
        const c = el("circle", { cx: x, cy: YA, r: mode === "trad" ? 9 : 6, class: `sy-dot a ${mode}` });
        c.style.animationDelay = i * 0.08 + "s";
        gA.appendChild(c);
      });
      $("#syncLabel").textContent = m.label;
      $("#syncNote").textContent = m.note;
      $("#sync").classList.toggle("is-sync", mode === "sync");
    }
    $("#syncSwitch").addEventListener("change", (e) => drawSync(e.target.checked ? "sync" : "trad"));
    drawSync("trad");

    // Metodología: 9 actividades + cronograma de 6 meses
    const STAGE_C = ["var(--leaf)", "var(--wind)", "var(--flow)"];
    const STAGE_N = ["Evaluar", "Contrastar", "Analizar"];
    const STEPS = [
      { s: 0, v: "Revisión", t: "de antecedentes para definir los requerimientos y limitaciones de la ruta metodológica.", o: "Revisión bibliográfica", a: 0, d: 1 },
      { s: 0, v: "Entrevistas", t: "no estructuradas con arquitectos, bioclimáticos y diseñadores (A · B · D) para perfeccionar la ruta.", o: "Ruta ajustada con usuarios reales", a: 1, d: 1 },
      { s: 0, v: "Definición", t: "de una ruta metodológica BIM acorde a las necesidades de los usuarios y al estado actual.", o: "Ruta metodológica", a: 1.4, d: 1.5 },
      { s: 1, v: "Definición", t: "de los criterios para la selección de los espacios a analizar.", o: "Criterios de selección", a: 2.5, d: 1.5 },
      { s: 1, v: "Experimentación", t: "con la metodología sobre algunos espacios.", o: "Perfeccionamiento de la metodología", a: 3.5, d: 1.5 },
      { s: 1, v: "Aplicación", t: "sobre un caso real, a los espacios seleccionados bajo los criterios propuestos.", o: "Perfeccionamiento de la metodología", a: 3.5, d: 1.5 },
      { s: 2, v: "Evaluación", t: "de los resultados de los estudios de caso analizados.", o: "Resultados y conclusiones", a: 4.5, d: 1.5 },
      { s: 2, v: "Comprobación", t: "de la eficacia de la metodología.", o: "Resultados y conclusiones", a: 4.5, d: 1.5 },
      { s: 2, v: "Validación", t: "con expertos diseñadores y bioclimáticos de la metodología y sus conclusiones.", o: "Resultados y conclusiones", a: 4.5, d: 1.5 },
    ];
    const list = $("#methodSteps"), gantt = $("#gantt"), out = $("#methodOut");
    let html = "", gh = "";
    STEPS.forEach((st, i) => {
      const k = (i % 3) + 1;
      if (k === 1) html += `<li class="ms-stage" style="--c:${STAGE_C[st.s]}"><span>Etapa ${st.s + 1}</span><b>${STAGE_N[st.s]}</b></li>`;
      html += `<li><button class="ms-step" data-i="${i}" style="--c:${STAGE_C[st.s]}"><span class="ms-n">0${k}</span><span><b>${st.v}</b> ${st.t}</span></button></li>`;
      gh += `<div class="g-row" data-i="${i}"><span class="g-lab">${st.s + 1}.0${k}</span><div class="g-track"><span class="g-bar" style="--c:${STAGE_C[st.s]}; left:${(st.a / 6) * 100}%; width:${(st.d / 6) * 100}%">${String(st.d).replace(".", ",")}</span></div></div>`;
    });
    list.innerHTML = html;
    gantt.innerHTML = gh;
    function pick(i) {
      $$(".ms-step", list).forEach((b) => b.classList.toggle("is-on", +b.dataset.i === i));
      $$(".g-row", gantt).forEach((r) => r.classList.toggle("is-on", +r.dataset.i === i));
      gantt.classList.add("has-pick");
      const st = STEPS[i];
      out.innerHTML = `<span class="mono tiny">Producto</span><br><b>${st.o}</b> · inicia en el mes ${Math.floor(st.a) + 1}, duración ${String(st.d).replace(".", ",")} ${st.d === 1 ? "mes" : "meses"}`;
    }
    list.addEventListener("click", (e) => { const b = e.target.closest(".ms-step"); if (b) pick(+b.dataset.i); });
    gantt.addEventListener("click", (e) => { const r = e.target.closest(".g-row"); if (r) pick(+r.dataset.i); });
    pick(0);

    // Aporte: planta esquemática (ilustrativa) con selección estratégica
    const svg = $("#planSvg");
    const ROOMS = [
      [20, 20, 110, 80], [130, 20, 90, 80], [220, 20, 90, 80], [310, 20, 70, 80],
      [20, 100, 80, 70], [100, 100, 120, 70, 1], [220, 100, 80, 70], [300, 100, 80, 70],
      [20, 170, 110, 70], [130, 170, 80, 70], [210, 170, 90, 70], [300, 170, 80, 70],
    ];
    const PICK = { 3: "var(--sun)", 8: "var(--wind)", 5: "var(--sound)" };
    let ph = `<defs><marker id="pArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="p-arrow"/></marker></defs>`;
    ROOMS.forEach(([x, y, w, h, hall], i) => {
      ph += `<rect class="p-room ${hall ? "hall" : ""}" data-i="${i}" x="${x}" y="${y}" width="${w}" height="${h}" style="--pc:${PICK[i] || "var(--muted)"}"/>`;
    });
    ph += `<g class="p-sun"><circle cx="392" cy="10" r="6"/><path d="M386 16 L 372 30" marker-end="url(#pArr)"/></g>`;
    ph += `<g class="p-wind"><path d="M2 205 h14" marker-end="url(#pArr)"/><path d="M2 220 h14" marker-end="url(#pArr)"/></g>`;
    svg.innerHTML = ph;
    const plan = $("#plan");
    const pbtns = $$(".tg", plan), ppill = $(".tg-pill", plan);
    function setPlan(mode) {
      pbtns.forEach((b) => { const on = b.dataset.mode === mode; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); });
      const on = pbtns.find((b) => b.dataset.mode === mode);
      ppill.style.width = on.offsetWidth + "px";
      ppill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
      plan.classList.toggle("sel", mode === "sel");
      $$(".p-room", svg).forEach((r) => r.classList.toggle("picked", mode === "sel" && PICK[r.dataset.i] != null));
      const total = ROOMS.length, n = mode === "sel" ? Object.keys(PICK).length : total;
      $("#planCount").textContent = `${n} de ${total}`;
      $("#planBar").style.width = (n / total) * 100 + "%";
    }
    pbtns.forEach((b) => b.addEventListener("click", () => setPlan(b.dataset.mode)));
    setPlan("all");
    // recolocar la píldora cuando el panel se muestra
    tabs.forEach((t) => t.addEventListener("click", () => {
      if (t.dataset.t === "aporte") requestAnimationFrame(() => setPlan(plan.classList.contains("sel") ? "sel" : "all"));
    }));
  })();

  /* ------------------------------------------------------------------
     Fases doctorales
     ------------------------------------------------------------------ */
  (function phases() {
    const DESC = [
      "Revisión sistemática en tres ejes: BIM en la educación, pedagogía del diseño bioclimático y herramientas de mediación tecnológica. Cada fuente se clasifica por proximidad temática a BIOBIM.",
      "Análisis del modelo y diagnóstico validados en la maestría para derivar los requisitos pedagógicos y técnicos: retroalimentación ágil, baja fricción y resultados medibles.",
      "Diseño de los andamios (scaffolds) para cada etapa, del reto de diseño compartido y de los instrumentos de medición, revisados por juicio de expertos.",
      "Diseño cuasi-experimental de métodos mixtos: Grupo Control vs. Grupo Experimental (n ≈ 10–20). ANCOVA, Mann-Whitney / GLM, escala IMI y entrevistas para triangular.",
    ];
    const btns = $$(".phase");
    const desc = $("#phaseDesc");
    const fill = $("#phaseFill");
    const set = (i) => {
      btns.forEach((b, k) => b.classList.toggle("is-on", k === i));
      desc.textContent = DESC[i];
      fill.style.width = (i / (btns.length - 1)) * 100 + "%";
    };
    btns.forEach((b, i) => { b.addEventListener("click", () => set(i)); b.addEventListener("mouseenter", () => set(i)); });
    new IntersectionObserver(([en], obs) => { if (en.isIntersecting) { set(3); obs.disconnect(); } }, { threshold: 0.5 }).observe($(".phases"));
    desc.textContent = DESC[0];
  })();

  /* ------------------------------------------------------------------
     PORTAFOLIO
     ------------------------------------------------------------------ */
  // Roles con efecto de escritura
  (function typed() {
    const el = $("#typed");
    const roles = ["bioclimático", "coordinador BIM", "docente universitario", "investigador BIOBIM"];
    if (reduceMotion) { el.textContent = roles.join(" · "); return; }
    let r = 0, c = 0, del = false;
    const step = () => {
      const word = roles[r];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      let wait = del ? 40 : 85;
      if (!del && c === word.length) { del = true; wait = 1700; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 300; }
      setTimeout(step, wait);
    };
    step();
  })();

  // Trayectoria
  const TIMELINE = [
    { y: "2024 — 2026", k: "pro", t: "EDU · Empresa de Desarrollo Urbano de Medellín", r: "Arquitecto bioclimático y diseñador", d: "Jardines Infantiles Buen Comienzo." },
    { y: "2023 — 2024", k: "edu", t: "Maestría en Bioclimática", r: "Universidad de San Buenaventura, Medellín", d: "Tesis: integración de estrategias bioclimáticas en el diseño a través de BIM (origen de BIOBIM)." },
    { y: "2024", k: "edu", t: "Profesional Avanzado CASA", r: "Consejo Colombiano de Construcción Sostenible", d: "Certificación en construcción sostenible." },
    { y: "2020 — 2025", k: "pro", t: "Índole Studio", r: "Arquitecto · Coordinador BIM (Revit)", d: "Ynikó Cottage & Lake, CROMA, Hygge, NUTHAMI, COCOON." },
    { y: "2020 — 2021", k: "pro", t: "Alcaldía de Bello", r: "Mejoramiento integral de barrios", d: "Estrategia de planeación territorial y fiscal eficiente." },
    { y: "2019", k: "edu", t: "Especialización en Construcción Sostenible", r: "Institución Universitaria Colegio Mayor de Antioquia", d: "" },
    { y: "2018 — 2026", k: "doc", t: "Colegio Mayor de Antioquia", r: "Arquitecto · Docente ocasional tiempo completo", d: "Docente de cátedra (2018–2024) y luego tiempo completo." },
    { y: "2018", k: "doc", t: "Universidad de San Buenaventura", r: "Profesor de cátedra", d: "Modelación paramétrica avanzada, representación digital, diseño arquitectónico 3." },
    { y: "2016 — 2017", k: "pro", t: "La B S.A.S.", r: "Arquitecto diseñador y asesor bioclimático", d: "Asesoría en colegios, hoteles y equipamientos." },
    { y: "2016 — 2017", k: "doc", t: "USB · Laboratorio de fabricación digital", r: "Laboratorista", d: "Fabricación digital y diseño paramétrico." },
    { y: "2016", k: "edu", t: "Diplomado en diseño bioclimático", r: "Universidad de San Buenaventura", d: "Comportamiento térmico de edificaciones." },
    { y: "2015 — 2016", k: "pro", t: "Aescala S.A.S.", r: "Auxiliar de arquitectura", d: "Promotora de proyectos, Medellín." },
    { y: "2012 — 2017", k: "edu", t: "Arquitectura", r: "Universidad de San Buenaventura, Medellín", d: "Matrícula de Honor por mejor promedio." },
  ];
  const KIND = { pro: ["Profesional", "var(--sun)"], doc: ["Docencia", "var(--leaf)"], edu: ["Formación", "var(--wind)"] };
  const tl = $("#timeline");
  tl.innerHTML = TIMELINE.map((e) => `
    <li class="tl reveal" data-k="${e.k}" style="--tc:${KIND[e.k][1]}">
      <div class="tl-card">
        <span class="tl-kind">${KIND[e.k][0]}</span>
        <span class="tl-y">${e.y}</span>
        <h3>${e.t}</h3>
        <p><b>${e.r}</b>${e.d ? " · " + e.d : ""}</p>
      </div>
    </li>`).join("");
  $$("#tlFilters .filter").forEach((b) => b.addEventListener("click", () => {
    $$("#tlFilters .filter").forEach((x) => x.classList.toggle("is-on", x === b));
    const f = b.dataset.f;
    $$(".tl", tl).forEach((li) => {
      li.classList.toggle("hide", f !== "all" && li.dataset.k !== f);
      li.classList.add("in");
    });
    updateTimelineLine();
  }));
  function updateTimelineLine() {
    if (currentView !== "portfolio" || !tl) return;
    const r = tl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
    tl.style.setProperty("--tl", p * 100 + "%");
  }

  // Proyectos
  const PROJECTS = [
    { n: "Jardines Infantiles Buen Comienzo", c: "EDU · Medellín", y: "2024–26", r: "Arquitecto bioclimático y diseñador", tags: ["bio", "edu"] },
    { n: "Parque lineal y parque de esquina", c: "Alcaldía de Moñitos", y: "2024", r: "Diseñador · Coordinador BIM", tags: ["urb", "bim"] },
    { n: "Ynikó Cottage & Lake", c: "Índole Studio · con certificación ambiental", y: "2020–24", r: "Diseñador · Coordinador BIM", tags: ["bim", "bio"] },
    { n: "COCOON", c: "Índole Studio · Guatapé", y: "2017–22", r: "Diseñador · Coordinador BIM · caso de estudio BIOBIM", tags: ["bim", "bio"] },
    { n: "CROMA Apartamentos", c: "Índole Studio", y: "2020–24", r: "Diseñador · Coordinador BIM", tags: ["bim"] },
    { n: "Hygge living & working", c: "Índole Studio", y: "2017–22", r: "Diseñador · Coordinador BIM", tags: ["bim"] },
    { n: "NUTHAMI", c: "Índole Studio", y: "2017–22", r: "Diseñador · Coordinador BIM", tags: ["bim"] },
    { n: "SENA sede Majagual", c: "Universidad Nacional de Colombia", y: "2017–22", r: "Diseño urbano y edificio de acceso", tags: ["urb", "edu", "bim"] },
    { n: "Malecón de Cocorná Sur", c: "Universidad Nacional de Colombia", y: "2017–22", r: "Proyecto urbano · Coordinador BIM", tags: ["urb", "bim"] },
    { n: "Malecón de Puerto Pizarro", c: "Universidad Nacional de Colombia", y: "2017–22", r: "Obra de protección costera", tags: ["urb"] },
    { n: "Malecón de Nuquí", c: "Universidad Nacional de Colombia", y: "2017–22", r: "Obra de protección costera", tags: ["urb"] },
    { n: "Ciclocaminabilidad Av. Regional Norte", c: "Universidad Nacional de Colombia", y: "2017–22", r: "Puente Madre Laura – Autopista Medellín-Bogotá", tags: ["urb"] },
    { n: "Parque de Ciudad Bolívar", c: "Universidad Nacional de Colombia", y: "2017–22", r: "Diseñador · Coordinador", tags: ["urb"] },
    { n: "Casa ML", c: "USB · Santa Fe de Antioquia", y: "2017–22", r: "Diseñador · Coordinador BIM", tags: ["bim"] },
    { n: "Casa Serna", c: "Copacabana", y: "2017–22", r: "Diseñador · Coordinador BIM", tags: ["bim"] },
    { n: "Hotel Cannua Ecolodge", c: "La B S.A.S. · Marinilla", y: "2016–17", r: "Asesor bioclimático", tags: ["bio"] },
    { n: "Hotel Click Clack", c: "HyS Arquitectos · Medellín", y: "2016–17", r: "Asesor bioclimático", tags: ["bio"] },
    { n: "Colegio Bartolomé de las Casas", c: "Plan B Arquitectos", y: "2016–17", r: "Asesor bioclimático", tags: ["bio", "edu"] },
    { n: "Tres colegios distritales", c: "Taller Síntesis · Bogotá", y: "2016–17", r: "El Porvenir, El Volcán, Diana Turbay · asesor bioclimático", tags: ["bio", "edu"] },
    { n: "Four Points by Sheraton", c: "Colectivo 720 / Dessin Studios · Medellín", y: "2016–17", r: "Restaurantes · asesor bioclimático y diseñador", tags: ["bio"] },
    { n: "Colegio y Fundación Lupines", c: "La B S.A.S. · Envigado", y: "2016", r: "Diseño y asesoría bioclimática", tags: ["bio", "edu"] },
    { n: "Centros intergeneracionales EDU", c: "Moscú, San Cristóbal y Agripina · Medellín", y: "2016", r: "Asesoría bioclimática", tags: ["bio"] },
    { n: "Edificio Científico Jardín Botánico", c: "USB Medellín", y: "2016", r: "Diseño y asesoría bioclimática", tags: ["bio"] },
    { n: "Barrios Sostenibles", c: "EDU · Universidad Nacional", y: "2016", r: "Diseño y asesoría bioclimática", tags: ["bio", "urb"] },
  ];
  const TAG = { bio: ["Bioclimática", "var(--sun)"], bim: ["BIM", "var(--wind)"], urb: ["Urbano", "var(--leaf)"], edu: ["Educativo", "var(--sound)"] };
  const pjBox = $("#projects");
  function renderProjects(f) {
    const list = PROJECTS.filter((p) => f === "all" || p.tags.includes(f));
    pjBox.innerHTML = list.map((p, i) => `
      <article class="pj pop" style="--c:${TAG[p.tags[0]][1]}; --d:${Math.min(i, 12) * 0.035}s">
        <span class="pj-y">${p.y}</span>
        <h3>${p.n}</h3>
        <p>${p.c}<br />${p.r}</p>
        <div class="pj-tags">${p.tags.map((t) => `<span>${TAG[t][0]}</span>`).join("")}</div>
      </article>`).join("");
  }
  $("#pjCount").textContent = PROJECTS.length;
  $$("#pjFilters .filter").forEach((b) => b.addEventListener("click", () => {
    $$("#pjFilters .filter").forEach((x) => x.classList.toggle("is-on", x === b));
    renderProjects(b.dataset.f);
  }));
  renderProjects("all");

  // Ponencias
  const TALKS = [
    { y: "2023", t: "V Encuentro de Experiencias Instrumentales", d: "Organizador y ponente · Procesos avanzados de diseño generativo en arquitectura" },
    { y: "2023", t: "IV Simposio Internacional para la Innovación y el Desarrollo Empresarial", d: "Experiencias digitales en los retos de la transformación digital" },
    { y: "2023", t: "Docente + Creador · Débora Arango", d: "Museografía virtual · primer laboratorio expositivo" },
    { y: "2022", t: "Foro BIM", d: "Ponencia: BIM y la bioclimática" },
    { y: "2022", t: "J11 · BIM y Bioclimática", d: "Tallerista" },
    { y: "2022", t: "Diálogos de Arquitectura y Urbanismo", d: "Procesos virtuales y escenarios como experiencia" },
    { y: "2020", t: "Cátedra Nómada", d: "Los laboratorios de fabricación frente a la cuarta revolución industrial" },
    { y: "2016", t: "EKOTECTURA · Bogotá", d: "Factores humanos incorporados a los procesos de diseño" },
    { y: "2016", t: "PVG Arquitectos", d: "Estrategias para espacios educativos óptimos desde la acústica según la ocupación" },
  ];
  $("#talks").innerHTML = TALKS.map((t) => `<li class="talk reveal"><span class="talk-y">${t.y}</span><div><b>${t.t}</b><span>${t.d}</span></div></li>`).join("");

  // Copiar correo
  const toast = $("#toast");
  let toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("show"), 2200);
  }
  $$(".copy-mail").forEach((b) => b.addEventListener("click", async () => {
    const mail = b.dataset.mail;
    try { await navigator.clipboard.writeText(mail); showToast("Correo copiado ✓"); }
    catch { location.href = "mailto:" + mail; }
  }));

  /* ------------------------------------------------------------------
     Arranque
     ------------------------------------------------------------------ */
  routeFromHash(true);
  observeReveals(document);
  placePill();
  requestAnimationFrame(placePill);
  document.fonts && document.fonts.ready.then(placePill);
  onScroll();
})();
