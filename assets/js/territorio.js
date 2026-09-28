/* =====================================================================
   EL TERRITORIO DE LA TRAYECTORIA · mundo 3D (Three.js)
   ---------------------------------------------------------------------
   Una gran pasarela central atraviesa trece preguntas de arquitectura,
   clima y modelo (2012 → hoy), tomadas del portafolio de David Volkmar Vélez. Cada portal es un año y lleva a una estación: una
   mini experiencia con un ejercicio interactivo que usa la técnica de
   representación de esa etapa (croquis, diagrama solar, superficie
   paramétrica, maqueta urbana, axonometría BIM, grafo…).

   Tres maneras de recorrerla:
   · Caminar con un personaje propio (se crea al entrar; hay un preajuste
     "Como David"). Por la pasarela aparecen hitos: premios, ponencias y
     certificaciones que se descubren al pasar.
   · Vista libre: orbitar, acercarse y desplazarse sobre la maqueta.
   · Recorrido guiado: la cámara (o el personaje) visita las estaciones.

   El sol avanza con los años: amanece en 2012 y llega al cenit hoy.
   Todo el contenido proviene de la hoja de vida del autor.
   ===================================================================== */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createAvatar, OPCIONES, DAVID, aleatorio } from "./territorio-avatar.js?v=12";
import { CAPITULOS, INTRO, GUIAS, VISITANTES, CHARLA, createDialog } from "./territorio-historia.js?v=12";
import { buildProps } from "./territorio-props.js?v=12";


const STATIONS = [
  { y: "2012–2017", t: "Arquitectura", org: "Universidad de San Buenaventura · Medellín", kind: "origen", c: "leaf",
    text: "Todo empieza por aprender a mirar: la forma, el clima y el lugar como un mismo problema. El dibujo a mano es la primera herramienta para pensar.",
    tech: "Croquis y dibujo a mano", tools: ["Dibujo", "AutoCAD", "SketchUp"],
    ex: "Todo proyecto empieza como un trazo. Lleva el croquis hasta el volumen construido y mira cómo la línea se vuelve sombra.",
    items: ["Propuesta de remodelación del Auditorio San Benito (2016)", "Matrícula de Honor (2015–2017)"] },
  { y: "2015–2016", t: "Aescala S.A.S.", org: "Promotora de proyectos · Medellín", role: "Auxiliar de arquitectura", kind: "vivienda", c: "sun",
    text: "La vivienda como primer taller: comparar volúmenes, alturas y voladizos antes de dibujar el detalle.",
    tech: "Modelo volumétrico", tools: ["AutoCAD", "SketchUp", "Photoshop"],
    ex: "El modelo volumétrico permite comparar opciones rápido: alturas, voladizos y giros antes de dibujar el detalle.",
    items: ["Casa FAM", "Casa L", "Casa FLP"] },
  { y: "2016–2017", t: "La B S.A.S.", org: "Asesoría y diseño bioclimático", role: "Arquitecto diseñador y asesor bioclimático", kind: "bio", c: "sun",
    text: "El clima como material de diseño: sol, sombra, ventilación y sonido estudiados en colegios, hoteles y equipamientos.",
    tech: "Diagrama solar", tools: ["Análisis solar", "Confort térmico", "Acústica"],
    ex: "Mueve la hora: el sol recorre su trayectoria y la sombra del edificio se calcula por proyección geométrica, como en una carta solar.",
    items: ["Hotel Cannua Ecolodge · Marinilla", "Hotel Click Clack · Medellín", "Colegio y Fundación Lupines", "Tres colegios distritales · Bogotá", "Centros intergeneracionales · EDU", "Edificio Científico Jardín Botánico", "Diplomado en diseño bioclimático · USB (2016)"] },
  { y: "2016–2017", t: "Laboratorio de fabricación digital", org: "Universidad de San Buenaventura", role: "Laboratorista", kind: "fab", c: "sound",
    text: "Del algoritmo a la pieza física: una regla bien escrita puede producir cientos de piezas distintas.",
    tech: "Superficie paramétrica", tools: ["Rhinoceros", "Grasshopper", "Fabricación digital"],
    ex: "Una sola regla (una onda) define las 63 piezas. Cambia la amplitud y la superficie completa se recalcula, como en Grasshopper.",
    items: ["Concurso Corona Pro Hábitat · centro cultural Karmatarua (2016)", "Mención de honor · DARP, Parque Fontanar del Río (2017)"] },
  { y: "2017–2022", t: "Universidad Nacional de Colombia", org: "Proyectos urbanos y de borde de agua", role: "Arquitecto diseñador · coordinador", kind: "urbano", c: "wind",
    text: "Bordes de agua en distintas regiones del país: el espacio público también puede proteger del río.",
    tech: "Maqueta urbana", tools: ["Revit", "AutoCAD", "Diseño urbano"],
    ex: "Sube la cota del agua: el malecón es espacio público y a la vez obra de protección. Por encima de su cota, el río entra a la ciudad.",
    items: ["Malecón de Cocorná Sur", "Malecón de Puerto Pizarro", "Malecón de Nuquí", "SENA sede Majagual", "Ciclocaminabilidad Av. Regional Norte", "Parque de Ciudad Bolívar"] },
  { y: "2017–2020", t: "Software y videojuegos", org: "Actividad paralela", role: "Diseño y desarrollo", kind: "software", c: "flow",
    text: "La programación como herramienta de representación: un mundo de juego es geometría con reglas.",
    tech: "Mundo low-poly", tools: ["Programación", "Diseño de videojuegos"],
    ex: "Un mundo de juego es geometría + reglas. Pasa del render sólido al alambre para ver la malla que hay debajo.",
    items: ["Base de este laboratorio web y sus herramientas interactivas"] },
  { y: "2018 – hoy", t: "Docencia universitaria", org: "Colegio Mayor de Antioquia · Universidad de San Buenaventura", role: "Profesor de cátedra (2018–2024) · docente de tiempo completo", kind: "docencia", c: "leaf",
    text: "Modelación paramétrica, representación digital y diseño en el aula: explicar una herramienta obliga a entenderla de nuevo.",
    tech: "Retícula y nube de puntos", tools: ["Modelación paramétrica", "Representación digital", "Diseño"],
    ex: "Así se enseña la modelación paramétrica: de una nube de puntos a una retícula, y de ahí a una superficie de doble curvatura.",
    items: ["Manejo de Instrumentos Digitales IV", "Representación Digital III", "Diseño Arquitectónico 3"] },
  { y: "2019", t: "Especialización en Construcción Sostenible", org: "Colegio Mayor de Antioquia", kind: "sostenible", c: "leaf",
    text: "Cada material tiene una historia antes y después del edificio: recursos, construcción, uso y fin de vida.",
    tech: "Diagrama de ciclo", tools: ["Construcción sostenible", "Ciclo de vida"],
    ex: "Recorre el ciclo de vida del edificio: materiales, construcción, uso y fin de vida. Cada etapa tiene su impacto.",
    items: [] },
  { y: "2020–2025", t: "Índole Studio", org: "Diseño y coordinación BIM", role: "Arquitecto · coordinador BIM (Revit)", kind: "bim", c: "wind",
    text: "Coordinar un modelo es lograr que estructura, fachada e instalaciones encajen, de la idea al detalle. En paralelo, mejoramiento integral de barrios en Bello (2020–2021).",
    tech: "Axonometría explotada BIM", tools: ["Revit", "BIM", "Coordinación"],
    ex: "Separa el modelo federado: losas, estructura, fachada, cubierta e instalaciones. Coordinar es hacer que todo vuelva a encajar.",
    items: ["Ynikó Cottage & Lake · con certificación ambiental", "CROMA Apartamentos", "Hygge living & working", "NUTHAMI", "COCOON"] },
  { y: "2016–2023", t: "Ponencias y divulgación", org: "Foros, cátedras y encuentros", kind: "red", c: "sound",
    text: "Las ideas crecen cuando se comparten: BIM y bioclimática, fabricación digital y diseño generativo en foros y encuentros académicos.",
    tech: "Red de conexiones", tools: ["Divulgación", "Diseño generativo", "Museografía virtual"],
    ex: "El conocimiento circula en red. Aumenta las conexiones y mira cómo las ideas viajan entre nodos.",
    items: ["EKOTECTURA · Bogotá (2016)", "Cátedra Nómada (2020, 2022)", "Foro BIM · BIM y la bioclimática (2022)", "V Encuentro de Experiencias Instrumentales · organizador (2023)"] },
  { y: "2023–2024", t: "Maestría en Bioclimática", org: "Universidad de San Buenaventura", kind: "maestria", c: "sun",
    text: "¿Cómo llevar las estrategias bioclimáticas al modelo BIM desde el inicio? Esa pregunta, trabajada como tesis, es el origen de BIOBIM.",
    tech: "Emblema BIOBIM", tools: ["BIM", "Simulación ambiental", "Metodología"],
    ex: "El símbolo de BIOBIM: el sol (clima) sobre el horizonte del modelo. Levántalo: cuando el clima entra al modelo, la decisión aparece.",
    items: ["Tesis: metodología BIM-bioclimática", "Caso de estudio: vivienda Coocon, Guatapé", "Profesional Avanzado CASA · CCCS"] },
  { y: "2024–2026", t: "EDU · Empresa de Desarrollo Urbano", org: "Medellín", role: "Arquitecto bioclimático y diseñador", kind: "edu", c: "leaf",
    text: "Espacios para la primera infancia pensados con el clima: aulas ventiladas, sombra y patio. También parques públicos en Moñitos (2024).",
    tech: "Sistema modular", tools: ["Diseño bioclimático", "Revit", "BIM"],
    ex: "Un sistema modular crece según el programa: agrega aulas alrededor del patio sin perder ventilación ni sombra.",
    items: ["Jardines Infantiles Buen Comienzo", "Parque lineal y parque de esquina · Moñitos"] },
  { y: "2026 →", t: "Propuesta doctoral · BIOBIM", org: "Universidad Nacional de Colombia · Facultad de Minas", kind: "doctorado", c: "flow",
    text: "Un modelo de enseñanza que integra la bioclimática al flujo BIM, con herramientas de andamiaje para estudiantes. Este laboratorio web es parte de esa búsqueda.",
    tech: "Grafo de conocimiento", tools: ["Investigación", "Pedagogía", "Herramientas digitales"],
    ex: "El andamiaje BIOBIM por niveles: de los datos climáticos a las seis herramientas, al modelo BIM y a la decisión de diseño.",
    items: ["Doctorado en Ingeniería · Sistemas e Informática (propuesta)", "BIOBIM Lab · este sitio"] },
];
const N = STATIONS.length;
const PIN_H = { bim: 12.5, red: 8.5, doctorado: 8, maestria: 7, bio: 7.5, sostenible: 5.5 };

/* Hitos que se descubren caminando por la pasarela (premios, ponencias, formación, proyectos) */
const HITOS = [
  { y: 2015.5, t: "Matrícula de Honor", d: "Mejor promedio · Universidad de San Buenaventura (2015–2017)", k: "premio" },
  { y: 2016.1, t: "Diplomado en diseño bioclimático", d: "Comportamiento térmico de edificaciones · USB", k: "formacion" },
  { y: 2016.3, t: "EKOTECTURA · Bogotá", d: "Ponencia: factores humanos incorporados a los procesos de diseño", k: "ponencia" },
  { y: 2016.7, t: "Concurso Corona Pro Hábitat", d: "Centro cultural Karmatarua, Jardín, Antioquia", k: "premio" },
  { y: 2017.2, t: "Mención de honor · DARP", d: "Centro deportivo y cultural, Parque Fontanar del Río, Bogotá", k: "premio" },
  { y: 2020.2, t: "Cátedra Nómada", d: "Los laboratorios de fabricación frente a la cuarta revolución industrial", k: "ponencia" },
  { y: 2020.7, t: "Alcaldía de Bello", d: "Mejoramiento integral de barrios (2020–2021)", k: "proyecto" },
  { y: 2022.2, t: "Foro BIM", d: "Ponencia: BIM y la bioclimática", k: "ponencia" },
  { y: 2022.6, t: "J11 · BIM y Bioclimática", d: "Tallerista", k: "ponencia" },
  { y: 2023.1, t: "V Encuentro de Experiencias Instrumentales", d: "Organizador y ponente · diseño generativo", k: "ponencia" },
  { y: 2023.6, t: "Docente + Creador · Débora Arango", d: "Museografía virtual · primer laboratorio expositivo", k: "ponencia" },
  { y: 2024.2, t: "Profesional Avanzado CASA", d: "Consejo Colombiano de Construcción Sostenible", k: "formacion" },
  { y: 2024.6, t: "Parques en Moñitos", d: "Parque lineal y parque de esquina · Alcaldía de Moñitos", k: "proyecto" },
];
const HITO_C = { premio: "sun", ponencia: "sound", formacion: "leaf", proyecto: "wind" };
const HITO_K = { premio: "Reconocimiento", ponencia: "Ponencia", formacion: "Formación", proyecto: "Proyecto" };
// Año de referencia de cada estación, para ubicar los hitos entre portales
const YS = [2012, 2015, 2016, 2016.5, 2017, 2017.5, 2018, 2019, 2020, 2021.5, 2023, 2024, 2026];
const UPV = new THREE.Vector3(0, 1, 0);


const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* ==================================================================
   SONIDO · sintetizado en Web Audio (sin archivos)
   drone suave + viento + agua, y una nota por estación (escala pentatónica)
   ================================================================== */
const Sound = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ac = null, master, rev, windG, waterG, noise, on = true, lastSlide = 0, lastPing = 0;
  try { on = localStorage.getItem("biobim-sound") !== "off"; } catch (e) { /* sin almacenamiento */ }
  const buf = (sec, ch, fill) => {
    const b = ac.createBuffer(ch, Math.floor(ac.sampleRate * sec), ac.sampleRate);
    for (let c = 0; c < ch; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = fill(i, d.length); }
    return b;
  };
  function start() {
    if (!AC) return;
    if (ac) { if (ac.state === "suspended") ac.resume(); return; }
    ac = new AC();
    master = ac.createGain(); master.gain.value = on ? 0.9 : 0;
    const comp = ac.createDynamicsCompressor();
    master.connect(comp); comp.connect(ac.destination);
    rev = ac.createConvolver();
    rev.buffer = buf(2.8, 2, (i, n) => (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3));
    const rg = ac.createGain(); rg.gain.value = 0.5; rev.connect(rg); rg.connect(master);
    noise = buf(4, 1, () => Math.random() * 2 - 1);
    // Drone: acorde abierto muy suave con filtro que respira
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
    [110, 164.81, 220.5].forEach((f, k) => {
      const o = ac.createOscillator(); o.type = k === 2 ? "triangle" : "sine"; o.frequency.value = f; o.detune.value = (k - 1) * 5;
      o.connect(lp); o.start();
    });
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07;
    const lg = ac.createGain(); lg.gain.value = 220; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const dg = ac.createGain(); dg.gain.value = 0; dg.gain.setTargetAtTime(0.03, ac.currentTime, 2.5);
    lp.connect(dg); dg.connect(master); dg.connect(rev);
    // Viento: ruido filtrado con ráfagas
    const ws = ac.createBufferSource(); ws.buffer = noise; ws.loop = true;
    const wf = ac.createBiquadFilter(); wf.type = "bandpass"; wf.frequency.value = 520; wf.Q.value = 0.8;
    const wl = ac.createOscillator(); wl.frequency.value = 0.09;
    const wlg = ac.createGain(); wlg.gain.value = 280; wl.connect(wlg); wlg.connect(wf.frequency); wl.start();
    windG = ac.createGain(); windG.gain.value = 0;
    ws.connect(wf); wf.connect(windG); windG.connect(master); ws.start();
    // Agua: ruido grave con oleaje (solo cerca de los malecones)
    const wa = ac.createBufferSource(); wa.buffer = noise; wa.loop = true; wa.playbackRate.value = 0.6;
    const af = ac.createBiquadFilter(); af.type = "lowpass"; af.frequency.value = 700;
    const am = ac.createGain(); am.gain.value = 0.6;
    const al = ac.createOscillator(); al.frequency.value = 0.3;
    const alg = ac.createGain(); alg.gain.value = 0.4; al.connect(alg); alg.connect(am.gain); al.start();
    waterG = ac.createGain(); waterG.gain.value = 0;
    wa.connect(af); af.connect(am); am.connect(waterG); waterG.connect(master); wa.start();
  }
  function note(f, o = {}) {
    if (!ac || !on) return;
    const { type = "sine", dur = 1.2, gain = 0.08, attack = 0.006, wet = 0.5, when = 0, glide = 0 } = o;
    const t = ac.currentTime + when;
    const osc = ac.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(f, t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur * 0.8);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    if (wet) { const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(rev); }
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0];
  return {
    start,
    get on() { return on; },
    toggle() {
      on = !on;
      try { localStorage.setItem("biobim-sound", on ? "on" : "off"); } catch (e) { /* */ }
      if (on) start();
      if (master) master.gain.setTargetAtTime(on ? 0.9 : 0, ac.currentTime, 0.15);
      return on;
    },
    chime(i) {                                               // nota propia de cada estación
      const f = SCALE[i % 5] * Math.pow(2, Math.floor(i / 5) - 1);
      note(f, { type: "triangle", dur: 2.2, gain: 0.08 });
      note(f * 1.5, { dur: 2.6, gain: 0.03, when: 0.07 });
      note(f * 2, { dur: 3, gain: 0.02, when: 0.14 });
    },
    tick() { note(2100, { dur: 0.06, gain: 0.018, wet: 0.15 }); },
    step(k = 0) { note(523.25 * Math.pow(2, (SCALE_STEPS[k % 5]) / 12), { type: "triangle", dur: 0.35, gain: 0.045, wet: 0.35 }); },
    slide(v) {
      const n = performance.now(); if (n - lastSlide < 70) return; lastSlide = n;
      note(260 + v * 780, { dur: 0.14, gain: 0.025, wet: 0.25 });
    },
    ping() {
      const n = performance.now(); if (n - lastPing < 260) return; lastPing = n;
      note(SCALE[(Math.random() * 5) | 0] * 2, { dur: 0.8, gain: 0.022, wet: 0.7 });
    },
    rise() { note(196, { dur: 1.6, gain: 0.05, glide: 587.33, wet: 0.6 }); note(392, { dur: 2.2, gain: 0.03, when: 0.9, type: "triangle" }); },
    whoosh(dur = 1.2) {
      if (!ac || !on) return;
      const t = ac.currentTime;
      const s = ac.createBufferSource(); s.buffer = noise;
      const f = ac.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
      f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.55); f.frequency.exponentialRampToValueAtTime(380, t + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.1);
    },
    ambience(wind, water) {
      if (!ac) return;
      const t = ac.currentTime;
      windG.gain.setTargetAtTime(wind, t, 0.6);
      waterG.gain.setTargetAtTime(water, t, 0.5);
    },
  };
})();
const SCALE_STEPS = [0, 2, 4, 7, 9];

/* ==================================================================
   ARRANQUE
   ================================================================== */
const canvas = $("#trCanvas");
const hasGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
if (!hasGL) fallback(); else {
  try { init(); } catch (e) { console.error(e); fallback(); }
}
function fallback() {
  window.__trReady = true;
  $("#trStart").hidden = true;
  $("#trFallback").hidden = false;
}


function init() {
  const cssVar = (n, d) => (getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d);
  const light = () => true;
  const col = (name) => new THREE.Color(cssVar(`--${name}`, "#ffb547"));

  const LOW = innerWidth < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  const DPR = Math.min(LOW ? 1.4 : 1.9, window.devicePixelRatio || 1);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);                                   // la resolución la maneja el paso de ilustración
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 2600);
  // Bruma atmosférica azul: lo lejano se aclara hacia el horizonte, como en una ilustración
  const fog = new THREE.Fog(0xcfe4f1, 320, 1700);
  // Mundo curvo: cada vértice baja según su distancia a la cámara (en el recorrido a pie se siente un planeta pequeño)
  const bendU = { value: 0 }, bendC = { value: new THREE.Vector2() }, BEND = { walk: 0.0011, orbit: 0.00012, create: 0.0011, title: 0.0026 };
  const BEND_CHUNK = `
    vec4 mvPosition = vec4( transformed, 1.0 );
    #ifdef USE_BATCHING
      mvPosition = batchingMatrix * mvPosition;
    #endif
    #ifdef USE_INSTANCING
      mvPosition = instanceMatrix * mvPosition;
    #endif
    mvPosition = modelMatrix * mvPosition;
    vec2 bendD = mvPosition.xz - uBendC;
    mvPosition.y -= dot( bendD, bendD ) * uBend;
    mvPosition = viewMatrix * mvPosition;
    gl_Position = projectionMatrix * mvPosition;`;
  const bendify = (m) => {
    if (!m || m.userData.bent || m.userData.cel || m.isShaderMaterial) return;
    m.userData.bent = true;
    const prev = m.onBeforeCompile;
    m.onBeforeCompile = (sh, r) => {
      if (prev) prev.call(m, sh, r);
      sh.uniforms.uBend = bendU; sh.uniforms.uBendC = bendC;
      sh.vertexShader = "uniform float uBend; uniform vec2 uBendC;\n" + sh.vertexShader.replace("#include <project_vertex>", BEND_CHUNK);
    };
    const key = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : null;
    m.customProgramCacheKey = () => "bend|" + (key ? key() : "");
    m.needsUpdate = true;
  };
  scene.fog = fog;
  const INK = new THREE.Color("#1b2226"), SHADOW = new THREE.Color("#3f6f78");

  /* ---------------- Paso de ilustración ----------------
     La escena se pinta en una textura (color + profundidad) y un sombreador la convierte en ilustración:
     línea fina en siluetas y quiebres, colores saturados, sombras teñidas de azul.
     La arquitectura, la pasarela y el personaje van con trazo limpio; el paisaje conserva un leve temblor. */
  const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType });
  rt.depthTexture = new THREE.DepthTexture(2, 2);
  rt.depthTexture.type = THREE.UnsignedIntType;
  const sketchU = {
    tDiffuse: { value: rt.texture }, tDepth: { value: rt.depthTexture }, res: { value: new THREE.Vector2(2, 2) },
    time: { value: 0 }, cNear: { value: camera.near }, cFar: { value: camera.far }, ink: { value: INK }, shade: { value: SHADOW },
    uInvProj: { value: new THREE.Matrix4() }, uCamWorld: { value: new THREE.Matrix4() },
  };
  const sketchMat = new THREE.ShaderMaterial({
    uniforms: sketchU, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform vec2 res; uniform float time;
      uniform float cNear; uniform float cFar; uniform vec3 ink; uniform vec3 shade;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      uniform mat4 uInvProj; uniform mat4 uCamWorld;
      float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float noise3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }
      float depthAt(vec2 uv){ float z = texture2D(tDepth, uv).r * 2.0 - 1.0; return 2.0 * cNear * cFar / (cFar + cNear - z * (cFar - cNear)); }
      float lumAt(vec2 uv){ vec3 c = texture2D(tDiffuse, uv).rgb; return dot(c / (1.0 + c), vec3(0.299, 0.587, 0.114)); }
      void main(){
        vec2 px = 1.6 / res, fc = vUv * res;
        float boil = floor(time * 3.0);
        float crisp = 1.0 - step(0.75, texture2D(tDiffuse, vUv).a);
        vec2 uv = vUv + (vec2(noise(fc * 0.03 + boil * 3.1), noise(fc * 0.03 + boil * 3.1 + 17.0)) - 0.5) * px * 1.8 * (1.0 - crisp);
        float dc = depthAt(uv);
        float lap = abs(4.0 * dc - depthAt(uv - vec2(px.x, 0.0)) - depthAt(uv + vec2(px.x, 0.0)) - depthAt(uv + vec2(0.0, px.y)) - depthAt(uv - vec2(0.0, px.y))) / max(dc, 0.001);
        float eD = smoothstep(0.014, 0.045, lap);
        float tl = lumAt(uv + px * vec2(-1.0, 1.0)), t = lumAt(uv + px * vec2(0.0, 1.0)), tr = lumAt(uv + px * vec2(1.0, 1.0));
        float l = lumAt(uv + px * vec2(-1.0, 0.0)), r = lumAt(uv + px * vec2(1.0, 0.0));
        float bl = lumAt(uv + px * vec2(-1.0, -1.0)), b = lumAt(uv + px * vec2(0.0, -1.0)), br = lumAt(uv + px * vec2(1.0, -1.0));
        float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br, gy = -bl - 2.0 * b - br + tl + 2.0 * t + tr;
        float eL = smoothstep(0.09, 0.24, length(vec2(gx, gy)));
        float farK = smoothstep(cFar * 0.05, cFar * 0.22, dc);
        float edge = max(eD, eL * 0.7) * (1.0 - farK * 0.85);
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        bool sky = texture2D(tDepth, vUv).r > 0.99999;
        if (!sky) {
          float L = dot(c, vec3(0.299, 0.587, 0.114));
          vec3 g = mix(vec3(L), c, 1.2);                                          // color de ilustración, más saturado
          g = mix(g, g * shade * 2.3, (1.0 - smoothstep(0.1, 0.45, L)) * 0.6);   // sombras azuladas
          c = mix(g, c, farK * 0.5);
          // pinceladas: el borde entre tintas se rompe con un ruido anclado al mundo (no "nada" con la cámara)
          vec4 vp = uInvProj * vec4(vUv * 2.0 - 1.0, texture2D(tDepth, vUv).r * 2.0 - 1.0, 1.0); vp /= vp.w;
          vec3 wpos = (uCamWorld * vec4(vp.xyz, 1.0)).xyz;
          float pn = noise3(wpos * 0.85) * 0.6 + noise3(wpos * 2.6) * 0.4;
          float Lc = max(dot(c, vec3(0.299, 0.587, 0.114)), 1e-3), Lq = (max(floor(Lc * 6.0 + (pn - 0.5) * 0.85 * (1.0 - farK)), 0.0) + 0.55) / 6.0;
          c *= mix(1.0, clamp(Lq / Lc, 0.65, 1.5), 0.62);                                         // color plano en pocas tintas
          // gradación: sombras hacia el turquesa y luces cremosas, como un LUT de ilustración
          float Lg = dot(c, vec3(0.299, 0.587, 0.114));
          c = mix(c, c * vec3(0.86, 0.99, 1.02) + vec3(0.0, 0.025, 0.035), 1.0 - smoothstep(0.18, 0.55, Lg));
          c = mix(c, c * vec3(1.03, 1.01, 0.95), smoothstep(0.6, 0.95, Lg));
          c = mix(c, ink, edge * mix(0.72, 0.85, crisp));
        }
        float aM = texture2D(tDiffuse, vUv).a;
        if (aM > 0.3 && aM < 0.45) c = texture2D(tDiffuse, vUv).rgb;            // personaje: conserva su propio sombreado cel
        if (aM < 0.3) c = ink;                                                   // contorno de tinta del personaje
        vec2 q = vUv - 0.5;
        c *= 1.0 - smoothstep(0.45, 0.85, length(q)) * 0.18;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const post = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sketchMat);
  postQuad.frustumCulled = false;
  post.add(postQuad);

  /* ---------------- Cielo pintado: del amanecer (2012) al mediodía (hoy) ---------------- */
  const skyU = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color(0xfff1c9) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 sunDir; uniform vec3 sunCol; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir);
        float h = clamp(d.y, 0.0, 1.0);
        float hb = floor(pow(h, 0.55) * 5.0 + 0.5) / 5.0;                     // degradado en bandas planas
        vec3 c = mix(horizon, top, hb);
        // nubes gráficas: manchas alargadas en horizontal, dos tonos más claros
        vec2 p = vec2(atan(d.x, d.z) * 1.7, d.y * 8.5);
        float n = 0.0, a = 0.55; vec2 q = p;
        for (int i = 0; i < 4; i++) { n += a * (sin(q.x * 1.7 + sin(q.y * 1.3)) * 0.5 + 0.5) * (sin(q.y * 2.1 + q.x * 0.4) * 0.5 + 0.5); q = q * 2.03 + vec2(1.7, 4.1); a *= 0.5; }
        float band = smoothstep(0.02, 0.2, h) * (1.0 - smoothstep(0.55, 0.9, h));
        c = mix(c, mix(top, horizon, 0.55) + 0.06, step(0.5, n * band + band * 0.12) * 0.75);
        c = mix(c, horizon + 0.1, step(0.62, n * band + band * 0.1) * 0.8);
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += sunCol * (smoothstep(0.9982, 0.999, s) * 1.6 + pow(s, 18.0) * 0.35);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  sky.renderOrder = -2;
  scene.add(sky);
  const SKY = { top0: new THREE.Color("#3f8f9a"), top1: new THREE.Color("#46b3ad"), hor0: new THREE.Color("#f0c9a2"), hor1: new THREE.Color("#a9e4d4") };
  // Nubes pintadas (planos que siempre miran a la cámara)
  const clouds = [];
  {
    const tex = (() => {
      const c = document.createElement("canvas"); c.width = 512; c.height = 256; const x = c.getContext("2d");
      const puff = (px, py, r, f) => { x.fillStyle = f; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); };
      const P = [[140, 160, 70], [220, 120, 90], [310, 135, 80], [390, 165, 58], [260, 170, 70], [180, 185, 50], [350, 190, 45]];
      for (const [a, b, r] of P) puff(a, b + 10, r, "#b8d2ec");
      for (const [a, b, r] of P) puff(a - 6, b - 6, r * 0.93, "#ffffff");
      for (const [a, b, r] of P.slice(0, 4)) puff(a - 16, b - 22, r * 0.45, "#fffdf6");
      x.globalCompositeOperation = "destination-out"; x.fillRect(0, 205, 512, 60);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const cm = new THREE.SpriteMaterial({ map: tex, fog: false, depthWrite: false, transparent: true });
    for (let k = 0; k < 34; k++) {
      const sp = new THREE.Sprite(cm);
      const a = Math.random() * Math.PI * 2, r = 700 + Math.random() * 700;
      sp.position.set(Math.cos(a) * r, 180 + Math.random() * 260, Math.sin(a) * r);
      const s = 180 + Math.random() * 220; sp.scale.set(s, s / 2, 1);
      sp.userData.v = 4 + Math.random() * 6;
      scene.add(sp); clouds.push(sp);
    }
  }
  const sunSprite = new THREE.Object3D();                      // (el sol ahora es parte del cielo)

  /* ---------------- Luces ---------------- */
  const hemi = new THREE.HemisphereLight(0xdcecff, 0x6f8a55, 1.15);
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  const rim = new THREE.DirectionalLight(0xbfd6ff, 0.25);
  const keyLight = new THREE.PointLight(0xfff1dc, 0, 16, 1.6);         // luz frontal suave para el creador del personaje
  // Luces de sala: se trasladan a la estancia más cercana y toman su color
  const roomSpot = new THREE.SpotLight(0xffffff, 0, 60, 0.55, 0.6, 1.2);
  const roomFill = new THREE.PointLight(0xffffff, 0, 45, 1.4);
  scene.add(hemi, sun, sun.target, rim, rim.target, keyLight, roomSpot, roomSpot.target, roomFill);
  let shadowSize = 0;
  function setShadowSize(s) {
    if (Math.abs(s - shadowSize) < 4) return;
    shadowSize = s;
    Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 500 });
    sun.shadow.camera.updateProjectionMatrix();
  }
  setShadowSize(40);

  /* ---------------- Texturas generadas (sin archivos) ---------------- */
  function canvasTex(w, h, draw, repeat = false) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    return t;
  }
  const deckTex = canvasTex(256, 256, (x, w, h) => {              // losas de concreto claro con juntas
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { x.fillStyle = `rgba(0,0,0,${0.03 + (i % 2) * 0.025})`; x.fillRect(i * 64, 0, 64, h); x.fillStyle = "rgba(0,0,0,0.22)"; x.fillRect(i * 64, 0, 2, h); }
    x.fillStyle = "rgba(0,0,0,0.16)"; x.fillRect(0, h / 2, w, 2);
    for (let k = 0; k < 700; k++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  }, true);
  const concTex = canvasTex(256, 256, (x, w, h) => {              // concreto a la vista: tablillas y tensores
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { x.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.04})`; x.fillRect(0, i * 32, w, 32); x.fillStyle = "rgba(0,0,0,0.12)"; x.fillRect(0, i * 32, w, 1.5); }
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.fillStyle = "rgba(0,0,0,0.18)"; x.beginPath(); x.arc(32 + i * 64, 16 + j * 64, 2.4, 0, Math.PI * 2); x.fill(); }
    for (let k = 0; k < 500; k++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 2); }
  }, true);
  const brickTex = canvasTex(128, 128, (x, w, h) => {             // ladrillo de Medellín
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 16; r++) for (let c = 0; c < 5; c++) {
      x.fillStyle = `rgba(0,0,0,${0.03 + Math.random() * 0.1})`; x.fillRect(c * 28 - (r % 2) * 14, r * 8, 26, 6.5);
    }
    for (const wx of [18, 80]) {                                                                                       // ventanas con marco y reja
      x.fillStyle = "rgba(245,240,230,0.85)"; x.fillRect(wx - 3, 34, 30, 28);
      x.fillStyle = "rgba(24,44,62,0.78)"; x.fillRect(wx, 37, 24, 22);
      x.fillStyle = "rgba(245,240,230,0.7)"; for (let k = 1; k < 4; k++) x.fillRect(wx + k * 6, 37, 1.5, 22);
    }
    x.fillStyle = "rgba(255,255,255,0.55)"; x.fillRect(0, 70, w, 4);                                                     // placa del entrepiso
    x.fillStyle = "rgba(70,40,30,0.75)"; x.fillRect(52, 92, 22, 36);                                                     // puerta
    x.fillStyle = "rgba(255,255,255,0.45)"; x.fillRect(0, 0, w, 6);                                                      // remate
  });
  const winTex = canvasTex(64, 128, (x, w, h) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 16; r++) for (let c = 0; c < 4; c++) { x.fillStyle = Math.random() < 0.5 ? "rgba(40,70,110,0.55)" : "rgba(40,70,110,0.25)"; x.fillRect(4 + c * 15, 4 + r * 8, 9, 5); }
  });
  const waterTex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = "#fff"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,1)";
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(0,40,80,${0.06 + Math.random() * 0.1})`; x.fillRect(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 2); }
  }, true);
  waterTex.repeat.set(6, 6);

  /* ---------------- Materiales: tonos de ilustración (sombreado por bandas) ---------------- */
  const toonRamp = new THREE.DataTexture(new Uint8Array([70, 150, 215, 255]), 4, 1, THREE.RedFormat);
  toonRamp.minFilter = toonRamp.magFilter = THREE.NearestFilter; toonRamp.needsUpdate = true;
  const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp, ...extra });
  const M = {
    base: toon(0xf2efe8),
    ground: toon(0xffffff, { vertexColors: true }),
    floorPaper: toon(0x6f9a52),
    edge: new THREE.LineBasicMaterial({ color: 0x1f2a33, transparent: true, opacity: 0.6 }),
    deck: toon(0xdcd6c9, { map: deckTex }),
    deckSide: toon(0xa39d90, { side: THREE.DoubleSide }),
    metal: toon(0x3d4448),
    city: toon(0xe9e6df, { map: winTex }),
    brick: toon(0xffffff, { map: brickTex }),
    mountain: toon(0x5f8f6a),
    conc: toon(0xc9c6bf, { map: concTex }),
    concDark: toon(0x6a6b6d, { map: concTex }),
    white: toon(0xf6f4ee),
    gold: toon(0xd8a444, { emissive: 0x8a5a14, emissiveIntensity: 0.35 }),
    water: toon(0x4f9fd0, { map: waterTex }),
    bulb: new THREE.MeshBasicMaterial({ color: 0xffd48a }),
    lightStrip: new THREE.MeshBasicMaterial({ color: 0x2c343a, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
    progress: new THREE.MeshBasicMaterial({ color: 0xf0a640, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
  };
  const ACC = ["sun", "leaf", "wind", "sound", "flow", "heat"];
  const accent = {};
  for (const k of ACC) {
    accent[k] = toon(col(k), { emissive: col(k), emissiveIntensity: 0.12 });
    accent[k + "Line"] = new THREE.LineBasicMaterial({ color: col(k), transparent: true, opacity: 0.95 });
    accent[k + "Glow"] = new THREE.MeshBasicMaterial({ color: col(k) });
  }

  /* ==================================================================
     LA PASARELA CENTRAL Y LAS ESTANCIAS (trazado del jardín)
     ================================================================== */
  const DECK = 4.2, HW = 3.6;                                // pasarela elevada sobre el jardín: altura y medio ancho
  const ROOM_R = [16, 15, 17, 17, 18, 14, 16, 17, 16, 18, 18, 18, 16];   // radio de cada estancia
  const P = STATIONS.map((_, i) => new THREE.Vector3(-216 + i * 36, 0, Math.sin(i * 0.85) * 26));
  const t0 = P[1].clone().sub(P[0]).normalize(), t1 = P[N - 1].clone().sub(P[N - 2]).normalize();
  const START = P[0].clone().addScaledVector(t0, -34), END = P[N - 1].clone().addScaledVector(t1, 32);
  const curve = new THREE.CatmullRomCurve3([START, ...P, END], false, "centripetal");
  const LEN = curve.getLength();
  const LENS = curve.getLengths(3000);
  const US = STATIONS.map((_, i) => LENS[Math.round(((i + 1) / (N + 1)) * 3000)] / LENS[3000]);   // portal de cada estancia (0–1)
  const sideAt = (u) => new THREE.Vector3().crossVectors(curve.getTangentAt(u), UPV).normalize();
  const SIDE = STATIONS.map((_, i) => (i % 2 ? 1 : -1));
  const GATE = US.map((u) => curve.getPointAt(u));
  const S = STATIONS.map((_, i) => GATE[i].clone().addScaledVector(sideAt(US[i]), SIDE[i] * (HW + 9 + ROOM_R[i])));   // centro de cada estancia
  const DIR_OF = (i) => S[i].clone().sub(GATE[i]).setY(0).normalize();   // del portal a la estancia
  const pathPts = curve.getSpacedPoints(700);
  // El trazado avanza siempre en x: se busca por x y se revisa una ventana alrededor
  function nearestIn(pts, x, z, win) {
    let lo = 0, hi = pts.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m].x < x) lo = m; else hi = m; }
    let d = Infinity, k = lo;
    for (let i = Math.max(0, lo - win); i < Math.min(pts.length, lo + win); i++) { const p = pts[i]; const dd = (p.x - x) ** 2 + (p.z - z) ** 2; if (dd < d) { d = dd; k = i; } }
    return { d: Math.sqrt(d), k };
  }
  function nearestOnPath(x, z) { const r = nearestIn(pathPts, x, z, 80); return { d: r.d, u: r.k / (pathPts.length - 1), p: pathPts[r.k] }; }
  const distToPath = (x, z) => nearestOnPath(x, z).d;
  const segAxis = (px, pz, a, b) => { const vx = b.x - a.x, vz = b.z - a.z, L2 = vx * vx + vz * vz || 1; const k = clamp(((px - a.x) * vx + (pz - a.z) * vz) / L2); return Math.hypot(px - (a.x + vx * k), pz - (a.z + vz * k)); };
  const nearBranch = (x, z, w) => { for (let i = 0; i < N; i++) if (segAxis(x, z, GATE[i], S[i]) < w) return true; return false; };
  const distToStations = (x, z) => { let d = Infinity; S.forEach((s, i) => { d = Math.min(d, Math.hypot(s.x - x, s.z - z) - ROOM_R[i]); }); return d; };
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  // Laguna del jardín: entre dos estancias del mismo lado
  const LAG = S[6].clone().lerp(S[8], 0.5).addScaledVector(sideAt(US[7]), SIDE[6] * 6), LAG_R = 14;
  const distLag = (x, z) => Math.hypot(LAG.x - x, LAG.z - z);
  // Quebrada: acompaña la pasarela y pasa por debajo de ella una y otra vez
  const riverPts = [];
  for (let k = 0; k <= 700; k++) { const u = k / 700, p = curve.getPointAt(u), sd = sideAt(u), w = Math.sin(u * Math.PI * 22) * 7.5; riverPts.push(new THREE.Vector3(p.x + sd.x * w, -1.15, p.z + sd.z * w)); }
  const distRiver = (x, z) => nearestIn(riverPts, x, z, 110).d;
  // Valle de Medellín: el jardín en el fondo, laderas que suben hacia el norte y el sur
  const rawH = (x, z) => 3 * Math.sin(x * 0.02) * Math.cos(z * 0.025) + 1.6 * Math.sin(x * 0.05 + z * 0.04) + 70 * sm(100, 280, Math.abs(z)) + 45 * sm(300, 420, Math.abs(x));
  const heightAt = (x, z) => {
    const dl = distLag(x, z), dr = distRiver(x, z);
    if (dl < LAG_R + 1) return -1.6;
    if (dr < 3.4) return -2.2;
    const f = Math.min(sm(10, 34, distToPath(x, z)), sm(4, 16, distToStations(x, z)), sm(LAG_R + 1, LAG_R + 10, dl), sm(3.4, 10, dr));
    return rawH(x, z) * f - 0.05 - 1.4 * (1 - sm(LAG_R + 1, LAG_R + 8, dl)) - 2.1 * (1 - sm(3.4, 7.5, dr));
  };

  /* ---------------- Terreno: prados del jardín con matices de verde ---------------- */
  const tg = new THREE.PlaneGeometry(820, 620, LOW ? 250 : 360, LOW ? 190 : 272);
  tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position, tcol = [];
  const cGrass = new THREE.Color("#79b04f"), cGrass2 = new THREE.Color("#5f9a45"), cMeadow = new THREE.Color("#a7c75c"), cSlope = new THREE.Color("#4f7f47"), cBank = new THREE.Color("#8fae6a"), cMud = new THREE.Color("#5e7f45");
  const tmpC = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i), y = heightAt(x, z);
    tp.setY(i, y);
    const n = Math.sin(x * 0.07) * Math.cos(z * 0.09) * 0.5 + 0.5;
    tmpC.copy(cGrass).lerp(cGrass2, n * 0.8).lerp(cMeadow, Math.max(0, Math.sin(x * 0.013 + z * 0.021)) * 0.35);
    tmpC.lerp(cSlope, sm(90, 220, Math.abs(z)));
    tmpC.lerp(cMud, (1 - sm(3, 8, distRiver(x, z))) * 0.7);
    if (distLag(x, z) < LAG_R + 4) tmpC.lerp(cBank, 0.6);
    tcol.push(tmpC.r, tmpC.g, tmpC.b);
  }
  tg.setAttribute("color", new THREE.Float32BufferAttribute(tcol, 3));
  tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, M.ground);
  terrain.receiveShadow = true;
  scene.add(terrain);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(2400, 48).rotateX(-Math.PI / 2), M.floorPaper);
  floor.position.y = -2;
  scene.add(floor);
  // Quebrada
  const flowTex = waterTex.clone(); flowTex.wrapS = flowTex.wrapT = THREE.RepeatWrapping; flowTex.repeat.set(1, 1); flowTex.needsUpdate = true;
  {
    const pos = [], uv = [], idx = [];
    let acc = 0;
    riverPts.forEach((p, k) => {
      const a = riverPts[Math.max(0, k - 1)], b = riverPts[Math.min(riverPts.length - 1, k + 1)];
      const tx = b.x - a.x, tz = b.z - a.z, L = Math.hypot(tx, tz) || 1, nx = -tz / L, nz = tx / L;
      if (k) acc += p.distanceTo(riverPts[k - 1]);
      pos.push(p.x + nx * 5.6, p.y, p.z + nz * 5.6, p.x - nx * 5.6, p.y, p.z - nz * 5.6);
      uv.push(acc / 14, 0, acc / 14, 0.6);
      if (k) { const q = (k - 1) * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const river = new THREE.Mesh(g, toon(0x4b9fd3, { map: flowTex, side: THREE.DoubleSide })); river.receiveShadow = true;
    scene.add(river); M.river = river.material;
    const ROCKS = 180, rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), toon(0x9aa0a0), ROCKS);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3();
    for (let k = 0; k < ROCKS; k++) {
      const p = riverPts[(Math.random() * riverPts.length) | 0], a = Math.random() * Math.PI * 2, r = 3.4 + Math.random() * 1.6;
      const sc = 0.4 + Math.random() * 0.9;
      rocks.setMatrixAt(k, m4.compose(new THREE.Vector3(p.x + Math.cos(a) * r, -1.3 + sc * 0.4, p.z + Math.sin(a) * r), q.setFromEuler(new THREE.Euler(Math.random(), Math.random(), 0)), s3.set(sc, sc * 0.7, sc)));
    }
    rocks.castShadow = true; scene.add(rocks);
  }
  // Laguna
  const lagoon = new THREE.Mesh(new THREE.CircleGeometry(LAG_R + 1.5, 64).rotateX(-Math.PI / 2), M.water);
  lagoon.position.set(LAG.x, -0.55, LAG.z); lagoon.receiveShadow = true;
  scene.add(lagoon);
  {
    const lily = new THREE.InstancedMesh(new THREE.CircleGeometry(0.9, 10).rotateX(-Math.PI / 2), toon(0x5d9a3e), 40);
    const m4 = new THREE.Matrix4();
    for (let k = 0; k < 40; k++) { const a = Math.random() * Math.PI * 2, r = Math.random() * (LAG_R - 2); lily.setMatrixAt(k, m4.makeTranslation(LAG.x + Math.cos(a) * r, -0.5, LAG.z + Math.sin(a) * r)); }
    scene.add(lily);
  }

  // Cinta a lo largo de la curva: dos bordes desplazados lateralmente
  const NS = 900, ribPts = curve.getSpacedPoints(NS), ribSide = ribPts.map((_, k) => sideAt(k / NS));
  function ribbon(offA, offB, yA, yB, uvScale = 0) {
    const pos = [], uv = [], idx = [];
    let acc = 0;
    ribPts.forEach((p, k) => {
      if (k) acc += p.distanceTo(ribPts[k - 1]);
      const s = ribSide[k];
      pos.push(p.x + s.x * offA, yA, p.z + s.z * offA, p.x + s.x * offB, yB, p.z + s.z * offB);
      uv.push(acc / (uvScale || 1), 0, acc / (uvScale || 1), 1);
      if (k) { const a = (k - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }   // normales hacia arriba
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const deckTop = new THREE.Mesh(ribbon(HW, -HW, DECK, DECK, 9), M.deck);
  deckTop.receiveShadow = true;
  scene.add(deckTop);
  for (const s of [1, -1]) {
    const sk = new THREE.Mesh(ribbon(s * HW, s * HW, DECK, DECK - 0.8), M.deckSide); sk.receiveShadow = true; scene.add(sk);
    scene.add(new THREE.Mesh(ribbon(s * (HW - 0.06), s * (HW - 0.3), DECK + 0.015, DECK + 0.015), M.lightStrip));   // borde que define
  }
  scene.add(new THREE.Mesh(ribbon(-HW, HW, DECK - 0.8, DECK - 0.8), M.deckSide));                          // cara inferior de la losa
  // Pilares, barandas y faroles de la pasarela elevada
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
    const pil = [], posts = [], rails = [];
    for (let d = 3; d < LEN; d += 9) { const u = d / LEN, p = curve.getPointAt(u), sd = sideAt(u); for (const sg of [1, -1]) pil.push([p.x + sd.x * sg * (HW - 0.9), p.z + sd.z * sg * (HW - 0.9)]); }
    const gapAt = (x, z, sg, u) => {
      if (nearBranch(x, z, 2.7)) return true;
      return Math.hypot(START.x - x, START.z - z) < 11.2 || Math.hypot(END.x - x, END.z - z) < 13.2;
    };
    const STEP = 2.4;
    for (let d = 0; d < LEN; d += STEP) {
      const u = d / LEN, u2 = Math.min(1, (d + STEP) / LEN), p = curve.getPointAt(u), p2 = curve.getPointAt(u2), sd = sideAt(u);
      for (const sg of [1, -1]) {
        const x = p.x + sd.x * sg * (HW - 0.1), z = p.z + sd.z * sg * (HW - 0.1);
        if (gapAt(x, z, sg, u)) continue;
        posts.push([x, z]);
        const sd2 = sideAt(u2), x2 = p2.x + sd2.x * sg * (HW - 0.1), z2 = p2.z + sd2.z * sg * (HW - 0.1);
        if (!gapAt(x2, z2, sg, u2)) rails.push([x, z, x2, z2]);
      }
    }
    const pm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.34, 0.42, 1, 10).translate(0, 0.5, 0), M.conc, pil.length);
    pil.forEach(([x, z], k) => { const g0 = heightAt(x, z); pm.setMatrixAt(k, m4.compose(p3.set(x, g0, z), q.identity(), s3.set(1, DECK - 0.8 - g0, 1))); });
    pm.castShadow = true; pm.receiveShadow = true; scene.add(pm);
    const po = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1.05, 0.07).translate(0, 0.525, 0), M.metal, posts.length);
    posts.forEach(([x, z], k) => po.setMatrixAt(k, m4.makeTranslation(x, DECK, z)));
    scene.add(po);
    const ra = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.07, 1).translate(0, 0, 0.5), M.metal, rails.length);
    rails.forEach(([x, z, x2, z2], k) => { const L = Math.hypot(x2 - x, z2 - z); ra.setMatrixAt(k, m4.compose(p3.set(x, DECK + 1.05, z), q.setFromAxisAngle(UPV, Math.atan2(x2 - x, z2 - z)), s3.set(1, 1, L))); });
    scene.add(ra);
  }
  const progGeo = ribbon(0.18, -0.18, DECK + 0.02, DECK + 0.02);            // línea central: sigue al personaje
  const progress = new THREE.Mesh(progGeo, M.progress);
  scene.add(progress);
  progGeo.setDrawRange(0, 0);
  // Plazas de inicio y fin
  for (const [p, r] of [[START, 11], [END, 13]]) {
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, DECK + 1.2, 64), M.conc);
    pl.position.set(p.x, (DECK - 1.2) / 2 - 0.012, p.z); pl.receiveShadow = true; scene.add(pl);
    const rg = new THREE.Mesh(new THREE.RingGeometry(r - 0.35, r - 0.1, 90).rotateX(-Math.PI / 2), M.lightStrip);
    rg.position.set(p.x, DECK + 0.02, p.z); scene.add(rg);
  }

  // Faroles a ambos lados (instanciados)
  {
    const posts = [], step = 13;
    for (let d = 16; d < LEN - 6; d += step) posts.push(d / LEN);
    const n = posts.length * 2;
    const postM = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.1, 4.2, 6).translate(0, 2.1, 0), M.metal, n);
    const bulbM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 10, 8), M.bulb, n);
    postM.castShadow = true;
    const m4 = new THREE.Matrix4();
    let k = 0;
    posts.forEach((u) => {
      const p = curve.getPointAt(u), s = sideAt(u);
      for (const sg of [1, -1]) {
        const x = p.x + s.x * sg * (HW - 0.4), z = p.z + s.z * sg * (HW - 0.4);
        if (nearBranch(x, z, 4)) { postM.setMatrixAt(k, m4.makeScale(0, 0, 0)); bulbM.setMatrixAt(k, m4.makeScale(0, 0, 0)); k++; continue; }
        postM.setMatrixAt(k, m4.makeTranslation(x, DECK, z));
        bulbM.setMatrixAt(k, m4.makeTranslation(x - s.x * sg * 0.15, DECK + 4.25, z - s.z * sg * 0.15));
        k++;
      }
    });
    scene.add(postM, bulbM);
  }

  // Objetos del lugar: mobiliario, piso, señales, kioscos, postes y cables (assets/js/territorio-props.js)
  const blockers = [];
  buildProps({ scene, toon, M, curve, LEN, sideAt, HW, DECK, GATE, SIDE, N, US, nearBranch, heightAt, distRiver, distToStations, START, END, t0, LOW, blockers,
    years: (i) => STATIONS[i].y });

  /* ---------------- Medellín: montañas, laderas de ladrillo, torres del valle y Metrocable ---------------- */
  const metro = { cabins: [], lines: [] };
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
    const cone = new THREE.ConeGeometry(1, 1, 8); cone.translate(0, 0.5, 0);
    const mts = new THREE.InstancedMesh(cone, M.mountain, 40);
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + Math.random() * 0.1, r = 620 + Math.random() * 200;
      p3.set(Math.cos(a) * r * 1.15, 20, Math.sin(a) * r * 0.9);
      s3.set(140 + Math.random() * 120, 120 + Math.random() * 160, 140 + Math.random() * 120);
      q.setFromAxisAngle(UPV, Math.random() * 6);
      mts.setMatrixAt(i, m4.compose(p3, q, s3));
    }
    scene.add(mts);
    // Comunas: casas de ladrillo que trepan las laderas
    const bx = new THREE.BoxGeometry(1, 1, 1); bx.translate(0, 0.5, 0);
    const HOUSES = LOW ? 900 : 1700;
    const houses = new THREE.InstancedMesh(bx, M.brick, HOUSES);
    houses.castShadow = false; houses.receiveShadow = true;
    const BR = ["#c0643a", "#b0532f", "#cf7a48", "#a44a2c", "#d98d5a", "#e8e0d2", "#9fb7c9", "#e6c35c"].map((c) => new THREE.Color(c));
    let placed = 0, guard = 0;
    const roofs = [], tanks = [];
    while (placed < HOUSES && guard++ < 30000) {
      const x = (Math.random() - 0.5) * 820, z = Math.sign(Math.random() - 0.5) * (118 + Math.random() * 175);
      const h0 = rawH(x, z);
      if (h0 < 8) continue;
      const w = 4 + Math.random() * 3.5, h = 4 + Math.floor(Math.random() * 3) * 2.8, d = 4 + Math.random() * 3.5;
      p3.set(x, h0 - 1, z); s3.set(w, h, d);
      q.setFromAxisAngle(UPV, (Math.random() - 0.5) * 0.4);
      houses.setMatrixAt(placed, m4.compose(p3, q, s3));
      houses.setColorAt(placed, BR[Math.random() < 0.82 ? (Math.random() * 5) | 0 : 5 + ((Math.random() * 3) | 0)]);
      roofs.push(new THREE.Matrix4().compose(new THREE.Vector3(x, h0 - 1 + h, z), q.clone(), new THREE.Vector3(w + 0.3, 0.35, d + 0.3)));
      if (Math.random() < 0.6) tanks.push(new THREE.Matrix4().makeTranslation(x + (Math.random() - 0.5) * w * 0.4, h0 - 1 + h + 0.35, z + (Math.random() - 0.5) * d * 0.4));
      placed++;
    }
    houses.count = placed;
    scene.add(houses);
    // Terrazas: placa con antepecho y tanques negros de agua (el paisaje de las laderas)
    const roofM = new THREE.InstancedMesh(bx, M.conc, roofs.length); roofs.forEach((mm, i) => roofM.setMatrixAt(i, mm)); scene.add(roofM);
    const tankG = new THREE.CylinderGeometry(0.75, 0.7, 1.1, 10).translate(0, 0.55, 0);
    const tankM = new THREE.InstancedMesh(tankG, toon(0x2b2f33), tanks.length); tanks.forEach((mm, i) => tankM.setMatrixAt(i, mm)); scene.add(tankM);
    // Torres del centro de la ciudad, al fondo del valle
    const TOW = 60;
    const towers = new THREE.InstancedMesh(bx, M.city, TOW);
    for (let k = 0; k < TOW; k++) {
      const x = Math.sign(Math.random() - 0.5) * (360 + Math.random() * 140), z = (Math.random() - 0.5) * 200;
      p3.set(x, rawH(x, z) - 1, z); s3.set(12 + Math.random() * 14, 25 + Math.random() * 70, 12 + Math.random() * 14);
      q.setFromAxisAngle(UPV, Math.random() * 0.5);
      towers.setMatrixAt(k, m4.compose(p3, q, s3));
    }
    scene.add(towers);
    // Metrocable: pilonas, cables y cabinas que suben la ladera
    const line = (x0, x1) => {
      const pts = [];
      for (let k = 0; k <= 6; k++) { const f = k / 6, x = x0 + (x1 - x0) * f * 0.35, z = -112 - f * 190; pts.push(new THREE.Vector3(x + Math.sin(f * 3) * 8, rawH(x, z) + 26, z)); }
      pts.forEach((p) => {
        const pyl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.1, 26, 6).translate(0, 13, 0), M.metal); pyl.position.set(p.x, p.y - 26, p.z); scene.add(pyl);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.5), M.metal); arm.position.set(p.x, p.y, p.z); scene.add(arm);
      });
      const c = new THREE.CatmullRomCurve3(pts);
      for (const off of [-2.4, 2.4]) {
        const g = new THREE.BufferGeometry().setFromPoints(c.getPoints(120).map((p) => p.clone().add(new THREE.Vector3(off, -0.3, 0))));
        scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x1f2a33 })));
      }
      metro.lines.push(c);
      const body = toon(0xe9e7e0), band = toon(0x2f6fb0);
      for (let k = 0; k < 9; k++) {
        const cab = new THREE.Group();
        const b = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 2.6), body); b.position.y = -2.6; cab.add(b);
        const bd = new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.5, 2.66), band); bd.position.y = -2.2; cab.add(bd);
        const hg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.6, 0.15), M.metal); hg.position.y = -0.8; cab.add(hg);
        cab.userData = { c, u: k / 9, dir: k % 2 ? 1 : -1, off: k % 2 ? 2.4 : -2.4 };
        scene.add(cab); metro.cabins.push(cab);
      }
    };
    line(-120, 40); line(150, 260);
  }

  /* ---------------- Jardín botánico: flora colombiana pintada en planos 2D ----------------
     Un atlas de 32 dibujos pintados en lienzo (estilo ilustración): árboles, guayacanes amarillos y
     rosados, palmas de cera, palmas, ceibas, yarumos, heliconias, buganvilias, helechos arbóreos,
     guaduales, macizos de flores, bromelias, arbustos, pinos y juncos. Una sola llamada de dibujo. */
  const vegTex = (() => {
    const c = document.createElement("canvas"); c.width = 2048; c.height = 2048;
    const x = c.getContext("2d");
    let sd = 7;
    const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    const R = (a, b) => a + rnd() * (b - a);
    const pickC = (arr) => arr[(rnd() * arr.length) | 0];
    const G = ["#4f8f3f", "#5fa246", "#6db34f", "#3f7a38", "#88c25a", "#2f6532"];
    const line = (col, w = 2) => { x.strokeStyle = col; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round"; };
    const blob = (cx, cy, r, fill, sq = 0.9) => {
      x.fillStyle = fill; x.beginPath();
      for (let k = 0; k <= 16; k++) { const a = (k / 16) * Math.PI * 2, rr = r * R(0.85, 1.08); x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * sq); }
      x.fill();
    };
    const trunk = (bx, by, tx, ty, w, colr = "#6b4c34") => {
      x.fillStyle = colr; x.beginPath(); x.moveTo(bx - w, by); x.quadraticCurveTo((bx + tx) / 2 + R(-6, 6), (by + ty) / 2, tx - w * 0.45, ty); x.lineTo(tx + w * 0.45, ty); x.quadraticCurveTo((bx + tx) / 2 + R(-6, 6), (by + ty) / 2, bx + w, by); x.fill();
      x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(bx, ty, w * 0.6, by - ty);
    };
    // copa pintada: masa oscura, masa media, luces arriba a la izquierda y contorno fino del mismo tono
    const crown = (cx, cy, rw, rh, pal, n = 26) => {
      for (let k = 0; k < n * 0.5; k++) blob(cx + R(-rw, rw) * 0.8 + 6, cy + R(-rh, rh) * 0.7 + 8, R(24, 46), pal[3]);
      for (let k = 0; k < n; k++) blob(cx + R(-rw, rw) * 0.8, cy + R(-rh, rh) * 0.75, R(20, 40), pickC([pal[0], pal[1], pal[2]]));
      for (let k = 0; k < n * 0.45; k++) blob(cx - R(0, rw) * 0.6, cy - R(0, rh) * 0.6, R(10, 22), pal[4]);
      line("rgba(20,40,25,0.55)", 1.8);
      for (let k = 0; k < n * 0.6; k++) { const a = R(0, Math.PI * 2); x.beginPath(); x.arc(cx + Math.cos(a) * rw * 0.85, cy + Math.sin(a) * rh * 0.85, R(16, 30), a - 1, a + 0.7); x.stroke(); }
    };
    const leaf = (bx, by, ang, len, wid, fill) => {
      const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len, nx = -Math.sin(ang) * wid, ny = Math.cos(ang) * wid, mx = (bx + ex) / 2, my = (by + ey) / 2;
      x.fillStyle = fill; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(mx + nx, my + ny, ex, ey); x.quadraticCurveTo(mx - nx, my - ny, bx, by); x.fill();
      line("rgba(20,50,25,0.6)", 1.6); x.stroke(); x.beginPath(); x.moveTo(bx, by); x.lineTo(ex, ey); x.stroke();
    };
    const frond = (bx, by, ang, len, colA = "#5fa246", colB = "#3f7a38") => {
      const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len + len * 0.3;
      line("#2f5a2c", 3); x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + Math.cos(ang) * len * 0.5, by + Math.sin(ang) * len * 0.5 - 18, ex, ey); x.stroke();
      for (let k = 2; k < 16; k++) {
        const f = k / 16, px = bx + (ex - bx) * f, py = by + (ey - by) * f - Math.sin(f * Math.PI) * 16;
        for (const sg of [1, -1]) { line(k % 2 ? colA : colB, 5); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(ang + sg * 1.25) * 28 * (1 - f * 0.5), py + Math.sin(ang + sg * 1.25) * 28 * (1 - f * 0.5) + 10); x.stroke(); }
      }
    };
    const dots = (cx, cy, rw, rh, n, cols, r = 5) => { for (let k = 0; k < n; k++) { x.fillStyle = pickC(cols); x.beginPath(); x.arc(cx + R(-rw, rw), cy + R(-rh, rh), R(r * 0.6, r), 0, Math.PI * 2); x.fill(); } };
    const cell = (i, fn) => { x.save(); x.translate((i % 8) * 256, Math.floor(i / 8) * 512); x.beginPath(); x.rect(3, 3, 250, 506); x.clip(); fn(); x.restore(); };
    const GREEN = ["#5fa246", "#6db34f", "#4f8f3f", "#2f6532", "#a6d46e"];
    const YEL = ["#f6c627", "#f3b61a", "#ffd84a", "#c98f10", "#fff09a"];
    const PINK = ["#ef8fbf", "#e56fa8", "#f7b0d2", "#b84a82", "#ffd6ea"];
    // 0–2 árboles de copa amplia
    for (let i = 0; i < 3; i++) cell(i, () => { trunk(128, 508, 128 + R(-10, 10), 240, 11); crown(128, 190, 105, 100, GREEN); });
    // 3–4 guayacán amarillo · 5–6 guayacán rosado
    for (let i = 3; i < 7; i++) cell(i, () => {
      trunk(128, 508, 128 + R(-14, 14), 270, 9, "#5c4432");
      line("#5c4432", 5); for (let k = 0; k < 4; k++) { x.beginPath(); x.moveTo(128, 300); x.lineTo(128 + R(-80, 80), R(170, 240)); x.stroke(); }
      crown(128, 190, 108, 88, i < 5 ? YEL : PINK, 30);
      dots(128, 190, 95, 75, 70, i < 5 ? ["#fff3a8", "#f1a90f"] : ["#ffe3f0", "#c9407f"], 6);
      if (i === 4 || i === 6) dots(128, 470, 90, 30, 60, i < 5 ? YEL : PINK, 5);                      // flores caídas
    });
    // 7–8 palma de cera: altísima, tronco claro anillado y copa pequeña
    for (let i = 7; i < 9; i++) cell(i, () => {
      const tx = 128 + R(-10, 10);
      trunk(128, 508, tx, 70, 6, "#cfc8b8");
      line("rgba(90,80,70,0.5)", 1.4); for (let y = 500; y > 80; y -= 14) { x.beginPath(); x.moveTo(122, y); x.lineTo(134, y - 2); x.stroke(); }
      for (let k = 0; k < 8; k++) frond(tx, 70, -Math.PI / 2 + (k / 7 - 0.5) * 3.3, R(55, 72), "#3f8a4a", "#2e6b3b");
    });
    // 9–10 palmas
    for (let i = 9; i < 11; i++) cell(i, () => { const tx = 128 + R(-30, 30); trunk(128, 508, tx, 150, 8, "#8a6a48"); for (let k = 0; k < 10; k++) frond(tx, 150, -Math.PI / 2 + (k / 9 - 0.5) * 3.3, R(90, 115)); });
    // 11–12 ceiba: copa enorme y aplanada, tronco con raíces tabulares
    for (let i = 11; i < 13; i++) cell(i, () => {
      x.fillStyle = "#7d6a55"; x.beginPath(); x.moveTo(60, 508); x.quadraticCurveTo(110, 440, 116, 250); x.lineTo(140, 250); x.quadraticCurveTo(146, 440, 196, 508); x.fill();
      crown(128, 170, 118, 70, GREEN, 30);
    });
    // 13 yarumo: hojas plateadas en sombrilla
    cell(13, () => { trunk(128, 508, 128, 200, 6, "#b9b2a4"); for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k / 6 - 0.5) * 2.6; leaf(128, 200, a, 90, 26, k % 2 ? "#cfd8cf" : "#a9bcae"); } });
    // 14–15 heliconias
    for (let i = 14; i < 16; i++) cell(i, () => {
      for (let k = 0; k < 7; k++) leaf(128 + R(-14, 14), 505, -Math.PI / 2 + (k / 6 - 0.5) * 1.8, R(210, 300), R(28, 38), pickC(GREEN));
      for (let k = 0; k < 5; k++) { const bx = 128 + R(-60, 60), by = R(240, 380); for (let j = 0; j < 5; j++) { x.fillStyle = j % 2 ? "#e0452f" : "#f2b233"; x.beginPath(); x.moveTo(bx, by + j * 16); x.lineTo(bx + 26 * (j % 2 ? 1 : -1), by + j * 16 + 6); x.lineTo(bx, by + j * 16 + 14); x.fill(); } }
    });
    // 16–17 buganvilias
    for (let i = 16; i < 18; i++) cell(i, () => { crown(128, 400, 110, 90, ["#5fa246", "#4f8f3f", "#6db34f", "#2f6532", "#a6d46e"], 16); dots(128, 390, 105, 85, 160, ["#d63b8e", "#e5569f", "#b72f78", "#f38bc0"], 9); });
    // 18–19 helecho arbóreo
    for (let i = 18; i < 20; i++) cell(i, () => { trunk(128, 508, 128 + R(-8, 8), 230, 9, "#4c3a2b"); for (let k = 0; k < 11; k++) frond(128, 230, -Math.PI / 2 + (k / 10 - 0.5) * 3.4, R(90, 120), "#6db34f", "#3f7a38"); });
    // 20–21 guadual
    for (let i = 20; i < 22; i++) cell(i, () => {
      for (let k = 0; k < 7; k++) {
        const bx = 60 + k * 22 + R(-5, 5), top = R(20, 110);
        x.fillStyle = k % 2 ? "#8fbf55" : "#6fa447"; x.fillRect(bx - 5, top, 10, 508 - top);
        line("rgba(40,70,30,0.6)", 1.4); for (let y = 506; y > top; y -= R(34, 48)) { x.beginPath(); x.moveTo(bx - 6, y); x.lineTo(bx + 6, y); x.stroke(); }
        for (let n = 0; n < 6; n++) leaf(bx, R(top, top + 220), R(-2.9, -0.2), R(34, 52), 8, pickC(GREEN));
      }
    });
    // 22–23 macizos de flores
    for (let i = 22; i < 24; i++) cell(i, () => {
      crown(128, 450, 115, 45, GREEN, 18);
      dots(128, 440, 112, 40, 140, i === 22 ? ["#f4d03f", "#e8582f", "#ffffff", "#f29ac2"] : ["#9b59b6", "#f4d03f", "#ff7a45", "#ffffff"], 8);
    });
    // 24–25 bromelias y orquídeas
    for (let i = 24; i < 26; i++) cell(i, () => {
      for (let k = 0; k < 12; k++) leaf(128, 500, -Math.PI / 2 + (k / 11 - 0.5) * 2.6, R(80, 130), 16, k % 2 ? "#3f8a4a" : "#5aa65a");
      if (i === 24) { x.fillStyle = "#e0452f"; x.beginPath(); x.moveTo(110, 420); x.lineTo(128, 330); x.lineTo(146, 420); x.fill(); }
      else dots(128, 360, 50, 40, 24, ["#c77dff", "#f5f0ff", "#9d4edd"], 12);
    });
    // 26–27 arbustos
    for (let i = 26; i < 28; i++) cell(i, () => crown(128, 420, 110, 80, GREEN, 20));
    // 28–29 pinos y cipreses (el bosque del fondo)
    for (let i = 28; i < 30; i++) cell(i, () => {
      trunk(128, 508, 128, 60, 7, "#5a4130");
      for (let k = 0; k < 9; k++) { const y = 80 + k * 46, w = 30 + k * 11; x.fillStyle = k % 2 ? "#2f5d3a" : "#3c6e45"; x.beginPath(); x.moveTo(128, y - 30); x.lineTo(128 - w, y + 34); x.lineTo(128 + w, y + 34); x.fill(); x.fillStyle = "rgba(160,210,150,0.35)"; x.beginPath(); x.moveTo(128, y - 30); x.lineTo(128 - w, y + 34); x.lineTo(128 - w * 0.3, y + 34); x.fill(); }
    });
    // 30–31 juncos y papiros de la laguna
    for (let i = 30; i < 32; i++) cell(i, () => { for (let k = 0; k < 14; k++) { const bx = 128 + R(-70, 70), top = R(150, 330); line(pickC(["#5aa65a", "#3f8a4a", "#7cbf62"]), 3); x.beginPath(); x.moveTo(bx, 508); x.quadraticCurveTo(bx + R(-20, 20), (508 + top) / 2, bx + R(-30, 30), top); x.stroke(); if (i === 31) dots(bx, top, 14, 10, 8, ["#6fae4e", "#9ccc6b"], 6); } });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return t;
  })();
  const SIZES = [[9, 14], [9, 14], [9, 14], [9, 13], [9, 13], [9, 13], [9, 13], [24, 34], [24, 34], [10, 15], [10, 15], [18, 26], [18, 26], [8, 12], [3, 4.5], [3, 4.5], [2.4, 3.6], [2.4, 3.6], [5, 7], [5, 7], [9, 14], [9, 14], [1.4, 2.2], [1.4, 2.2], [1.1, 1.7], [1.1, 1.7], [2.2, 3.4], [2.2, 3.4], [14, 22], [14, 22], [2.2, 3.6], [2.2, 3.6]];
  const KIND = { arbol: [0, 1, 2], amarillo: [3, 4], rosado: [5, 6], cera: [7, 8], palma: [9, 10], ceiba: [11, 12], yarumo: [13], heliconia: [14, 15], buganvilia: [16, 17], helecho: [18, 19], guadua: [20, 21], flores: [22, 23], bromelia: [24, 25], arbusto: [26, 27], pino: [28, 29], junco: [30, 31] };
  const vegList = [];
  let vegU = null;                                             // uniformes de la vegetación (cámara y objetivo)
  const segD = (px, pz, a, b) => { const vx = b.x - a.x, vz = b.z - a.z, L2 = vx * vx + vz * vz; const k = clamp(((px - a.x) * vx + (pz - a.z) * vz) / L2); return Math.hypot(px - (a.x + vx * k), pz - (a.z + vz * k)); };
  const freeSpot = (x, z, pad = 1.5) => {
    if (distToStations(x, z) < pad) return false;
    if (distRiver(x, z) < 4.3) return false;
    for (const b of blockers) if (Math.hypot(b.x - x, b.z - z) < b.r) return false;
    if (distLag(x, z) < LAG_R + 0.5) return false;
    for (let i = 0; i < N; i++) { if (Math.hypot(GATE[i].x - x, GATE[i].z - z) < 6 || segD(x, z, GATE[i], S[i]) < 4) return false; }
    return Math.hypot(START.x - x, START.z - z) > 13 && Math.hypot(END.x - x, END.z - z) > 15;
  };
  const pick = (weights) => { let s = 0; for (const w of Object.values(weights)) s += w; let r = Math.random() * s; for (const [k, w] of Object.entries(weights)) { r -= w; if (r <= 0) { const a = KIND[k]; return a[(Math.random() * a.length) | 0]; } } return 0; };
  const plant = (x, z, v) => {
    const [a, b] = SIZES[v], h = a + Math.random() * (b - a), hw = h * 0.28;
    if (h > DECK - 1.3) {                                        // no cabe bajo la losa: se aparta lo que mide su copa
      if (distToPath(x, z) < HW + hw + 0.8 || nearBranch(x, z, 2.4 + hw + 0.6) || distToStations(x, z) < 1.4 + hw) return false;
      if (Math.hypot(START.x - x, START.z - z) < 11.5 + hw || Math.hypot(END.x - x, END.z - z) < 13.5 + hw) return false;
    }
    vegList.push([x, heightAt(x, z) - 0.2, z, h * 0.5, h, v]); return true;
  };
  // Jardín bajo y alrededor de la pasarela elevada: macizos, sotobosque y copas a la altura del paseo
  for (let k = 0, g = 0; k < (LOW ? 900 : 1900) && g < 20000; g++) {
    const u = Math.random(), p = curve.getPointAt(u), sd = sideAt(u), sg = Math.random() < 0.5 ? 1 : -1, d = Math.random() * 22;
    const x2 = p.x + sd.x * sg * d, z2 = p.z + sd.z * sg * d;
    if (!freeSpot(x2, z2)) continue;
    plant(x2, z2, d < HW + 1.5 ? pick({ flores: 6, bromelia: 4, helecho: 3, heliconia: 2 })
      : d < HW + 7 ? pick({ heliconia: 4, buganvilia: 3, helecho: 3, flores: 3, bromelia: 2, guadua: 1, yarumo: 1 })
      : pick({ arbol: 3, amarillo: 3, rosado: 3, cera: 2, palma: 2, ceiba: 1, helecho: 2, guadua: 2 })); k++;
  }
  // Orillas de la quebrada
  for (let k = 0; k < (LOW ? 160 : 320); k++) { const p = riverPts[(Math.random() * riverPts.length) | 0], a = Math.random() * Math.PI * 2, r = 4.4 + Math.random() * 2.5; const x2 = p.x + Math.cos(a) * r, z2 = p.z + Math.sin(a) * r; if (freeSpot(x2, z2)) plant(x2, z2, pick({ junco: 5, heliconia: 2, helecho: 2, bromelia: 1 })); }
  // Alrededor de cada estancia: un bosque que la oculta a medias (el frente queda despejado para la curiosidad)
  S.forEach((s, i) => {
    const back = DIR_OF(i).clone().negate();
    for (let k = 0, g = 0; k < (LOW ? 22 : 40) && g < 900; g++) {
      const a = Math.random() * Math.PI * 2, r = ROOM_R[i] + 3 + Math.random() * 14;
      const x2 = s.x + Math.cos(a) * r, z2 = s.z + Math.sin(a) * r;
      if (Math.cos(a) * -back.x + Math.sin(a) * -back.z > 0.75) continue;
      if (!freeSpot(x2, z2, 2.5) || distToPath(x2, z2) < HW + 3) continue;
      plant(x2, z2, pick({ ceiba: 1, amarillo: 3, rosado: 2, cera: 3, palma: 2, guadua: 2, arbol: 3, yarumo: 1, helecho: 2 })); k++;
    }
  });
  // Laguna: juncos y papiros en la orilla
  for (let k = 0; k < 60; k++) { const a = Math.random() * Math.PI * 2, r = LAG_R + 1 + Math.random() * 3; const x2 = LAG.x + Math.cos(a) * r, z2 = LAG.z + Math.sin(a) * r; if (freeSpot(x2, z2)) plant(x2, z2, pick({ junco: 4, heliconia: 1 })); }
  // Jardín abierto: bosque, palmares de cera y guayacanes hasta las laderas
  for (let k = 0, g = 0; k < (LOW ? 650 : 1400) && g < 24000; g++) {
    const x2 = (Math.random() - 0.5) * 760, z2 = (Math.random() - 0.5) * 300;
    if (distToPath(x2, z2) < 12 || !freeSpot(x2, z2, 4)) continue;
    const slope = sm(90, 150, Math.abs(z2));
    plant(x2, z2, slope > 0.5 ? pick({ pino: 4, arbol: 3, guadua: 1 }) : pick({ arbol: 4, amarillo: 3, rosado: 2, cera: 2, palma: 2, ceiba: 1, pino: 2, guadua: 1, yarumo: 1, buganvilia: 1 })); k++;
  }
  {
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, 0.5, 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: { atlas: { value: vegTex }, fogColor: { value: fog.color }, fogNear: { value: fog.near }, fogFar: { value: fog.far }, camP: { value: new THREE.Vector3() }, tgtP: { value: new THREE.Vector3() }, time: { value: 0 }, uBend: bendU, uBendC: bendC },
      vertexShader: `
        attribute float aVar; varying vec2 vUv; varying float vFog; uniform float uBend; uniform vec2 uBendC;
        uniform vec3 camP; uniform vec3 tgtP; uniform float time;
        void main(){
          vec3 c = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          // Las plantas entre la cámara y lo que se mira se apartan (no tapan al personaje ni la sala)
          vec2 a = camP.xz, b = tgtP.xz, v = b - a;
          float k = clamp(dot(c.xz - a, v) / max(dot(v, v), 0.001), 0.0, 1.0);
          float hide = (1.0 - smoothstep(2.4, 4.6, length(c.xz - (a + v * k)))) * step(0.02, k) * (1.0 - step(0.96, k));
          hide = max(hide, 1.0 - smoothstep(3.0, 6.0, length(c.xz - a)));
          float sx = length(instanceMatrix[0].xyz), sy = length(instanceMatrix[1].xyz);
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); right.y = 0.0; right = normalize(right);
          float sway = sin(time * 1.3 + c.x * 0.3 + c.z * 0.2) * 0.04 * position.y;              // brisa
          vec3 p = c + (right * (position.x + sway) * sx + vec3(0.0, position.y * sy, 0.0)) * (1.0 - hide);
          float col = mod(aVar, 8.0), row = floor(aVar / 8.0);
          vUv = vec2((uv.x + col) / 8.0, (uv.y + (3.0 - row)) / 4.0);
          vec2 bd = p.xz - uBendC; p.y -= dot(bd, bd) * uBend;
          vec4 mv = viewMatrix * vec4(p, 1.0); vFog = -mv.z;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D atlas; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar; varying vec2 vUv; varying float vFog;
        void main(){
          vec4 t = texture2D(atlas, vUv);
          if (t.a < 0.5) discard;
          gl_FragColor = vec4(mix(t.rgb, fogColor, smoothstep(fogNear, fogFar, vFog)), 1.0);
        }`,
    });
    const veg = new THREE.InstancedMesh(geo, mat, vegList.length);
    const vars = new Float32Array(vegList.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();
    vegList.forEach(([x2, y2, z2, w, h, v], k) => { veg.setMatrixAt(k, m4.compose(p3.set(x2, y2, z2), q, s3.set(w, h, 1))); vars[k] = v; });
    geo.setAttribute("aVar", new THREE.InstancedBufferAttribute(vars, 1));
    veg.frustumCulled = false;
    scene.add(veg);
    vegU = mat.uniforms;
  }

  /* ---------------- Viento, mariposas y polen ---------------- */
  const WIND = 90;
  const windGeo = new THREE.BufferGeometry();
  const windPos = new Float32Array(WIND * 6);
  const windSeed = Array.from({ length: WIND }, () => ({ x: (Math.random() - 0.5) * 500, y: 2 + Math.random() * 14, z: (Math.random() - 0.5) * 180, v: 8 + Math.random() * 8, l: 3 + Math.random() * 5 }));
  windGeo.setAttribute("position", new THREE.BufferAttribute(windPos, 3));
  const windMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  const windLines = new THREE.LineSegments(windGeo, windMat);
  windLines.frustumCulled = false;
  scene.add(windLines);
  const POLLEN = 700;
  const polGeo = new THREE.BufferGeometry();
  const polPos = new Float32Array(POLLEN * 3);
  for (let i = 0; i < POLLEN; i++) { polPos[i * 3] = (Math.random() - 0.5) * 500; polPos[i * 3 + 1] = 0.5 + Math.random() * 12; polPos[i * 3 + 2] = (Math.random() - 0.5) * 180; }
  polGeo.setAttribute("position", new THREE.BufferAttribute(polPos, 3));
  const pollen = new THREE.Points(polGeo, new THREE.PointsMaterial({ color: 0xfff3b0, size: 0.28, transparent: true, opacity: 0.8, depthWrite: false }));
  pollen.frustumCulled = false;
  scene.add(pollen);


  /* ==================================================================
     CONSTRUCTORES · cada estación devuelve su ejercicio
     { label, value, fmt(v), set(v), tick?(t, dt), steps?, loop?, speed?, onStep? }
     ================================================================== */
  const add = (g, mesh, shadow = true) => { mesh.castShadow = shadow; mesh.receiveShadow = true; g.add(mesh); return mesh; };
  const box = (g, w, h, d, x, y, z, mat = M.base, edges = true) => {
    const m = add(g, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    m.position.set(x, y + h / 2, z);
    if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), M.edge));
    return m;
  };
  const roofed = (g, w, h, d, x, z, mat = M.base, rh = 1.2) => {
    box(g, w, h, d, x, 0, z, mat);
    const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, rh); s.closePath();
    const r = add(g, new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), mat));
    r.position.set(x, h, z - d / 2);
    r.add(new THREE.LineSegments(new THREE.EdgesGeometry(r.geometry), M.edge));
    return r;
  };
  const lineTube = (g, pts, r, mat, closed = false) => add(g, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, closed), Math.max(24, pts.length * 6), r, 6, closed), mat), false);
  const segs = (pts, mat) => new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat);
  function hull(pts) {                                       // envolvente convexa (cadena monótona)
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  let active = -1;                                           // estación abierta

  const BUILD = {
    origen(g, a) {
      const mat = M.base.clone(); mat.transparent = true;
      const house = new THREE.Group(); g.add(house);
      roofed(house, 3.4, 2.4, 3.2, 0, 0, mat, 1.6);
      const lm = a.line.clone();
      const pts = [], jit = () => (Math.random() - 0.5) * 0.28;
      const seg = (x1, z1, x2, z2, y = 0.06) => pts.push(new THREE.Vector3(x1 + jit(), y, z1 + jit()), new THREE.Vector3(x2 + jit(), y, z2 + jit()));
      for (let k = 0; k < 2; k++) { seg(-4, -3.6, 4, -3.6); seg(4, -3.6, 4, 3.6); seg(4, 3.6, -4, 3.6); seg(-4, 3.6, -4, -3.6); }
      for (let x = -3; x <= 3; x += 1.5) seg(x, -4.4, x, -3.9);
      seg(-4.8, 0, -4.2, 0); seg(4.2, 1, 5.6, 2.6); seg(5.6, 2.6, 6.2, 2.6);
      for (const [x, z] of [[-1.7, -1.6], [1.7, -1.6], [1.7, 1.6], [-1.7, 1.6]]) pts.push(new THREE.Vector3(x, 0, z), new THREE.Vector3(x + jit() * 0.3, 4.4, z));
      g.add(segs(pts, lm));
      return {
        label: "Del croquis al volumen", value: 1, steps: 3, speed: 0.1,
        fmt: (v) => ["Croquis a mano", "Esquema de masas", "Volumen construido"][Math.min(2, Math.floor(v * 3))],
        set(v) { house.scale.y = 0.02 + 0.98 * v; mat.opacity = 0.1 + 0.9 * v; mat.depthWrite = v > 0.5; lm.opacity = 1 - 0.55 * v; },
      };
    },
    vivienda(g, a) {
      const A = new THREE.Group(), B = new THREE.Group(), C = new THREE.Group(); g.add(A, B, C);
      A.position.set(-3, 0, -0.6); roofed(A, 2.4, 2.2, 2.6, 0, 0, M.base, 1.3);
      B.position.set(0.6, 0, 1.2); box(B, 3, 1.8, 2.2, 0, 0, 0); const up = box(B, 1.6, 1.2, 1.6, 0, 1.8, 0, a.mat);
      C.position.set(3.6, 0, -1); roofed(C, 2.2, 2.6, 2.2, 0, 0, M.base, 1);
      return {
        label: "Iteración de diseño", value: 0.5, steps: 5, speed: 0.1,
        fmt: (v) => `Opción ${1 + Math.min(4, Math.floor(v * 5))} de 5`,
        set(v) {
          A.scale.y = 0.7 + 0.7 * v;
          up.scale.y = 0.6 + 1.2 * Math.sin(v * Math.PI); up.position.set(-0.7 + 1.4 * v, 1.8 + 0.6 * up.scale.y, 0);
          C.rotation.y = v * Math.PI / 3;
          B.position.z = 1.2 + Math.sin(v * Math.PI * 2) * 0.5;
        },
      };
    },
    bio(g, a) {
      const b = box(g, 4.4, 2.6, 2.6, 0, 0, 0); b.castShadow = false;
      const R = 6.2, HH = 5.4;
      const arcPos = (u) => new THREE.Vector3(-Math.cos(u) * R, Math.sin(u) * HH + 0.1, -1.6 + Math.sin(u) * 0.6);
      lineTube(g, Array.from({ length: 25 }, (_, k) => arcPos((k / 24) * Math.PI)), 0.05, a.mat);
      const dotG = new THREE.SphereGeometry(0.12, 8, 6);
      for (let h = 0; h <= 12; h++) { const d = add(g, new THREE.Mesh(dotG, a.mat), false); d.position.copy(arcPos((h / 12) * Math.PI)); }
      const s = add(g, new THREE.Mesh(new THREE.SphereGeometry(0.55, 18, 12), new THREE.MeshBasicMaterial({ color: 0xffc46b })), false);
      const rays = segs(Array.from({ length: 6 }, () => new THREE.Vector3()), a.line);
      g.add(rays);
      const shadow = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide }));
      shadow.position.y = 0.05; g.add(shadow);
      const corners = [[-2.2, -1.3], [2.2, -1.3], [2.2, 1.3], [-2.2, 1.3]];
      const c0 = new THREE.Vector3(0, 1.3, 0);
      let len = 0;
      return {
        label: "Hora solar", value: 0.3, steps: 12, loop: true, speed: 0.07,
        fmt: (v) => { const h = 6 + 12 * v; return `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")} h · sombra ${len.toFixed(1)} m`; },
        set(v) {
          const sp = arcPos(v * Math.PI); s.position.copy(sp);
          const rp = rays.geometry.attributes.position;
          [[-1.8, 2.6, 0], [0, 2.6, 0], [1.8, 2.6, 0]].forEach(([x, y, z], k) => { rp.setXYZ(k * 2, sp.x, sp.y, sp.z); rp.setXYZ(k * 2 + 1, x, y, z); });
          rp.needsUpdate = true;
          const d = sp.clone().sub(c0).normalize();
          const k = Math.min(2.6 / Math.max(0.06, d.y), 12);
          len = k * Math.hypot(d.x, d.z);
          const pts = [];
          for (const [x, z] of corners) pts.push([x, z], [x - d.x * k, z - d.z * k]);
          const shape = new THREE.Shape(hull(pts).map(([x, z]) => new THREE.Vector2(x, -z)));
          shadow.geometry.dispose();
          shadow.geometry = new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2);
        },
      };
    },
    fab(g, a) {
      const bars = [], barG = new THREE.BoxGeometry(0.62, 1, 0.62);
      for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) {
        const m = add(g, new THREE.Mesh(barG, (i + j) % 3 === 0 ? a.mat : M.base));
        m.position.set(i * 0.75, 0, j * 0.75); bars.push([m, i, j]);
      }
      let amp = 0.6;
      return {
        label: "Amplitud de la onda", value: 0.6, speed: 0.12,
        fmt: (v) => `A = ${(v * 2.2).toFixed(2)} m · 63 piezas`,
        set(v) { amp = v; },
        tick(t) { for (const [m, i, j] of bars) { const h = 0.3 + amp * 1.1 * (Math.sin(i * 0.7 + t * 1.1) * Math.cos(j * 0.8 + t * 0.7) + 1) + 0.25; m.scale.y = h; m.position.y = h / 2; } },
      };
    },
    urbano(g, a) {
      box(g, 14, 0.9, 0.5, 0, 0, 0.9, M.base);
      const prom = []; for (let x = -7; x <= 7; x += 0.5) prom.push(new THREE.Vector3(x, 1, 0.9));
      lineTube(g, prom, 0.1, a.mat);
      const wmat = () => new THREE.MeshStandardMaterial({ color: col("wind"), transparent: true, opacity: 0.45, roughness: 0.15, flatShading: true });
      const front = add(g, new THREE.Mesh(new THREE.PlaneGeometry(14, 4.6, 28, 9).rotateX(-Math.PI / 2), wmat()), false);
      front.position.set(0, 0, 3.4);
      const back = add(g, new THREE.Mesh(new THREE.PlaneGeometry(14, 4, 28, 8).rotateX(-Math.PI / 2), wmat()), false);
      back.position.set(0, 0, -1.3); back.visible = false;
      [1.2, 2.4, 1.6, 3.2, 1.4, 2, 2.8, 1.2].forEach((h, k) => box(g, 1.3, h, 1.3, -6.2 + k * 1.75, 0, -1.8 - (k % 2) * 1.4));
      const heat = col("heat"), wind = col("wind");
      let lvl = 0;
      const wave = (m, t, amp) => { const p = m.geometry.attributes.position; for (let k = 0; k < p.count; k++) p.setY(k, Math.sin(p.getX(k) * 0.9 + t * 1.6) * amp + Math.cos(p.getZ(k) * 1.3 + t) * amp * 0.5); p.needsUpdate = true; };
      return {
        label: "Cota del agua", value: 0.35, steps: 2, speed: 0.08,
        fmt: (v) => `+${(v * 1.5).toFixed(2)} m · ${lvl > 0.95 ? "el río desborda" : "el malecón protege"}`,
        set(v) {
          lvl = -0.2 + v * 1.5;
          front.position.y = lvl;
          const over = clamp((lvl - 0.95) / 0.3);
          back.visible = over > 0; back.position.y = 0.05 + over * 0.45; back.material.opacity = 0.45 * over;
          front.material.color.copy(wind).lerp(heat, over * 0.6); back.material.color.copy(front.material.color);
        },
        tick(t) { wave(front, t, 0.06); if (back.visible) wave(back, t + 1, 0.04); },
      };
    },
    software(g, a) {
      const solid = M.base.clone(), leaf = accent.leaf.clone(), gold = accent.sun.clone();
      for (const m of [solid, leaf, gold]) m.transparent = true;
      const wm = a.line.clone(); wm.opacity = 0.2;
      const world = new THREE.Group(); g.add(world);
      const hero = new THREE.Group(); world.add(hero);
      const v = (grp, x, y, z, m) => box(grp, 0.7, 0.7, 0.7, x * 0.7, y * 0.7, z * 0.7, m, false);
      for (let y = 0; y < 3; y++) v(hero, 0, y, 0, solid);
      v(hero, 0, 3, 0, gold); v(hero, -1, 2, 0, solid); v(hero, 1, 2, 0, solid);
      for (const [x, z] of [[-4, -1], [4, 1], [3, -2.5], [-3, 2.2]]) {
        const tr = add(world, new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 5), leaf)); tr.position.set(x, 1.6, z);
        box(world, 0.3, 0.6, 0.3, x, 0, z, solid, false);
      }
      const coin = add(world, new THREE.Mesh(new THREE.OctahedronGeometry(0.45), gold), false);
      world.traverse((o) => { if (o.isMesh) o.add(new THREE.LineSegments(new THREE.WireframeGeometry(o.geometry), wm)); });
      return {
        label: "Render", value: 0, steps: 2, speed: 0.1,
        fmt: (v) => (v < 0.5 ? "Sólido (lo que ve el jugador)" : "Alambre (la malla que hay debajo)"),
        set(v) { for (const m of [solid, leaf, gold]) { m.opacity = 1 - 0.92 * v; m.depthWrite = v < 0.5; } wm.opacity = 0.15 + 0.85 * v; },
        tick(t) {
          hero.position.set(Math.cos(t * 0.6) * 1.8, Math.abs(Math.sin(t * 3)) * 0.35, Math.sin(t * 0.6) * 1.8);
          hero.rotation.y = -t * 0.6;
          coin.rotation.y = t * 2; coin.position.set(Math.cos(t * 0.6 + 1.2) * 1.8, 2.4 + Math.sin(t * 2.4) * 0.3, Math.sin(t * 0.6 + 1.2) * 1.8);
        },
      };
    },
    docencia(g, a) {
      box(g, 6.4, 3, 0.25, 0, 0, -3.4, M.base);
      const grid = new THREE.GridHelper(6, 12, col("leaf"), col("leaf")); grid.material.transparent = true; grid.material.opacity = 0.3;
      grid.position.set(0, 1.6, -3.25); grid.rotation.x = Math.PI / 2; g.add(grid);
      const n = 9, XY = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) XY.push([(i - 4) * 0.8, (j - 4) * 0.6]);
      const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * n * 3), 3));
      g.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: col("leaf"), size: 0.3 })));
      const idx = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { if (i < n - 1) idx.push(i * n + j, (i + 1) * n + j); if (j < n - 1) idx.push(i * n + j, i * n + j + 1); }
      const lg = new THREE.BufferGeometry(); lg.setAttribute("position", pg.attributes.position); lg.setIndex(idx);
      const lm = a.line.clone(); lm.opacity = 0;
      g.add(new THREE.LineSegments(lg, lm));
      let V = 0;
      const place = (t) => {
        const p = pg.attributes.position;
        XY.forEach(([x, z], k) => p.setXYZ(k, x, 1.2 + V * (1.3 + x * z * 0.3) + (1 - V) * Math.sin(k * 1.7 + t) * 0.12, z));
        p.needsUpdate = true;
      };
      return {
        label: "Del punto a la superficie", value: 0.1, steps: 3, speed: 0.08,
        fmt: (v) => ["Nube de puntos", "Retícula (malla)", "Paraboloide hiperbólico"][Math.min(2, Math.floor(v * 3))],
        set(v) { V = v; lm.opacity = Math.min(1, v * 1.8) * 0.9; },
        tick: place,
      };
    },
    sostenible(g, a) {
      const ring = add(g, new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.12, 8, 72), a.mat), false);
      ring.rotation.x = Math.PI / 2; ring.position.y = 2.2;
      const arrows = new THREE.Group(); arrows.position.y = 2.2; g.add(arrows);
      for (let k = 0; k < 3; k++) {
        const c = add(arrows, new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.8, 8), a.mat));
        const u = (k / 3) * Math.PI * 2 + 0.5; c.position.set(Math.cos(u) * 2.8, 0, Math.sin(u) * 2.8); c.rotation.set(0, -u, Math.PI / 2);
      }
      const STG = ["sun", "heat", "wind", "leaf"];
      const nodes = STG.map((k, i) => { const s = add(g, new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 10), accent[k]), false); const u = (i / 4) * Math.PI * 2; s.position.set(Math.cos(u) * 2.8, 2.2, Math.sin(u) * 2.8); return s; });
      const marker = add(g, new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })), false);
      const cm = M.base.clone();
      box(g, 1.6, 1.6, 1.6, 0, 0, 0, cm);
      const tgt = new THREE.Color();
      let k = 0;
      return {
        label: "Etapa del ciclo de vida", value: 0.1, steps: 4, loop: true, speed: 0.06,
        fmt: (v) => ["Extracción y materiales", "Construcción", "Uso y operación", "Fin de vida y reciclaje"][Math.min(3, Math.floor(v * 4))],
        set(v) {
          const u = v * Math.PI * 2; marker.position.set(Math.cos(u) * 2.8, 2.2, Math.sin(u) * 2.8);
          k = Math.min(3, Math.floor(v * 4));
          nodes.forEach((s, i) => s.scale.setScalar(i === k ? 1.7 : 1));
        },
        tick(t, dt) { arrows.rotation.y = -t * 0.4; tgt.copy(accent[STG[k]].color); cm.color.lerp(tgt, Math.min(1, dt * 4)); },
      };
    },
    bim(g, a) {
      const layers = [];
      for (let k = 0; k < 4; k++) {
        const L = new THREE.Group(); g.add(L); layers.push(L);
        box(L, 4.6, 0.22, 3.4, 0, 0, 0, k === 3 ? a.mat : M.base);
        if (k < 3) for (const [x, z] of [[-2, -1.4], [2, -1.4], [-2, 1.4], [2, 1.4], [0, -1.4], [0, 1.4]]) box(L, 0.2, 1.2, 0.2, x, 0.22, z, M.base, false);
        if (k < 3) box(L, 1.6, 1.2, 0.12, -1, 0.22, 1.62, accent.wind, false);
      }
      const pipeG = new THREE.CylinderGeometry(0.09, 0.09, 1, 8); pipeG.translate(0, 0.5, 0);
      const pipes = [[1.3, 0.5], [1.55, 0.5], [1.3, 0.8]].map(([x, z]) => { const p = add(g, new THREE.Mesh(pipeG, accent.heat), false); p.position.set(x, 0.1, z); return p; });
      return {
        label: "Explosión del modelo", value: 0.5, speed: 0.1,
        fmt: (v) => (v < 0.06 ? "Modelo federado ensamblado" : `Separación ${(v * 2.2).toFixed(1)} m · 5 disciplinas`),
        set(v) {
          const e = v * 2.2;
          layers.forEach((L, k) => { L.position.y = k * (1.42 + e); });
          for (const p of pipes) p.scale.y = 3 * (1.42 + e) + 0.2;
        },
      };
    },
    red(g, a) {
      const nodes = [];
      for (let k = 0; k < 16; k++) {
        const phi = Math.acos(1 - (2 * (k + 0.5)) / 16), th = Math.PI * (1 + Math.sqrt(5)) * k;
        nodes.push(new THREE.Vector3(Math.cos(th) * Math.sin(phi) * 2.9, 3.4 + Math.cos(phi) * 2.9, Math.sin(th) * Math.sin(phi) * 2.9));
      }
      const G = new THREE.Group(); g.add(G);
      const ng = new THREE.SphereGeometry(0.22, 10, 8);
      for (const n of nodes) { const s = add(G, new THREE.Mesh(ng, a.mat), false); s.position.copy(n); }
      const edges = [];
      nodes.forEach((n, i) => nodes.forEach((m, j) => { if (j > i) edges.push([i, j, n.distanceTo(m)]); }));
      edges.sort((x, y) => x[2] - y[2]);
      const E = edges.slice(0, 60);
      const lines = segs(E.flatMap(([i, j]) => [nodes[i], nodes[j]]), a.line);
      G.add(lines);
      const podium = add(g, new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 24), M.base)); podium.position.y = 0.2;
      const pm = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pulses = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), pm); G.add(m); return { m, e: 0, p: Math.random() }; });
      let count = 30;
      return {
        label: "Conexiones", value: 0.5, speed: 0.08,
        fmt: () => `${count} conexiones · ${nodes.length} nodos`,
        set(v) { count = Math.max(3, Math.round(v * E.length)); lines.geometry.setDrawRange(0, count * 2); },
        tick(t, dt, focused) {
          G.rotation.y = t * 0.25;
          for (const q of pulses) {
            q.p += dt * 0.9;
            if (q.p >= 1) { q.p = 0; q.e = (Math.random() * count) | 0; if (focused) Sound.ping(); }
            const [i, j] = E[Math.min(q.e, count - 1)];
            q.m.position.lerpVectors(nodes[i], nodes[j], q.p);
          }
        },
      };
    },
    maestria(g) {
      const E = new THREE.Group(); E.position.y = 0.4; g.add(E);
      const k = 0.26, bz = (px, py) => new THREE.Vector3((px - 16) * k, (25 - py) * k, 0);
      add(E, new THREE.Mesh(new THREE.TubeGeometry(new THREE.CubicBezierCurve3(bz(2.5, 25), bz(8, 16.5), bz(24, 16.5), bz(29.5, 25)), 64, 1.6 * k, 14, false), accent.leaf));
      const r = 8.4 * k, yRest = bz(16, 17.5).y, cut = (25 - 18.6) * k + 3 * k;
      const sunMat = accent.sun.clone();
      sunMat.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), -(DECK + EXH_Y + EXH_S * (0.4 + cut)))];   // corte del horizonte de la marca
      sunMat.clipShadows = true;
      const sunM = add(E, new THREE.Mesh(new THREE.SphereGeometry(r, 40, 24), sunMat));
      sunM.scale.z = 0.4;
      const halo = segs(Array.from({ length: 12 }, (_, i) => { const u = (i / 12) * Math.PI * 2; return [new THREE.Vector3(Math.cos(u) * r * 1.25, Math.sin(u) * r * 1.25, 0), new THREE.Vector3(Math.cos(u) * r * 1.6, Math.sin(u) * r * 1.6, 0)]; }).flat(), accent.sunLine.clone());
      halo.material.clippingPlanes = sunMat.clippingPlanes;
      E.add(halo);
      box(g, 3, 0.4, 1.4, 0, 0, 0, M.base);
      return {
        label: "Sol naciente", value: 0.5, steps: 3, speed: 0.08,
        fmt: (v) => ["Bajo el horizonte", "Sol naciente · la marca BIOBIM", "Sol pleno · clima dentro del modelo"][Math.min(2, Math.floor(v * 3))],
        onStep(b, prev) { if (b === 2 && prev < 2) Sound.rise(); else Sound.step(b); },
        set(v) {
          const y = v < 0.5 ? lerp(cut - r - 0.05, yRest, v * 2) : lerp(yRest, cut + r + 0.08, (v - 0.5) * 2);
          sunM.position.y = y; halo.position.y = y;
          sunMat.emissiveIntensity = 0.18 + 0.6 * v;
          halo.material.opacity = clamp((v - 0.66) / 0.3);
        },
        tick(t) { E.rotation.y = Math.sin(t * 0.4) * 0.35; halo.rotation.z = t * 0.2; },
      };
    },
    edu(g, a) {
      const spots = [[-3, -1.8], [0, -2.3], [3, -1.8], [-3.4, 1.7], [3.4, 1.7], [0, 2.9]];
      const mods = spots.map(([x, z], k) => { const m = new THREE.Group(); m.position.set(x, 0, z); g.add(m); roofed(m, 2.2, 1.6, 2, 0, 0, k % 2 ? a.mat : M.base, 0.9); return { g: m, s: 0 }; });
      const pm = accent.leaf.clone(); pm.transparent = true; pm.opacity = 0.35;
      const patio = add(g, new THREE.Mesh(new THREE.CircleGeometry(1.8, 28), pm), false);
      patio.rotation.x = -Math.PI / 2; patio.position.y = 0.05;
      for (const [x, z] of [[0, 0.9], [-1, -0.1], [1.1, 0.2]]) { const tr = add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), accent.leaf)); tr.position.set(x, 1.1, z); box(g, 0.14, 0.6, 0.14, x, 0, z, M.base, false); }
      let count = 3;
      return {
        label: "Aulas del sistema", value: 0.4, steps: 6, speed: 0.08,
        fmt: () => `${count} aula${count > 1 ? "s" : ""} modular${count > 1 ? "es" : ""} · patio central`,
        set(v) { count = 1 + Math.min(5, Math.floor(v * 6)); },
        tick(t, dt) {
          mods.forEach((m, k) => {
            m.s += ((k < count ? 1 : 0) - m.s) * Math.min(1, dt * 6);
            m.g.visible = m.s > 0.01; m.g.scale.set(1, Math.max(0.001, m.s), 1); m.g.position.y = (1 - m.s) * 3;
          });
        },
      };
    },
    doctorado(g, a) {
      const G = new THREE.Group(); g.add(G);
      const TIERS = [[6, 0.9, 3.3], [6, 2.6, 2.5], [3, 4.2, 1.4], [1, 5.7, 0]];
      const tiers = TIERS.map(([n, y, r], t) => Array.from({ length: n }, (_, k) => { const u = (k / n) * Math.PI * 2 + t * 0.4; return new THREE.Vector3(Math.cos(u) * r, y, Math.sin(u) * r); }));
      const dim = a.mat.clone(); dim.transparent = true; dim.opacity = 0.2; dim.emissiveIntensity = 0;
      const lit = [a.mat, a.mat, a.mat, accent.sun];
      const ng = new THREE.SphereGeometry(0.28, 14, 10);
      const nodeMesh = tiers.map((T, t) => T.map((p) => { const s = add(G, new THREE.Mesh(ng, dim), false); s.position.copy(p); if (t === 3) s.scale.setScalar(2); return s; }));
      const links = [0, 1, 2].map((t) => {
        const pts = [];
        tiers[t].forEach((p, i) => pts.push(p, tiers[t + 1][Math.floor((i * tiers[t + 1].length) / tiers[t].length)]));
        const m = a.line.clone(); const l = segs(pts, m); G.add(l); return l;
      });
      box(g, 2.4, 0.4, 2.4, 0, 0, 0, M.base);
      return {
        label: "Andamiaje BIOBIM", value: 1, steps: 4, speed: 0.08,
        fmt: (v) => ["Datos climáticos", "Las seis herramientas", "Modelo BIM", "Decisión de diseño"][Math.min(3, Math.floor(v * 4))],
        set(v) {
          const L = 1 + Math.min(3, Math.floor(v * 4));
          nodeMesh.forEach((T, t) => T.forEach((s) => { s.material = t < L ? lit[t] : dim; }));
          links.forEach((l, t) => { l.material.opacity = t + 1 < L ? 0.9 : 0.06; });
        },
        tick(t) { G.rotation.y = t * 0.2; },
      };
    },
  };


  /* ==================================================================
     ESTACIONES, RAMALES Y PORTALES
     ================================================================== */
  const stations = [], hits = [], EX = [], gates = [];
  const walkables = [deckTop];                                // superficies donde se puede hacer clic para caminar (todo elevado)
  const hitGeo = new THREE.CylinderGeometry(6.6, 6.6, 12, 16); hitGeo.translate(0, 6, 0);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const DIR = STATIONS.map((_, i) => DIR_OF(i));

  // Letreros y años pintados en el piso: texturas de lienzo que se redibujan con la fuente y el tema
  const labelJobs = [];
  function labelTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const job = () => { const x = c.getContext("2d"); x.clearRect(0, 0, w, h); draw(x, w, h, light()); tex.needsUpdate = true; };
    job(); labelJobs.push(job);
    return tex;
  }
  const fitFont = (x, txt, weight, size, maxW, fam = "'Space Grotesk', system-ui, sans-serif") => {
    let s = size; do { x.font = `${weight} ${s}px ${fam}`; s -= 4; } while (x.measureText(txt).width > maxW && s > 18);
  };
  const yearOf = (s) => s.y.split(/[–—\s→]/)[0];
  const hexOf = (c) => cssVar(`--${c}`, "#ffb547");
  const HAND = "'Architects Daughter', 'Caveat', cursive";
  function floorLabel(big, small, c) {
    return labelTex(1024, 420, (x, w, h) => {
      x.textAlign = "center"; x.textBaseline = "alphabetic";
      x.fillStyle = "rgba(43,41,37,0.82)";
      fitFont(x, big, 400, 240, w - 60, HAND); x.fillText(big, w / 2, 250);
      x.strokeStyle = hexOf(c); x.lineWidth = 9; x.lineCap = "round";
      x.beginPath(); x.moveTo(w * 0.22, 282); x.quadraticCurveTo(w * 0.5, 272 + Math.random() * 12, w * 0.78, 284); x.stroke();
      x.fillStyle = "rgba(43,41,37,0.8)";
      fitFont(x, small, 400, 60, w - 90, HAND); x.fillText(small, w / 2, 362);
    });
  }
  function signLabel(kicker, title, c) {
    return labelTex(1024, 256, (x, w, h) => {
      x.fillStyle = "rgba(246,241,228,0.97)"; x.fillRect(10, 12, w - 20, h - 24);
      x.strokeStyle = "rgba(43,41,37,0.9)"; x.lineWidth = 5; x.lineJoin = "round";
      x.beginPath(); x.moveTo(8, 14); x.lineTo(w - 6, 10); x.lineTo(w - 12, h - 10); x.lineTo(12, h - 14); x.closePath(); x.stroke();
      x.fillStyle = hexOf(c); x.fillRect(24, 26, 16, h - 52);
      x.textAlign = "left"; x.textBaseline = "alphabetic";
      x.fillStyle = hexOf(c); fitFont(x, kicker, 400, 46, w - 110, HAND); x.fillText(kicker, 64, 92);
      x.fillStyle = "#2b2925"; fitFont(x, title, 400, 92, w - 100, HAND); x.fillText(title, 64, 196);
    });
  }
  const flatPlane = (w, h, tex) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.set(-Math.PI / 2, 0, Math.PI); m.renderOrder = 2;
    return m;
  };
  function makeGate(p, tan, c, scale = 1, sign = null, floor = null) {
    const g = new THREE.Group();
    g.position.set(p.x, DECK, p.z);
    g.rotation.y = Math.atan2(tan.x, tan.z);
    const glow = c === "light" ? M.lightStrip : accent[c + "Glow"];
    const X = (HW + 0.45) * scale, Hh = 5.4 * scale;
    const part = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = mat === M.metal; g.add(m); return m; };
    const strips = [];
    for (const sg of [1, -1]) {
      part(new THREE.BoxGeometry(0.34, Hh, 0.34), M.metal, sg * X, Hh / 2, 0);
      strips.push(part(new THREE.BoxGeometry(0.07, Hh - 0.5, 0.36), glow, sg * (X - 0.19), Hh / 2 - 0.1, 0));
    }
    part(new THREE.BoxGeometry(2 * X + 0.34, 0.5, 0.34), M.metal, 0, Hh + 0.15, 0);
    strips.push(part(new THREE.BoxGeometry(2 * X - 0.2, 0.08, 0.36), glow, 0, Hh - 0.15, 0));
    if (sign) { const s = new THREE.Mesh(new THREE.PlaneGeometry(4.6 * scale, 1.15 * scale), new THREE.MeshBasicMaterial({ map: sign, transparent: true })); s.position.set(0, Hh + 1.05 * scale, -0.02); s.rotation.y = Math.PI; g.add(s); }
    if (floor) { const f = flatPlane(7.4, 3.03, floor); f.position.set(0, 0.03, -6.2); g.add(f); }
    g.userData = { strips, flash: 0 };
    scene.add(g);
    return g;
  }

  const EXH_S = 1.25, EXH_Y = 0.8;                           // escala y altura de la pieza expuesta
  /* ==================================================================
     ESTANCIAS MONUMENTALES · una arquitectura propia para cada etapa
     ------------------------------------------------------------------
     Pabellones brutalistas escondidos en el jardín. Desde afuera se ve
     un volumen imponente, un portal y una pregunta; adentro, la pieza en
     el centro, una luz propia, haces de luz, paneles y anotaciones.
     ================================================================== */
  const PREG = {
    origen: "¿Dónde empieza un proyecto?", vivienda: "¿Cuántas casas caben en una idea?",
    bio: "¿A qué hora llega la sombra?", fab: "¿Puede una sola regla dibujar 63 piezas?",
    urbano: "¿Qué pasa cuando sube el río?", software: "¿Qué hay debajo de un videojuego?",
    docencia: "¿Cómo se enseña a ver en tres dimensiones?", sostenible: "¿Dónde termina la vida de un edificio?",
    bim: "¿Qué hay dentro de un modelo?", red: "¿Cómo viaja una idea?",
    maestria: "¿Cuándo sale el sol dentro del modelo?", edu: "¿Cómo crece una escuela?",
    doctorado: "¿Se puede enseñar a diseñar con el clima?",
  };
  const ARQ = {
    origen: "Claustro de muros", vivienda: "Casas apiladas", bio: "El óculo", fab: "La celosía dorada", urbano: "Gradas al agua",
    software: "El cubo de píxeles", docencia: "El auditorio", sostenible: "Orquideorama", bim: "La torre", red: "La bóveda de las ideas",
    maestria: "El arco del sol", edu: "Las rocas negras", doctorado: "El faro",
  };
  const nn = (i) => String(i + 1).padStart(2, "0");
  const solids = [], plinths = [], roofMats = STATIONS.map(() => []), visited = new Set(), ROOM = [], roomFx = [], panelMeshes = [];
  const tint = (c, k) => col(c).lerp(new THREE.Color(0xf7f2e8), k);

  function wrapText(x, text, maxW, lineH, x0, y0, maxLines = 99) {
    const words = String(text).split(" "); let line = "", y = y0, n = 0;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (x.measureText(test).width > maxW && line) { x.fillText(line, x0, y); line = w; y += lineH; if (++n >= maxLines) return y; }
      else line = test;
    }
    if (line) { x.fillText(line, x0, y); y += lineH; }
    return y;
  }
  // Paneles de sala: 0 identidad · 1 la historia · 2 proyectos (o el ejercicio)
  const panelTex = (i, k) => labelTex(460, 560, panelDraw(i, k));
  function panelDraw(i, k) {
    const s = STATIONS[i];
    return ((x, w, h) => {
      const P = 34;
      x.fillStyle = "#1c2227"; x.fillRect(0, 0, w, h);
      x.fillStyle = hexOf(s.c); x.fillRect(0, 0, w, 10);
      x.textAlign = "left"; x.textBaseline = "alphabetic";
      const head = (t) => { x.fillStyle = hexOf(s.c); x.font = "500 20px 'JetBrains Mono', monospace"; x.fillText(t.toUpperCase(), P, 58); x.fillStyle = "#eef2f4"; };
      if (k === 0) {
        x.fillStyle = hexOf(s.c); x.font = `400 120px ${HAND}`; x.fillText(nn(i), P, 150);
        x.fillStyle = "#a9b4ba"; x.font = "500 22px 'JetBrains Mono', monospace"; x.fillText(s.y, P, 196);
        x.fillStyle = "#f4f6f7"; x.font = `400 42px ${HAND}`; let y = wrapText(x, s.t, w - 2 * P, 46, P, 262, 3);
        x.font = "600 21px Inter, sans-serif"; if (s.role) y = wrapText(x, s.role, w - 2 * P, 28, P, y + 14, 4);
        x.fillStyle = "#a9b4ba"; x.font = "400 20px Inter, sans-serif"; if (s.org) wrapText(x, s.org, w - 2 * P, 27, P, y + 8, 4);
      } else if (k === 1) {
        head("La idea");
        x.font = "400 23px Inter, sans-serif"; let y = wrapText(x, s.text, w - 2 * P, 33, P, 108, 10);
        x.fillStyle = hexOf(s.c); x.font = "500 18px 'JetBrains Mono', monospace"; x.fillText("REPRESENTACIÓN", P, y + 28);
        x.fillStyle = "#f4f6f7"; x.font = `400 32px ${HAND}`; y = wrapText(x, s.tech, w - 2 * P, 36, P, y + 66, 2);
        x.fillStyle = "#a9b4ba"; x.font = "400 19px Inter, sans-serif"; wrapText(x, s.tools.join(" · "), w - 2 * P, 26, P, y + 6, 2);
      } else if (s.items.length) {
        head("En sala");
        x.font = "400 21px Inter, sans-serif"; let y = 108;
        for (const it of s.items) { x.fillStyle = hexOf(s.c); x.fillRect(P, y - 12, 9, 9); x.fillStyle = "#eef2f4"; y = wrapText(x, it, w - 2 * P - 22, 28, P + 22, y, 3) + 10; if (y > h - 40) break; }
      } else { head("El ejercicio"); x.font = "400 23px Inter, sans-serif"; wrapText(x, s.ex, w - 2 * P, 33, P, 108, 12); }
    });
  }
  // Letrero del portal: número, arquitectura y pregunta (la curiosidad invita a entrar)
  function roomSign(i) {
    const s = STATIONS[i];
    return labelTex(1024, 300, (x, w, h) => {
      x.fillStyle = "rgba(20,26,30,0.94)"; x.fillRect(8, 8, w - 16, h - 16);
      x.fillStyle = hexOf(s.c); x.fillRect(8, 8, 26, h - 16);
      x.textAlign = "left"; x.textBaseline = "alphabetic";
      x.fillStyle = hexOf(s.c); x.font = "500 38px 'JetBrains Mono', monospace"; x.fillText(`ESTANCIA ${nn(i)} · ${ARQ[s.kind].toUpperCase()}`, 64, 80);
      x.fillStyle = "#f4f6f7"; fitFont(x, PREG[s.kind], 400, 74, w - 110, HAND); x.fillText(PREG[s.kind], 64, 186);
      x.fillStyle = "#a9b4ba"; x.font = "400 32px Inter, sans-serif"; x.fillText("Entra para descubrirlo →", 64, 252);
    });
  }
  // Cartela de anotación (texto a mano con línea guía hacia la pieza)
  function noteTex(title, body, c) {
    return labelTex(512, 190, (x, w, h) => {
      x.fillStyle = "rgba(247,244,236,0.95)"; x.fillRect(4, 4, w - 8, h - 8);
      x.fillStyle = hexOf(c); x.fillRect(4, 4, 10, h - 8);
      x.fillStyle = hexOf(c); x.font = "500 22px 'JetBrains Mono', monospace"; x.fillText(title.toUpperCase(), 32, 46);
      x.fillStyle = "#1f2a33"; x.font = `400 34px ${HAND}`; wrapText(x, body, w - 60, 38, 32, 98, 2);
    });
  }

  /* ---------------- Kit de construcción ---------------- */
  function buildRoom(i, g) {
    const s = STATIONS[i], R = ROOM_R[i];
    const A = new THREE.Group(); A.position.y = DECK; g.add(A);
    const segsL = [], spots = [];
    const glow = accent[s.c + "Glow"];
    const inM = toon(tint(s.c, 0.55));
    const roofM = M.conc.clone(); roofM.transparent = true; roofMats[i].push(roofM);
    const put = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; A.add(m); return m; };
    const B = (w, h, d, x, y, z, mat = M.conc, ry = 0) => { const m = put(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y + h / 2, z); m.rotation.y = ry; return m; };
    const wall = (x1, z1, x2, z2, h, t = 0.8, mat = M.conc, y = 0) => {
      const L = Math.hypot(x2 - x1, z2 - z1), m = B(t, h, L, (x1 + x2) / 2, y, (z1 + z2) / 2, mat, Math.atan2(x2 - x1, z2 - z1));
      if (y < 1.5) segsL.push([x1, z1, x2, z2]);
      return m;
    };
    const sector = (r0, r1, a0, a1) => {
      const sh = new THREE.Shape(), n = 48;
      for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; k ? sh.lineTo(Math.sin(a) * r1, -Math.cos(a) * r1) : sh.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1); }
      for (let k = n; k >= 0; k--) { const a = a0 + ((a1 - a0) * k) / n; sh.lineTo(Math.sin(a) * r0, -Math.cos(a) * r0); }
      return sh;
    };
    const arc = (r0, r1, a0, a1, h, mat = M.conc, y = 0, collide = true) => {
      const m = put(new THREE.Mesh(new THREE.ExtrudeGeometry(sector(r0, r1, a0, a1), { depth: h, bevelEnabled: false }).rotateX(-Math.PI / 2), mat)); m.position.y = y;
      if (collide && y < 1.5) { const r = (r0 + r1) / 2; for (let k = 0; k < 24; k++) { const a = a0 + ((a1 - a0) * k) / 24, b = a0 + ((a1 - a0) * (k + 1)) / 24; segsL.push([Math.sin(a) * r, Math.cos(a) * r, Math.sin(b) * r, Math.cos(b) * r]); } }
      return m;
    };
    const circleSolid = (x, z, r, n = 10) => { for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, b = ((k + 1) / n) * Math.PI * 2; segsL.push([x + Math.cos(a) * r, z + Math.sin(a) * r, x + Math.cos(b) * r, z + Math.sin(b) * r]); } };
    const shaft = (x, z, y0, y1, r0, r1, color, op = 0.14) => {                  // haz de luz aditivo
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, y1 - y0, 40, 1, true), new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, fog: false,
        blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor,
      }));
      m.material.userData.keepBlend = true;
      m.position.set(x, (y0 + y1) / 2, z); A.add(m); return m;
    };
    const glowBox = (w, h, d, x, y, z, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y + h / 2, z); A.add(m); return m; };
    const fx = { rot: [], spin: [], pix: null };                  // animaciones propias de la sala
    let cfg = { rIn: R - 3, zE: R - 1, hw: 3.4, ph: 8, pinY: 16, light: 0xffe2b0, lh: 14 };

    switch (s.kind) {
      case "origen": {                                          // CLAUSTRO DE MUROS: rendijas de luz y patio a cielo abierto
        wall(-13, -13, 13, -13, 12); wall(-13, -13, -13, 12, 12); wall(13, -13, 13, 12, 12);
        wall(-13, 12, -4.2, 12, 12); wall(4.2, 12, 13, 12, 12);
        B(8.4, 3.5, 0.8, 0, 8.5, 12);                          // dintel
        wall(-8.6, -13, -8.6, 4, 9, 0.6); wall(8.6, -13, 8.6, 4, 9, 0.6);
        for (const x of [-10.8, 10.8]) { const r = B(4.4, 0.6, 25, x, 12, -0.5, roofM); r.castShadow = true; }
        for (const x of [-4, 0, 4]) glowBox(0.35, 9, 0.2, x, 1.2, -12.55, 0xffd9a0);   // rendijas en el muro de fondo
        shaft(0, 0, 0, 14, 7.5, 6.5, 0xfff1d0, 0.08);
        spots.push([-8.2, -8, Math.PI / 2], [8.2, -8, -Math.PI / 2], [-8.2, -1, Math.PI / 2]);
        cfg = { rIn: 12, zE: 12.4, hw: 4.2, ph: 8.5, pinY: 17, light: 0xffcf8a, lh: 15 };
        break;
      }
      case "vivienda": {                                        // CASAS APILADAS alrededor de un patio
        const ang = [0.9, 1.9, Math.PI, 4.4, 5.4];
        ang.forEach((a, k) => {
          const r = 10.5, x = Math.sin(a) * r, z = Math.cos(a) * r, ry = a;
          const low = B(7, 5, 6, x, 0, z, M.white, ry);
          const up = B(6.4, 4, 5.4, x + Math.sin(a) * 1.6, 5, z + Math.cos(a) * 1.6, k % 2 ? M.conc : M.brick, ry + 0.25);
          const w1 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshBasicMaterial({ color: 0xffb65c })); w1.position.set(0, 0.2, -3.01); w1.rotation.y = Math.PI; low.add(w1);
          const w2 = w1.clone(); w2.position.set(1, 0.2, -2.71); up.add(w2);
          const c = Math.cos(ry), sn = Math.sin(ry), hx = 3.5, hz = 3;
          const pts = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz]].map(([u, v]) => [x + u * c + v * sn, z - u * sn + v * c]);
          for (let j = 0; j < 4; j++) segsL.push([pts[j][0], pts[j][1], pts[(j + 1) % 4][0], pts[(j + 1) % 4][1]]);
          if (k < 3) spots.push([x * 0.64, z * 0.64, a + Math.PI, true]);
        });
        cfg = { rIn: 7.2, zE: 13.5, hw: 3.4, ph: 7, pinY: 14, light: 0xffb65c, lh: 12 };
        break;
      }
      case "bio": {                                             // EL ÓCULO: un tambor de concreto y un haz de sol
        const gap = 0.42;
        arc(15.4, 16.4, gap, Math.PI * 2 - gap, 11);
        arc(15.4, 16.4, -gap, gap, 3.4, M.conc, 7.6, false);
        const sh = new THREE.Shape(); sh.absarc(0, 0, 17.2, 0, Math.PI * 2, false);
        const hole = new THREE.Path(); hole.absellipse(0, -1, 9.5, 6.2, 0, Math.PI * 2, true, 0.3); sh.holes.push(hole);
        const roof = put(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 48 }).rotateX(-Math.PI / 2), roofM)); roof.position.y = 11;
        const lin = put(new THREE.Mesh(new THREE.CylinderGeometry(15.35, 15.35, 10.8, 64, 1, true, gap, Math.PI * 2 - 2 * gap), toon(tint(s.c, 0.55), { side: THREE.BackSide })), false); lin.position.y = 5.4;
        shaft(0, 0, 0, 12, 7.2, 9.6, 0xfff3c4, 0.16);
        for (const a of [1.5, -1.5, 2.3]) spots.push([Math.sin(a) * 15, Math.cos(a) * 15, a + Math.PI]);
        cfg = { rIn: 14.5, zE: 16, hw: 6.2, ph: 7.2, pinY: 16, light: 0xfff0c0, lh: 16 };
        break;
      }
      case "fab": {                                             // LA CELOSÍA DORADA: un volumen flotante de diamantes
        wall(-13, -9, 13, -9, 18, 1.2, M.concDark);
        for (const sg of [1, -1]) { const w = B(1.4, 18, 18, sg * 13.2, 0, 0, M.concDark); w.rotation.z = sg * 0.12; segsL.push([sg * 12.6, -9, sg * 12.6, 9]); }
        const boxM = M.gold.clone(); boxM.transparent = true; roofMats[i].push(boxM);
        const bx = B(26, 8, 18, 0, 10, 0, boxM);
        const pyr = new THREE.ConeGeometry(0.62, 0.7, 4); pyr.rotateY(Math.PI / 4);
        const list = [];
        for (let a = -12.3; a <= 12.31; a += 1.25) for (let b = -8.3; b <= 8.31; b += 1.25) list.push([a, 9.64, b, Math.PI]);
        for (let a = -12.3; a <= 12.31; a += 1.25) for (let y = 10.6; y <= 17.4; y += 1.25) list.push([a, y, 9.34, Math.PI / 2, true]);
        const pm = M.gold.clone(); pm.transparent = true; roofMats[i].push(pm);
        const pz = new THREE.InstancedMesh(pyr, pm, list.length); pz.castShadow = true;
        const m4 = new THREE.Matrix4(), e = new THREE.Euler();
        list.forEach(([x, y, z, r], k) => { e.set(r, 0, 0); pz.setMatrixAt(k, m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(e), new THREE.Vector3(1, 1, 1))); });
        A.add(pz);
        for (const x of [-8, 0, 8]) shaft(x, 0, 0, 9.6, 3.6, 2.2, 0xffc34d, 0.13);
        glowBox(24, 0.15, 0.3, 0, 0.05, -8.2, 0xffc34d);
        spots.push([-8, -8.3, 0], [8, -8.3, 0], [-12.2, 1, Math.PI / 2]);
        cfg = { rIn: 12, zE: 9.5, hw: 5, ph: 8.4, pinY: 22, light: 0xffc34d, lh: 9 };
        break;
      }
      case "urbano": {                                          // GRADAS AL AGUA: un espejo de agua y un gran voladizo
        const water = put(new THREE.Mesh(new THREE.PlaneGeometry(22, 22).rotateX(-Math.PI / 2), M.water), false); water.position.y = 0.04;
        for (let k = 0; k < 4; k++) {
          const r0 = 11 + k * 1.6, h = 0.55 * (k + 1);
          B(2 * r0 + 3.2, h, 1.6, 0, 0, -r0 - 0.8);                           // gradas de fondo
          for (const sg of [1, -1]) B(1.6, h, 2 * r0 + 1.6, sg * (r0 + 0.8), 0, -0.8);
        }
        segsL.push([-11, -11, 11, -11], [-11, -11, -11, 11], [11, -11, 11, 11]);
        for (const sg of [1, -1]) wall(sg * 17.5, -10, sg * 17.5, 8, 11, 2.2, M.concDark);
        const cn = B(38, 0.9, 22, 0, 11, -1, roofM); cn.castShadow = true;
        shaft(0, 0, 0, 11, 6, 8, 0x8fe3ff, 0.1);
        spots.push([-16.3, -3, Math.PI / 2], [16.3, -3, -Math.PI / 2], [0, -13.6, 0, true, 3.4]);
        cfg = { rIn: 11, zE: 13, hw: 6, ph: 8, pinY: 16, light: 0x7fd6ff, lh: 11 };
        break;
      }
      case "software": {                                        // EL CUBO DE PÍXELES: una caja negra que parpadea
        const dk = toon(0x1a1d22);
        wall(-11, -11, 11, -11, 16, 0.8, dk); wall(-11, -11, -11, 11, 16, 0.8, dk); wall(11, -11, 11, 11, 16, 0.8, dk);
        wall(-11, 11, -1.8, 11, 16, 0.8, dk); wall(1.8, 11, 11, 11, 16, 0.8, dk); B(3.6, 5, 0.8, 0, 11, 11, dk);
        const top = B(22.8, 0.8, 22.8, 0, 16, 0, roofM);
        const pix = [];
        for (const [face, nx, nz] of [[0, 0, 1], [1, 1, 0], [2, -1, 0], [3, 0, -1]]) for (let a = -10; a <= 10; a += 1.25) for (let y = 1.2; y <= 15.2; y += 1.25) {
          if (face === 0 && Math.abs(a) < 2.4 && y < 11.5) continue;
          pix.push(nz ? [a, y, nz * 11.45, nz > 0 ? 0 : Math.PI] : [nx * 11.45, y, a, nx > 0 ? Math.PI / 2 : -Math.PI / 2]);
        }
        const pm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.85, 0.85), new THREE.MeshBasicMaterial({ color: 0xffffff }), pix.length);
        const m4 = new THREE.Matrix4(), PC = [0x37d7ff, 0xff4fd8, 0xf4f7ff, 0x1a2a3a, 0x1a2a3a].map((c) => new THREE.Color(c));
        pix.forEach(([x, y, z, ry], k) => { pm.setMatrixAt(k, m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(UPV, ry), new THREE.Vector3(1, 1, 1))); pm.setColorAt(k, PC[(Math.random() * PC.length) | 0]); });
        A.add(pm); fx.pix = { mesh: pm, colors: PC, t: 0 };
        const grid = new THREE.GridHelper(21, 21, 0x37d7ff, 0x1d6f86); grid.position.y = 0.03; A.add(grid);
        shaft(0, 0, 0, 15, 5, 3, 0x37d7ff, 0.1);
        spots.push([-10.5, -4, Math.PI / 2], [10.5, -4, -Math.PI / 2], [0, -10.5, 0]);
        cfg = { rIn: 10, zE: 11.5, hw: 1.8, ph: 11, pinY: 20, light: 0x58e1ff, lh: 13 };
        break;
      }
      case "docencia": {                                        // EL AUDITORIO: gradas en semicírculo y un pizarrón monumental
        for (let k = 0; k < 5; k++) arc(8.5 + k * 1.3, 9.8 + k * 1.3, Math.PI * 0.6, Math.PI * 1.4, 0.6 * (k + 1), M.conc, 0, k === 0);
        const board = arc(15.4, 16.2, Math.PI * 0.55, Math.PI * 1.45, 10, toon(0x2f4a3c));
        const disc = put(new THREE.Mesh(new THREE.CylinderGeometry(15.5, 15.5, 0.8, 64), roofM)); disc.position.y = 12.5;
        for (const a of [0.9, -0.9, Math.PI]) B(0.8, 12.5, 0.8, Math.sin(a) * 13.5, 0, Math.cos(a) * 13.5, M.metal);
        const gp = new THREE.GridHelper(16, 16, 0xd9f5d0, 0xd9f5d0); gp.rotation.x = Math.PI / 2; gp.position.set(0, 5.5, -15.3); gp.material.transparent = true; gp.material.opacity = 0.35; A.add(gp);
        shaft(0, 0, 0, 12, 6, 7, 0xe6ffd9, 0.09);
        spots.push([-6, -15.1, 0, false, 7.4], [6, -15.1, 0, false, 7.4], [0, -15.1, 0, false, 7.4]);
        cfg = { rIn: 8.4, zE: 14, hw: 5, ph: 8, pinY: 17, light: 0xd6ffd0, lh: 13 };
        break;
      }
      case "sostenible": {                                      // ORQUIDEORAMA: árboles-flor de madera (Jardín Botánico de Medellín)
        const wood = toon(0xc8955a, { side: THREE.DoubleSide }); wood.transparent = true; roofMats[i].push(wood);
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + Math.PI / 6, x = Math.sin(a) * 10.4, z = Math.cos(a) * 10.4;
          if (Math.cos(a) > 0.9) continue;
          const f = put(new THREE.Mesh(new THREE.CylinderGeometry(6, 0.8, 10, 6, 1, true), wood)); f.position.set(x, 7, z); f.rotation.y = Math.PI / 6;
          B(1.6, 2, 1.6, x, 0, z, M.concDark); circleSolid(x, z, 1.2, 6);
          for (let j = 0; j < 6; j++) { const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + Math.random(), 0), toon([0x4f8f3f, 0x6db34f, 0x3f7a38][j % 3])); pl.position.set(x + Math.random() * 6 - 3, 0.8, z + Math.random() * 6 - 3); put(pl); }
          for (let j = 0; j < 5; j++) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 5), toon([0xe0452f, 0xf2b233, 0xd63b8e][j % 3])); fl.position.set(x + Math.random() * 5 - 2.5, 1.6, z + Math.random() * 5 - 2.5); put(fl); }
        }
        shaft(0, 0, 0, 13, 5, 6.5, 0xd8ffb0, 0.12);
        spots.push([-5.5, -3, 1.2, true], [5.5, -3, -1.2, true], [0, -6.5, 0, true]);
        cfg = { rIn: 13.5, zE: 15, hw: 5, ph: 8, pinY: 15, light: 0xc8ff9a, lh: 13 };
        break;
      }
      case "bim": {                                             // LA TORRE: un monolito elevado sobre contrafuertes
        const tw = B(13, 30, 8, 0, 16, -2, roofM); tw.castShadow = true;
        const gl = glowBox(2.2, 28, 0.2, -3.8, 17, 2.05, 0x2d4f8a);
        for (let y = 18; y < 45; y += 1.6) glowBox(2.2, 0.08, 0.25, -3.8, y, 2.1, 0x9cc3ff);
        const legs = [[-15, 9, -6.5, 16, 2], [15, 9, 6.5, 16, 2], [-15, -11, -6.5, 16, -6], [15, -11, 6.5, 16, -6]];
        legs.forEach(([x0, z0, x1, y1, z1]) => {
          const a = new THREE.Vector3(x0, 0, z0), b = new THREE.Vector3(x1, y1, z1), L = a.distanceTo(b);
          const m = put(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, L), M.conc)); m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b);
          circleSolid(x0, z0, 1.3, 6);
        });
        wall(-10, -12, 10, -12, 14, 1, M.concDark);
        shaft(0, 0, 0, 16, 5, 3.5, 0x9cc3ff, 0.12);
        spots.push([-6, -11.4, 0], [6, -11.4, 0], [0, -11.4, 0, false, 7.5]);
        cfg = { rIn: 12, zE: 14, hw: 5, ph: 9, pinY: 49, light: 0x8fb8ff, lh: 15 };
        break;
      }
      case "red": {                                             // LA BÓVEDA DE LAS IDEAS: anillos de estrellas y una mano gigante
        const dome = put(new THREE.Mesh(new THREE.SphereGeometry(17, 56, 28, Math.PI / 2 + 0.52, Math.PI * 2 - 1.04, 0.42, Math.PI / 2 - 0.42), toon(0x3a4048, { side: THREE.DoubleSide })));
        arc(16.6, 17.4, 0.52, Math.PI * 2 - 0.52, 0.2, M.concDark, 0);
        for (let k = 0; k < 16; k++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4 + k * 0.7, 0.035, 6, 96), new THREE.MeshBasicMaterial({ color: k % 3 ? 0xbfe9ff : 0xfff3c9, transparent: true, opacity: 0.8,
            blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, depthWrite: false }));
          ring.material.userData.keepBlend = true;
          ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.12; ring.position.y = 14 + k * 0.05; A.add(ring); fx.spin.push([ring, (k % 2 ? 1 : -1) * (0.05 + k * 0.01)]);
        }
        const hand = new THREE.Group(); hand.position.set(0, 16.5, -1.5); A.add(hand);
        const stone = M.white;
        const palm = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.6, 1.4), stone); palm.position.y = -2.6; hand.add(palm);
        [-1.5, -0.5, 0.5, 1.5].forEach((x, k) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.9, 3.4 + (k === 1 || k === 2 ? 0.8 : 0), 0.95), stone); f.position.set(x, -6.4 - (k === 1 || k === 2 ? 0.4 : 0), 0.1); f.rotation.x = 0.15; hand.add(f); });
        const th = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.8, 0.95), stone); th.position.set(2.6, -3.8, 0.2); th.rotation.z = -0.6; hand.add(th);
        hand.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
        fx.rot.push(hand);
        shaft(0, 0, 0, 14, 4.5, 6, 0xbfe9ff, 0.07);
        for (const a of [1.7, -1.7, 2.5]) spots.push([Math.sin(a) * 15.6, Math.cos(a) * 15.6, a + Math.PI]);
        cfg = { rIn: 15, zE: 16.2, hw: 7.6, ph: 9, pinY: 20, light: 0x9fd8ff, lh: 13 };
        break;
      }
      case "maestria": {                                        // EL ARCO DEL SOL: la marca BIOBIM a escala monumental
        const k = 1.2, bz = (px, py) => new THREE.Vector3((px - 16) * k, (25 - py) * k * 1.6, -6);
        const arcC = new THREE.CubicBezierCurve3(bz(2.5, 25), bz(8, 16.5), bz(24, 16.5), bz(29.5, 25));
        put(new THREE.Mesh(new THREE.TubeGeometry(arcC, 80, 1.5, 16, false), M.white));
        for (const x of [-16.2, 16.2]) circleSolid(x, -6, 1.8, 8);
        const sunDisk = new THREE.Mesh(new THREE.CircleGeometry(10.5, 64), new THREE.MeshBasicMaterial({ color: 0xffb547 }));
        sunDisk.position.set(0, 4.5, -11); A.add(sunDisk); fx.sun = sunDisk;
        B(44, 5.2, 2.4, 0, 0, -9.6, M.concDark);                                 // horizonte que corta el sol
        segsL.push([-22, -9.6, 22, -9.6]);
        arc(15.6, 16.4, Math.PI * 0.62, Math.PI * 1.38, 1.2, M.conc, 0);
        shaft(0, -4, 0, 15, 8, 10, 0xffd08a, 0.07);
        spots.push([-9, 3, 0.9, true], [9, 3, -0.9, true], [-12, -4, 1.3, true]);
        cfg = { rIn: 14, zE: 16, hw: 7, ph: 7, pinY: 20, light: 0xffb070, lh: 14 };
        break;
      }
      case "edu": {                                             // LAS ROCAS NEGRAS (homenaje al Parque Biblioteca España)
        const rockM = toon(0x2b2e34);
        [[2.5, 12, 9, 13, 8], [3.8, 11, 10, 15, 9], [5.2, 12.5, 8, 11, 8]].forEach(([a, r, sx, sy, sz], k) => {
          const x = Math.sin(a) * r, z = Math.cos(a) * r;
          const rk = put(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), rockM)); rk.scale.set(sx / 2, sy / 2, sz / 2); rk.position.set(x, sy / 2 - 1, z); rk.rotation.set(0.15 * (k - 1), a, 0.18 * (k % 2 ? 1 : -1));
          for (let j = 0; j < 4; j++) { const sl = glowBox(0.25, 2.4, 0.1, 0, 0, 0, 0xffd36b); sl.position.set(x + Math.cos(a) * (j - 1.5) * 1.3 - Math.sin(a) * sx * 0.42, 3 + j * 1.6, z + Math.sin(a) * (j - 1.5) * 1.3 * -1 - Math.cos(a) * sz * 0.42); sl.rotation.y = a; }
          circleSolid(x, z, Math.min(sx, sz) * 0.45, 10);
        });
        shaft(0, 0, 0, 13, 5.5, 7, 0xfff0b0, 0.09);
        spots.push([-5.5, 2, 1.1, true], [5.5, 2, -1.1, true], [0, -5.5, 0, true]);
        cfg = { rIn: 11, zE: 15, hw: 6, ph: 7, pinY: 18, light: 0xffd36b, lh: 13 };
        break;
      }
      case "doctorado": {                                       // EL FARO: una torre blanca sobre las rocas, con un haz que gira
        const rockM = toon(0x8d9096);
        for (let k = 0; k < 9; k++) { const rk = put(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), rockM)); const a = (k / 9) * Math.PI * 2; rk.scale.set(2.4 + Math.random() * 1.6, 1.6 + Math.random() * 2.2, 2.4 + Math.random() * 1.6); rk.position.set(Math.sin(a) * 3.4, 1.2, -9 + Math.cos(a) * 3.4); rk.rotation.set(Math.random(), Math.random(), 0); }
        circleSolid(0, -9, 5.6, 10);
        const tw = put(new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.6, 22, 24), M.white)); tw.position.set(0, 14, -9);
        for (let y = 7; y < 23; y += 4.5) glowBox(0.7, 1.2, 0.2, 0, y, -5.35 + (y - 7) * 0.02, 0xffe7a8);
        const lant = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 3, 16), new THREE.MeshBasicMaterial({ color: 0xfff4c8 })); lant.position.set(0, 26.5, -9); A.add(lant);
        const cap = put(new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.6, 16), M.concDark)); cap.position.set(0, 29.3, -9);
        B(8, 0.5, 8, 0, 25, -9, M.metal);
        const beam = new THREE.Group(); beam.position.set(0, 26.5, -9); A.add(beam);
        const bm = shaft(0, 0, 0, 40, 0.8, 7, 0xfff4c8, 0.12); A.remove(bm); bm.rotation.z = Math.PI / 2; bm.position.set(20, 0, 0); beam.add(bm);
        fx.beam = beam;
        arc(13.4, 14.2, 0.55, Math.PI * 2 - 0.55, 1.2, M.conc, 0);
        spots.push([-7.5, 3, 1.0, true], [7.5, 3, -1.0, true], [-9.5, -3, 1.4, true]);
        cfg = { rIn: 12, zE: 14, hw: 6, ph: 6, pinY: 33, light: 0xeaf4ff, lh: 13 };
        break;
      }
    }

    // Portal de entrada con la pregunta
    const { zE, hw, ph } = cfg;
    for (const sg of [1, -1]) put(new THREE.Mesh(new THREE.BoxGeometry(0.5, ph, 0.7), glow)).position.set(sg * hw, ph / 2, zE + 0.4);
    put(new THREE.Mesh(new THREE.BoxGeometry(2 * hw + 0.5, 0.5, 0.7), glow)).position.set(0, ph + 0.25, zE + 0.4);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 2), new THREE.MeshBasicMaterial({ map: roomSign(i), transparent: true }));
    sign.position.set(0, ph + 1.6, zE + 0.8); A.add(sign);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(2 * hw - 0.4, 1.4), glow); mat.rotation.x = -Math.PI / 2; mat.position.set(0, 0.03, zE); A.add(mat);
    // Número monumental en el piso, al entrar
    const big = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ map: labelTex(512, 256, (x, w, h) => { x.textAlign = "center"; x.fillStyle = hexOf(s.c); x.font = `400 200px ${HAND}`; x.fillText(nn(i), w / 2, 200); }), transparent: true, depthWrite: false }));
    big.rotation.x = -Math.PI / 2; big.position.set(0, 0.04, zE - 3.2); A.add(big);
    // Pedestal de la pieza
    const pl = put(new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.6, EXH_Y, 48), M.white)); pl.position.y = EXH_Y / 2;
    const plRing = new THREE.Mesh(new THREE.RingGeometry(4.65, 4.85, 64).rotateX(-Math.PI / 2), glow); plRing.position.y = 0.05; A.add(plRing);
    // Paneles de sala
    spots.slice(0, 3).forEach(([x, z, ry, free, yy], k) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.8), new THREE.MeshBasicMaterial({ map: panelTex(i, k), side: THREE.DoubleSide }));
      p.userData.panel = { i, k }; panelMeshes.push(p);
      p.position.set(x + Math.sin(ry) * 0.5, yy || (free ? 3.1 : 2.6), z + Math.cos(ry) * 0.5); p.rotation.y = ry; A.add(p);
      if (free) for (const sg of [1, -1]) { const lg = put(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.1), M.metal)); lg.position.set(p.position.x + Math.cos(ry) * sg * 1.4, 0.6, p.position.z - Math.sin(ry) * sg * 1.4); }
    });
    // Anotaciones alrededor de la pieza, con línea guía
    const notes = [["Representación", s.tech], ["Herramientas", s.tools.join(" · ")], [s.items.length ? "Proyecto" : "Pregunta", s.items[0] || PREG[s.kind]]];
    const lineM = new THREE.LineBasicMaterial({ color: new THREE.Color(hexOf(s.c)) });
    notes.forEach(([tt, body], k) => {
      const a = [-0.9, 0.9, 0.05][k], r = 7.2, x = Math.sin(a) * r, z = Math.cos(a) * r * 0.6, y = 5.2 + k * 0.9;
      const n = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.34), new THREE.MeshBasicMaterial({ map: noteTex(tt, body, s.c), transparent: true, side: THREE.DoubleSide }));
      n.position.set(x, y, z); n.rotation.y = a * 0.5; A.add(n);
      A.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y - 0.7, z), new THREE.Vector3(x * 0.35, EXH_Y + 2.2, z * 0.35)]), lineM));
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), glow); dot.position.set(x * 0.35, EXH_Y + 2.2, z * 0.35); A.add(dot);
    });
    ROOM[i] = cfg;
    roomFx[i] = fx;
    return segsL;
  }

  const hitMatR = new THREE.MeshBasicMaterial({ visible: false });
  STATIONS.forEach((s, i) => {
    const u = US[i], tan = curve.getTangentAt(u), dir = DIR[i], R = ROOM_R[i];
    const g = new THREE.Group();
    g.position.copy(S[i]);
    g.rotation.y = Math.atan2(-dir.x, -dir.z);                   // la entrada mira hacia la pasarela
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(R + 1, R + 0.4, DECK + 1.2, 72), M.conc);
    ped.position.y = (DECK - 1.2) / 2 - 0.008; ped.receiveShadow = true; g.add(ped); walkables.push(ped);
    const rm = accent[s.c + "Glow"].clone(); rm.transparent = true; rm.opacity = 0.5;
    const ring = new THREE.Mesh(new THREE.RingGeometry(R + 0.55, R + 0.85, 96).rotateX(-Math.PI / 2), rm);
    ring.position.y = DECK + 0.025; g.add(ring);
    const segsL = buildRoom(i, g);
    const inner = new THREE.Group(); inner.position.set(0, DECK + EXH_Y, 0); inner.scale.setScalar(EXH_S); g.add(inner);
    const ex = BUILD[s.kind](inner, { mat: accent[s.c], line: accent[s.c + "Line"] });
    ex.set(ex.value);
    ex.bucket = ex.steps ? Math.min(ex.steps - 1, Math.floor(ex.value * ex.steps)) : null;
    EX.push(ex);
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(R + 1, R + 1, 32, 16).translate(0, 16, 0), hitMatR); hit.userData.i = i; g.add(hit); hits.push(hit);
    g.userData = { ring };
    scene.add(g);
    stations.push(g);
    g.updateMatrixWorld(true);
    const w = (x, z) => new THREE.Vector3(x, 0, z).applyMatrix4(g.matrixWorld);
    for (const [x1, z1, x2, z2] of segsL) { const a = w(x1, z1), b = w(x2, z2); solids.push([a.x, a.z, b.x, b.z, i]); }
    const pc = w(0, 0); pc.r = 4.9; plinths.push(pc);
    // Ramal: de la pasarela al portal de la estancia
    const a = GATE[i].clone().addScaledVector(dir, HW - 0.4), b = S[i].clone().addScaledVector(dir, -(R + 0.6));
    const len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5);
    const br = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.8, len + 1.2), M.deck);
    br.position.set(mid.x, DECK - 0.415, mid.z); br.rotation.y = Math.atan2(dir.x, dir.z); br.receiveShadow = true; br.castShadow = true;
    for (const sg of [1, -1]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, len + 1), accent[s.c + "Glow"]); e.position.set(sg * 2.1, 0.42, 0); br.add(e);
      const rl = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, len - 1), M.metal); rl.position.set(sg * 2.12, 1.45, 0); br.add(rl);
      for (let t = -len / 2 + 1; t <= len / 2 - 1; t += 2.4) { const po = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.05, 0.07), M.metal); po.position.set(sg * 2.12, 0.92, t); br.add(po); }
    }
    for (let t = -len / 2 + 2; t <= len / 2 - 2; t += 7) {
      const pw = new THREE.Vector3(mid.x + dir.x * t, 0, mid.z + dir.z * t), g0 = heightAt(pw.x, pw.z);
      const pi = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, DECK - 0.8 - g0, 10), M.conc); pi.position.set(pw.x, g0 + (DECK - 0.8 - g0) / 2, pw.z); pi.castShadow = true; scene.add(pi);
    }
    scene.add(br); walkables.push(br);
    // Portal del año sobre la pasarela: número y pregunta, sin revelar la etapa
    gates.push(makeGate(GATE[i], tan, s.c, 1, signLabel(`${s.y} · Estancia ${nn(i)} ${SIDE[i] > 0 ? "→" : "←"}`, PREG[s.kind], s.c), floorLabel(yearOf(s), `ESTANCIA ${nn(i)}`, s.c)));
  });
  // Portal de entrada y mirador final
  makeGate(START.clone().addScaledVector(t0, 4.5), t0, "light", 1.25, signLabel("2012 → hoy · 13 salas", "El territorio de las preguntas", "sun"), floorLabel("2012", "EMPIEZA EL RECORRIDO", "sun"));
  { const g = new THREE.Group(); g.position.set(END.x, DECK + 0.03, END.z); g.rotation.y = Math.atan2(t1.x, t1.z); g.add(flatPlane(9, 3.7, floorLabel("2026 →", "CONTINUARÁ", "flow"))); scene.add(g); }
  document.fonts?.ready?.then(() => labelJobs.forEach((j) => j()));
  new MutationObserver(() => labelJobs.forEach((j) => j())).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------------- Hitos: premios, ponencias y formación que se descubren al pasar ---------------- */
  const hitos = [], gems = [];
  {
    const byInt = {};
    HITOS.forEach((h) => { let k = 0; while (k < N - 2 && h.y >= YS[k + 1]) k++; (byInt[k] = byInt[k] || []).push(h); });
    const gemGeo = new THREE.OctahedronGeometry(0.34), beamGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.15, 6);
    let alt = 1;
    Object.entries(byInt).forEach(([k, list]) => {
      k = +k;
      list.forEach((h, j) => {
        const u = US[k] + ((j + 1) / (list.length + 1)) * (US[k + 1] - US[k]);
        const p = curve.getPointAt(u), sd = sideAt(u);
        alt = -alt;
        const c = col(HITO_C[h.k]);
        const g = new THREE.Group(); g.position.set(p.x + sd.x * alt * 1.7, DECK, p.z + sd.z * alt * 1.7);
        const gm = new THREE.Mesh(gemGeo, toon(c, { emissive: c, emissiveIntensity: 0.45, transparent: true }));
        gm.position.y = 1.4; gm.castShadow = true; g.add(gm);
        const bm = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 })); bm.position.y = 0.6; g.add(bm);
        const rg = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.5, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.7 })); rg.position.y = 0.03; g.add(rg);
        gm.userData.h = hitos.length;
        g.userData = { h, u, gm, bm, rg, got: false, anim: 0 };
        scene.add(g); hitos.push(g); gems.push(gm);
      });
    });
  }

  /* ==================================================================
     PERSONAJE
     ================================================================== */
  let look = { ...DAVID };
  // v4: personaje modelado nuevo; los looks guardados antes vuelven al predeterminado
  try { const saved = JSON.parse(localStorage.getItem("biobim-avatar") || "null"); if (saved && saved.v === 4) look = { ...DAVID, ...saved }; } catch (e) { /* sin almacenamiento */ }
  const avatar = createAvatar(THREE, look, { bend: bendU, bendC, maskAlpha: 0.38 });
  scene.add(avatar.root);
  const av = { pos: START.clone().addScaledVector(t0, 1.5).setY(DECK), heading: Math.atan2(t0.x, t0.z), spd: 0, u: 0, maxU: 0, vy: 0, air: false, jump: false };
  const segDist = (px, pz, a, b) => {
    const vx = b.x - a.x, vz = b.z - a.z, L2 = vx * vx + vz * vz;
    const k = clamp(((px - a.x) * vx + (pz - a.z) * vz) / L2);
    return Math.hypot(px - (a.x + vx * k), pz - (a.z + vz * k));
  };
  function groundY(x, z) {
    if (distToPath(x, z) <= HW + 0.15) return DECK;
    for (let i = 0; i < N; i++) {
      if (Math.hypot(S[i].x - x, S[i].z - z) <= ROOM_R[i] + 1.1) return DECK;
      if (segDist(x, z, GATE[i], S[i]) <= 2.2) return DECK;
    }
    if (Math.hypot(START.x - x, START.z - z) <= 11 || Math.hypot(END.x - x, END.z - z) <= 13) return DECK;
    return heightAt(x, z);
  }
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

  /* ==================================================================
     CÁMARA · órbita libre + vuelos suaves
     ================================================================== */
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.07, minDistance: 7, maxDistance: 620,
    maxPolarAngle: 1.36, screenSpacePanning: false, rotateSpeed: 0.6, zoomSpeed: 0.9, panSpeed: 0.9,
    autoRotate: true, autoRotateSpeed: 0.35,
  });
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  const HOME = { pos: new THREE.Vector3(-40, 300, 250), tgt: new THREE.Vector3(0, 0, -10) };
  camera.position.copy(HOME.pos); controls.target.copy(HOME.tgt);

  let tween = null;
  function flyTo(pos, tgt, dur = 1.8) {
    const from = { pos: camera.position.clone(), tgt: controls.target.clone() };
    const lift = Math.min(28, from.tgt.distanceTo(tgt) * 0.18);
    tween = { from, pos: pos.clone(), tgt: tgt.clone(), t0: performance.now(), dur, lift };
    controls.enabled = false; controls.autoRotate = false;
    if (from.pos.distanceTo(pos) > 12) Sound.whoosh(dur * 0.9);
  }
  function stationView(i) {
    const tan = curve.getTangentAt(US[i]), dir = DIR[i];
    const narrow = W <= 860, dist = narrow ? (W < 500 ? 1.7 : 1.4) : 1;
    const tgt = S[i].clone().setY(DECK + 6);
    const pos = S[i].clone().addScaledVector(dir, -(ROOM_R[i] + 16) * dist).addScaledVector(tan, -12 * dist).setY(DECK + 16 * dist);
    return { pos, tgt };
  }
  function walkTo(x, z) {
    const off = camera.position.clone().sub(controls.target);
    const tgt = new THREE.Vector3(x, 0, z);
    flyTo(tgt.clone().add(off), tgt, 1.4);
  }

  /* ==================================================================
     INTERFAZ
     ================================================================== */
  const card = $("#trCard"), pinsEl = $("#trPins"), years = $("#trYears"), map = $("#trMap");
  const startEl = $("#trStart"), sunEl = $("#trSun"), hitosEl = $("#trHitos");
  const tourBtn = $("#trTour"), soundBtn = $("#trSound"), modeBtn = $("#trMode");
  const creatorEl = $("#trCreator"), stickEl = $("#trStick"), jumpEl = $("#trJump");
  jumpEl.addEventListener("pointerdown", (e) => { e.preventDefault(); av.jump = true; });
  const toast = document.createElement("p"); toast.className = "tr-toast"; toast.setAttribute("role", "status"); document.body.appendChild(toast);
  let toastT = 0;
  function say(msg, ms = 5200) { toast.innerHTML = msg; toast.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("is-on"), ms); }
  let mode = "orbit";                                          // "orbit" · "walk" · "create"

  // Etiquetas
  pinsEl.innerHTML = STATIONS.map((s, i) => `<button class="tr-pin" data-i="${i}" style="--c:var(--${s.c})" aria-label="Estancia ${nn(i)}, ${s.y}: ${PREG[s.kind]}"><span class="mono">Estancia ${nn(i)} · ${s.y}</span><b class="tr-pin-q">${PREG[s.kind]}</b><b class="tr-pin-t">${s.t}</b><em>${s.tech}</em></button>`).join("");
  const pins = [...pinsEl.querySelectorAll(".tr-pin")];
  pinsEl.addEventListener("click", (e) => { const b = e.target.closest(".tr-pin"); if (b) { stopTours(); goStation(+b.dataset.i); } });
  pins.forEach((p, i) => { p.addEventListener("pointerenter", () => setHover(i)); p.addEventListener("pointerleave", () => setHover(-1)); });

  // Línea de tiempo
  years.innerHTML = STATIONS.map((s, i) => `<li><button data-i="${i}" style="--c:var(--${s.c})" title="${s.t}"><span class="mono">${s.y.replace(" – hoy", "→")}</span><b>${s.t}</b></button></li>`).join("");
  const yearBtns = [...years.querySelectorAll("button")];
  years.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { stopTours(); goStation(+b.dataset.i); } });
  $("#trPrev").addEventListener("click", () => { stopTours(); goStation(active <= 0 ? N - 1 : active - 1); });
  $("#trNext").addEventListener("click", () => { stopTours(); goStation(active < 0 || active >= N - 1 ? 0 : active + 1); });

  // Minimapa (planta)
  const mapPts = curve.getPoints(160).map((p) => `${p.x.toFixed(1)},${p.z.toFixed(1)}`).join(" ");
  map.innerHTML = `<svg viewBox="-280 -115 560 230" role="img" aria-label="Planta del territorio. Clic para ir a un punto.">
      <rect x="-280" y="-115" width="560" height="230" rx="18" class="m-bg"/>
      <polyline points="${mapPts}" class="m-path"/>
      ${S.map((p, i) => `<line x1="${GATE[i].x.toFixed(1)}" y1="${GATE[i].z.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.z.toFixed(1)}" class="m-br"/><circle cx="${p.x.toFixed(1)}" cy="${p.z.toFixed(1)}" r="9" class="m-st" data-i="${i}" style="--c:var(--${STATIONS[i].c})"/>`).join("")}
      <g id="trMapCam"><path d="M0 0 L-22 -52 L22 -52 Z" class="m-cone"/><circle r="6" class="m-eye"/></g>
      <circle id="trMapAv" r="7" class="m-av"/>
    </svg><span class="m-lbl mono">Planta · N↑</span>`;
  const mapSvg = map.querySelector("svg"), mapCam = map.querySelector("#trMapCam"), mapAv = map.querySelector("#trMapAv"), mapSt = [...map.querySelectorAll(".m-st")];
  mapSvg.addEventListener("click", (e) => {
    const pt = mapSvg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(mapSvg.getScreenCTM().inverse());
    stopTours();
    let best = -1, bd = 24;
    S.forEach((p, i) => { const d = Math.hypot(p.x - q.x, p.z - q.y); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) goStation(best);
    else if (mode === "walk") walkQueue([{ type: "goto", p: new THREE.Vector3(q.x, 0, q.y) }]);
    else { closeCard(); walkTo(clamp(q.x, -300, 300), clamp(q.y, -120, 120)); }
  });

  // Ficha de sala (minimizable), rótulo de entrada y control de la pieza
  let exPlaying = false, cur = null, focusTgt = null, titleT = 0;
  const pieceEl = $("#trPiece"), salaTitle = $("#trSalaTitle");
  let cardFull = false;
  try { cardFull = localStorage.getItem("biobim-ficha") === "full"; } catch (e) { /* sin almacenamiento */ }
  const ICON_PLAY = '<svg viewBox="0 0 24 24" class="i-play"><path d="M8 5v14l11-7z"/></svg><svg viewBox="0 0 24 24" class="i-pause"><path d="M8 5v14M16 5v14"/></svg>';
  function setFull(v) {
    cardFull = v;
    card.dataset.state = v ? "full" : "min";
    const tg = $(".tr-cb-tg", card);
    if (tg) { tg.setAttribute("aria-expanded", String(v)); tg.querySelector("span").textContent = v ? "Ocultar ficha" : "Ver ficha"; }
    try { localStorage.setItem("biobim-ficha", v ? "full" : "min"); } catch (e) { /* */ }
  }
  function showCard(i) {
    const s = STATIONS[i], ex = EX[i], n = nn(i);
    for (const el of [card, pieceEl, salaTitle]) el.style.setProperty("--c", `var(--${s.c})`);
    card.innerHTML = `
      <header class="tr-cb">
        <span class="tr-cb-n">${n}</span>
        <div class="tr-cb-t"><span class="mono">Estancia ${n} · ${s.y}</span><b>${s.t}</b></div>
        <button class="tr-cb-tg" aria-expanded="${cardFull}" aria-controls="trCardBody" title="Ficha de sala (I)"><span>${cardFull ? "Ocultar ficha" : "Ver ficha"}</span><i aria-hidden="true"></i></button>
        <button class="tr-close" aria-label="Cerrar (Esc)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </header>
      <div class="tr-cbody" id="trCardBody"><div class="tr-cbody-in">
        <p class="tr-sala-q"><span class="mono">${ARQ[s.kind]}</span>${PREG[s.kind]}</p>
        <dl class="tr-ficha">
          <div><dt class="mono">Periodo</dt><dd>${s.y}</dd></div>
          ${s.org ? `<div><dt class="mono">Institución</dt><dd>${s.org}</dd></div>` : ""}
          ${s.role ? `<div><dt class="mono">Rol</dt><dd>${s.role}</dd></div>` : ""}
          <div><dt class="mono">Técnica</dt><dd>${s.tech}</dd></div>
          <div><dt class="mono">Herramientas</dt><dd>${s.tools.join(" · ")}</dd></div>
        </dl>
        <p class="tr-sala-text">${s.text}</p>
        ${s.items.length ? `<h3 class="tr-h mono">Obras en sala · ${s.items.length}</h3><ol class="tr-obras">${s.items.map((x, k) => `<li><span class="mono">${String(k + 1).padStart(2, "0")}</span>${x}</li>`).join("")}</ol>` : ""}
        <h3 class="tr-h mono">Sobre la pieza</h3>
        <p class="tr-ex-note">${s.ex}</p>
      </div></div>`;
    card.dataset.state = cardFull ? "full" : "min";
    card.hidden = false;
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap", "is-open");
    $(".tr-cb-tg", card).addEventListener("click", () => setFull(!cardFull));
    $(".tr-close", card).addEventListener("click", () => { stopTours(); closeCard(); });
    // Control de la pieza: siempre a mano, aunque la ficha esté minimizada
    pieceEl.innerHTML = `
      <button class="tr-ex-play" aria-pressed="false" aria-label="Animar la pieza (P)">${ICON_PLAY}</button>
      <div class="tr-pc-l"><span class="mono">La pieza · ${s.tech}</span><b>${ex.label}</b></div>
      <input class="tr-range" type="range" min="0" max="1000" step="1" aria-label="${ex.label}" />
      <output class="mono"></output>`;
    pieceEl.hidden = false; void pieceEl.offsetWidth; pieceEl.classList.add("is-open");
    document.body.classList.add("has-piece");
    cur = { range: $(".tr-range", pieceEl), out: $("output", pieceEl), play: $(".tr-ex-play", pieceEl) };
    cur.range.value = String(Math.round(ex.value * 1000));
    cur.out.textContent = ex.fmt(ex.value);
    cur.range.style.setProperty("--p", `${ex.value * 100}%`);
    cur.range.addEventListener("input", () => { setPlaying(false); applyEx(i, cur.range.value / 1000, true); });
    cur.play.addEventListener("click", () => setPlaying(!exPlaying));
    // Rótulo de sala: título grande al entrar, luego se desvanece
    salaTitle.innerHTML = `<span class="mono">Estancia ${n} · ${s.y}</span><b>${s.t}</b><em>${ARQ[s.kind]}</em>`;
    salaTitle.classList.remove("is-on"); void salaTitle.offsetWidth; salaTitle.classList.add("is-on");
    clearTimeout(titleT); titleT = setTimeout(() => salaTitle.classList.remove("is-on"), 3600);
    yearBtns.forEach((b, k) => b.classList.toggle("is-on", k === i));
    yearBtns[i].scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }
  function setPlaying(v) {
    exPlaying = v;
    if (cur) cur.play.setAttribute("aria-pressed", String(v));
    if (v && active >= 0) { const ex = EX[active]; ex.phase = ex.loop ? ex.value : Math.acos(clamp(1 - 2 * ex.value, -1, 1)) / (Math.PI * 2); }
  }
  function applyEx(i, v, manual) {
    const ex = EX[i];
    ex.value = v; ex.set(v);
    if (i === active && cur) {
      cur.out.textContent = ex.fmt(v);
      cur.range.style.setProperty("--p", `${v * 100}%`);
      if (!manual) cur.range.value = String(Math.round(v * 1000));
    }
    if (ex.steps) {
      const b = Math.min(ex.steps - 1, Math.floor(v * ex.steps));
      if (b !== ex.bucket) { const prev = ex.bucket; ex.bucket = b; ex.onStep ? ex.onStep(b, prev) : Sound.step(b); }
    }
    if (manual) Sound.slide(v);
  }
  // Abrir una estación sin mover la cámara (al llegar caminando)
  function markVisited(i) {
    if (visited.has(i)) return;
    visited.add(i); syncHitos();
    pins[i].classList.add("is-visited");
    mapSt[i].classList.add("is-visited");
  }
  function openStation(i, { autoplay = true } = {}) {
    markVisited(i);
    if (i === active && card.classList.contains("is-open")) return;
    active = i; focusTgt = null;
    showCard(i);
    setPlaying(false);
    gates[i].userData.flash = 1;
    avatar.wave();
    setTimeout(() => { if (active === i) { Sound.chime(i); if (autoplay) setPlaying(true); } }, 350);
  }
  // Vista libre: volar hasta la estación
  function focus(i, { autoplay = true } = {}) {
    markVisited(i);
    if (i === active && card.classList.contains("is-open")) return;
    active = i;
    const v = stationView(i);
    focusTgt = v.tgt;
    flyTo(v.pos, v.tgt, 1.9);
    showCard(i);
    setPlaying(false);
    setTimeout(() => { if (active === i) { Sound.chime(i); if (autoplay) setPlaying(true); } }, 1500);
    if (tour) tourNext = performance.now() + 1900 + 8000;
  }
  function closeCard() {
    if (active < 0) return;
    active = -1; focusTgt = null; setPlaying(false);
    card.classList.remove("is-open"); pieceEl.classList.remove("is-open"); salaTitle.classList.remove("is-on");
    document.body.classList.remove("has-piece");
    setTimeout(() => { if (active < 0) { card.hidden = true; pieceEl.hidden = true; } }, 350);
    yearBtns.forEach((b) => b.classList.remove("is-on"));
  }
  // Ir a una estación según el modo: volando (vista libre) o caminando (personaje)
  function goStation(i) {
    if (mode === "walk") walkToStation(i);
    else focus(i);
  }

  /* ---------------- Movimiento del personaje: cola de acciones ---------------- */
  const Q = [];
  let holdFrame = false;
  function walkQueue(list) { Q.length = 0; holdFrame = false; Q.push(...list); }
  function toPathFirst() {
    const list = [];
    const n = nearestOnPath(av.pos.x, av.pos.z);
    if (n.d > HW + 0.3) {
      // si está en una estación, vuelve por su ramal; si no, directo a la pasarela
      let j = -1; for (let i = 0; i < N; i++) if (Math.hypot(S[i].x - av.pos.x, S[i].z - av.pos.z) < ROOM_R[i] + 2 || segDist(av.pos.x, av.pos.z, GATE[i], S[i]) < 2.5) j = i;
      list.push({ type: "goto", p: j >= 0 ? GATE[j].clone() : curve.getPointAt(n.u) });
    }
    return list;
  }
  function walkToStation(i) {
    stopTours();
    walkQueue([...toPathFirst(), { type: "path", u: US[i], sp: 8 }, { type: "goto", p: S[i].clone().addScaledVector(DIR[i], -(ROOM[i].rIn - 3)), sp: 6 }, { type: "face", dir: DIR[i] }]);
  }

  // Recorridos guiados: en vista libre vuela la cámara; caminando, el personaje recorre la pasarela
  let tour = false, tourNext = 0, walkTour = false;
  function syncTourBtn() {
    const on = tour || walkTour;
    tourBtn.setAttribute("aria-pressed", String(on));
    tourBtn.querySelector("span").textContent = on ? "Pausar recorrido" : "Recorrido guiado";
  }
  function startTour() {
    if (mode === "walk") return startWalkTour();
    tour = true; syncTourBtn();
    focus(active >= 0 && active < N - 1 ? active : 0);
    say("Recorrido guiado · toca la escena para tomar el control");
  }
  function startWalkTour() {
    walkTour = true; syncTourBtn();
    closeCard();
    const n = nearestOnPath(av.pos.x, av.pos.z);
    let i0 = US.findIndex((u) => u > n.u - 0.004); if (i0 < 0) i0 = 0;
    const list = toPathFirst();
    for (let i = i0; i < N; i++) {
      list.push({ type: "path", u: US[i], sp: 6 });
      list.push({ type: "goto", p: S[i].clone().addScaledVector(DIR[i], -(ROOM[i].rIn - 3)), sp: 5.5 });
      list.push({ type: "face", dir: DIR[i] });
      list.push({ type: "call", fn: () => tourStop(i) });
      list.push({ type: "wait", s: 8.5 });
      list.push({ type: "call", fn: () => closeCard() });
      list.push({ type: "goto", p: GATE[i].clone(), sp: 5 });
    }
    list.push({ type: "path", u: 1, sp: 6 });
    list.push({ type: "call", fn: () => { walkTour = false; syncTourBtn(); avatar.wave(3); say("Fin del recorrido · sigue explorando libremente"); } });
    walkQueue(list);
    say("Recorrido a pie · toca la escena o muévete para tomar el control");
  }
  function tourStop(i) { openStation(i); }
  function stopTours() {
    if (tour || walkTour) { tour = false; if (walkTour) { walkTour = false; Q.length = 0; holdFrame = false; } syncTourBtn(); }
  }
  tourBtn.addEventListener("click", () => ((tour || walkTour) ? stopTours() : startTour()));
  $("#trHome").addEventListener("click", () => { stopTours(); closeCard(); setMode("orbit", false); flyTo(HOME.pos, HOME.tgt, 2); });
  function syncSound() { soundBtn.setAttribute("aria-pressed", String(Sound.on)); soundBtn.classList.toggle("is-off", !Sound.on); }
  soundBtn.addEventListener("click", () => { Sound.toggle(); syncSound(); });
  syncSound();

  /* ---------------- Modos: vista libre, caminar y creación del personaje ---------------- */
  function setMode(m, fly = true) {
    mode = m;
    document.body.dataset.mode = m;
    modeBtn.setAttribute("aria-pressed", String(m === "walk"));
    modeBtn.querySelector("span").textContent = m === "walk" ? "Vista libre" : "Caminar";
    stickEl.hidden = m !== "walk" || !COARSE;
    jumpEl.hidden = m !== "walk" || !COARSE;
    if (m === "walk") {
      Object.assign(controls, { minDistance: 2.6, maxDistance: 26, maxPolarAngle: 1.55, enablePan: false, autoRotate: false });
      if (fly) {
        const f = new THREE.Vector3(Math.sin(av.heading), 0, Math.cos(av.heading));
        flyTo(av.pos.clone().addScaledVector(f, -5.4).setY(av.pos.y + 2.9), av.pos.clone().setY(av.pos.y + 1.7), 1.4);
      }
    } else if (m === "orbit") {
      Q.length = 0; walkTour = false; syncTourBtn();
      Object.assign(controls, { minDistance: 7, maxDistance: 620, maxPolarAngle: 1.4, enablePan: true });
      if (fly) flyTo(av.pos.clone().add(new THREE.Vector3(-26, 34, 40)), av.pos.clone(), 1.6);
    }
    controls.enabled = m !== "create" && !tween;
  }
  modeBtn.addEventListener("click", () => {
    stopTours();
    if (mode === "walk") setMode("orbit");
    else { closeCard(); setMode("walk"); say(COARSE ? "Usa el <b>joystick</b> o toca el suelo para ir · <b>Saltar</b> a la derecha" : "<b>W</b> avanza · <b>A</b> / <b>D</b> gira · <b>Shift</b> corre · <b>Espacio</b> salta · o toca el suelo para ir", 6000); }
  });

  // Creador del personaje
  const ROWS = [
    ["Piel", "piel", "sw", OPCIONES.piel], ["Ojos", "ojos", "sw", OPCIONES.ojos], ["Peinado", "peinado", "seg", OPCIONES.peinado],
    ["Color de pelo", "pelo", "sw", OPCIONES.pelo], ["Barba", "barba", "bool"], ["Gafas", "gafas", "bool"],
    ["Prenda", "prenda", "seg", OPCIONES.prenda], ["Color de la prenda", "ropa", "sw", OPCIONES.ropa], ["Pierna", "pierna", "seg", OPCIONES.pierna], ["Color del pantalón", "pantalon", "sw", OPCIONES.pantalon], ["Tenis", "zapatos", "sw", OPCIONES.zapatos], ["Accesorio", "accesorio", "seg", OPCIONES.accesorio],
  ];
  const rowsEl = $("#trCrRows");
  function renderCreator() {
    rowsEl.innerHTML = ROWS.map(([lbl, k, type, opts]) => {
      let inner = "";
      if (type === "sw") inner = opts.map((c, j) => `<button class="tr-sw" style="--sw:${c}" data-k="${k}" data-v="${c}" aria-label="${lbl} ${j + 1}" aria-pressed="${look[k] === c}"></button>`).join("");
      else if (type === "seg") inner = opts.map(([v, t]) => `<button class="tr-seg" data-k="${k}" data-v="${v}" aria-pressed="${look[k] === v}">${t}</button>`).join("");
      else inner = [[true, "Sí"], [false, "No"]].map(([v, t]) => `<button class="tr-seg" data-k="${k}" data-v="${v}" aria-pressed="${look[k] === v}">${t}</button>`).join("");
      return `<div class="tr-cr-row"><p class="mono">${lbl}</p><div class="tr-cr-opts" role="group" aria-label="${lbl}">${inner}</div></div>`;
    }).join("");
  }
  function saveLook() { avatar.setLook(look); try { localStorage.setItem("biobim-avatar", JSON.stringify({ ...look, v: 4 })); } catch (e) { /* */ } renderCreator(); }
  rowsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (!b) return;
    let v = b.dataset.v; if (v === "true") v = true; else if (v === "false") v = false;
    look[b.dataset.k] = v; saveLook(); Sound.tick(); avatar.wave(0.9);
  });
  $("#trCrDavid").addEventListener("click", () => { look = { ...DAVID }; saveLook(); avatar.wave(); Sound.step(2); });
  $("#trCrRandom").addEventListener("click", () => { look = aleatorio(); saveLook(); avatar.wave(); Sound.step(4); });
  let crSpin = 0;
  function openCreator() {
    stopTours(); closeCard(); Q.length = 0;
    setMode("create", false);
    renderCreator();
    creatorEl.hidden = false; void creatorEl.offsetWidth; creatorEl.classList.add("is-open");
    av.pos.copy(START).addScaledVector(t0, 1.5).setY(DECK);
    av.heading = Math.atan2(-t0.x, -t0.z); crSpin = 0;
    const face = new THREE.Vector3(Math.sin(av.heading), 0, Math.cos(av.heading));
    const cd = W <= 860 ? 7.2 : 5.8;
    flyTo(av.pos.clone().addScaledVector(face, cd).setY(DECK + 1.8), av.pos.clone().setY(DECK + 0.98), 1.6);
    $("#trCrGo").focus({ preventScroll: true });
  }
  function closeCreator(next) {
    creatorEl.classList.remove("is-open");
    setTimeout(() => { creatorEl.hidden = true; }, 350);
    av.heading = Math.atan2(t0.x, t0.z);
    if (next === "walk") {
      setMode("walk");
      say(COARSE ? "Usa el <b>joystick</b> o toca el suelo para ir · <b>Saltar</b> a la derecha · entra a las <b>13 estancias</b> y descubre los hitos ✦"
        : "<b>W</b> avanza · <b>A</b> / <b>D</b> gira · la cámara te sigue · entra a las <b>13 salas</b> y descubre los <b>hitos</b> ✦", 7500);
    } else setMode("orbit");
  }
  $("#trCrGo").addEventListener("click", () => closeCreator("walk"));
  $("#trCrSkip").addEventListener("click", () => closeCreator("orbit"));
  $("#trAvatar").addEventListener("click", openCreator);

  // Pantalla de entrada
  const goFree = $("#trGoFree"), goTour = $("#trGoTour"), goWalk = $("#trGoWalk");
  { const m = /estacion-(\d+)/.exec(location.hash); if (m && STATIONS[+m[1]]) goFree.textContent = `Ir a ${STATIONS[+m[1]].t}`; }
  let started = false;
  function enter(how) {
    if (Sound.on) Sound.start();
    startEl.classList.add("is-hidden");
    setTimeout(() => { startEl.hidden = true; }, 600);
    controls.autoRotate = false;
    const first = !started; started = true;
    document.body.classList.remove("is-title");
    if (how === "walk") {
      av.pos.copy(START).addScaledVector(t0, 1.5).setY(DECK); av.heading = Math.atan2(t0.x, t0.z);
      setMode("walk");
      if (first) setTimeout(() => dlg.start(INTRO.map((l) => ({ ...l, c: "var(--flow)" })), () => say(COARSE ? "Usa el <b>joystick</b> para caminar · toca a las personas para conversar" : "<b>W</b> avanza · <b>A</b> / <b>D</b> gira · <b>E</b> conversa · <b>B</b> bitácora", 7000)), 1700);
      return;
    }
    if (how === "tour") { setMode("orbit", false); return startTour(); }
    if (first) {
      // Llegada desde el portafolio: territorio.html#estacion-N abre esa estación
      const m = /estacion-(\d+)/.exec(location.hash);
      const deep = m && +m[1] < N ? +m[1] : -1;
      setMode("orbit", false);
      if (deep >= 0) focus(deep);
      else {
        flyTo(START.clone().add(new THREE.Vector3(-16, 30, 44)), START.clone().addScaledVector(t0, 28), 2.4);
        say("Arrastra para orbitar · clic en un modelo para entrar · o pulsa <b>Caminar</b> para recorrer la pasarela", 7000);
      }
    }
  }
  goWalk.addEventListener("click", () => enter("walk"));
  goFree.addEventListener("click", () => enter("free"));
  goTour.addEventListener("click", () => enter("tour"));
  $("#trHelp").addEventListener("click", () => {
    startEl.classList.add("is-help"); startEl.hidden = false; void startEl.offsetWidth; startEl.classList.remove("is-hidden");
    goWalk.focus();
  });

  /* ---------------- Hitos: descubrirlos ---------------- */
  let found = 0;
  function syncHitos() { hitosEl.innerHTML = `<i aria-hidden="true">✦</i> ${found}/${hitos.length} <span>hitos</span> · <i aria-hidden="true">◧</i> ${visited.size}/${N} <span>estancias</span>`; }
  syncHitos();
  function hitoToast(g) {
    const h = g.userData.h;
    say(`<span class="tr-toast-k" style="color:var(--${HITO_C[h.k]})">✦ ${Math.floor(h.y)} · ${HITO_K[h.k]}</span><b>${h.t}</b><span>${h.d}</span>`, 5200);
  }
  function collect(g) {
    if (g.userData.got) return;
    g.userData.got = true; g.userData.anim = 1;
    found++; syncHitos();
    hitosEl.classList.remove("is-pop"); void hitosEl.offsetWidth; hitosEl.classList.add("is-pop");
    Sound.rise();
    hitoToast(g);
    if (found === hitos.length) setTimeout(() => say("✦ Encontraste todos los hitos del recorrido", 5000), 5400);
  }

  /* ---------------- Puntero: clic, doble clic y resaltado ---------------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null, hover = -1, pointerMoved = false, drag = null;
  const toNdc = (e) => { ndc.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1); ray.setFromCamera(ndc, camera); };
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.45, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0 }));
  scene.add(marker);
  canvas.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now() };
    if (mode === "create") { drag = { x: e.clientX, spin: crSpin }; return; }
    if (tween && !holdFrame) { tween = null; controls.enabled = true; }
    stopTours();
  });
  addEventListener("pointermove", (e) => { if (drag) crSpin = drag.spin + (e.clientX - drag.x) * 0.012; });
  addEventListener("pointerup", () => { drag = null; });
  canvas.addEventListener("pointerup", (e) => {
    if (!down) return;
    const click = Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6 && performance.now() - down.t < 450;
    down = null;
    if (!click || mode === "create") return;
    toNdc(e);
    const nh = mode === "walk" && ray.intersectObjects(npcHits, false)[0];
    if (nh) {
      const n = nh.object.userData.npc;
      if (Math.hypot(n.pos.x - av.pos.x, n.pos.z - av.pos.z) < 4) talkTo(n);
      else walkQueue([{ type: "goto", p: n.pos.clone().lerp(av.pos, 1.6 / Math.max(1.6, n.pos.distanceTo(av.pos))) }]);
      return;
    }
    const pn = ray.intersectObjects(panelMeshes, false)[0];
    if (pn && pn.distance < 60) { openPanel(pn.object.userData.panel); return; }
    const g = ray.intersectObjects(gems, false)[0];
    if (g) { const h = hitos[g.object.userData.h]; if (mode === "walk") walkQueue([{ type: "goto", p: h.position.clone() }]); else hitoToast(h); return; }
    const h = ray.intersectObjects(hits, false)[0];
    if (h) { goStation(h.object.userData.i); return; }
    if (mode === "walk") {
      const w = ray.intersectObjects(walkables, false)[0];
      if (w) {
        const p = w.point; p.x = clamp(p.x, -320, 320); p.z = clamp(p.z, -135, 135);
        walkQueue([{ type: "goto", p: p.clone() }]);
        marker.position.set(p.x, groundY(p.x, p.z) + 0.04, p.z); marker.material.opacity = 1;
      }
    }
  });
  canvas.addEventListener("dblclick", (e) => {
    if (mode !== "orbit") return;
    toNdc(e);
    if (ray.intersectObjects(hits, false)[0]) return;
    const h = ray.intersectObject(terrain, false)[0];
    if (h) { closeCard(); walkTo(clamp(h.point.x, -300, 300), clamp(h.point.z, -120, 120)); }
  });
  canvas.addEventListener("pointermove", (e) => { if (e.buttons === 0) { ndc.set((e.clientX / W) * 2 - 1, -(e.clientY / H) * 2 + 1); pointerMoved = true; } });
  canvas.addEventListener("pointerleave", () => setHover(-1));
  canvas.addEventListener("wheel", () => { if (mode === "create") return; stopTours(); if (tween && !holdFrame) { tween = null; controls.enabled = true; } }, { passive: true });
  function setHover(i) {
    if (i === hover) return;
    if (hover >= 0) { stations[hover].userData.ring.scale.setScalar(1); pins[hover].classList.remove("is-hover"); mapSt[hover].classList.remove("is-hover"); }
    hover = i;
    canvas.style.cursor = i >= 0 ? "pointer" : "";
    if (i >= 0) { stations[i].userData.ring.scale.setScalar(1.04); pins[i].classList.add("is-hover"); mapSt[i].classList.add("is-hover"); Sound.tick(); }
  }

  /* ---------------- Joystick táctil (modo caminar en pantallas táctiles) ---------------- */
  const COARSE = matchMedia("(pointer: coarse)").matches;
  const stick = { x: 0, y: 0, id: null };
  {
    const knob = stickEl.querySelector("i");
    const R = 46;
    const move = (e) => {
      const r = stickEl.getBoundingClientRect();
      let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const L = Math.hypot(dx, dy); if (L > R) { dx *= R / L; dy *= R / L; }
      stick.x = dx / R; stick.y = -dy / R;
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    stickEl.addEventListener("pointerdown", (e) => { stick.id = e.pointerId; stickEl.setPointerCapture(e.pointerId); stopTours(); move(e); });
    stickEl.addEventListener("pointermove", (e) => { if (e.pointerId === stick.id) move(e); });
    const end = (e) => { if (e.pointerId !== stick.id) return; stick.id = null; stick.x = stick.y = 0; knob.style.transform = ""; };
    stickEl.addEventListener("pointerup", end); stickEl.addEventListener("pointercancel", end);
  }

  /* ---------------- Teclado ---------------- */
  const keys = new Set();
  let running = false;
  const MOVE = { KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  /* ==================================================================
     HISTORIA · guías, visitantes, diálogos y bitácora (a la manera de Messenger)
     ================================================================== */
  const dlgEl = $("#trDlg"), talkEl = $("#trTalk"), logEl = $("#trLog"), logBtn = $("#trLogBtn");
  const dlg = createDialog(dlgEl, {
    onOpen: () => { keys.clear(); document.body.classList.add("is-talking"); },
    onClose: () => document.body.classList.remove("is-talking"),
    tick: () => Sound.tick(),
  });
  const talked = new Set(), npcs = [], npcHits = [];
  let nearNpc = null;
  // Un guía por sala, junto a la entrada, mirando hacia quien llega
  GUIAS.forEach((g, i) => {
    const d = DIR[i], side = new THREE.Vector3(-d.z, 0, d.x);
    const p = S[i].clone().addScaledVector(d, -Math.max(3.5, ROOM[i].rIn - 3.2)).addScaledVector(side, 2.4); p.y = DECK;
    const pc = p.clone(); pc.r = 0.55; plinths.push(pc);                    // no se atraviesa
    npcs.push({ kind: "guia", i, g, pos: p, heading: Math.atan2(-d.x, -d.z), look: g.look, name: `${g.nombre} · ${g.rol}` });
  });
  // Visitantes que pasean por la pasarela
  VISITANTES.slice(0, LOW ? 3 : 6).forEach((v, k) => {
    npcs.push({ kind: "visita", look: v.look, u: 0.04 + (k + 0.5) / 6.4, dir: k % 2 ? 1 : -1, off: ((k % 3) - 1) * 1.4, spd: 1.05 + (k % 3) * 0.18,
      pause: 0, next: 8 + k * 3, pos: new THREE.Vector3(), heading: 0, name: "Visitante", line: CHARLA[k % CHARLA.length] });
  });
  const headP = new THREE.Vector3();
  function npcLoop(dt, t) {
    let best = null, bd = 3.2;
    const far = LOW ? 55 : 85;
    for (const n of npcs) {
      if (n.kind === "visita") {
        const dp = Math.hypot(n.pos.x - av.pos.x, n.pos.z - av.pos.z);
        if (n.talking || (dp < 1.8 && mode === "walk")) n.pause = Math.max(n.pause, 0.6);
        if (n.pause > 0) n.pause -= dt;
        else {
          n.u += (n.dir * n.spd * dt) / LEN;
          if (n.u < 0.02 || n.u > 0.98) { n.dir *= -1; n.u = clamp(n.u, 0.02, 0.98); }
          if ((n.next -= dt) < 0) { n.pause = 2 + Math.random() * 3; n.next = 12 + Math.random() * 14; }
        }
        const p = curve.getPointAt(n.u), sd = sideAt(n.u), tn = curve.getTangentAt(n.u);
        n.pos.set(p.x + sd.x * n.off, DECK, p.z + sd.z * n.off);
        n.heading = Math.atan2(tn.x * n.dir, tn.z * n.dir);
      }
      const d = Math.hypot(n.pos.x - av.pos.x, n.pos.z - av.pos.z);
      const near = d < far;
      if (near && !n.av) {
        n.av = createAvatar(THREE, n.look, { bend: bendU, bendC, maskAlpha: 0.38, faceRes: 1024 });
        const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.9, 8), new THREE.MeshBasicMaterial({ visible: false }));
        hit.position.y = 0.95; hit.userData.npc = n; n.av.root.add(hit); npcHits.push(hit);
        scene.add(n.av.root);
      }
      if (!n.av) continue;
      n.av.root.visible = near;
      if (!near) continue;
      let h = n.heading;
      if (d < 4.5 && mode === "walk") h = Math.atan2(av.pos.x - n.pos.x, av.pos.z - n.pos.z);   // mira a quien se acerca
      n.face = n.face ?? h; n.face += angDiff(n.face, h) * Math.min(1, dt * 4);
      n.av.root.position.copy(n.pos); n.av.root.rotation.y = n.face;
      n.av.update(dt, n.kind === "visita" && n.pause <= 0 ? 0.32 : 0, t + n.pos.x * 0.1, 0);
      if (mode === "walk" && d < bd) { bd = d; best = n; }
    }
    nearNpc = best;
    // Globo para conversar sobre la cabeza
    if (nearNpc && !dlg.open && !tween) {
      headP.copy(nearNpc.pos); headP.y += 2.15;
      const bdx = headP.x - bendC.value.x, bdz = headP.z - bendC.value.y; headP.y -= (bdx * bdx + bdz * bdz) * bendU.value;
      headP.project(camera);
      if (headP.z < 1) {
        talkEl.hidden = false;
        talkEl.style.transform = `translate(${((headP.x + 1) / 2) * W}px, ${((1 - headP.y) / 2) * H}px) translate(-50%, -100%)`;
      }
    } else talkEl.hidden = true;
  }
  function talkTo(n) {
    if (!n || dlg.open) return;
    Q.length = 0; stopTours();
    n.talking = true;
    av.heading = Math.atan2(n.pos.x - av.pos.x, n.pos.z - av.pos.z);
    // La cámara se ubica sobre el hombro para ver la cara de quien habla
    const to = new THREE.Vector3(av.pos.x - n.pos.x, 0, av.pos.z - n.pos.z).normalize(), sd = new THREE.Vector3(-to.z, 0, to.x);
    flyTo(av.pos.clone().addScaledVector(to, 2.4).addScaledVector(sd, 1.1).setY(av.pos.y + 1.95), n.pos.clone().setY(n.pos.y + 1.45).addScaledVector(to, 0.4), 0.9);
    if (n.av) n.av.wave(1.2);
    if (n.kind === "guia") {
      const c = `var(--${STATIONS[n.i].c})`;
      dlg.start(n.g.lineas.map((text) => ({ who: n.name, text, c })), () => {
        n.talking = false;
        if (!talked.has(n.i)) { talked.add(n.i); markVisited(n.i); logUpdate(n.i); }
      });
    } else {
      dlg.start([{ who: n.name, text: n.line, c: "var(--leaf)" }], () => { n.talking = false; n.line = CHARLA[(Math.random() * CHARLA.length) | 0]; });
    }
  }
  talkEl.addEventListener("click", () => talkTo(nearNpc));
  // Bitácora: capítulos con su progreso, como una lista de encargos
  function renderLog() {
    logEl.querySelector("ol").innerHTML = CAPITULOS.map((c, k) => {
      const n = c.salas.filter((i) => talked.has(i)).length;
      return `<li class="${n === c.salas.length ? "is-done" : ""}"><span>${k + 1}. ${c.t}</span> <em>(${n}/${c.salas.length})</em></li>`;
    }).join("") + `<li class="tr-log-h ${found === hitos.length ? "is-done" : ""}"><span>✦ Hitos del camino</span> <em>(${found}/${hitos.length})</em></li>`;
  }
  function logUpdate(i) {
    const c = CAPITULOS.find((c) => c.salas.includes(i)), n = c.salas.filter((j) => talked.has(j)).length;
    say(`<span class="tr-toast-k">Bitácora actualizada</span><b>${c.t} (${n}/${c.salas.length})</b>`, 3400);
    logBtn.classList.remove("is-pop"); void logBtn.offsetWidth; logBtn.classList.add("is-pop");
    renderLog();
  }
  logBtn.addEventListener("click", () => { renderLog(); logEl.hidden = !logEl.hidden; logBtn.setAttribute("aria-expanded", String(!logEl.hidden)); Sound.tick(); });
  // Botones laterales: música, personaje y saludo
  const musicBtn = $("#trMusic");
  const syncMusic = () => musicBtn.setAttribute("aria-pressed", $("#trSound").getAttribute("aria-pressed"));
  musicBtn.addEventListener("click", () => { $("#trSound").click(); syncMusic(); });
  syncMusic();
  $("#trShirt").addEventListener("click", () => openCreator());
  $("#trWave").addEventListener("click", () => { avatar.wave(); Sound.step(2); });

  // Visor de paneles: la museografía de las paredes, en grande y legible
  const lightEl = document.getElementById("trLight");
  let lightAt = null;
  function openPanel({ i, k }) {
    lightAt = { i, k };
    const c = document.createElement("canvas"); c.width = 920; c.height = 1120;
    const x = c.getContext("2d"); x.scale(2, 2); panelDraw(i, k)(x, 460, 560, light());
    lightEl.querySelector(".tr-light-img").replaceChildren(c);
    c.setAttribute("role", "img"); c.setAttribute("aria-label", `Panel ${k + 1} de 3 · ${STATIONS[i].t}`);
    lightEl.querySelector(".tr-light-n").textContent = `Sala ${String(i + 1).padStart(2, "0")} · panel ${k + 1} de 3`;
    lightEl.hidden = false; keys.clear();
    lightEl.querySelector(".tr-light-x").focus({ preventScroll: true });
  }
  function closePanel() { lightEl.hidden = true; lightAt = null; }
  const stepPanel = (d) => { if (lightAt) openPanel({ i: lightAt.i, k: (lightAt.k + d + 3) % 3 }); };
  lightEl.querySelector(".tr-light-x").addEventListener("click", closePanel);
  lightEl.querySelector(".tr-light-prev").addEventListener("click", () => stepPanel(-1));
  lightEl.querySelector(".tr-light-next").addEventListener("click", () => stepPanel(1));
  lightEl.addEventListener("click", (e) => { if (e.target === lightEl) closePanel(); });
  function nearestPanel() {
    let best = null, bd = 16;
    for (const m of panelMeshes) { m.getWorldPosition(tmp3); const d = Math.hypot(tmp3.x - av.pos.x, tmp3.z - av.pos.z); if (d < bd) { bd = d; best = m; } }
    return best;
  }
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!lightEl.hidden) {
      if (e.key === "Escape" || e.key === "l" || e.key === "L") closePanel();
      else if (e.key === "ArrowRight") stepPanel(1);
      else if (e.key === "ArrowLeft") stepPanel(-1);
      e.preventDefault(); return;
    }
    if (dlg.open) {
      if (["Enter", " ", "e", "E", "Escape"].includes(e.key)) { if (e.key === "Escape") dlg.close(); else dlg.next(); e.preventDefault(); }
      return;
    }
    if ((e.key === "e" || e.key === "E") && nearNpc && mode === "walk") { talkTo(nearNpc); e.preventDefault(); return; }
    if ((e.key === "b" || e.key === "B") && !e.target.matches?.("input, textarea")) { logBtn.click(); return; }
    if ((e.key === "l" || e.key === "L") && !e.target.matches?.("input, textarea")) { const m = nearestPanel(); if (m) { openPanel(m.userData.panel); e.preventDefault(); return; } }
    if (!startEl.hidden && !startEl.classList.contains("is-hidden")) { if (e.key === "Escape" && started) enter("free"); return; }
    if (e.key === "Shift") running = true;
    if (mode === "create") { if (e.key === "Escape") closeCreator("orbit"); if (e.key === "Enter" && !e.target.closest?.("button")) closeCreator("walk"); return; }
    if (e.target.matches?.("input, textarea")) { if (e.key === "Escape") e.target.blur(); if (!MOVE[e.code] || e.target.type === "range") return; }
    if (MOVE[e.code]) { keys.add(e.code); stopTours(); if (tween && !holdFrame) { tween = null; controls.enabled = true; } e.preventDefault(); return; }
    switch (e.key.toLowerCase()) {
      case "q": stopTours(); goStation(active <= 0 ? N - 1 : active - 1); break;
      case "e": stopTours(); goStation(active < 0 || active >= N - 1 ? 0 : active + 1); break;
      case "escape": stopTours(); closeCard(); break;
      case "h": stopTours(); closeCard(); setMode("orbit", false); flyTo(HOME.pos, HOME.tgt, 2); break;
      case "g": (tour || walkTour) ? stopTours() : startTour(); break;
      case "m": Sound.toggle(); syncSound(); break;
      case "c": openCreator(); break;
      case "f": modeBtn.click(); break;
      case " ": e.preventDefault(); if (mode === "walk") av.jump = true; else if (active >= 0) setPlaying(!exPlaying); break;
      case "p": if (active >= 0) setPlaying(!exPlaying); break;
      case "i": if (active >= 0) setFull(!cardFull); break;
      case "r": if (mode === "walk") avatar.wave(); break;
      case "?": $("#trHelp").click(); break;
    }
  });
  addEventListener("keyup", (e) => { keys.delete(e.code); if (e.key === "Shift") running = false; });
  addEventListener("blur", () => { keys.clear(); running = false; });

  /* ---------------- Tamaño y encuadre ---------------- */
  let W = innerWidth, H = innerHeight, offX = 0, offY = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W * DPR, H * DPR, false);
    rt.setSize(W * DPR, H * DPR);
    sketchU.res.value.set(W * DPR, H * DPR);
    camera.aspect = W / H;
    camera.fov = W < 700 ? 55 : 42;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  /* ==================================================================
     BUCLE
     ================================================================== */
  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), fwd = new THREE.Vector3(), right = new THREE.Vector3();
  const sunDir = new THREE.Vector3();
  let sunU = 0, lastHover = 0, lastGate = -1, announced = -1;
  const stationFrac = (u) => {
    if (u <= US[0]) return 0;
    if (u >= US[N - 1]) return 1;
    let k = 0; while (k < N - 2 && u > US[k + 1]) k++;
    return (k + (u - US[k]) / (US[k + 1] - US[k])) / (N - 1);
  };

  const offDeckOk = (x, z) => {
    for (let i = 0; i < N; i++) if (Math.hypot(S[i].x - x, S[i].z - z) <= ROOM_R[i] + 1 || segDist(x, z, GATE[i], S[i]) <= 2) return true;
    return Math.hypot(START.x - x, START.z - z) <= 10.8 || Math.hypot(END.x - x, END.z - z) <= 12.8;
  };
  const walkableAt = (x, z) => distToPath(x, z) <= HW - 0.3 || offDeckOk(x, z);
  const tmp3 = new THREE.Vector3();
  function walkStep(dt, t) {
    let dir = null, spd = 0, manual = false;
    const prevX = av.pos.x, prevZ = av.pos.z;
    const wasOnDeck = distToPath(av.pos.x, av.pos.z) <= HW || offDeckOk(av.pos.x, av.pos.z);
    let ix = stick.x, iz = stick.y;
    for (const c of keys) { ix += MOVE[c][0]; iz += MOVE[c][1]; }
    if (dlg.open) { ix = 0; iz = 0; }
    ix = clamp(ix, -1, 1); iz = clamp(iz, -1, 1);
    if (Math.abs(ix) > 0.12 || Math.abs(iz) > 0.12) {
      if (Q.length) walkQueue([]);
      // Como en un juego en tercera persona: W / S avanzan o retroceden, A / D giran y la cámara sigue detrás
      const turn = Math.abs(ix) > 0.12 ? ix : 0;
      av.heading -= turn * 2.4 * dt;
      if (Math.abs(iz) > 0.12) {
        dir = tmp2.set(Math.sin(av.heading), 0, Math.cos(av.heading)).multiplyScalar(Math.sign(iz));
        spd = (running ? 8.5 : 4.8) * Math.abs(iz) * (iz < 0 ? 0.6 : 1);
        // Sobre la pasarela, avanzar sigue su curva sin corregir a mano
        const n0 = nearestOnPath(av.pos.x, av.pos.z);
        if (!turn && iz > 0 && n0.d < HW) {
          const tn = curve.getTangentAt(n0.u), ta = Math.atan2(tn.x, tn.z), tb = ta + Math.PI;
          const tg = Math.abs(angDiff(av.heading, ta)) < Math.abs(angDiff(av.heading, tb)) ? ta : tb;
          if (Math.abs(angDiff(av.heading, tg)) < 0.6) av.heading += angDiff(av.heading, tg) * Math.min(1, dt * 2.5);
        }
      }
      manual = true;
    } else if (Q.length) {
      const a = Q[0];
      if (a.type === "goto") {
        const d = tmp2.set(a.p.x - av.pos.x, 0, a.p.z - av.pos.z), L = d.length();
        if (L < 0.2) Q.shift(); else { dir = d.normalize(); spd = Math.min(a.sp || 5.2, L * 3 + 1); }
      } else if (a.type === "path") {
        if (a.cur == null) a.cur = nearestOnPath(av.pos.x, av.pos.z).u;
        const step = (a.sp || 5.2) * dt / LEN;
        if (Math.abs(a.u - a.cur) <= step) { a.cur = a.u; Q.shift(); } else a.cur += Math.sign(a.u - a.cur) * step;
        const p = curve.getPointAt(clamp(a.cur));
        const d = tmp2.set(p.x - av.pos.x, 0, p.z - av.pos.z), L = d.length();
        if (L > 1e-4) { av.pos.x = p.x; av.pos.z = p.z; dir = d.normalize(); }
        spd = a.sp || 5.2;
        dir && (av.heading += angDiff(av.heading, Math.atan2(dir.x, dir.z)) * Math.min(1, dt * 10));
        dir = null;                                              // la posición ya se fijó sobre la curva
      } else if (a.type === "face") {
        const target = Math.atan2(a.dir.x, a.dir.z), dd = angDiff(av.heading, target);
        av.heading += dd * Math.min(1, dt * 7);
        if (Math.abs(dd) < 0.04) Q.shift();
      } else if (a.type === "wait") {
        a.left = (a.left ?? a.s) - dt; if (a.left <= 0) Q.shift();
      } else if (a.type === "call") { Q.shift(); a.fn(); }
    }
    if (dir && spd > 0) {
      av.pos.addScaledVector(dir, spd * dt);
      if (!manual) av.heading += angDiff(av.heading, Math.atan2(dir.x, dir.z)) * Math.min(1, dt * 10);
    }
    // Barandas: lo elevado (pasarela, ramales, plazas y salas) no se abandona; se desliza a lo largo del borde
    if (!walkableAt(av.pos.x, av.pos.z) && walkableAt(prevX, prevZ)) {
      if (walkableAt(av.pos.x, prevZ)) av.pos.z = prevZ;
      else if (walkableAt(prevX, av.pos.z)) av.pos.x = prevX;
      else { av.pos.x = prevX; av.pos.z = prevZ; if (Q.length && Q[0].type === "goto") Q.shift(); }
    }
    // Muros de las estancias y pedestales: no se atraviesan
    for (const [ax, az, bx, bz, si] of solids) {
      if (Math.abs(S[si].x - av.pos.x) > ROOM_R[si] + 3 || Math.abs(S[si].z - av.pos.z) > ROOM_R[si] + 3) continue;
      const vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1;
      const k = clamp(((av.pos.x - ax) * vx + (av.pos.z - az) * vz) / L2), cx = ax + vx * k, cz = az + vz * k;
      const dx = av.pos.x - cx, dz = av.pos.z - cz, d = Math.hypot(dx, dz);
      if (d < 0.45) { const nx = d > 1e-4 ? dx / d : -vz / Math.sqrt(L2), nz = d > 1e-4 ? dz / d : vx / Math.sqrt(L2); av.pos.x = cx + nx * 0.45; av.pos.z = cz + nz * 0.45; }
    }
    for (const p of plinths) {
      const dx = av.pos.x - p.x, dz = av.pos.z - p.z, d = Math.hypot(dx, dz);
      if (d < p.r && d > 1e-3) { av.pos.x = p.x + (dx / d) * p.r; av.pos.z = p.z + (dz / d) * p.r; }
    }
    av.pos.x = clamp(av.pos.x, -330, 330); av.pos.z = clamp(av.pos.z, -140, 140);
    // Salto: impulso y gravedad; aterriza sobre la pasarela, el ramal o el terreno
    const gy = groundY(av.pos.x, av.pos.z);
    if (av.jump && !av.air) { av.vy = 7.4; av.air = true; Sound.step(3); }
    av.jump = false;
    if (av.air) {
      av.vy -= 22 * dt; av.pos.y += av.vy * dt;
      if (av.pos.y <= gy && av.vy < 0) { av.pos.y = gy; av.vy = 0; av.air = false; Sound.tick(); }
    } else av.pos.y += (gy - av.pos.y) * Math.min(1, dt * 12);
    av.spd += (spd - av.spd) * Math.min(1, dt * 8);
    const n = nearestOnPath(av.pos.x, av.pos.z);
    if (n.d < HW + 1) { av.u = n.u; av.maxU = Math.max(av.maxU, n.u); }
    return n;
  }

  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(0.1, clock.getDelta()), t = clock.elapsedTime, now = performance.now();
    bendU.value += ((!started ? BEND.title : BEND[mode] ?? BEND.orbit) - bendU.value) * Math.min(1, dt * 1.5);
    const bc = mode === "orbit" ? controls.target : av.pos;
    bendC.value.x += (bc.x - bendC.value.x) * Math.min(1, dt * 3); bendC.value.y += (bc.z - bendC.value.y) * Math.min(1, dt * 3);

    // Personaje y estancia en la que está
    let nearPath = null, inRoom = -1, nearSt = -1, nearD = Infinity;
    if (mode === "walk") nearPath = walkStep(dt, t);
    else av.spd += (0 - av.spd) * Math.min(1, dt * 8);
    for (let i = 0; i < N; i++) { const d = Math.hypot(S[i].x - av.pos.x, S[i].z - av.pos.z); if (d < nearD) { nearD = d; nearSt = i; } }
    if (mode === "walk" && nearSt >= 0 && nearD < ROOM[nearSt].rIn) inRoom = nearSt;
    avatar.root.position.copy(av.pos);
    avatar.root.rotation.y = mode === "create" ? av.heading + crSpin + Math.sin(t * 0.6) * 0.35 : av.heading;
    avatar.update(dt, clamp(av.spd / 7), t, av.air ? clamp((av.pos.y - groundY(av.pos.x, av.pos.z)) / 0.8) : 0);
    npcLoop(dt, t);
    keyLight.intensity += ((mode === "create" ? 9 : 0) - keyLight.intensity) * Math.min(1, dt * 4);
    if (keyLight.intensity > 0.01) keyLight.position.copy(camera.position).add(tmp.set(0, 0.8, 0));

    // Cámara
    if (tween) {
      tween.t = (now - tween.t0) / (tween.dur * 1000);            // por tiempo real: igual de fluido aunque bajen los fps
      const k = easeIO(clamp(tween.t));
      controls.target.lerpVectors(tween.from.tgt, tween.tgt, k);
      camera.position.lerpVectors(tween.from.pos, tween.pos, k);
      camera.position.y += Math.sin(Math.PI * k) * tween.lift;
      if (tween.t >= 1) { tween = null; controls.enabled = mode !== "create"; }
      camera.lookAt(controls.target);
    } else if (mode === "walk") {
      if (!holdFrame) {
        // La cámara acompaña al personaje; en el recorrido a pie se ubica detrás de él
        tmp.copy(av.pos).setY(av.pos.y + 1.7).sub(controls.target).multiplyScalar(Math.min(1, dt * 5));
        controls.target.add(tmp); camera.position.add(tmp);
        // La cámara vuelve sola detrás del personaje al caminar o girar (arrastrar la mueve solo un momento)
        const turning = ["KeyA", "KeyD", "ArrowLeft", "ArrowRight"].some((k) => keys.has(k)) || Math.abs(stick.x) > 0.12;
        if (!walkTour && !down && (av.spd > 0.6 || turning)) {
          const off = tmp2.copy(camera.position).sub(controls.target);
          const a0 = Math.atan2(off.x, off.z), a1 = av.heading + Math.PI, r = Math.hypot(off.x, off.z);
          const na = a0 + angDiff(a0, a1) * Math.min(1, dt * (turning ? 6 : 2.6));
          const r1 = r + (clamp(r, 3.8, 7) - r) * Math.min(1, dt * 1.2), k = Math.min(1, dt * 1.5);
          camera.position.set(controls.target.x + Math.sin(na) * r1, camera.position.y + (controls.target.y + 0.45 + r1 * 0.14 - camera.position.y) * k, controls.target.z + Math.cos(na) * r1);
        }
        if (walkTour && av.spd > 0.5 && inRoom < 0) {
          const f = tmp2.set(Math.sin(av.heading), 0, Math.cos(av.heading));
          tmp.copy(av.pos).addScaledVector(f, -10).setY(av.pos.y + 5.5).sub(camera.position).multiplyScalar(Math.min(1, dt * 1.2));
          camera.position.add(tmp);
        }
        // Dentro de la sala: movimiento libre; la cámara solo se mantiene dentro de los muros
        if (inRoom >= 0) {
          const c = S[inRoom], lim = Math.max(ROOM[inRoom].rIn, ROOM_R[inRoom] - 2.5);
          const T = controls.target, ox = camera.position.x - T.x, oz = camera.position.z - T.z;
          const tx = T.x - c.x, tz = T.z - c.z, A = ox * ox + oz * oz;
          if (Math.hypot(camera.position.x - c.x, camera.position.z - c.z) > lim && A > 1e-4 && Math.hypot(tx, tz) < lim) {
            const Bq = 2 * (tx * ox + tz * oz), Cq = tx * tx + tz * tz - lim * lim;
            const kk = clamp((-Bq + Math.sqrt(Math.max(0, Bq * Bq - 4 * A * Cq))) / (2 * A));
            camera.position.x = T.x + ox * kk; camera.position.z = T.z + oz * kk;
            const flat = Math.sqrt(A) * kk;                          // muy cerca: la cámara sube para seguir viendo
            if (flat < 3.5) camera.position.y += (T.y + 3.2 + (3.5 - flat) * 0.8 - camera.position.y) * Math.min(1, dt * 4);
          }
          if (camera.position.y > av.pos.y + 7.5) camera.position.y += (av.pos.y + 7.5 - camera.position.y) * Math.min(1, dt * 3);
        }
      }
      controls.update();
    } else if (mode === "orbit") {
      if (keys.size) {
        camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
        right.crossVectors(fwd, UPV);
        let mx = 0, mz = 0;
        for (const c of keys) { mx += MOVE[c][0]; mz += MOVE[c][1]; }
        const sp = (14 + camera.position.distanceTo(controls.target) * 0.6) * dt;
        tmp.copy(fwd).multiplyScalar(mz * sp).addScaledVector(right, mx * sp);
        controls.target.add(tmp); camera.position.add(tmp);
      }
      controls.update();
      const tg = controls.target;
      const cx = clamp(tg.x, -300, 300) - tg.x, cz = clamp(tg.z, -130, 130) - tg.z, cy = clamp(tg.y, 0, 40) - tg.y;
      if (cx || cz || cy) { tg.x += cx; tg.z += cz; tg.y += cy; camera.position.x += cx; camera.position.z += cz; camera.position.y += cy; }
    }
    if (camera.position.y < 1.2) camera.position.y = 1.2;
    const focusP = mode === "orbit" ? controls.target : av.pos;

    // Fichas: en vista libre se cierran al alejarse; caminando se abren al llegar a una estación
    if (mode === "orbit" && active >= 0 && !tween && focusTgt && controls.target.distanceTo(focusTgt) > 45) closeCard();
    if (mode === "walk" && !walkTour) {
      if (inRoom >= 0 && active !== inRoom) openStation(inRoom);
      else if (active >= 0 && Math.hypot(S[active].x - av.pos.x, S[active].z - av.pos.z) > ROOM[active].rIn + 1.5) closeCard();
      // Al acercarse a una estancia aparece su pregunta
      if (nearD < ROOM_R[nearSt] + 18 && nearD >= ROOM[nearSt].rIn && announced !== nearSt) {
        announced = nearSt;
        const s = STATIONS[nearSt];
        say(`<span class="tr-toast-k" style="color:var(--${s.c})">Estancia ${nn(nearSt)} · ${s.y}</span><b>${PREG[s.kind]}</b><span>${visited.has(nearSt) ? "Ya la visitaste: " + s.t : "Entra para descubrirlo"}</span>`, 3600);
      }
      if (announced >= 0 && Math.hypot(S[announced].x - av.pos.x, S[announced].z - av.pos.z) > ROOM_R[announced] + 28) announced = -1;
    }
    // Cubiertas: se desvanecen en la sala donde está el personaje (o la que se mira en vista libre)
    const openRoom = mode === "walk" ? (inRoom >= 0 ? inRoom : (walkTour ? active : -1)) : active;
    roofMats.forEach((ms, i) => { const want = i === openRoom ? 0.12 : 1; for (const m of ms) { m.opacity += (want - m.opacity) * Math.min(1, dt * 5); m.depthWrite = m.opacity > 0.6; } });
    // Portales: al cruzarlos se encienden y anuncian la estación
    if (mode === "walk") {
      for (let i = 0; i < N; i++) {
        if (i !== lastGate && Math.hypot(GATE[i].x - av.pos.x, GATE[i].z - av.pos.z) < 2.6) {
          lastGate = i; gates[i].userData.flash = 1; Sound.ping();
          const fw = Math.cos(av.heading) * curve.getTangentAt(US[i]).z + Math.sin(av.heading) * curve.getTangentAt(US[i]).x >= 0;
          if (!walkTour) say(`<span class="tr-toast-k" style="color:var(--${STATIONS[i].c})">${STATIONS[i].y} · Estancia ${nn(i)}</span><b>${PREG[STATIONS[i].kind]}</b><span>La estancia está ${(SIDE[i] > 0) === fw ? "a tu derecha →" : "← a tu izquierda"}</span>`, 3000); announced = i;
        }
      }
      // Hitos: se descubren al pasar cerca
      for (const g of hitos) if (!g.userData.got && Math.hypot(g.position.x - av.pos.x, g.position.z - av.pos.z) < 1.9) collect(g);
    }

    // Ejercicio en reproducción
    if (exPlaying && active >= 0) {
      const ex = EX[active];
      ex.phase = (ex.phase || 0) + dt * (ex.speed || 0.1);
      const v = ex.loop ? ex.phase % 1 : 0.5 - 0.5 * Math.cos(ex.phase * Math.PI * 2);
      applyEx(active, v, false);
    }
    for (let i = 0; i < N; i++) if (EX[i].tick) EX[i].tick(t, dt, i === active);

    // Recorrido guiado en vista libre
    if (tour && !tween && now > tourNext) {
      if (active < N - 1) focus(active + 1);
      else { stopTours(); say("Fin del recorrido · sigue explorando libremente"); }
    }

    // El sol avanza con los años
    const uT = active >= 0 ? active / (N - 1) : stationFrac(mode === "orbit" ? nearestOnPath(focusP.x, focusP.z).u : av.u);
    sunU += (uT - sunU) * Math.min(1, dt * 1.5);
    const el = (7 + 71 * sunU) * (Math.PI / 180), az = (105 - 75 * sunU) * (Math.PI / 180);
    sunDir.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    sun.position.copy(focusP).addScaledVector(sunDir, 220);
    sun.target.position.copy(focusP);
    rim.position.copy(focusP).addScaledVector(sunDir, -100).setY(focusP.y + 60);
    rim.target.position.copy(focusP);
    const L = light();
    sun.color.setHSL(0.075 + 0.045 * sunU, 0.95, 0.58 + 0.3 * sunU);
    sun.intensity = 1.5 + 0.9 * sunU;
    setShadowSize(clamp(camera.position.distanceTo(focusP) * 0.6, 34, 150));
    skyU.top.value.copy(SKY.top0).lerp(SKY.top1, Math.pow(sunU, 0.6));
    skyU.horizon.value.copy(SKY.hor0).lerp(SKY.hor1, Math.pow(sunU, 0.5));
    skyU.sunDir.value.copy(sunDir);
    fog.color.copy(skyU.horizon.value);
    sky.position.copy(camera.position);
    for (const c of clouds) { c.position.x += c.userData.v * dt; if (c.position.x > 1500) c.position.x = -1500; }
    flowTex.offset.x -= dt * 0.08;
    for (const cab of metro.cabins) {
      const d = cab.userData; d.u = (d.u + dt * 0.012 * d.dir + 1) % 1;
      cab.position.copy(d.c.getPointAt(d.u)); cab.position.x += d.off; cab.position.y -= 0.3;
    }
    // Luz propia de la sala más cercana (se traslada y toma su color)
    {
      let li = -1, ld = Infinity;
      for (let i = 0; i < N; i++) { const d = Math.hypot(S[i].x - focusP.x, S[i].z - focusP.z) - ROOM_R[i]; if (d < ld) { ld = d; li = i; } }
      const on = ld < 30 ? 1 : 0;
      if (li >= 0 && on) {
        const cfg = ROOM[li];
        roomSpot.position.set(S[li].x, DECK + cfg.lh, S[li].z); roomSpot.target.position.set(S[li].x, DECK, S[li].z);
        roomFill.position.set(S[li].x, DECK + 5, S[li].z);
        roomSpot.color.setHex(cfg.light); roomFill.color.setHex(cfg.light);
      }
      roomSpot.intensity += (on * 80 - roomSpot.intensity) * Math.min(1, dt * 3);
      roomFill.intensity += (on * 18 - roomFill.intensity) * Math.min(1, dt * 3);
    }
    roomFx.forEach((f, i) => {
      if (!f) return;
      const near = Math.hypot(S[i].x - focusP.x, S[i].z - focusP.z) < 160;
      if (!near) return;
      for (const [m, v] of f.spin) m.rotation.z += v * dt;
      for (const h of f.rot) h.position.y = 16.5 + Math.sin(t * 0.6) * 0.35;
      if (f.beam) f.beam.rotation.y = t * 0.5;
      if (f.pix && (f.pix.t += dt) > 0.12) { f.pix.t = 0; for (let k = 0; k < 24; k++) f.pix.mesh.setColorAt((Math.random() * f.pix.mesh.count) | 0, f.pix.colors[(Math.random() * f.pix.colors.length) | 0]); f.pix.mesh.instanceColor.needsUpdate = true; }
    });

    // Pasarela: línea de lo recorrido, portales que destellan y marcador del clic
    progGeo.setDrawRange(0, Math.floor((mode === "orbit" ? 1 : av.u) * NS) * 6);
    for (const g of gates) {
      const f = g.userData.flash; if (f <= 0) continue;
      g.userData.flash = Math.max(0, f - dt * 0.9);
      for (const s of g.userData.strips) s.scale.set(1 + f * 1.6, 1, 1 + f * 1.6);
    }
    marker.material.opacity = Math.max(0, marker.material.opacity - dt * 0.8);
    marker.scale.setScalar(1 + (1 - marker.material.opacity) * 1.5);
    // Hitos: flotan; al descubrirse suben y se desvanecen
    for (const g of hitos) {
      const d = g.userData;
      if (!d.got) { d.gm.position.y = 1.4 + Math.sin(t * 2 + d.u * 40) * 0.12; d.gm.rotation.y = t * 1.5; }
      else if (d.anim > 0) {
        d.anim = Math.max(0, d.anim - dt * 1.1);
        d.gm.position.y += dt * 2.2; d.gm.scale.setScalar(1 + (1 - d.anim) * 0.8);
        d.gm.material.opacity = d.anim; d.bm.material.opacity = 0.55 * d.anim;
        if (d.anim === 0) { d.gm.visible = false; d.bm.visible = false; d.rg.material.opacity = 0.25; }
      }
    }

    // Viento y polen
    for (let k = 0; k < WIND; k++) {
      const w = windSeed[k];
      w.x += w.v * dt; if (w.x > 260) { w.x = -260; w.z = (Math.random() - 0.5) * 180; }
      const y = w.y + Math.sin(t * 0.8 + k) * 0.4;
      windPos.set([w.x, y, w.z, w.x + w.l, y + 0.05, w.z + 0.3], k * 6);
    }
    windGeo.attributes.position.needsUpdate = true;
    for (let k = 0; k < POLLEN; k++) {
      let x = polPos[k * 3] + dt * (1.2 + (k % 5) * 0.2);
      if (x > 250) x = -250;
      polPos[k * 3] = x;
      polPos[k * 3 + 1] += Math.sin(t * 0.7 + k) * dt * 0.15;
    }
    polGeo.attributes.position.needsUpdate = true;

    // Anillos: la estación abierta brilla
    stations.forEach((g, i) => { const m = g.userData.ring.material; m.opacity += ((i === active ? 1 : i === hover ? 0.85 : 0.45) - m.opacity) * Math.min(1, dt * 6); });

    // Encuadre: deja espacio a la ficha o al creador
    const open = active >= 0 && card.classList.contains("is-open") && cardFull;
    const wantX = mode === "create" ? (W > 860 ? -Math.min(W * 0.17, 240) : 0) : (open && W > 860 ? -Math.min(W * 0.16, 250) : 0);
    const wantY = mode === "create" ? (W <= 860 ? H * 0.17 : 0) : (open && W <= 860 ? H * 0.2 : 0);
    offX += (wantX - offX) * Math.min(1, dt * 5); offY += (wantY - offY) * Math.min(1, dt * 5);
    camera.setViewOffset(W, H, offX, offY, W, H);
    camera.updateProjectionMatrix();

    // Resaltado bajo el puntero
    if (pointerMoved && now - lastHover > 50 && !tween && mode !== "create") {
      lastHover = now; pointerMoved = false;
      ray.setFromCamera(ndc, camera);
      const h = ray.intersectObjects(hits, false)[0];
      setHover(h ? h.object.userData.i : -1);
    }

    // Etiquetas
    pins.forEach((pin, k) => {
      tmp.copy(S[k]).setY(DECK + ROOM[k].pinY).project(camera);
      const d = camera.position.distanceTo(S[k]);
      const vis = mode !== "create" && tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1 && d < 520;
      let o = vis ? clamp((520 - d) / 160) : 0;
      if (open) o *= k === active ? 0 : 0.45;
      pin.style.transform = `translate(-50%, -100%) translate(${((tmp.x + 1) / 2) * W}px, ${((1 - tmp.y) / 2) * H}px)`;
      pin.style.opacity = o.toFixed(2);
      pin.style.pointerEvents = o > 0.2 ? "" : "none";
      pin.tabIndex = o > 0.2 ? 0 : -1;
      pin.classList.toggle("is-near", d < 60);
    });

    // Minimapa
    const tg = controls.target;
    const ang = Math.atan2(tg.x - camera.position.x, -(tg.z - camera.position.z)) * 180 / Math.PI;
    mapCam.setAttribute("transform", `translate(${clamp(tg.x, -275, 275).toFixed(1)} ${clamp(tg.z, -110, 110).toFixed(1)}) rotate(${ang.toFixed(1)})`);
    mapAv.setAttribute("cx", av.pos.x.toFixed(1)); mapAv.setAttribute("cy", av.pos.z.toFixed(1));
    mapSt.forEach((c, i) => c.classList.toggle("is-on", i === active));

    // Lectura del sol y ambiente sonoro
    sunEl.textContent = `Sol ${Math.round(el * 180 / Math.PI)}° · ${Math.round(2012 + sunU * 14)}`;
    const nearWater = Math.min(focusP.distanceTo(S[4]), 60);
    Sound.ambience(0.012 + 0.03 * clamp(camera.position.y / 90), 0.06 * clamp(1 - nearWater / 26));

    sketchU.time.value = t;
    sketchU.uInvProj.value.copy(camera.projectionMatrixInverse); sketchU.uCamWorld.value.copy(camera.matrixWorld);
    if (vegU) { vegU.camP.value.copy(camera.position); vegU.tgtP.value.copy(controls.target); vegU.time.value = t; }
    renderer.setRenderTarget(rt); renderer.render(scene, camera);
    renderer.setRenderTarget(null); renderer.render(post, postCam);
  }
  {
    const LAND = new Set([M.ground, M.floorPaper, M.city, M.mountain, M.brick, M.water, windMat]);
    const seen = new Set();
    const crisp = (m) => {
      if (!m || seen.has(m) || LAND.has(m) || m.isShaderMaterial || m.isPointsMaterial || m.isSpriteMaterial || m.userData.keepBlend) return;
      seen.add(m);
      if (m.transparent) {
        // transparentes: mezclan el color pero conservan la máscara de lo que tienen detrás
        Object.assign(m, { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
          blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor });
      } else {
        m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace(/}\s*$/, "  gl_FragColor.a = 0.5;\n}"); };
        m.customProgramCacheKey = () => "crisp";
      }
      m.needsUpdate = true;
    };
    scene.traverse((o) => { if (o.material) [].concat(o.material).forEach(crisp); });
    Object.values(M).forEach(crisp);
    Object.values(accent).forEach(crisp);
  }
  scene.traverse((o) => { if (o.material && o !== sky) [].concat(o.material).forEach(bendify); });
  Object.values(M).forEach(bendify); Object.values(accent).forEach(bendify);
  setMode("orbit", false);
  if (!started) {
    document.body.classList.add("is-title");
    controls.target.set(-20, 0, 0); camera.position.set(-20, 390, 330);
    Object.assign(controls, { autoRotate: true, autoRotateSpeed: 0.6 });
  }
  loop();

  // Listo: se habilita la entrada
  window.__trReady = true;
  startEl.classList.add("is-ready");
  goFree.disabled = false; goTour.disabled = false; goWalk.disabled = false;
  goWalk.focus({ preventScroll: true });
}
