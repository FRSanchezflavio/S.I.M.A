/**
 * Algoritmos de detección de comunidades para análisis de bandas criminales
 * Implementa algoritmos especializados para identificar grupos criminales organizados
 */

/**
 * Implementa el algoritmo de Louvain para detección de comunidades
 * Optimiza la modularidad para encontrar grupos densamente conectados
 * Ideal para detectar bandas criminales y células operativas
 */
export const detectarComunidadesLouvain = (
  grafo,
  resolucion = 1.0,
  maxIteraciones = 100
) => {
  // Fase 1: Inicialización - cada nodo en su propia comunidad
  let comunidades = {};
  let modulariades = [];

  grafo.nodos.forEach(nodo => {
    comunidades[nodo.id] = nodo.id;
  });

  let modularidadActual = calcularModularidad(grafo, comunidades, resolucion);
  let mejoro = true;
  let iteracion = 0;

  // Fase 2: Optimización local iterativa
  while (mejoro && iteracion < maxIteraciones) {
    mejoro = false;
    iteracion++;

    // Para cada nodo, intentar moverlo a la comunidad de sus vecinos
    grafo.nodos.forEach(nodo => {
      const nodoId = nodo.id;
      const comunidadOriginal = comunidades[nodoId];
      const vecinos = obtenerVecinos(grafo, nodoId);

      // Comunidades de los vecinos
      const comunidadesVecinas = [
        ...new Set(vecinos.map(vecinoId => comunidades[vecinoId])),
      ].filter(com => com !== comunidadOriginal);

      let mejorComunidad = comunidadOriginal;
      let mejorModularidad = modularidadActual;

      // Probar cada comunidad vecina
      comunidadesVecinas.forEach(comunidadVecina => {
        // Mover temporalmente el nodo
        comunidades[nodoId] = comunidadVecina;
        const nuevaModularidad = calcularModularidad(
          grafo,
          comunidades,
          resolucion
        );

        if (nuevaModularidad > mejorModularidad) {
          mejorModularidad = nuevaModularidad;
          mejorComunidad = comunidadVecina;
          mejoro = true;
        }
      });

      // Aplicar el mejor movimiento
      comunidades[nodoId] = mejorComunidad;
      modularidadActual = mejorModularidad;
    });

    modulariades.push(modularidadActual);
  }

  // Fase 3: Agregación y construcción de resultado
  const comunidadesFinales = agruparComunidades(grafo, comunidades);

  return {
    comunidades: comunidadesFinales,
    modularidad: modularidadActual,
    iteraciones: iteracion,
    calidad_deteccion: evaluarCalidadDeteccion(comunidadesFinales),
    bandas_potenciales: identificarBandasPotenciales(comunidadesFinales),
  };
};

/**
 * Implementa algoritmo de detección de comunidades por propagación de etiquetas
 * Rápido y efectivo para redes grandes
 */
export const detectarComunidadesPropagacion = (grafo, maxIteraciones = 50) => {
  // Inicializar etiquetas únicas para cada nodo
  let etiquetas = {};
  grafo.nodos.forEach((nodo, index) => {
    etiquetas[nodo.id] = index;
  });

  let cambios = true;
  let iteracion = 0;

  while (cambios && iteracion < maxIteraciones) {
    cambios = false;
    iteracion++;

    // Orden aleatorio para evitar sesgos
    const nodosAleatorios = [...grafo.nodos].sort(() => Math.random() - 0.5);

    nodosAleatorios.forEach(nodo => {
      const nodoId = nodo.id;
      const vecinos = obtenerVecinosPonderados(grafo, nodoId);

      if (vecinos.length === 0) return;

      // Contar frecuencia de etiquetas de vecinos (ponderado por confianza)
      const conteoEtiquetas = {};
      vecinos.forEach(({ vecinoId, peso }) => {
        const etiquetaVecino = etiquetas[vecinoId];
        conteoEtiquetas[etiquetaVecino] =
          (conteoEtiquetas[etiquetaVecino] || 0) + peso;
      });

      // Encontrar etiqueta más frecuente
      const etiquetaMasFrecuente = Object.keys(conteoEtiquetas).reduce((a, b) =>
        conteoEtiquetas[a] > conteoEtiquetas[b] ? a : b
      );

      if (parseInt(etiquetaMasFrecuente) !== etiquetas[nodoId]) {
        etiquetas[nodoId] = parseInt(etiquetaMasFrecuente);
        cambios = true;
      }
    });
  }

  // Agrupar nodos por etiqueta
  const comunidadesPorEtiqueta = {};
  Object.keys(etiquetas).forEach(nodoId => {
    const etiqueta = etiquetas[nodoId];
    if (!comunidadesPorEtiqueta[etiqueta]) {
      comunidadesPorEtiqueta[etiqueta] = [];
    }
    comunidadesPorEtiqueta[etiqueta].push(nodoId);
  });

  const comunidadesFinales = Object.values(comunidadesPorEtiqueta)
    .map((miembros, index) => ({
      id: index,
      miembros: miembros,
      tamaño: miembros.length,
      densidad: calcularDensidadComunidad(grafo, miembros),
      conexiones_internas: contarConexionesInternas(grafo, miembros),
      conexiones_externas: contarConexionesExternas(grafo, miembros),
    }))
    .filter(com => com.tamaño >= 2); // Filtrar comunidades triviales

  return {
    comunidades: comunidadesFinales,
    iteraciones: iteracion,
    calidad_deteccion: evaluarCalidadDeteccion(comunidadesFinales),
    bandas_potenciales: identificarBandasPotenciales(comunidadesFinales),
  };
};

/**
 * Detección de comunidades jerárquicas usando algoritmo de Girvan-Newman modificado
 * Identifica estructura jerárquica de bandas criminales
 */
export const detectarComunidadesJerarquicas = (
  grafo,
  umbralModularidad = 0.3
) => {
  const dendrograma = [];
  let grafoTrabajo = clonarGrafo(grafo);
  let nivel = 0;

  while (grafoTrabajo.vinculos.length > 0) {
    // Calcular betweenness de cada enlace
    const betweennessEnlaces = calcularBetweennessEnlaces(grafoTrabajo);

    // Encontrar enlace con mayor betweenness
    const enlaceCritico = Object.keys(betweennessEnlaces).reduce((a, b) =>
      betweennessEnlaces[a] > betweennessEnlaces[b] ? a : b
    );

    // Remover enlace crítico
    grafoTrabajo.vinculos = grafoTrabajo.vinculos.filter(
      v => obtenerIdEnlace(v) !== enlaceCritico
    );

    // Detectar comunidades actuales
    const componentesActuales = detectarComponentesConexas(grafoTrabajo);

    if (componentesActuales.length > 1) {
      const modularidad = calcularModularidadComponentes(
        grafoTrabajo,
        componentesActuales
      );

      dendrograma.push({
        nivel: nivel,
        enlace_removido: enlaceCritico,
        comunidades: componentesActuales.map((componente, index) => ({
          id: index,
          miembros: componente,
          tamaño: componente.length,
          densidad: calcularDensidadComunidad(grafo, componente),
          es_banda_potencial: esBandaPotencial(grafo, componente),
        })),
        modularidad: modularidad,
        calidad: modularidad,
      });

      // Parar si la modularidad es suficientemente buena
      if (modularidad > umbralModularidad && componentesActuales.length <= 10) {
        break;
      }
    }

    nivel++;
  }

  // Seleccionar mejor nivel (mayor modularidad)
  const mejorNivel = dendrograma.reduce((mejor, actual) =>
    actual.modularidad > mejor.modularidad ? actual : mejor
  );

  return {
    dendrograma: dendrograma,
    mejor_particion: mejorNivel,
    comunidades: mejorNivel.comunidades,
    bandas_detectadas: mejorNivel.comunidades.filter(c => c.es_banda_potencial),
    estructura_jerarquica: analizarEstructuraJerarquica(dendrograma),
  };
};

/**
 * Algoritmo especializado para detectar células operativas criminales
 * Busca grupos pequeños y densamente conectados con alta confianza mutua
 */
export const detectarCelulasOperativas = (
  grafo,
  umbralConfianza = 0.7,
  tamañoMaximo = 6
) => {
  const celulas = [];
  const nodosVisitados = new Set();

  grafo.nodos.forEach(nodo => {
    if (nodosVisitados.has(nodo.id)) return;

    // Encontrar clique máximo que incluye este nodo
    const clique = encontrarCliqueMaximo(
      grafo,
      nodo.id,
      umbralConfianza,
      tamañoMaximo
    );

    if (clique.length >= 3) {
      // Mínimo 3 miembros para ser célula
      // Verificar que es una célula operativa real
      const esCelulaOperativa = verificarCelulaOperativa(
        grafo,
        clique,
        umbralConfianza
      );

      if (esCelulaOperativa) {
        celulas.push({
          id: celulas.length,
          miembros: clique,
          tamaño: clique.length,
          cohesion: calcularCohesion(grafo, clique),
          confianza_promedio: calcularConfianzaPromedio(grafo, clique),
          tipo_celula: clasificarTipoCelula(grafo, clique),
          actividad_estimada: estimarNivelActividad(grafo, clique),
          conexiones_externas: contarConexionesExternas(grafo, clique),
        });

        // Marcar nodos como visitados
        clique.forEach(nodoId => nodosVisitados.add(nodoId));
      }
    }
  });

  return {
    celulas: celulas,
    total_detectadas: celulas.length,
    celulas_activas: celulas.filter(c => c.actividad_estimada === 'alta'),
    cobertura_red: nodosVisitados.size / grafo.nodos.length,
    recomendaciones_intervencion: generarRecomendacionesIntervencion(celulas),
  };
};

/**
 * Detecta redes de comunicación y coordinación
 * Identifica patrones de comunicación entre diferentes grupos
 */
export const detectarRedesComunicacion = (grafo, umbralFrecuencia = 0.5) => {
  // Filtrar solo vínculos de comunicación
  const vinculosComunicacion = grafo.vinculos.filter(v =>
    ['comunicacion_frecuente', 'coordinacion_operativa'].includes(
      v.tipo_vinculacion
    )
  );

  const grafoComuncacion = {
    nodos: grafo.nodos,
    vinculos: vinculosComunicacion.filter(
      v => v.nivel_confianza >= umbralFrecuencia
    ),
  };

  // Detectar hubs de comunicación
  const hubsComunicacion = detectarHubsComunicacion(grafoComuncacion);

  // Detectar cadenas de comunicación
  const cadenasComunicacion = detectarCadenasComunicacion(grafoComuncacion);

  // Detectar puentes entre grupos
  const puentesGrupos = detectarPuentesEntreGrupos(grafoComuncacion);

  return {
    hubs_comunicacion: hubsComunicacion,
    cadenas_comunicacion: cadenasComunicacion,
    puentes_grupos: puentesGrupos,
    patrones_comunicacion: analizarPatronesComunicacion(grafoComuncacion),
    vulnerabilidades: identificarVulnerabilidadesComunicacion(grafoComuncacion),
  };
};

// === FUNCIONES AUXILIARES ===

const calcularModularidad = (grafo, comunidades, resolucion = 1.0) => {
  const totalEnlaces = grafo.vinculos.length;
  if (totalEnlaces === 0) return 0;

  let modularidad = 0;
  const gradoNodos = {};

  // Calcular grado de cada nodo
  grafo.nodos.forEach(nodo => {
    gradoNodos[nodo.id] = grafo.vinculos.filter(
      v => v.persona_origen_id === nodo.id || v.persona_destino_id === nodo.id
    ).length;
  });

  // Sumar contribuciones de cada par de nodos
  grafo.nodos.forEach(nodo1 => {
    grafo.nodos.forEach(nodo2 => {
      if (
        nodo1.id !== nodo2.id &&
        comunidades[nodo1.id] === comunidades[nodo2.id]
      ) {
        const enlaceExiste = grafo.vinculos.some(
          v =>
            (v.persona_origen_id === nodo1.id &&
              v.persona_destino_id === nodo2.id) ||
            (v.persona_origen_id === nodo2.id &&
              v.persona_destino_id === nodo1.id)
        );

        const aij = enlaceExiste ? 1 : 0;
        const esperado =
          (gradoNodos[nodo1.id] * gradoNodos[nodo2.id]) / (2 * totalEnlaces);

        modularidad += aij - resolucion * esperado;
      }
    });
  });

  return modularidad / (2 * totalEnlaces);
};

const obtenerVecinos = (grafo, nodoId) => {
  return grafo.vinculos
    .filter(
      v => v.persona_origen_id === nodoId || v.persona_destino_id === nodoId
    )
    .map(v =>
      v.persona_origen_id === nodoId
        ? v.persona_destino_id
        : v.persona_origen_id
    );
};

const obtenerVecinosPonderados = (grafo, nodoId) => {
  return grafo.vinculos
    .filter(
      v => v.persona_origen_id === nodoId || v.persona_destino_id === nodoId
    )
    .map(v => ({
      vecinoId:
        v.persona_origen_id === nodoId
          ? v.persona_destino_id
          : v.persona_origen_id,
      peso: v.nivel_confianza || 0.5,
    }));
};

const agruparComunidades = (grafo, comunidades) => {
  const grupos = {};

  Object.keys(comunidades).forEach(nodoId => {
    const comunidadId = comunidades[nodoId];
    if (!grupos[comunidadId]) {
      grupos[comunidadId] = [];
    }
    grupos[comunidadId].push(nodoId);
  });

  return Object.entries(grupos).map(([id, miembros], index) => ({
    id: index,
    miembros: miembros,
    tamaño: miembros.length,
    densidad: calcularDensidadComunidad(grafo, miembros),
    conexiones_internas: contarConexionesInternas(grafo, miembros),
    conexiones_externas: contarConexionesExternas(grafo, miembros),
    cohesion: calcularCohesion(grafo, miembros),
  }));
};

const calcularDensidadComunidad = (grafo, miembros) => {
  if (miembros.length < 2) return 0;

  const conexionesInternas = contarConexionesInternas(grafo, miembros);
  const conexionesPosibles = (miembros.length * (miembros.length - 1)) / 2;

  return conexionesPosibles > 0 ? conexionesInternas / conexionesPosibles : 0;
};

const contarConexionesInternas = (grafo, miembros) => {
  const conjuntoMiembros = new Set(miembros);
  return grafo.vinculos.filter(
    v =>
      conjuntoMiembros.has(v.persona_origen_id) &&
      conjuntoMiembros.has(v.persona_destino_id)
  ).length;
};

const contarConexionesExternas = (grafo, miembros) => {
  const conjuntoMiembros = new Set(miembros);
  return grafo.vinculos.filter(
    v =>
      (conjuntoMiembros.has(v.persona_origen_id) &&
        !conjuntoMiembros.has(v.persona_destino_id)) ||
      (!conjuntoMiembros.has(v.persona_origen_id) &&
        conjuntoMiembros.has(v.persona_destino_id))
  ).length;
};

const evaluarCalidadDeteccion = comunidades => {
  if (comunidades.length === 0) return 0;

  const densidadPromedio =
    comunidades.reduce((sum, com) => sum + com.densidad, 0) /
    comunidades.length;
  const tamañoPromedio =
    comunidades.reduce((sum, com) => sum + com.tamaño, 0) / comunidades.length;
  const cohesionPromedio =
    comunidades.reduce((sum, com) => sum + (com.cohesion || 0), 0) /
    comunidades.length;

  return (
    densidadPromedio * 0.4 +
    cohesionPromedio * 0.4 +
    Math.min(tamañoPromedio / 10, 1) * 0.2
  );
};

const identificarBandasPotenciales = comunidades => {
  return comunidades
    .filter(
      com => com.tamaño >= 3 && com.densidad > 0.4 && (com.cohesion || 0) > 0.3
    )
    .map(com => ({
      ...com,
      probabilidad_banda: calcularProbabilidadBanda(com),
      nivel_amenaza: calcularNivelAmenaza(com),
      prioridad_intervencion: calcularPrioridadIntervencionBanda(com),
    }))
    .sort((a, b) => b.prioridad_intervencion - a.prioridad_intervencion);
};

const calcularProbabilidadBanda = comunidad => {
  let probabilidad = 0;

  // Factores que aumentan probabilidad
  if (comunidad.tamaño >= 5) probabilidad += 0.2;
  if (comunidad.densidad > 0.6) probabilidad += 0.3;
  if ((comunidad.cohesion || 0) > 0.5) probabilidad += 0.3;
  if (comunidad.conexiones_externas > 5) probabilidad += 0.2;

  return Math.min(probabilidad, 1.0);
};

const calcularNivelAmenaza = comunidad => {
  const score =
    comunidad.tamaño * 0.3 +
    comunidad.densidad * 0.4 +
    (comunidad.cohesion || 0) * 0.3;

  if (score > 0.7) return 'alto';
  if (score > 0.4) return 'medio';
  return 'bajo';
};

const calcularPrioridadIntervencionBanda = comunidad => {
  return (
    comunidad.probabilidad_banda * 0.4 +
    (comunidad.nivel_amenaza === 'alto'
      ? 1
      : comunidad.nivel_amenaza === 'medio'
      ? 0.6
      : 0.3) *
      0.6
  );
};

const calcularCohesion = (grafo, miembros) => {
  if (miembros.length < 2) return 0;

  const conjuntoMiembros = new Set(miembros);
  const vinculosInternos = grafo.vinculos.filter(
    v =>
      conjuntoMiembros.has(v.persona_origen_id) &&
      conjuntoMiembros.has(v.persona_destino_id)
  );

  if (vinculosInternos.length === 0) return 0;

  const confianzaPromedio =
    vinculosInternos.reduce((sum, v) => sum + (v.nivel_confianza || 0.5), 0) /
    vinculosInternos.length;
  const densidad = calcularDensidadComunidad(grafo, miembros);

  return (confianzaPromedio + densidad) / 2;
};

const clonarGrafo = grafo => ({
  nodos: [...grafo.nodos],
  vinculos: [...grafo.vinculos],
});

const obtenerIdEnlace = vinculo => {
  return `${Math.min(
    vinculo.persona_origen_id,
    vinculo.persona_destino_id
  )}-${Math.max(vinculo.persona_origen_id, vinculo.persona_destino_id)}`;
};

const calcularBetweennessEnlaces = grafo => {
  const betweenness = {};

  // Inicializar
  grafo.vinculos.forEach(v => {
    betweenness[obtenerIdEnlace(v)] = 0;
  });

  // Para cada par de nodos, calcular caminos más cortos
  grafo.nodos.forEach(origen => {
    grafo.nodos.forEach(destino => {
      if (origen.id !== destino.id) {
        const caminos = encontrarTodosLosCaminosCortos(
          grafo,
          origen.id,
          destino.id
        );

        caminos.forEach(camino => {
          for (let i = 0; i < camino.length - 1; i++) {
            const enlaceId = obtenerIdEnlace({
              persona_origen_id: camino[i],
              persona_destino_id: camino[i + 1],
            });

            if (betweenness[enlaceId] !== undefined) {
              betweenness[enlaceId] += 1 / caminos.length;
            }
          }
        });
      }
    });
  });

  return betweenness;
};

const encontrarTodosLosCaminosCortos = (grafo, origen, destino) => {
  // Implementación simplificada - usar BFS para encontrar caminos más cortos
  const cola = [[origen]];
  const caminos = [];
  let longitudMinima = Infinity;

  while (cola.length > 0) {
    const caminoActual = cola.shift();
    const nodoActual = caminoActual[caminoActual.length - 1];

    if (caminoActual.length > longitudMinima) continue;

    if (nodoActual === destino) {
      if (caminoActual.length < longitudMinima) {
        longitudMinima = caminoActual.length;
        caminos.length = 0;
      }
      if (caminoActual.length === longitudMinima) {
        caminos.push([...caminoActual]);
      }
      continue;
    }

    const vecinos = obtenerVecinos(grafo, nodoActual);
    vecinos.forEach(vecino => {
      if (!caminoActual.includes(vecino)) {
        cola.push([...caminoActual, vecino]);
      }
    });
  }

  return caminos;
};

const detectarComponentesConexas = grafo => {
  const visitados = new Set();
  const componentes = [];

  grafo.nodos.forEach(nodo => {
    if (!visitados.has(nodo.id)) {
      const componente = [];
      const pila = [nodo.id];

      while (pila.length > 0) {
        const nodoActual = pila.pop();

        if (visitados.has(nodoActual)) continue;

        visitados.add(nodoActual);
        componente.push(nodoActual);

        const vecinos = obtenerVecinos(grafo, nodoActual);
        pila.push(...vecinos.filter(v => !visitados.has(v)));
      }

      if (componente.length > 0) {
        componentes.push(componente);
      }
    }
  });

  return componentes;
};

const calcularModularidadComponentes = (grafo, componentes) => {
  const comunidades = {};

  componentes.forEach((componente, index) => {
    componente.forEach(nodoId => {
      comunidades[nodoId] = index;
    });
  });

  return calcularModularidad(grafo, comunidades);
};

const esBandaPotencial = (grafo, miembros) => {
  const densidad = calcularDensidadComunidad(grafo, miembros);
  const cohesion = calcularCohesion(grafo, miembros);

  return miembros.length >= 3 && densidad > 0.4 && cohesion > 0.3;
};

const analizarEstructuraJerarquica = dendrograma => {
  return {
    niveles_jerarquia: dendrograma.length,
    mejor_particion_nivel: dendrograma.findIndex(
      d => d.modularidad === Math.max(...dendrograma.map(d => d.modularidad))
    ),
    estabilidad: calcularEstabilidadJerarquia(dendrograma),
    patrones_division: analizarPatronesDivision(dendrograma),
  };
};

const calcularEstabilidadJerarquia = dendrograma => {
  if (dendrograma.length < 2) return 1;

  const modulariades = dendrograma.map(d => d.modularidad);
  const variacion = Math.sqrt(
    modulariades.reduce((sum, m) => {
      const promedio =
        modulariades.reduce((s, v) => s + v, 0) / modulariades.length;
      return sum + Math.pow(m - promedio, 2);
    }, 0) / modulariades.length
  );

  return Math.max(0, 1 - variacion);
};

const analizarPatronesDivision = dendrograma => {
  return dendrograma.map((nivel, index) => ({
    nivel: index,
    num_comunidades: nivel.comunidades.length,
    tamaño_promedio:
      nivel.comunidades.reduce((sum, c) => sum + c.tamaño, 0) /
      nivel.comunidades.length,
    division_balanceada: calcularBalanceDivision(nivel.comunidades),
  }));
};

const calcularBalanceDivision = comunidades => {
  if (comunidades.length < 2) return 1;

  const tamanos = comunidades.map(c => c.tamaño);
  const promedio = tamanos.reduce((sum, t) => sum + t, 0) / tamanos.length;
  const varianza =
    tamanos.reduce((sum, t) => sum + Math.pow(t - promedio, 2), 0) /
    tamanos.length;

  return Math.max(0, 1 - Math.sqrt(varianza) / promedio);
};

const encontrarCliqueMaximo = (
  grafo,
  nodoInicial,
  umbralConfianza,
  tamañoMaximo
) => {
  const candidatos = [nodoInicial];
  const vecinosAlta = obtenerVecinosPonderados(grafo, nodoInicial)
    .filter(v => v.peso >= umbralConfianza)
    .map(v => v.vecinoId);

  // Algoritmo greedy para encontrar clique
  for (const vecino of vecinosAlta) {
    if (candidatos.length >= tamañoMaximo) break;

    // Verificar si el vecino está conectado a todos los candidatos actuales
    const conectadoATodos = candidatos.every(candidato => {
      if (candidato === vecino) return true;
      return grafo.vinculos.some(
        v =>
          ((v.persona_origen_id === candidato &&
            v.persona_destino_id === vecino) ||
            (v.persona_origen_id === vecino &&
              v.persona_destino_id === candidato)) &&
          (v.nivel_confianza || 0.5) >= umbralConfianza
      );
    });

    if (conectadoATodos) {
      candidatos.push(vecino);
    }
  }

  return candidatos;
};

const verificarCelulaOperativa = (grafo, miembros, umbralConfianza) => {
  const densidad = calcularDensidadComunidad(grafo, miembros);
  const confianzaPromedio = calcularConfianzaPromedio(grafo, miembros);

  return densidad > 0.6 && confianzaPromedio >= umbralConfianza;
};

const calcularConfianzaPromedio = (grafo, miembros) => {
  const conjuntoMiembros = new Set(miembros);
  const vinculosInternos = grafo.vinculos.filter(
    v =>
      conjuntoMiembros.has(v.persona_origen_id) &&
      conjuntoMiembros.has(v.persona_destino_id)
  );

  if (vinculosInternos.length === 0) return 0;

  return (
    vinculosInternos.reduce((sum, v) => sum + (v.nivel_confianza || 0.5), 0) /
    vinculosInternos.length
  );
};

const clasificarTipoCelula = (grafo, miembros) => {
  // Analizar tipos de vínculos para clasificar la célula
  const conjuntoMiembros = new Set(miembros);
  const vinculosInternos = grafo.vinculos.filter(
    v =>
      conjuntoMiembros.has(v.persona_origen_id) &&
      conjuntoMiembros.has(v.persona_destino_id)
  );

  const tiposVinculos = vinculosInternos.map(v => v.tipo_vinculacion);
  const tiposDominantes = [...new Set(tiposVinculos)];

  if (tiposDominantes.includes('jerarquia_comando')) return 'comando';
  if (tiposDominantes.includes('coordinacion_operativa')) return 'operativa';
  if (tiposDominantes.includes('familiar_sangre')) return 'familiar';
  if (tiposDominantes.includes('socio_comercial')) return 'comercial';

  return 'mixta';
};

const estimarNivelActividad = (grafo, miembros) => {
  const conexionesExternas = contarConexionesExternas(grafo, miembros);
  const densidadInterna = calcularDensidadComunidad(grafo, miembros);

  const scoreActividad =
    (conexionesExternas / miembros.length) * 0.6 + densidadInterna * 0.4;

  if (scoreActividad > 0.7) return 'alta';
  if (scoreActividad > 0.4) return 'media';
  return 'baja';
};

const generarRecomendacionesIntervencion = celulas => {
  return celulas
    .filter(c => c.actividad_estimada === 'alta')
    .map(c => ({
      celula_id: c.id,
      tipo_intervencion: determinarTipoIntervencion(c),
      prioridad: c.tipo_celula === 'comando' ? 'alta' : 'media',
      recursos_requeridos: estimarRecursosRequeridos(c),
      riesgo_fuga: calcularRiesgoFuga(c),
    }));
};

const determinarTipoIntervencion = celula => {
  if (celula.tipo_celula === 'comando') return 'operativo_simultaneo';
  if (celula.cohesion > 0.8) return 'infiltracion_vigilancia';
  return 'investigacion_profunda';
};

const estimarRecursosRequeridos = celula => {
  if (celula.tamaño > 5 && celula.tipo_celula === 'comando') return 'alto';
  if (celula.actividad_estimada === 'alta') return 'medio';
  return 'bajo';
};

const calcularRiesgoFuga = celula => {
  const factorTamaño = celula.tamaño / 10;
  const factorConexiones = celula.conexiones_externas / 20;

  return Math.min(factorTamaño + factorConexiones, 1);
};

const detectarHubsComunicacion = grafo => {
  // Implementación simplificada
  return grafo.nodos
    .map(nodo => ({
      nodo_id: nodo.id,
      conexiones_comunicacion: obtenerVecinos(grafo, nodo.id).length,
      centralidad_comunicacion:
        obtenerVecinos(grafo, nodo.id).length / (grafo.nodos.length - 1),
    }))
    .filter(hub => hub.conexiones_comunicacion >= 3)
    .sort((a, b) => b.centralidad_comunicacion - a.centralidad_comunicacion);
};

const detectarCadenasComunicacion = grafo => {
  // Buscar caminos de comunicación largos
  const cadenas = [];
  // Implementación simplificada - detectar caminos lineales
  return cadenas;
};

const detectarPuentesEntreGrupos = grafo => {
  // Detectar nodos que conectan diferentes grupos
  return [];
};

const analizarPatronesComunicacion = grafo => {
  return {
    densidad_comunicacion:
      grafo.vinculos.length /
      ((grafo.nodos.length * (grafo.nodos.length - 1)) / 2),
    frecuencia_promedio:
      grafo.vinculos.reduce((sum, v) => sum + (v.nivel_confianza || 0.5), 0) /
      grafo.vinculos.length,
    tipos_comunicacion: [
      ...new Set(grafo.vinculos.map(v => v.tipo_vinculacion)),
    ],
  };
};

const identificarVulnerabilidadesComunicacion = grafo => {
  return {
    puntos_falla: [], // Nodos cuya eliminación fragmentaría la comunicación
    canales_criticos: [], // Enlaces críticos de comunicación
    redundancia: 0, // Nivel de redundancia en las comunicaciones
  };
};

export default {
  detectarComunidadesLouvain,
  detectarComunidadesPropagacion,
  detectarComunidadesJerarquicas,
  detectarCelulasOperativas,
  detectarRedesComunicacion,
};
