/* =====================================================================
   HISTORIA · territorio.html
   ---------------------------------------------------------------------
   La capa de juego del territorio, en la línea de Messenger (abeto):
   · un monólogo de llegada del visitante,
   · un personaje en cada sala que cuenta su pregunta y su trabajo
     (la hoja de vida se descubre conversando, sin narrar a nadie en
     tercera persona),
   · visitantes que pasean por la pasarela y dicen algo al pasar,
   · la bitácora: capítulos con su progreso, como una lista de encargos,
   · el cuadro de diálogo con pestaña de nombre y botón ▶.
   ===================================================================== */

// Capítulos de la bitácora: agrupan las 13 salas (índices de STATIONS)
export const CAPITULOS = [
  { t: "Aprender a mirar", salas: [0, 1] },
  { t: "El clima como material", salas: [2, 3] },
  { t: "Ciudad y código", salas: [4, 5] },
  { t: "Enseñar y construir", salas: [6, 7, 8] },
  { t: "Compartir e investigar", salas: [9, 10, 11, 12] },
];

export const INTRO = [
  { who: "Visitante", text: "Un jardín elevado sobre la ciudad… dicen que aquí hay trece salas." },
  { who: "Visitante", text: "Cada una guarda una pregunta. Y en cada una hay alguien que sabe contarla." },
  { who: "Visitante", text: "Mejor empiezo a caminar." },
];

// Un personaje por sala (en el orden de STATIONS). look: variaciones sobre el personaje base
export const GUIAS = [
  { nombre: "Nora", rol: "dibujante", look: { piel: "#d9a27a", pelo: "#3a2417", peinado: "largo", prenda: "camiseta", ropa: "#f1ece2", pantalon: "#6b5a45", zapatos: "#2b2c31", accesorio: "bandolera" },
    lineas: ["¿Viniste por la pregunta? ¿Dónde empieza un proyecto?",
      "Aquí creemos que empieza en un trazo: mirar el lugar, el clima y la forma como un mismo problema.",
      "En esta sala están los croquis de la carrera y la propuesta para el Auditorio San Benito.",
      "Anima la pieza del centro: el croquis se vuelve volumen y la línea, sombra."] },
  { nombre: "Tomás", rol: "maestro de obra", look: { piel: "#8a5a3b", pelo: "#1d1b22", peinado: "corto", prenda: "buzo", ropa: "#4f8fa8", pantalon: "#1f2d3a", zapatos: "#6b5a45", accesorio: "casco", barba: true },
    lineas: ["¿Cuántas casas caben en una idea? Más de las que crees.",
      "Antes de dibujar el detalle comparábamos volúmenes: alturas, voladizos, giros.",
      "Casa FAM, Casa L, Casa FLP… todas empezaron como cajas apiladas como estas."] },
  { nombre: "Lucía", rol: "asesora de clima", look: { piel: "#f6dcc6", pelo: "#a8753a", peinado: "flequillo", prenda: "camiseta", ropa: "#ffb547", pantalon: "#3f4a5a", zapatos: "#f2efe8", accesorio: "audifonos" },
    lineas: ["¿A qué hora llega la sombra? Esa pregunta decide dónde va una ventana.",
      "El clima también es material de diseño: sol, viento, calor y sonido.",
      "Colegios en Bogotá, hoteles en Antioquia, el edificio científico del Jardín Botánico…",
      "Mueve la hora en la pieza y mira cómo camina la sombra."] },
  { nombre: "Iván", rol: "laboratorista", look: { piel: "#b67c55", pelo: "#1d1b22", peinado: "rizado", prenda: "buzo", ropa: "#8d7bb0", pantalon: "#17191c", zapatos: "#f2b21b", accesorio: "ninguno", gafas: true },
    lineas: ["Una sola regla puede dibujar 63 piezas. ¿Quieres verlo?",
      "En el laboratorio pasábamos del algoritmo a la pieza física: Rhino, Grasshopper y la cortadora.",
      "De aquí salieron propuestas para concursos como Corona Pro Hábitat y el DARP en Bogotá."] },
  { nombre: "Marta", rol: "ingeniera de ribera", look: { piel: "#5e3b26", pelo: "#1d1b22", peinado: "rizado", prenda: "camiseta", ropa: "#6f9a5b", pantalon: "#a59c8c", zapatos: "#4f8fa8", accesorio: "mochila" },
    lineas: ["¿Qué pasa cuando sube el río? Esa es la pregunta de los pueblos de borde.",
      "Un malecón puede ser plaza y muro de protección al mismo tiempo.",
      "Cocorná, Puerto Pizarro, Nuquí… cada río pide una respuesta distinta."] },
  { nombre: "Pixel", rol: "desarrolladora", look: { piel: "#eec3a2", pelo: "#5b6cff", peinado: "despeinado", prenda: "buzo", ropa: "#26282e", pantalon: "#1f2d3a", zapatos: "#c9483c", accesorio: "audifonos" },
    lineas: ["¿Qué hay debajo de un videojuego? Geometría y reglas.",
      "Programar también es una forma de representar el espacio.",
      "Este mismo jardín está hecho así. Pasa la pieza a alambre y lo verás."] },
  { nombre: "Sara", rol: "profesora", look: { piel: "#d9a27a", pelo: "#6b4423", peinado: "largo", prenda: "buzo", ropa: "#c9483c", pantalon: "#3f4a5a", zapatos: "#f2efe8", accesorio: "planos", gafas: true },
    lineas: ["¿Cómo se enseña a ver en tres dimensiones?",
      "Explicar una herramienta obliga a entenderla de nuevo.",
      "Modelación paramétrica, representación digital y diseño: de la nube de puntos a la superficie."] },
  { nombre: "Óscar", rol: "constructor", look: { piel: "#b67c55", pelo: "#a3a8ad", peinado: "rapado", prenda: "camiseta", ropa: "#e8743a", pantalon: "#6b5a45", zapatos: "#2b2c31", accesorio: "casco", barba: true },
    lineas: ["¿Dónde termina la vida de un edificio? Casi nunca donde creemos.",
      "Cada material tiene una historia antes y después de la obra.",
      "Recorre el ciclo en la pieza: materiales, construcción, uso y fin de vida."] },
  { nombre: "Camila", rol: "coordinadora BIM", look: { piel: "#eec3a2", pelo: "#17161b", peinado: "flequillo", prenda: "camiseta", ropa: "#4f8fa8", pantalon: "#17191c", zapatos: "#f2b21b", accesorio: "bandolera" },
    lineas: ["¿Qué hay dentro de un modelo? Todo lo que tiene que encajar.",
      "Estructura, fachada, instalaciones: coordinar es que nada choque en la obra.",
      "Ynikó, CROMA, Hygge, NUTHAMI, COCOON… proyectos que pasaron por esta torre."] },
  { nombre: "Andrés", rol: "moderador", look: { piel: "#8a5a3b", pelo: "#3a2417", peinado: "despeinado", prenda: "buzo", ropa: "#6f9a5b", pantalon: "#3f4a5a", zapatos: "#f2efe8", accesorio: "ninguno" },
    lineas: ["¿Cómo viaja una idea? De persona en persona.",
      "Foros, cátedras y encuentros: BIM y bioclimática, fabricación y diseño generativo.",
      "Aumenta las conexiones en la pieza y mira cómo se propaga."] },
  { nombre: "Elena", rol: "investigadora", look: { piel: "#f6dcc6", pelo: "#3a2417", peinado: "largo", prenda: "camiseta", ropa: "#8d7bb0", pantalon: "#1f2d3a", zapatos: "#4f8fa8", accesorio: "mochila", gafas: true },
    lineas: ["¿Cuándo sale el sol dentro del modelo?",
      "Cuando el clima entra al BIM desde el principio, las decisiones aparecen solas.",
      "De esa pregunta nació BIOBIM. Levanta el sol de la pieza."] },
  { nombre: "Juana", rol: "educadora", look: { piel: "#d9a27a", pelo: "#1d1b22", peinado: "rizado", prenda: "buzo", ropa: "#ffb547", pantalon: "#b8423a", zapatos: "#f2efe8", accesorio: "ninguno" },
    lineas: ["¿Cómo crece una escuela? Alrededor de un patio con sombra.",
      "Jardines para la primera infancia: aulas ventiladas, luz suave y juego.",
      "Y parques públicos en Moñitos, junto al mar."] },
  { nombre: "El farero", rol: "guardián del faro", look: { piel: "#b67c55", pelo: "#a3a8ad", peinado: "corto", prenda: "buzo", ropa: "#1f2d3a", pantalon: "#6b5a45", zapatos: "#2b2c31", accesorio: "ninguno", barba: true, gafas: true },
    lineas: ["¿Se puede enseñar a diseñar con el clima?",
      "Esa pregunta sigue abierta. Este jardín es parte de la respuesta.",
      "Gracias por recorrerlo. Las herramientas de BIOBIM Lab te esperan al volver."] },
];

// Visitantes que pasean por la pasarela
export const VISITANTES = [
  { look: { piel: "#eec3a2", pelo: "#6b4423", peinado: "flequillo", prenda: "camiseta", ropa: "#c9483c", pierna: "bermuda", pantalon: "#3f4a5a", zapatos: "#f2efe8", accesorio: "mochila" } },
  { look: { piel: "#8a5a3b", pelo: "#1d1b22", peinado: "rizado", prenda: "buzo", ropa: "#f1ece2", pantalon: "#1f2d3a", zapatos: "#f2b21b", accesorio: "audifonos" } },
  { look: { piel: "#f6dcc6", pelo: "#d8bf8a", peinado: "largo", prenda: "camiseta", ropa: "#6f9a5b", pierna: "bermuda", pantalon: "#a59c8c", zapatos: "#4f8fa8", accesorio: "bandolera" } },
  { look: { piel: "#b67c55", pelo: "#3a2417", peinado: "corto", prenda: "buzo", ropa: "#4f8fa8", pantalon: "#17191c", zapatos: "#c9483c", accesorio: "ninguno", gafas: true } },
  { look: { piel: "#d9a27a", pelo: "#1d1b22", peinado: "despeinado", prenda: "camiseta", ropa: "#ffb547", pantalon: "#6b5a45", zapatos: "#2b2c31", accesorio: "planos" } },
  { look: { piel: "#5e3b26", pelo: "#1d1b22", peinado: "rapado", prenda: "buzo", ropa: "#8d7bb0", pierna: "bermuda", pantalon: "#3f4a5a", zapatos: "#f2efe8", accesorio: "mochila" } },
];
export const CHARLA = [
  "¡Qué buen día para caminar por aquí arriba!",
  "¿Ya viste la quebrada? Pasa justo debajo de la pasarela.",
  "Dicen que en la sala del faro está la última pregunta.",
  "Me perdí buscando la sala de las casas apiladas.",
  "Los guayacanes están florecidos, ¿viste?",
  "Si te acercas a los paneles de las salas, los puedes leer en grande.",
  "Cada sala tiene una pieza que se mueve. Pruébalas.",
  "Vengo todos los días. Siempre encuentro algo nuevo.",
];

/* ---------------- Cuadro de diálogo ---------------- */
// Pestaña con el nombre, texto que se escribe letra a letra y botón ▶
export function createDialog(el, { onOpen, onClose, tick } = {}) {
  el.innerHTML = `<div class="tr-dlg-name"></div><p class="tr-dlg-text" aria-live="polite"></p><button class="tr-dlg-next" type="button" aria-label="Continuar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>`;
  const nameEl = el.querySelector(".tr-dlg-name"), textEl = el.querySelector(".tr-dlg-text"), btn = el.querySelector(".tr-dlg-next");
  let lines = [], i = 0, done = null, typing = null, full = "", open = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function show() {
    const L = lines[i];
    nameEl.textContent = L.who; nameEl.style.setProperty("--c", L.c || "var(--flow)");
    full = L.text; textEl.textContent = "";
    clearInterval(typing);
    if (reduce) { textEl.textContent = full; return; }
    let n = 0;
    typing = setInterval(() => {
      n += 2; textEl.textContent = full.slice(0, n);
      if (n % 6 === 0 && tick) tick();
      if (n >= full.length) { clearInterval(typing); typing = null; }
    }, 22);
  }
  function next() {
    if (!open) return;
    if (typing) { clearInterval(typing); typing = null; textEl.textContent = full; return; }
    i++;
    if (i >= lines.length) return close();
    show();
  }
  function close() {
    if (!open) return;
    open = false; clearInterval(typing); typing = null;
    el.classList.remove("is-on");
    setTimeout(() => { if (!open) el.hidden = true; }, 250);
    if (onClose) onClose();
    const d = done; done = null; if (d) d();
  }
  function start(list, cb) {
    lines = list; i = 0; done = cb || null; open = true;
    el.hidden = false; void el.offsetWidth; el.classList.add("is-on");
    if (onOpen) onOpen();
    show();
    btn.focus({ preventScroll: true });
  }
  btn.addEventListener("click", (e) => { e.stopPropagation(); next(); });
  el.addEventListener("click", next);
  return { start, next, close, get open() { return open; } };
}
