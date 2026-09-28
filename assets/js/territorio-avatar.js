/* =====================================================================
   PERSONAJE · territorio.html
   ---------------------------------------------------------------------
   Personaje de ilustración 3D (≈ 1,72 m), en la línea de los juegos
   pintados a mano: anatomía modelada por secciones (torso, cadera,
   extremidades con codos y rodillas), cabeza esculpida (cráneo,
   mandíbula, nariz, orejas) con la cara pintada en una textura, pelo
   hecho de mechones curvos, ropa con dobladillos y tenis gruesos.
   Todo es geometría propia, sin modelos externos.

   Sombreado: material "cel" propio (Lambert modificado). Dos tonos
   con borde suave, sombra teñida hacia el frío (no negra), brillo de
   contorno (rim) y contorno de tinta (casco invertido). Recibe las
   sombras del sol del territorio.

   Se personaliza (piel, ojos, peinado, pelo, barba, gafas, prenda,
   pierna, colores y accesorio) y se anima por código: caminar con
   rodillas y codos, respirar, mirar, saludar y saltar.
   ===================================================================== */

export const OPCIONES = {
  piel: ["#f6dcc6", "#eec3a2", "#d9a27a", "#b67c55", "#8a5a3b", "#5e3b26"],
  ojos: ["#3a2a20", "#3b6f7a", "#2f4f8a", "#4f7a3b", "#1d1b1f"],
  pelo: ["#1d1b22", "#3a2417", "#6b4423", "#a8753a", "#d8bf8a", "#a3a8ad"],
  ropa: ["#26282e", "#f1ece2", "#e8743a", "#c9483c", "#ffb547", "#6f9a5b", "#4f8fa8", "#5b6cff", "#8d7bb0"],
  pantalon: ["#3f4a5a", "#b8423a", "#1f2d3a", "#17191c", "#6b5a45", "#a59c8c"],
  zapatos: ["#f2b21b", "#f2efe8", "#2b2c31", "#c9483c", "#4f8fa8"],
  peinado: [["despeinado", "Despeinado"], ["flequillo", "Flequillo"], ["rizado", "Rizado"], ["corto", "Corto"], ["largo", "Largo"], ["rapado", "Rapado"]],
  prenda: [["camiseta", "Camiseta"], ["buzo", "Buzo ancho"]],
  pierna: [["pantalon", "Pantalón"], ["bermuda", "Bermuda"]],
  accesorio: [["mochila", "Mochila"], ["audifonos", "Audífonos"], ["bandolera", "Bandolera"], ["ninguno", "Ninguno"], ["casco", "Casco de obra"], ["planos", "Portaplanos"]],
};

export const DAVID = {
  piel: "#eec3a2", ojos: "#3a2a20", pelo: "#1d1b22", peinado: "despeinado", barba: false, gafas: false,
  prenda: "camiseta", ropa: "#26282e", pierna: "pantalon", pantalon: "#3f4a5a", zapatos: "#f2b21b", accesorio: "mochila",
};

export function aleatorio() {
  const pick = (a) => a[(Math.random() * a.length) | 0];
  return {
    piel: pick(OPCIONES.piel), ojos: pick(OPCIONES.ojos), pelo: pick(OPCIONES.pelo), peinado: pick(OPCIONES.peinado)[0],
    barba: Math.random() < 0.3, gafas: Math.random() < 0.35, prenda: pick(OPCIONES.prenda)[0], ropa: pick(OPCIONES.ropa),
    pierna: pick(OPCIONES.pierna)[0], pantalon: pick(OPCIONES.pantalon), zapatos: pick(OPCIONES.zapatos), accesorio: pick(OPCIONES.accesorio)[0],
  };
}

export function createAvatar(THREE, look = DAVID, opts = {}) {
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const bend = opts.bend || { value: 0 }, bendC = opts.bendC || { value: new THREE.Vector2() };

  /* ---------------- Materiales ---------------- */
  const RIM = new THREE.Color("#fff3dc"), SHADE = new THREE.Vector3(0.66, 0.64, 0.84);   // sombra: el color base teñido hacia el frío
  const ALPHA = (opts.maskAlpha ?? 0.38).toFixed(2);          // 0,38: el render final conserva este sombreado
  const mats = [];
  // Material cel: dos tonos con borde suave, sombra teñida y brillo de contorno
  function cel(hex, extra = {}) {
    const m = new THREE.MeshLambertMaterial({ color: hex, ...extra });
    const U = { uShadow: { value: SHADE }, uRim: { value: RIM }, uBend: bend, uBendC: bendC };
    m.userData.keepBlend = true;                               // el territorio no reescribe su sombreado
    m.userData.cel = U;
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = "uniform float uBend; uniform vec2 uBendC;\n" + sh.vertexShader.replace("#include <project_vertex>", `
        vec4 mvPosition = modelMatrix * vec4( transformed, 1.0 );
        vec2 bendD = mvPosition.xz - uBendC;
        mvPosition.y -= dot( bendD, bendD ) * uBend;
        mvPosition = viewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`);
      sh.fragmentShader = "uniform vec3 uShadow; uniform vec3 uRim;\n" + sh.fragmentShader.replace("#include <opaque_fragment>", `
        {
          vec3 W = vec3( 0.299, 0.587, 0.114 );
          float ld = max( dot( diffuseColor.rgb, W ), 1e-3 );
          float amb = dot( reflectedLight.indirectDiffuse, W ) / ld;
          float dir = dot( reflectedLight.directDiffuse, W ) / ld;
          float k = smoothstep( 0.22, 0.34, dir / max( amb, 1e-3 ) );
          vec3 lit = diffuseColor.rgb * ( amb + mix( dir, amb * 1.35, 0.65 ) );
          vec3 shd = diffuseColor.rgb * uShadow * amb * 1.3;
          vec3 col = mix( shd, lit, k );
          float fres = 1.0 - max( dot( normal, normalize( vViewPosition ) ), 0.0 );
          col += uRim * smoothstep( 0.66, 0.74, fres ) * ( 0.1 + 0.22 * k ) * ( amb + dir );
          outgoingLight = col + totalEmissiveRadiance;
        }
        #include <opaque_fragment>
        gl_FragColor.a = ${ALPHA};`);
    };
    m.customProgramCacheKey = () => "cel";
    const setC = (h) => m.color.set(h);
    setC(hex); m.userData.setC = setC;
    mats.push(m);
    return m;
  }
  // Contorno de tinta: casco invertido. Alfa 0,2: el render final lo pinta con la tinta exacta
  const inkMat = new THREE.ShaderMaterial({
    uniforms: { w: { value: 0.0065 }, uBend: bend, uBendC: bendC },
    vertexShader: "uniform float w; uniform float uBend; uniform vec2 uBendC; void main() { vec4 p = modelMatrix * vec4(position + normal * w, 1.0); vec2 d = p.xz - uBendC; p.y -= dot(d, d) * uBend; gl_Position = projectionMatrix * viewMatrix * p; }",
    fragmentShader: "void main() { gl_FragColor = vec4(0.075, 0.07, 0.085, " + (opts.maskAlpha >= 1 ? "1.0" : "0.2") + "); }",
    side: THREE.BackSide,
  });

  // Cara pintada: textura equirectangular sobre la cabeza (u = 0,25 mira al frente)
  const FR = opts.faceRes || 2048;                                  // resolución de la cara (los secundarios usan menos)
  const faceCv = document.createElement("canvas"); faceCv.width = FR; faceCv.height = FR / 2;
  const faceTex = new THREE.CanvasTexture(faceCv);
  faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.anisotropy = 8;

  const M = {
    skin: cel("#eec3a2"), face: cel("#ffffff", { map: faceTex }), lip: cel("#d98f7d"),
    hair: cel("#1d1b22"), top: cel("#26282e"), trim: cel("#1c1d22"), pants: cel("#3f4a5a"), hem: cel("#333d4b"),
    shoe: cel("#f2b21b"), shoe2: cel("#d99a12"), sole: cel("#f4f1ea"), lace: cel("#fff8e6"), sock: cel("#1f2024"),
    strap: cel("#e9e4d8"), bag: cel("#e9e4d8"), bag2: cel("#cfc8b8"), metal: cel("#2b2c31"), hat: cel("#ffb547"),
    tube: cel("#b58cff"), cup: cel("#f1ece2"), frame: cel("#26242a"),
  };

  /* ---------------- Geometría ---------------- */
  const flip = (idx) => { const o = []; for (let i = 0; i < idx.length; i += 3) o.push(idx[i], idx[i + 2], idx[i + 1]); return o; };
  // Loft: secciones superelípticas a lo largo de y (w: medio ancho, d: medio fondo, z: corrimiento)
  function loft(secs, radial = 28, p = 2.2, caps = [true, true]) {
    const pos = [], idx = [], n = secs.length;
    for (const s of secs) {
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / p) * s.w, z = Math.sign(sn) * Math.pow(Math.abs(sn), 2 / p) * s.d;
        pos.push((s.x || 0) + x, s.y, (s.z || 0) + z);
      }
    }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = a + radial, d = b + radial;
      idx.push(a, c, b, b, c, d);
    }
    const up = secs[n - 1].y > secs[0].y;
    const cap = (i, top) => {
      const s = secs[i], ci = pos.length / 3; pos.push(s.x || 0, s.y, s.z || 0);
      for (let j = 0; j < radial; j++) { const a = i * radial + j, b = i * radial + ((j + 1) % radial); if (top) idx.push(b, a, ci); else idx.push(a, b, ci); }
    };
    if (caps[0]) cap(0, false); if (caps[1]) cap(n - 1, true);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(up ? idx : flip(idx));
    g.computeVertexNormals();
    return g;
  }
  const ellip = (rx, ry, rz, ws = 20, hs = 14) => new THREE.SphereGeometry(1, ws, hs).scale(rx, ry, rz);

  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const mesh = (g, geo, mat, x = 0, y = 0, z = 0, ink = true) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (ink) { const o = new THREE.Mesh(geo, inkMat); o.castShadow = false; o.raycast = () => {}; m.add(o); }
    return m;
  };

  /* ---------------- Piernas ---------------- */
  const hips = new THREE.Group(); hips.position.y = 0.9; body.add(hips);
  mesh(hips, loft([{ y: -0.1, w: 0.15, d: 0.1 }, { y: -0.02, w: 0.162, d: 0.106 }, { y: 0.07, w: 0.158, d: 0.1 }, { y: 0.13, w: 0.15, d: 0.096 }], 30, 2.4), M.pants);
  mesh(hips, loft([{ y: 0.095, w: 0.157, d: 0.1 }, { y: 0.13, w: 0.154, d: 0.099 }], 30, 2.4, [false, false]), M.hem, 0, 0, 0, false);
  function leg(sx) {
    const L = new THREE.Group(); L.position.set(sx * 0.085, 0, 0); hips.add(L);
    mesh(L, loft([{ y: 0.02, w: 0.084, d: 0.09 }, { y: -0.12, w: 0.08, d: 0.084 }, { y: -0.3, w: 0.066, d: 0.07 }, { y: -0.42, w: 0.06, d: 0.064 }], 22, 2.1), M.pants);
    const knee = new THREE.Group(); knee.position.y = -0.42; L.add(knee);
    const shinP = mesh(knee, loft([{ y: 0.01, w: 0.061, d: 0.065 }, { y: -0.14, w: 0.058, d: 0.062 }, { y: -0.3, w: 0.06, d: 0.064 }, { y: -0.36, w: 0.066, d: 0.07 }], 22, 2.1), M.pants);
    const cuffP = mesh(knee, loft([{ y: -0.33, w: 0.068, d: 0.072 }, { y: -0.365, w: 0.069, d: 0.073 }], 22, 2.1, [false, false]), M.hem, 0, 0, 0, false);
    const hemB = mesh(L, loft([{ y: -0.34, w: 0.078, d: 0.082 }, { y: -0.39, w: 0.08, d: 0.084 }], 22, 2.1, [false, false]), M.hem);
    const shinS = mesh(knee, loft([{ y: 0.03, w: 0.046, d: 0.05 }, { y: -0.1, w: 0.047, d: 0.054 }, { y: -0.26, w: 0.036, d: 0.04 }, { y: -0.35, w: 0.033, d: 0.036 }], 18, 2), M.skin);
    const sock = mesh(knee, loft([{ y: -0.27, w: 0.038, d: 0.042 }, { y: -0.37, w: 0.036, d: 0.04 }], 18, 2, [false, false]), M.sock);
    // Tenis gruesos: capellada, puntera, lengüeta, cordones y suela
    const shoe = new THREE.Group(); shoe.position.y = -0.39; knee.add(shoe);
    const upG = loft([{ y: -0.078, w: 0.046, d: 0.05, z: -0.02 }, { y: -0.04, w: 0.054, d: 0.064, z: -0.022 }, { y: 0.03, w: 0.058, d: 0.056, z: -0.008 }, { y: 0.1, w: 0.056, d: 0.046, z: 0.004 }, { y: 0.16, w: 0.046, d: 0.036, z: 0.012 }, { y: 0.195, w: 0.03, d: 0.024, z: 0.016 }], 22, 2.6);
    upG.rotateX(Math.PI / 2);
    mesh(shoe, upG, M.shoe, 0, -0.03, 0);
    mesh(shoe, ellip(0.05, 0.034, 0.05, 16, 10), M.shoe2, 0, -0.05, 0.15);
    const tongue = mesh(shoe, loft([{ y: 0.0, w: 0.03, d: 0.012 }, { y: 0.075, w: 0.028, d: 0.01 }], 12, 2.4), M.lace, 0, -0.01, 0.035); tongue.rotation.x = -0.35;
    for (let k = 0; k < 3; k++) { const l = mesh(shoe, new THREE.BoxGeometry(0.05, 0.008, 0.012), M.lace, 0, -0.01 - k * 0.011, 0.06 + k * 0.03, false); l.rotation.x = 0.25; }
    const solShape = new THREE.Shape(); solShape.absellipse(0, 0, 0.062, 0.14, 0, Math.PI * 2);
    const sol = new THREE.ExtrudeGeometry(solShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 28 });
    sol.rotateX(Math.PI / 2); sol.translate(0, -0.055, 0.055);
    mesh(shoe, sol, M.sole);
    return { L, knee, shinP, cuffP, hemB, shinS, sock };
  }
  const legL = leg(-1), legR = leg(1);

  /* ---------------- Torso y brazos ---------------- */
  const spine = new THREE.Group(); spine.position.y = 0.98; body.add(spine);
  const torsoSecs = (k) => [
    { y: -0.12, w: 0.158 * k, d: 0.106 * k }, { y: -0.04, w: 0.156 * k, d: 0.103 * k }, { y: 0.07, w: 0.148 * k, d: 0.098 * k, z: 0.004 },
    { y: 0.19, w: 0.165 * k, d: 0.108 * k, z: 0.01 }, { y: 0.29, w: 0.178 * k, d: 0.112 * k, z: 0.008 }, { y: 0.36, w: 0.182 * k, d: 0.104 * k },
    { y: 0.41, w: 0.15 * k, d: 0.09 * k }, { y: 0.445, w: 0.085, d: 0.066 }, { y: 0.455, w: 0.056, d: 0.05 },
  ];
  const shirt = mesh(spine, loft(torsoSecs(1), 34, 2.5), M.top);
  const sweat = mesh(spine, loft(torsoSecs(1.12).map((s, i) => (i === 0 ? { ...s, y: -0.15 } : s)), 34, 2.5), M.top);
  const sweatHem = mesh(spine, loft([{ y: -0.16, w: 0.174, d: 0.12 }, { y: -0.1, w: 0.178, d: 0.122 }], 34, 2.5, [false, false]), M.trim);
  const shirtHem = mesh(spine, loft([{ y: -0.125, w: 0.162, d: 0.11 }, { y: -0.105, w: 0.162, d: 0.11 }], 34, 2.5, [false, false]), M.trim, 0, 0, 0, false);
  const collar = mesh(spine, new THREE.TorusGeometry(0.058, 0.012, 8, 28), M.trim, 0, 0.452, 0.004, false); collar.rotation.x = Math.PI / 2; collar.scale.set(1, 0.85, 1);
  mesh(spine, loft([{ y: 0.42, w: 0.056, d: 0.052 }, { y: 0.48, w: 0.05, d: 0.048 }, { y: 0.53, w: 0.048, d: 0.046 }], 16, 2), M.skin);
  const badge = mesh(spine, new THREE.BoxGeometry(0.07, 0.07, 0.01), M.hat, 0, 0.27, 0.114, false);

  function arm(sx) {
    const S = new THREE.Group(); S.position.set(sx * 0.178, 0.37, 0); spine.add(S);
    const upper = mesh(S, loft([{ y: 0.03, w: 0.05, d: 0.052 }, { y: -0.1, w: 0.046, d: 0.047 }, { y: -0.27, w: 0.038, d: 0.04 }], 18, 2), M.skin);
    mesh(S, ellip(0.056, 0.05, 0.058, 16, 12), M.top, -sx * 0.008, 0.0, 0);
    const sleeveT = mesh(S, loft([{ y: 0.04, w: 0.062, d: 0.064 }, { y: -0.08, w: 0.064, d: 0.064 }, { y: -0.15, w: 0.066, d: 0.066 }], 20, 2, [false, false]), M.top);
    const sleeveL = mesh(S, loft([{ y: 0.04, w: 0.07, d: 0.072 }, { y: -0.14, w: 0.066, d: 0.068 }, { y: -0.28, w: 0.06, d: 0.062 }], 20, 2, [false, false]), M.top);
    const elbow = new THREE.Group(); elbow.position.y = -0.27; S.add(elbow);
    const fore = mesh(elbow, loft([{ y: 0.015, w: 0.038, d: 0.04 }, { y: -0.1, w: 0.037, d: 0.035 }, { y: -0.23, w: 0.029, d: 0.025 }], 16, 2), M.skin);
    const foreL = mesh(elbow, loft([{ y: 0.02, w: 0.061, d: 0.063 }, { y: -0.14, w: 0.057, d: 0.056 }, { y: -0.2, w: 0.054, d: 0.052 }], 20, 2, [false, false]), M.top);
    const cuff = mesh(elbow, loft([{ y: -0.19, w: 0.046, d: 0.044 }, { y: -0.235, w: 0.043, d: 0.041 }], 18, 2, [false, false]), M.trim);
    // Mano: palma, dedos juntos y pulgar
    const hand = new THREE.Group(); hand.position.y = -0.245; elbow.add(hand);
    mesh(hand, ellip(0.026, 0.042, 0.016, 12, 10), M.skin, 0, -0.03, 0);
    mesh(hand, ellip(0.023, 0.03, 0.014, 12, 8), M.skin, sx * 0.002, -0.07, 0.004);
    const th = mesh(hand, ellip(0.01, 0.026, 0.01, 8, 6), M.skin, 0, -0.035, 0.018); th.rotation.x = 0.5;
    return { S, elbow, upper, sleeveT, sleeveL, fore, foreL, cuff };
  }
  const armL = arm(-1), armR = arm(1);

  /* ---------------- Cabeza ---------------- */
  const head = new THREE.Group(); head.position.y = 0.485; head.scale.setScalar(1.16); spine.add(head);
  const HX = 0.118, HY = 0.138, HZ = 0.13, HC = 0.12;                // semiejes y centro del cráneo
  const skullGeo = new THREE.SphereGeometry(1, 64, 48);
  {
    const p = skullGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const low = Math.max(0, -y), jaw = Math.pow(low, 1.4);
      x *= 1 - 0.22 * jaw; z *= 1 - 0.08 * jaw;                        // mandíbula y mentón
      if (z > 0) z += 0.05 * Math.pow(low, 0.8) * Math.max(0, 1 - Math.abs(x) * 2);
      if (z < 0) z *= 1.06 - 0.12 * low;                               // occipital
      x *= 1 - 0.06 * Math.max(0, y);                                  // sienes
      const nd = Math.exp(-((x / 0.12) ** 2 + ((y + 0.16) / 0.13) ** 2));   // nariz
      if (z > 0.7) z += 0.1 * nd;
      p.setXYZ(i, x * HX, y * HY + HC, z * HZ);
    }
    skullGeo.computeVertexNormals();
  }
  mesh(head, skullGeo, M.face);
  for (const sx of [-1, 1]) {
    const e = mesh(head, ellip(0.022, 0.034, 0.014, 14, 10), M.skin, sx * 0.114, HC - 0.005, -0.008); e.rotation.y = sx * 0.3;
    mesh(head, ellip(0.011, 0.019, 0.006, 10, 8), M.lip, sx * 0.121, HC - 0.005, -0.004, false);
  }

  function drawFace() {
    const x = faceCv.getContext("2d"), W = 2048, H = 1024, K = W / (Math.PI * 2);
    x.setTransform(FR / 2048, 0, 0, FR / 2048, 0, 0);
    const P = (a, b) => [W * 0.25 + a * K, H / 2 - b * K];
    x.fillStyle = look.piel; x.fillRect(0, 0, W, H);
    const ink = "#221c24";
    const dark = "#" + new THREE.Color(look.piel).multiplyScalar(0.8).lerp(new THREE.Color("#7a4a5a"), 0.2).getHexString();
    // sombra pintada bajo el pelo
    { const [, cy] = P(0, 0.62); const g = x.createLinearGradient(0, cy - 40, 0, cy + 90); g.addColorStop(0, dark); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.globalAlpha = 0.55; x.fillRect(0, 0, W, cy + 90); x.globalAlpha = 1; }
    // rubor
    for (const sx of [-1, 1]) {
      const [cx, cy] = P(sx * 0.62, -0.28);
      const gr = x.createRadialGradient(cx, cy, 4, cx, cy, 60); gr.addColorStop(0, "rgba(232,120,118,0.5)"); gr.addColorStop(1, "rgba(232,120,118,0)");
      x.fillStyle = gr; x.beginPath(); x.ellipse(cx, cy, 64, 40, 0, 0, Math.PI * 2); x.fill();
    }
    // ojos almendrados: iris de color, pupila, brillo y párpado superior grueso
    for (const sx of [-1, 1]) {
      const [cx, cy] = P(sx * 0.4, -0.04), ew = 52, eh = 40;
      x.save();
      x.beginPath(); x.moveTo(cx - ew, cy + 4); x.quadraticCurveTo(cx - sx * 6, cy - eh * 1.35, cx + ew, cy - 2); x.quadraticCurveTo(cx + sx * 4, cy + eh * 0.95, cx - ew, cy + 4); x.closePath();
      x.fillStyle = "#fbf8f2"; x.fill(); x.clip();
      x.fillStyle = look.ojos; x.beginPath(); x.ellipse(cx - sx * 8, cy + 2, 25, 32, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = "rgba(0,0,0,0.35)"; x.beginPath(); x.ellipse(cx - sx * 8, cy - 10, 22, 14, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = ink; x.beginPath(); x.ellipse(cx - sx * 8, cy + 3, 12, 16, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#ffffff"; x.beginPath(); x.arc(cx - sx * 2, cy - 8, 6, 0, Math.PI * 2); x.fill();
      x.restore();
      x.strokeStyle = ink; x.lineCap = "round"; x.lineJoin = "round";
      x.lineWidth = 9; x.beginPath(); x.moveTo(cx - ew - 4, cy + 6); x.quadraticCurveTo(cx - sx * 6, cy - eh * 1.4, cx + ew + 6, cy - 4); x.stroke();
      x.lineWidth = 3; x.beginPath(); x.moveTo(cx - ew * 0.6, cy + eh * 0.72); x.quadraticCurveTo(cx, cy + eh * 0.95, cx + ew * 0.7, cy + eh * 0.6); x.stroke();
      const [bx, by] = P(sx * 0.4, 0.3);
      x.strokeStyle = look.pelo; x.lineWidth = 12;
      x.beginPath(); x.moveTo(bx - sx * 44, by + 8); x.quadraticCurveTo(bx - sx * 6, by - 12, bx + sx * 42, by - 2); x.stroke();
    }
    // nariz: sombra lateral y punta
    { const [nx, ny] = P(0.0, -0.2); x.strokeStyle = "rgba(150,80,70,0.55)"; x.lineWidth = 5; x.beginPath(); x.moveTo(nx + 8, ny - 50); x.quadraticCurveTo(nx + 18, ny, nx + 2, ny + 14); x.stroke(); x.fillStyle = "rgba(150,80,70,0.35)"; x.beginPath(); x.ellipse(nx, ny + 12, 14, 6, 0, 0, Math.PI * 2); x.fill(); }
    // boca
    { const [mx, my] = P(0.0, -0.46); x.strokeStyle = "#5a2a2c"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(mx - 30, my - 2); x.quadraticCurveTo(mx, my + 8, mx + 30, my - 4); x.stroke(); x.fillStyle = "rgba(180,90,90,0.3)"; x.beginPath(); x.ellipse(mx, my + 14, 20, 6, 0, 0, Math.PI * 2); x.fill(); }
    if (look.barba) {
      let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      x.fillStyle = look.pelo;
      for (let k = 0; k < 1400; k++) {
        const a = (rnd() - 0.5) * 1.5, b = -0.55 - rnd() * 0.55 + Math.abs(a) * 0.3;
        if (b > -0.5 || (Math.abs(a) < 0.3 && b > -0.58 && b < -0.36)) continue;
        const [px, py] = P(a, b); x.globalAlpha = 0.25 + rnd() * 0.3; x.fillRect(px, py, 3, 6);
      }
      x.globalAlpha = 1;
    }
    faceTex.needsUpdate = true;
  }

  /* ---------------- Pelo ---------------- */
  // Como en Messenger: una sola masa esculpida (un casco con volumen), recortada abajo en puntas.
  // edge(a): elevación del borde según el azimut (0 = frente) · vol(a, b): volumen · drop(a): largo bajo la nuca
  const onHead = (a, b, k = 1.07) => [Math.sin(a) * Math.cos(b) * HX * k, Math.sin(b) * HY * k + HC, Math.cos(a) * Math.cos(b) * HZ * k * (Math.cos(a) < 0 ? 1.06 : 1)];
  const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const hashA = (n) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
  // dientes: puntas triangulares que bajan desde el borde (amplitud y periodo según la zona)
  const teeth = (a, amp, per, seed = 1) => { const u = a / per + 0.5, i = Math.floor(u), f = u - i; return amp * (0.55 + 0.45 * hashA(i + seed)) * (1 - Math.abs(f * 2 - 1)); };
  function hairShell({ edge, vol, drop = () => 0 }) {
    const NA = 168, NB = 30, pos = [], idx = [];
    const ring = (k) => {
      for (let i = 0; i < NA; i++) {
        const a = -Math.PI + (i / NA) * Math.PI * 2, e = edge(a), dr = drop(a);
        for (let j = 0; j <= NB; j++) {
          const t = Math.pow(j / NB, 0.85), b = Math.PI / 2 + (e - Math.PI / 2) * t;
          const bb = Math.max(b, -0.45), v = vol(a, bb) * k;
          let [x, y, z] = onHead(a, bb, v);
          if (b < -0.45 && e < -0.45) { const f = (-0.45 - b) / (-0.45 - e); y -= f * dr; x *= 1 + f * 0.12; z *= 1 + f * 0.08; }
          pos.push(x, y, z);
        }
      }
    };
    ring(1); ring(0.955);                                           // exterior e interior (el borde queda con espesor)
    const R = NB + 1, off = NA * R;
    for (let i = 0; i < NA; i++) {
      const i2 = (i + 1) % NA;
      for (let j = 0; j < NB; j++) {
        const a0 = i * R + j, b0 = i2 * R + j;
        idx.push(a0, a0 + 1, b0, b0, a0 + 1, b0 + 1);                                  // exterior
        idx.push(off + a0, off + b0, off + a0 + 1, off + b0, off + b0 + 1, off + a0 + 1); // interior (hacia adentro)
      }
      const e0 = i * R + NB, e1 = i2 * R + NB;                                            // canto del borde
      idx.push(e0, off + e0, e1, e1, off + e0, off + e1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  // perfil del borde por zonas: frente (|a| < f0), lados y nuca, con transiciones suaves
  const zones = (a, front, side, back, f0 = 0.75, f1 = 1.45) => {
    const A = Math.abs(a);
    return A < f0 ? front : A < f1 ? front + (side - front) * sstep(f0, f1, A) : side + (back - side) * sstep(f1, 2.6, A);
  };
  const hairs = {};
  const style = (name, spec) => { const g = new THREE.Group(); mesh(g, hairShell(spec), M.hair); hairs[name] = g; head.add(g); };
  // Melena corta con flequillo en puntas y patillas (la del personaje de Messenger)
  style("despeinado", {
    edge: (a) => { const A = Math.abs(a); return zones(a, 0.4, -0.18, -0.5) - (A < 1.05 ? teeth(a, 0.17, 0.2, 3) : teeth(a, 0.09, 0.28, 7)) - 0.2 * Math.exp(-(((A - 1.3) / 0.1) ** 2)); },
    vol: (a, b) => 1.1 + 0.05 * sstep(0.2, 1.2, b) - 0.03 * Math.cos(a) * sstep(0.9, 1.4, b) + 0.035 * Math.max(0, Math.sin(a * 5 + 1.3)) * sstep(0.9, 1.35, b) + 0.02 * sstep(1.2, 2.6, Math.abs(a)),
  });
  // Flequillo recto (casco)
  style("flequillo", {
    edge: (a) => zones(a, 0.3, -0.25, -0.48) - teeth(a, 0.035, 0.12, 5),
    vol: (a, b) => 1.1 + 0.04 * sstep(0.3, 1.3, b) + 0.02 * sstep(1.2, 2.6, Math.abs(a)),
  });
  // Corto con copete
  style("corto", {
    edge: (a) => zones(a, 0.52, 0.12, -0.28) - teeth(a, 0.07, 0.22, 11),
    vol: (a, b) => 1.065 + 0.05 * Math.max(0, Math.cos(a)) * sstep(0.9, 1.3, b),
  });
  // Rizado: volumen grumoso
  style("rizado", {
    edge: (a) => zones(a, 0.48, 0.02, -0.34) - teeth(a, 0.06, 0.16, 13),
    vol: (a, b) => 1.16 + 0.05 * sstep(0.2, 1.2, b) + 0.045 * Math.abs(Math.sin(a * 7.3 + b * 3.1) * Math.sin(b * 9.7 - a * 2.3)),
  });
  // Largo hasta los hombros, con flequillo abierto
  style("largo", {
    edge: (a) => { const A = Math.abs(a); return (A < 0.7 ? 0.36 - teeth(a, 0.12, 0.22, 17) : -1.1 - teeth(a, 0.08, 0.3, 19)) - 0.35 * sstep(0.1, 0.7, A) * 0; },
    vol: (a, b) => 1.1 + 0.04 * sstep(0.3, 1.3, b),
    drop: (a) => { const A = Math.abs(a); return A < 0.7 ? 0 : 0.05 + 0.22 * sstep(0.8, 1.6, A); },
  });
  style("rapado", {
    edge: (a) => zones(a, 0.6, 0.22, -0.05),
    vol: () => 1.028,
  });

  // Gafas redondas
  const glasses = new THREE.Group(); head.add(glasses);
  for (const sx of [-1, 1]) {
    const p = onHead(sx * 0.38, -0.02, 1.13), r = mesh(glasses, new THREE.TorusGeometry(0.03, 0.0035, 8, 32), M.frame, p[0], p[1], p[2], false);
    r.rotation.y = sx * 0.38;
    const t = mesh(glasses, new THREE.CylinderGeometry(0.0028, 0.0028, 0.12, 6), M.frame, sx * 0.113, HC - 0.002, 0.04, false); t.rotation.x = Math.PI / 2;
  }
  { const p = onHead(0, 0.0, 1.16); mesh(glasses, new THREE.TorusGeometry(0.014, 0.003, 6, 12, Math.PI), M.frame, p[0], p[1], p[2], false); }

  /* ---------------- Accesorios ---------------- */
  const acc = {};
  const tubeG = (pts, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V3(...p))), 24, r, 8, false);
  acc.mochila = new THREE.Group(); spine.add(acc.mochila);
  {
    const g = acc.mochila;
    mesh(g, loft([{ y: -0.02, w: 0.12, d: 0.055 }, { y: 0.08, w: 0.13, d: 0.065 }, { y: 0.22, w: 0.125, d: 0.062 }, { y: 0.3, w: 0.1, d: 0.05 }], 24, 3), M.bag, 0, 0.02, -0.175);
    mesh(g, loft([{ y: 0.0, w: 0.09, d: 0.03 }, { y: 0.09, w: 0.095, d: 0.034 }], 20, 3), M.bag2, 0, 0.05, -0.225);
    for (const sx of [-1, 1]) mesh(g, tubeG([[sx * 0.09, 0.35, -0.12], [sx * 0.1, 0.42, -0.04], [sx * 0.095, 0.38, 0.085], [sx * 0.1, 0.2, 0.113], [sx * 0.11, 0.06, 0.1], [sx * 0.11, 0.04, -0.12]], 0.012), M.strap, 0, 0, 0, false);
  }
  acc.bandolera = new THREE.Group(); spine.add(acc.bandolera);
  {
    const g = acc.bandolera;
    mesh(g, tubeG([[-0.13, 0.42, 0.07], [-0.02, 0.3, 0.12], [0.1, 0.12, 0.12], [0.18, 0.0, 0.08]], 0.009), M.metal, 0, 0, 0, false);
    mesh(g, tubeG([[-0.13, 0.42, 0.07], [-0.1, 0.4, -0.08], [0.05, 0.2, -0.12], [0.18, 0.0, 0.05]], 0.009), M.metal, 0, 0, 0, false);
    const b = mesh(g, loft([{ y: -0.06, w: 0.07, d: 0.03 }, { y: 0.05, w: 0.075, d: 0.032 }], 20, 3), M.metal, 0.19, -0.02, 0.07); b.rotation.y = 0.9;
  }
  acc.audifonos = new THREE.Group(); head.add(acc.audifonos);
  {
    const g = acc.audifonos;
    const band = mesh(g, new THREE.TorusGeometry(0.135, 0.011, 8, 40, Math.PI), M.cup, 0, HC + 0.01, -0.01); band.scale.set(1, 1.08, 1);
    for (const sx of [-1, 1]) {
      const c = mesh(g, loft([{ y: -0.02, w: 0.042, d: 0.048 }, { y: 0.02, w: 0.045, d: 0.05 }, { y: 0.035, w: 0.036, d: 0.04 }], 20, 2), M.cup, sx * 0.125, HC - 0.01, -0.005);
      c.rotation.z = -sx * Math.PI / 2;
    }
  }
  acc.casco = new THREE.Group(); head.add(acc.casco);
  { mesh(acc.casco, new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.14, 0.12, 0.155), M.hat, 0, HC + 0.03, 0); mesh(acc.casco, new THREE.CylinderGeometry(0.16, 0.16, 0.012, 32).scale(1, 1, 1.12), M.hat, 0, HC + 0.03, 0.02); }
  acc.planos = new THREE.Group(); spine.add(acc.planos);
  { const t = mesh(acc.planos, new THREE.CylinderGeometry(0.04, 0.04, 0.72, 16), M.tube, 0, 0.2, -0.16); t.rotation.z = 0.7; }
  acc.ninguno = new THREE.Group();

  /* ---------------- Aspecto ---------------- */
  const shade = (h, k) => "#" + new THREE.Color(h).multiplyScalar(k).getHexString();
  function setLook(l) {
    look = { ...DAVID, ...l };
    if (!hairs[look.peinado]) look.peinado = DAVID.peinado;
    if (!acc[look.accesorio]) look.accesorio = DAVID.accesorio;
    const C = (m, h) => m.userData.setC(h);
    C(M.skin, look.piel); C(M.hair, look.pelo); C(M.top, look.ropa); C(M.trim, shade(look.ropa, 0.78));
    C(M.pants, look.pantalon); C(M.hem, shade(look.pantalon, 0.82));
    C(M.shoe, look.zapatos); C(M.shoe2, shade(look.zapatos, 0.86));
    C(M.lip, "#" + new THREE.Color(look.piel).lerp(new THREE.Color("#c2505a"), 0.35).getHexString());
    for (const [k, g] of Object.entries(hairs)) g.visible = k === look.peinado;
    glasses.visible = !!look.gafas;
    for (const [k, g] of Object.entries(acc)) g.visible = k === look.accesorio;
    const buzo = look.prenda === "buzo", berm = look.pierna === "bermuda";
    shirt.visible = !buzo; shirtHem.visible = !buzo; sweat.visible = buzo; sweatHem.visible = buzo; badge.visible = !buzo;
    for (const a of [armL, armR]) { a.sleeveT.visible = !buzo; a.sleeveL.visible = buzo; a.foreL.visible = buzo; a.cuff.visible = buzo; a.upper.visible = !buzo; }
    for (const g of [legL, legR]) { g.shinP.visible = !berm; g.cuffP.visible = !berm; g.hemB.visible = berm; g.shinS.visible = berm; g.sock.visible = berm; }
    drawFace();
  }
  setLook(look);

  /* ---------------- Animación ---------------- */
  let phase = 0, wave = 0, look0 = 0;
  function update(dt, speed01, t, air = 0) {
    phase += dt * (5.2 + speed01 * 5.5) * (speed01 > 0.02 && air < 0.1 ? 1 : 0);
    const s = Math.sin(phase), c = Math.cos(phase), amp = speed01 * (1 - air);
    const k = Math.min(1, dt * 14), ease = (o, v) => o + (v - o) * k;
    // piernas: cadera y rodilla que se dobla al pasar
    legL.L.rotation.x = ease(legL.L.rotation.x, s * 0.55 * amp - 0.7 * air);
    legR.L.rotation.x = ease(legR.L.rotation.x, -s * 0.55 * amp + 0.35 * air);
    legL.knee.rotation.x = ease(legL.knee.rotation.x, (Math.max(0, -c) * 0.95 + 0.05) * amp + 1.1 * air);
    legR.knee.rotation.x = ease(legR.knee.rotation.x, (Math.max(0, c) * 0.95 + 0.05) * amp + 0.5 * air);
    // brazos: hombro y codo
    armL.S.rotation.x = ease(armL.S.rotation.x, -s * 0.5 * amp);
    armL.elbow.rotation.x = ease(armL.elbow.rotation.x, -(0.18 + Math.max(0, -s) * 0.5) * (0.3 + amp));
    armL.S.rotation.z = ease(armL.S.rotation.z, -0.07 - 0.9 * air);
    if (wave > 0) {
      wave -= dt;
      armR.S.rotation.x = ease(armR.S.rotation.x, 0);
      armR.S.rotation.z = ease(armR.S.rotation.z, 2.5 + Math.sin(t * 12) * 0.22);
      armR.elbow.rotation.x = ease(armR.elbow.rotation.x, -0.3);
      armR.elbow.rotation.z = ease(armR.elbow.rotation.z, Math.sin(t * 12) * 0.25);
    } else {
      armR.S.rotation.x = ease(armR.S.rotation.x, s * 0.5 * amp);
      armR.S.rotation.z = ease(armR.S.rotation.z, 0.07 + 0.9 * air);
      armR.elbow.rotation.x = ease(armR.elbow.rotation.x, -(0.18 + Math.max(0, s) * 0.5) * (0.3 + amp));
      armR.elbow.rotation.z = ease(armR.elbow.rotation.z, 0);
    }
    // cuerpo: rebote, giro de cadera y hombros, respiración
    body.position.y = (Math.abs(c) * 0.035 - 0.015) * amp;
    hips.rotation.y = s * 0.12 * amp;
    spine.rotation.y = -s * 0.1 * amp;
    spine.rotation.x = 0.06 * amp + 0.03;
    spine.scale.set(1 + Math.sin(t * 2.1) * 0.006 * (1 - amp), 1 + Math.sin(t * 2.1) * 0.008 * (1 - amp), 1);
    look0 += ((amp < 0.05 ? Math.sin(t * 0.45) * 0.4 : 0) - look0) * Math.min(1, dt * 3);
    head.rotation.y = look0 - spine.rotation.y * 0.8;
    head.rotation.x = -0.04 * amp - 0.02;
    head.rotation.z = Math.sin(t * 0.7) * 0.025 * (1 - amp);
  }
  return { root, setLook, update, wave: (d = 1.8) => { wave = d; }, get look() { return look; }, materials: mats };
}
