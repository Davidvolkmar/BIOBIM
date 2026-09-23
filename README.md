# BIOBIM Lab

Laboratorio web de herramientas bioclimáticas para estudiantes de arquitectura e ingeniería y portafolio profesional de **David Volkmar Vélez**, arquitecto y magíster en Bioclimática.

El sitio explica rápido el proceso **BIOBIM**, un modelo de enseñanza-aprendizaje que lleva la simulación bioclimática al inicio del diseño, dentro de un flujo BIM continuo. También reúne el paquete de herramientas y presenta la trayectoria profesional e investigativa del autor.

---

## Contenido del sitio

El sitio tiene tres pestañas:

| Pestaña | Qué contiene |
|---|---|
| **Laboratorio** | Carta solar de Medellín animada. El problema de la "comprobación tardía" y la curva de esfuerzo de diseño. El proceso BIOBIM en 3 etapas cíclicas, comparado con el proceso tradicional. La investigación de maestría a fondo y la propuesta doctoral. |
| **Herramientas** | Ruta de implementación de las 6 herramientas. Las 4 fases del proyecto con su alcance, resultados y criterios bioclimáticos. Mapa de implementación, tabla de criterios por fase, catálogo y ecosistema de software de referencia. |
| **Portafolio** | Perfil, trayectoria filtrable, proyectos, ponencias, reconocimientos, descarga de la hoja de vida y contacto. |

### Las 6 herramientas y su orden de implementación

| Paso | Herramienta | Fase principal | Usa resultados de |
|---|---|---|---|
| 1 | Análisis del lugar | Prefactibilidad | — |
| 2 | Ángulos solares | Idea básica · Anteproyecto | 1 |
| 3 | Ventilación | Idea básica · Anteproyecto | 1, 2 |
| 4 | CFD | Anteproyecto | 3 |
| 5 | Térmico | Anteproyecto · Proyecto | 2, 3, 4 |
| 6 | Acústico | Anteproyecto · Proyecto | 3, 5 |

El orden sigue tres criterios:
- de lo general a lo específico;
- de menor a mayor exigencia técnica;
- cada paso usa los resultados del anterior.

---

## Estructura del proyecto

```
PAGINA/
├── index.html                  Página única con las 3 vistas
├── README.md
└── assets/
    ├── 2026_dvv.png            Retrato (Laboratorio y Portafolio)
    ├── css/
    │   └── styles.css          Estilos, temas claro/oscuro y responsive
    ├── docs/
    │   └── Hoja_de_vida_David_Volkmar_Velez_2026.pdf
    └── js/
        ├── tools-config.js     ← Configuración de las herramientas (links, orden, fases)
        └── main.js             Interacciones y datos del portafolio
```

Es un sitio **estático**: HTML, CSS y JavaScript sin frameworks ni proceso de compilación. La única dependencia externa son las fuentes de Google Fonts (Space Grotesk, Inter y JetBrains Mono).

---

## Ver el sitio en local

**Opción rápida:** abre `index.html` con doble clic en el navegador.

**Recomendado:** sírvelo con un servidor local para que las rutas y la descarga del PDF funcionen igual que en producción. Usa cualquiera de estos comandos desde la carpeta del proyecto:

```bash
npx serve .
```

```bash
python -m http.server 5500
```

Luego abre `http://localhost:5500` (o el puerto que indique `serve`).

---

## Activar una herramienta (pegar su link)

Edita **`assets/js/tools-config.js`** y pega el enlace en el campo `url` de la herramienta:

```js
{
  id: "solar",
  nombre: "Ángulos solares",
  url: "https://mi-herramienta-solar.web.app",   // ← aquí
  ...
}
```

- Con `url` vacío (`""`) la tarjeta aparece como **Próximamente** y el botón queda deshabilitado.
- Con un enlace, la tarjeta aparece como **Disponible** y el botón **Abrir herramienta** la abre en una pestaña nueva.

### Campos de cada herramienta

| Campo | Descripción |
|---|---|
| `url` | Enlace de la herramienta. |
| `orden` | Posición en la ruta de implementación (1 = primera). |
| `usa` | Ids de las herramientas cuyos resultados necesita. Ninguna herramienta debe ir antes que las que usa. |
| `entra` | Fases donde es de uso principal. |
| `puede` | Fases donde puede entrar como apoyo. |
| `etapa` | Etapa BIOBIM: 1 Requerimientos, 2 Estrategias, 3 Montaje y validación. |
| `criterios` | Criterios bioclimáticos que trabaja (`orientacion`, `soleamiento`, `clima`, `ventilacion`, `iluminacion`, `temperatura`, `acustica`, `materiales`, `energia`, `certificacion`). |
| `color` | Color de la herramienta en toda la interfaz. |
| `resumen`, `descripcion`, `porque`, `entradas`, `salidas`, `aprendes` | Textos de la tarjeta y de la ventana de detalle. |

Índices de fase usados en `entra` y `puede`:
- `0` Prefactibilidad
- `1` Idea básica
- `2` Anteproyecto
- `3` Proyecto

La ruta, el mapa, la tabla de criterios, el catálogo y el adelanto del Laboratorio se generan solos a partir de este archivo.

---

## Editar otros contenidos

| Qué | Dónde |
|---|---|
| Trayectoria (línea de tiempo) | `main.js` → arreglo `TIMELINE` |
| Proyectos | `main.js` → arreglo `PROJECTS` (etiquetas: `bio`, `bim`, `urb`, `edu`) |
| Ponencias y eventos | `main.js` → arreglo `TALKS` |
| Fases del proyecto (alcance y resultados) | `main.js` → arreglo `PHASES` |
| Etapas del proceso BIOBIM | `main.js` → arreglo `STAGES` |
| Metodología y cronograma de la maestría | `main.js` → arreglo `STEPS` dentro de la función `master()` |
| Textos fijos, reconocimientos y software | `index.html` |
| Colores y tipografías | `styles.css` → variables en `:root` |

### Carta solar

La carta solar calcula la posición real del sol para Medellín (latitud 6,25° N). Recorre automáticamente 3 fechas clave (21 jun, 21 mar y 21 dic) a 3 horas clave (09:00, 12:00 y 15:00). Para cambiar las horas o el ritmo, edita estas constantes al inicio de la función `sunPath()` en `main.js`:

```js
const KEY_DAYS = [172, 80, 355];   // día del año: 21 jun, 21 mar, 21 dic
const KEY_HOURS = [9, 12, 15];
const HOLD = 0.9;                  // segundos quieto en cada punto
const MOVE = 0.55;                 // segundos de transición
```

### Hoja de vida y retrato

- **Hoja de vida:** reemplaza `assets/docs/Hoja_de_vida_David_Volkmar_Velez_2026.pdf` por la versión nueva con el **mismo nombre** y no hay que tocar el código.
- **Retrato:** reemplaza `assets/2026_dvv.png` con el mismo nombre. Para la web se recomienda exportarlo a unos 600 × 600 px en `.webp` o `.jpg`; el actual pesa 3,6 MB.

---

## Publicar con GitHub Pages

1. Crea un repositorio y sube el contenido de esta carpeta, con `index.html` en la raíz.
2. En GitHub ve a **Settings → Pages**.
3. En **Source** elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
4. En unos minutos el sitio estará en `https://<usuario>.github.io/<repositorio>/`.

Como todas las rutas son relativas, el sitio también funciona sin cambios en Netlify, Vercel o cualquier hosting estático.

### Rutas relativas (importante al editar)

Todos los archivos se enlazan con rutas **relativas a `index.html`**, sin barra inicial:

```html
<link rel="stylesheet" href="assets/css/styles.css" />
<img src="assets/2026_dvv.png" />
<a href="assets/docs/Hoja_de_vida_David_Volkmar_Velez_2026.pdf" download>
```

Así el sitio carga igual en local, en la raíz de un dominio o en una subcarpeta como `usuario.github.io/repositorio/`. Al agregar archivos nuevos:

- **No** uses rutas que empiecen con `/`, con `C:\` ni con `file:`. Una ruta con `/` inicial apunta a la raíz del dominio y se rompe en GitHub Pages.
- Respeta **mayúsculas y minúsculas** exactas y evita espacios en los nombres. Windows no los distingue, pero los servidores Linux sí: `Foto.PNG` ≠ `foto.png`.
- Guarda todo dentro de `assets/`, en la subcarpeta que corresponda.

### Qué no subir al repositorio

Crea un archivo `.gitignore` con:

```
INVESTIGACION/
.claude/
```

- `INVESTIGACION/` contiene los documentos fuente (borrador de tesis, propuesta doctoral y hoja de vida original). El sitio no los usa.
- `.claude/` es configuración local del entorno de desarrollo.

> **Privacidad:** antes de publicar, revisa que la hoja de vida en `assets/docs/` no incluya datos que no quieras hacer públicos, por ejemplo los teléfonos y correos de las referencias. En un repositorio público ese archivo queda indexable.

---

## Características técnicas

- **Tres vistas en una sola página**, con navegación por URL: `#inicio`, `#herramientas`, `#portafolio` y anclas internas como `#fases`, `#mapa` o `#investigacion`.
- **Tema claro y oscuro:** respeta la preferencia del sistema y se puede cambiar con el botón del menú.
- **Responsive:** funciona desde teléfonos de 360 px hasta pantallas de escritorio.
- **Accesibilidad:** controles con roles ARIA y navegación por teclado. Respeta la preferencia de *reducir movimiento*, excepto en la carta solar, que siempre está animada.
- **Sin dependencias de JavaScript:** no usa librerías externas.

---

## Autor

**David Volkmar Vélez**
Arquitecto · Especialista en Construcción Sostenible · Magíster en Bioclimática · Profesional Avanzado CASA (CCCS)
Medellín, Colombia · davidvolkmar9@gmail.com

### Investigación de base

- Volkmar Vélez, D. (2024). *Ensayo de una metodología de integración de estrategias bioclimáticas en el proceso de diseño arquitectónico a través de BIM* [Tesis de maestría, Universidad de San Buenaventura, Medellín].
- Volkmar Vélez, D. *Modelo de enseñanza-aprendizaje basado en una metodología de integración de estrategias bioclimáticas en el proceso de diseño a través de BIM* [Propuesta doctoral, Doctorado en Ingeniería – Sistemas e Informática, Universidad Nacional de Colombia, Sede Medellín].
