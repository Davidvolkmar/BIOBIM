/* =====================================================================
   CONFIGURACIÓN DE HERRAMIENTAS BIOBIM
   ---------------------------------------------------------------------
   Para activar una herramienta, pega su enlace en el campo `url`.
   Ejemplo:  url: "https://mi-herramienta.web.app",
   Si `url` está vacío (""), la tarjeta se muestra como "Próximamente".

   Fases del proyecto (índices usados en `entra` y `puede`):
     0 = Prefactibilidad
     1 = Idea básica (prediseño)
     2 = Anteproyecto (diseño)
     3 = Proyecto (posdiseño)

   orden     → posición en la ruta de implementación (1 = primera).
   usa       → herramientas cuyos resultados necesita (ids). Define el orden:
               ninguna herramienta debería ir antes que las que usa.
   entra     → fases donde la herramienta es de uso principal.
   puede     → fases donde puede entrar como apoyo.
   criterios → criterios bioclimáticos que trabaja
               (orientacion, soleamiento, clima, ventilacion, iluminacion,
                temperatura, acustica, materiales, energia, certificacion).
   ===================================================================== */
window.BIOBIM_TOOLS = [
  {
    id: "lugar",
    nombre: "Análisis del lugar",
    url: "",
    orden: 1,
    usa: [],
    etapa: 1,
    entra: [0],
    puede: [1],
    criterios: ["clima", "orientacion"],
    color: "#6fcf8e",
    resumen: "Leer el clima del sitio de forma sistemática antes de definir la forma.",
    porque: "Es el punto de partida: sin leer el clima del sitio no hay estrategia que priorizar. Entra antes de dibujar y entrega el viento dominante, la radiación y las estrategias prioritarias.",
    descripcion:
      "Primer andamiaje del proceso BIOBIM. Organiza temperatura, humedad, viento y radiación del sitio para que el estudiante identifique qué problema climático resuelve su proyecto antes de dibujar la primera línea.",
    entradas: ["Archivo climático (EPW / IDEAM)", "Ubicación, altitud y topografía", "Entorno inmediato"],
    salidas: ["Rosa de vientos y régimen térmico", "Carta psicrométrica (Givoni)", "Estrategias priorizadas"],
    aprendes: "Traducir datos climáticos en requerimientos de diseño.",
  },
  {
    id: "solar",
    nombre: "Ángulos solares",
    url: "",
    orden: 2,
    usa: ["lugar"],
    etapa: 2,
    entra: [1, 2],
    puede: [0],
    criterios: ["soleamiento", "orientacion", "iluminacion"],
    color: "#ffb547",
    resumen: "Carta solar, radiación y protecciones para ajustar orientación y volumen.",
    porque: "La orientación es la estrategia casi obligatoria y la de menor exigencia técnica: con el clima del sitio define el volumen inicial y después dimensiona aleros, quiebrasoles y vanos.",
    descripcion:
      "Calcula la posición del sol (altitud y azimut) a lo largo del año y la radiación incidente sobre fachadas y cubiertas. Permite dimensionar aleros, quiebrasoles y aberturas con datos, no con intuición.",
    entradas: ["Latitud y orientación", "Volumetría inicial", "Horario de ocupación"],
    salidas: ["Carta solar estereográfica", "Máscaras de sombra", "Radiación por fachada (kWh/m²)"],
    aprendes: "Relacionar geometría solar con ganancias térmicas y luz natural.",
  },
  {
    id: "ventilacion",
    nombre: "Ventilación",
    url: "",
    orden: 3,
    usa: ["lugar", "solar"],
    etapa: 2,
    entra: [1, 2],
    puede: [],
    criterios: ["ventilacion"],
    color: "#4fd1e8",
    resumen: "Ventilación natural cruzada y por efecto chimenea, dimensionada.",
    porque: "Con el volumen ya orientado, el viento dominante decide la planta: profundidad, vanos opuestos y alturas. Deja planteada una hipótesis de ventilación.",
    descripcion:
      "Estima renovaciones de aire, áreas efectivas de apertura y el potencial de ventilación cruzada y por efecto chimenea según el viento dominante y la diferencia de temperatura.",
    entradas: ["Velocidad y dirección del viento", "Área y posición de vanos", "Volumen del espacio"],
    salidas: ["Renovaciones por hora (ACH)", "Área de apertura requerida", "Diagnóstico de ventilación cruzada"],
    aprendes: "Entender el aire como material de diseño.",
  },
  {
    id: "termico",
    nombre: "Térmico",
    url: "",
    orden: 5,
    usa: ["solar", "ventilacion", "cfd"],
    etapa: 3,
    entra: [2, 3],
    puede: [],
    criterios: ["temperatura", "materiales", "energia"],
    color: "#ff6b5b",
    resumen: "Envolvente, masa térmica y confort de los ocupantes.",
    porque: "Es la verificación que integra: combina ganancias solares, renovaciones de aire validadas y materiales de la envolvente para comprobar el confort. Necesita que todo lo anterior esté definido.",
    descripcion:
      "Evalúa transmitancia (U), inercia térmica y confort (adaptativo / PMV-PPD) de los espacios seleccionados, verificando dentro del mismo flujo BIM si la envolvente cumple la estrategia planteada.",
    entradas: ["Capas de materiales del modelo", "Ganancias internas", "Clima exterior"],
    salidas: ["Valor U y desfase térmico", "Horas en confort", "Temperatura operativa"],
    aprendes: "Leer el comportamiento térmico como consecuencia de decisiones de forma y material.",
  },
  {
    id: "acustico",
    nombre: "Acústico",
    url: "",
    orden: 6,
    usa: ["ventilacion", "termico"],
    etapa: 3,
    entra: [2, 3],
    puede: [],
    criterios: ["acustica", "materiales"],
    color: "#b58cff",
    resumen: "Aislamiento, reverberación y ruido según la ocupación.",
    porque: "Cierra la ruta: revisa el conflicto entre vanos abiertos para ventilar y el ruido exterior, y afina acabados y volúmenes interiores ya definidos. Se ajusta en anteproyecto y se cierra en proyecto.",
    descripcion:
      "Calcula el tiempo de reverberación (Sabine / Eyring), el aislamiento de fachadas y particiones y la exposición a ruido ambiental, con énfasis en espacios educativos según su ocupación real.",
    entradas: ["Geometría y volumen del recinto", "Coeficientes de absorción", "Fuentes de ruido"],
    salidas: ["Tiempo de reverberación (T60)", "Índice de aislamiento", "Recomendaciones de materiales"],
    aprendes: "Diseñar la calidad sonora del espacio desde el volumen y el material.",
  },
  {
    id: "cfd",
    nombre: "CFD",
    url: "",
    orden: 4,
    usa: ["ventilacion"],
    etapa: 3,
    entra: [2],
    puede: [1, 3],
    criterios: ["ventilacion", "temperatura"],
    color: "#5b8cff",
    resumen: "Dinámica de fluidos computacional: el viento hecho visible.",
    porque: "Valida la hipótesis de ventilación en cuanto la geometría del anteproyecto está definida, antes de cerrar vanos y envolvente. Es la simulación más exigente, por eso llega cuando ya hay algo concreto que verificar.",
    descripcion:
      "Simula el flujo de aire exterior e interior para visualizar velocidades, presiones sobre fachada y zonas de estancamiento, validando las estrategias de ventilación antes de construir.",
    entradas: ["Modelo IFC / geometría simplificada", "Perfil de viento", "Condiciones de frontera"],
    salidas: ["Campos de velocidad y presión", "Líneas de corriente", "Coeficientes de presión (Cp)"],
    aprendes: "Validar hipótesis de viento con evidencia visual y cuantitativa.",
  },
];
