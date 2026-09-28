/* =====================================================================
   REFERENCIAS · BIOBIM Lab (APA 7)
   ---------------------------------------------------------------------
   Registro único de fuentes del sitio. Para citar en index.html:
     <cite data-ref="azhar2010"></cite>          → muestra "Azhar et al., 2010"
     <cite data-ref="azhar2010">Azhar et al. (2010)</cite>  → texto propio
   Al pasar el mouse la cita muestra la referencia completa y, al hacer
   clic, lleva a la lista de Referencias de la vista.

   Campos:
     cite → texto corto autor-año
     apa  → referencia completa en APA 7 (puede incluir <i>cursiva</i>)
     url  → DOI o enlace verificable (opcional)
     src  → de dónde se tomó el dato (para el mantenimiento del sitio)

   Las fuentes marcadas src: "propuesta" o "tesis" se transcriben tal como
   aparecen en los documentos del autor. Las marcadas src: "técnica" son
   manuales y normas de referencia que soportan los cálculos del sitio.
   ===================================================================== */
window.BIOBIM_REFS = {
  // ---------- Trabajos del autor ----------
  volkmar2024: {
    cite: "Volkmar Vélez, 2024",
    apa: "Volkmar Vélez, D. (2024). <i>Ensayo de una metodología de integración de estrategias bioclimáticas en el proceso de diseño arquitectónico a través de BIM</i> [Tesis de maestría, Universidad de San Buenaventura, Medellín].",
    src: "propuesta",
  },
  volkmarProp: {
    cite: "Volkmar Vélez, en preparación",
    apa: "Volkmar Vélez, D. (en preparación). <i>Modelo de enseñanza-aprendizaje basado en una metodología de integración de estrategias bioclimáticas en el proceso de diseño a través de BIM</i> [Propuesta doctoral, Doctorado en Ingeniería – Sistemas e Informática, Universidad Nacional de Colombia, Sede Medellín].",
    src: "propuesta",
  },

  // ---------- Problema y contexto ----------
  cpnaa2018: {
    cite: "CPNAA, 2018",
    apa: "Consejo Profesional Nacional de Arquitectura y sus Profesiones Auxiliares (CPNAA). (2018). <i>Estudio de caracterización del arquitecto colombiano</i>.",
    src: "propuesta",
  },
  azhar2010: {
    cite: "Azhar et al., 2010",
    apa: "Azhar, S., Brown, J. W., & Sattineni, A. (2010). A case study of building performance analyses using building information modeling. <i>2010 27th International Symposium on Automation and Robotics in Construction (ISARC 2010)</i>, 213–222.",
    url: "https://doi.org/10.22260/isarc2010/0023",
    src: "propuesta",
  },
  azhar2009: {
    cite: "Azhar et al., 2009",
    apa: "Azhar, S., Brown, J., & Farooqui, R. (2009). BIM-based sustainability analysis: An evaluation of building performance analysis software. <i>Proceedings of the 45th ASC Annual Conference</i>.",
    src: "tesis",
  },
  curt2004: {
    cite: "CURT, 2004",
    apa: "Construction Users Roundtable (CURT). (2004). <i>Collaboration, integrated information, and the project lifecycle in building design, construction and operation</i> (White Paper WP-1202).",
    src: "propuesta",
  },
  gao2019: {
    cite: "Gao et al., 2019",
    apa: "Gao, H., Koch, C., & Wu, Y. (2019). Building information modelling based building energy modelling: A review. <i>Applied Energy, 238</i>, 320–343.",
    url: "https://doi.org/10.1016/j.apenergy.2019.01.032",
    src: "propuesta",
  },
  martin2014: {
    cite: "Martín Dorta et al., 2014",
    apa: "Martín Dorta, N., Franco Pérez, C., Broock Hijar, D., & González de Chaves y Assef, P. (2014). <i>Análisis de la integración de la tecnología BIM y los indicadores de sostenibilidad</i>. Universitat Politècnica de València.",
    src: "propuesta",
  },
  pompei2019: {
    cite: "Pompei et al., 2019",
    apa: "Pompei, L., Spiridigliozzi, G., De Santoli, L., Cornaro, C., & Bisegna, F. (2019). Testing the BIM-Ladybug tools interoperability: A daylighting simulation workflow. <i>Building Simulation Applications (BSA2019)</i>.",
    src: "propuesta",
  },
  elzeyadi2020: {
    cite: "Elzeyadi & Abboushi, 2020",
    apa: "Elzeyadi, I., & Abboushi, B. (2020). Mind the gap: Building simulation in the architectural design studio. <i>108th ACSA Annual Meeting Proceedings, Open</i>.",
    url: "https://doi.org/10.35483/ACSA.AM.108.11",
    src: "propuesta",
  },
  fernandez2022: {
    cite: "Fernández-Antolin et al., 2022",
    apa: "Fernández-Antolin, M.-M., del Río, J. M., & Gonzalez-Lezcano, R.-A. (2022). Building performance simulation tools as part of architectural design: Breaking the gap through software simulation. <i>International Journal of Technology and Design Education, 32</i>(2), 1227–1245.",
    url: "https://doi.org/10.1007/s10798-020-09641-7",
    src: "propuesta",
  },
  iso16739: {
    cite: "ISO, 2024",
    apa: "International Organization for Standardization (ISO). (2024). <i>ISO 16739-1:2024. Industry Foundation Classes (IFC) for data sharing in the construction and facility management industries. Part 1: Data schema</i>.",
    src: "propuesta",
  },
  gobcol2020: {
    cite: "Gobierno de Colombia, 2020",
    apa: "Gobierno de Colombia. (2020). <i>Estrategia Nacional BIM 2020-2026</i>.",
    src: "propuesta",
  },

  // ---------- Estado del arte de la maestría ----------
  parra2020: {
    cite: "Parra Correa, 2020",
    apa: "Parra Correa, E. (2020). <i>Propuesta de una metodología para la optimización multi-objetivo de estrategias bioclimáticas en edificaciones a través de modelos paramétricos</i>.",
    src: "tesis",
  },
  finocchiaro2018: {
    cite: "Finocchiaro & Lobaccaro, 2018",
    apa: "Finocchiaro, L., & Lobaccaro, G. (2018). <i>Bioclimatic design of green buildings</i>.",
    src: "tesis",
  },
  camporeale2012: {
    cite: "Camporeale, 2012",
    apa: "Camporeale, P. E. (2012). <i>El uso de algoritmos genéticos en el diseño paramétrico de edificios energéticamente eficientes: El coeficiente G y el consumo anual de energía</i>.",
    src: "tesis",
  },
  reus2016: {
    cite: "Reus Netto & Czajkowski, 2016",
    apa: "Reus Netto, G., & Czajkowski, J. (2016). <i>Comparación entre las normas de desempeño térmico edilicio de Argentina y Brasil</i>.",
    src: "tesis",
  },
  cascone2023: {
    cite: "Cascone, 2023",
    apa: "Cascone, S. (2023). Digital technologies and sustainability assessment: A critical review on the integration methods between BIM and LEED.",
    src: "tesis",
  },
  zanni2016: {
    cite: "Zanni et al., 2016",
    apa: "Zanni, M., Soetanto, R., & Ruikar, K. (2016). Towards a BIM-enabled sustainable building design process: Roles, responsibilities, and requirements. <i>Architectural Engineering and Design Management</i>.",
    src: "tesis",
  },

  // ---------- Marco teórico del doctorado ----------
  kolb1984: {
    cite: "Kolb, 1984",
    apa: "Kolb, D. A. (1984). <i>Experiential learning: Experience as the source of learning and development</i>. Prentice-Hall.",
    src: "propuesta",
  },
  sweller1988: {
    cite: "Sweller, 1988",
    apa: "Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. <i>Cognitive Science, 12</i>(2), 257–285.",
    url: "https://doi.org/10.1016/0364-0213(88)90023-7",
    src: "propuesta",
  },
  vygotsky1978: {
    cite: "Vygotsky, 1978",
    apa: "Vygotsky, L. S. (1978). <i>Mind in society: The development of higher psychological processes</i>. Harvard University Press.",
    src: "propuesta",
  },
  norman2013: {
    cite: "Norman, 2013",
    apa: "Norman, D. A. (2013). <i>The design of everyday things</i> (Rev. and expanded ed.). Basic Books.",
    src: "propuesta",
  },
  dbr2003: {
    cite: "Design-Based Research Collective, 2003",
    apa: "Design-Based Research Collective. (2003). Design-based research: An emerging paradigm for educational inquiry. <i>Educational Researcher, 32</i>(1), 5–8.",
    url: "https://doi.org/10.3102/0013189X032001005",
    src: "propuesta",
  },

  // ---------- Soporte técnico de las herramientas y del modelo vivo ----------
  givoni1969: {
    cite: "Givoni, 1969",
    apa: "Givoni, B. (1969). Architectural design based on climate. En D. Watson (Ed.), <i>Energy conservation through building design</i>. McGraw-Hill.",
    src: "propuesta",
  },
  olgyay2015: {
    cite: "Olgyay, 2015",
    apa: "Olgyay, V. (2015). <i>Design with climate: Bioclimatic approach to architectural regionalism</i> (Edición original de 1963, Princeton University Press).",
    src: "propuesta",
  },
  duffie2013: {
    cite: "Duffie & Beckman, 2013",
    apa: "Duffie, J. A., & Beckman, W. A. (2013). <i>Solar engineering of thermal processes</i> (4.ª ed.). Wiley.",
    src: "técnica",
  },
  cibse2005: {
    cite: "CIBSE, 2005",
    apa: "Chartered Institution of Building Services Engineers (CIBSE). (2005). <i>Natural ventilation in non-domestic buildings</i> (CIBSE Applications Manual AM10).",
    src: "técnica",
  },
  iso7730: {
    cite: "ISO, 2005",
    apa: "International Organization for Standardization (ISO). (2005). <i>ISO 7730:2005. Ergonomics of the thermal environment — Analytical determination and interpretation of thermal comfort using calculation of the PMV and PPD indices and local thermal comfort criteria</i>.",
    src: "técnica",
  },
  ashrae55: {
    cite: "ASHRAE, 2020",
    apa: "ASHRAE. (2020). <i>ANSI/ASHRAE Standard 55-2020: Thermal environmental conditions for human occupancy</i>.",
    src: "técnica",
  },
  sabine1922: {
    cite: "Sabine, 1922",
    apa: "Sabine, W. C. (1922). <i>Collected papers on acoustics</i>. Harvard University Press.",
    src: "técnica",
  },
  eyring1930: {
    cite: "Eyring, 1930",
    apa: "Eyring, C. F. (1930). Reverberation time in “dead” rooms. <i>The Journal of the Acoustical Society of America, 1</i>(2A), 217–241.",
    src: "técnica",
  },
  blocken2014: {
    cite: "Blocken, 2014",
    apa: "Blocken, B. (2014). 50 years of computational wind engineering: Past, present and future. <i>Journal of Wind Engineering and Industrial Aerodynamics, 129</i>, 69–102.",
    src: "técnica",
  },
};
