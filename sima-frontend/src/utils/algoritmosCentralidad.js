/**
 * Algoritmos de análisis de centralidad para redes criminales
 * Implementa algoritmos especializados para análisis de inteligencia policial
 */

/**
 * Calcula la centralidad de grado (Degree Centrality)
 * Mide la importancia de un nodo basada en el número de conexiones directas
 */
export const calcularCentralidadGrado = grafo => {
  const centralidades = {};
  const totalNodos = grafo.nodos.length;

  grafo.nodos.forEach(nodo => {
    const conexiones = grafo.vinculos.filter(
      vinculo =>
        vinculo.persona_origen_id === nodo.id ||
        vinculo.persona_destino_id === nodo.id
    ).length;

    // Normalizar por el máximo posible de conexiones (n-1)
    centralidades[nodo.id] = {
      degree: conexiones / (totalNodos - 1),
      connections_count: conexiones,
      normalized_score: conexiones / (totalNodos - 1),
    };
  });

  return centralidades;
};

/**
 * Calcula la centralidad de intermediación (Betweenness Centrality)
 * Identifica nodos que actúan como puentes entre otros nodos
 * Crítico para identificar facilitadores y coordinadores
 */
export const calcularCentralidadIntermediacion = grafo => {
  const centralidades = {};
  const nodos = grafo.nodos.map(n => n.id);

  // Inicializar centralidades
  nodos.forEach(nodo => {
    centralidades[nodo] = {
      betweenness: 0,
      paths_through: 0,
      bridge_score: 0,
    };
  });

  // Para cada par de nodos, encontrar caminos más cortos
  for (let i = 0; i < nodos.length; i++) {
    for (let j = i + 1; j < nodos.length; j++) {
      const origen = nodos[i];
      const destino = nodos[j];

      const caminosCortos = encontrarCaminosCortos(grafo, origen, destino);

      if (caminosCortos.length > 0) {
        // Contar cuántos caminos pasan por cada nodo intermedio
        caminosCortos.forEach(camino => {
          // Excluir origen y destino del camino
          const nodosIntermedios = camino.slice(1, -1);

          nodosIntermedios.forEach(nodoIntermedio => {
            centralidades[nodoIntermedio].betweenness +=
              1 / caminosCortos.length;
            centralidades[nodoIntermedio].paths_through += 1;
          });
        });
      }
    }
  }

  // Normalizar por el máximo posible
  const maxPosible = ((nodos.length - 1) * (nodos.length - 2)) / 2;

  nodos.forEach(nodo => {
    if (maxPosible > 0) {
      centralidades[nodo].betweenness /= maxPosible;
      centralidades[nodo].bridge_score = centralidades[nodo].betweenness;
    }
  });

  return centralidades;
};

/**
 * Calcula la centralidad de cercanía (Closeness Centrality)
 * Mide qué tan cerca está un nodo de todos los otros nodos
 * Útil para identificar líderes o coordinadores centrales
 */
export const calcularCentralidadCercania = grafo => {
  const centralidades = {};
  const nodos = grafo.nodos.map(n => n.id);

  nodos.forEach(nodoOrigen => {
    let sumaDistancias = 0;
    let nodosAlcanzables = 0;

    nodos.forEach(nodoDestino => {
      if (nodoOrigen !== nodoDestino) {
        const distancia = encontrarDistanciaMinima(
          grafo,
          nodoOrigen,
          nodoDestino
        );

        if (distancia !== Infinity) {
          sumaDistancias += distancia;
          nodosAlcanzables++;
        }
      }
    });

    // Calcular centralidad de cercanía
    if (nodosAlcanzables > 0) {
      const distanciaPromedio = sumaDistancias / nodosAlcanzables;
      centralidades[nodoOrigen] = {
        closeness: 1 / distanciaPromedio,
        average_distance: distanciaPromedio,
        reachable_nodes: nodosAlcanzables,
        connectivity_score: nodosAlcanzables / (nodos.length - 1),
      };
    } else {
      centralidades[nodoOrigen] = {
        closeness: 0,
        average_distance: Infinity,
        reachable_nodes: 0,
        connectivity_score: 0,
      };
    }
  });

  return centralidades;
};

/**
 * Calcula la centralidad de vector propio (Eigenvector Centrality)
 * Considera no solo el número de conexiones, sino la importancia de los nodos conectados
 * Identifica personas conectadas a otras personas importantes
 */
export const calcularCentralidadVectorPropio = (
  grafo,
  iteraciones = 100,
  tolerancia = 1e-6
) => {
  const nodos = grafo.nodos.map(n => n.id);
  const n = nodos.length;

  // Crear matriz de adyacencia ponderada
  const matriz = crearMatrizAdyacencia(grafo);

  // Inicializar vector propio con valores aleatorios
  let vectorPropio = {};
  nodos.forEach(nodo => {
    vectorPropio[nodo] = Math.random();
  });

  // Método de potencias para encontrar el vector propio dominante
  for (let iter = 0; iter < iteraciones; iter++) {
    const nuevoVector = {};

    // Multiplicar matriz por vector
    nodos.forEach(nodo => {
      nuevoVector[nodo] = 0;
      nodos.forEach(otroNodo => {
        nuevoVector[nodo] += matriz[nodo][otroNodo] * vectorPropio[otroNodo];
      });
    });

    // Normalizar el vector
    const norma = Math.sqrt(
      Object.values(nuevoVector).reduce((sum, val) => sum + val * val, 0)
    );

    if (norma > 0) {
      Object.keys(nuevoVector).forEach(nodo => {
        nuevoVector[nodo] /= norma;
      });
    }

    // Verificar convergencia
    const diferencia = nodos.reduce((sum, nodo) => {
      return sum + Math.abs(nuevoVector[nodo] - vectorPropio[nodo]);
    }, 0);

    vectorPropio = nuevoVector;

    if (diferencia < tolerancia) {
      break;
    }
  }

  // Convertir a objeto de centralidades
  const centralidades = {};
  nodos.forEach(nodo => {
    centralidades[nodo] = {
      eigenvector: Math.abs(vectorPropio[nodo]),
      influence_score: Math.abs(vectorPropio[nodo]),
      network_importance: Math.abs(vectorPropio[nodo]),
    };
  });

  return centralidades;
};

/**
 * Calcula múltiples métricas de centralidad de forma combinada
 * Proporciona un análisis completo de la importancia de cada nodo
 */
export const calcularCentralidadCompleta = grafo => {
  const centralidadGrado = calcularCentralidadGrado(grafo);
  const centralidadIntermediacion = calcularCentralidadIntermediacion(grafo);
  const centralidadCercania = calcularCentralidadCercania(grafo);
  const centralidadVectorPropio = calcularCentralidadVectorPropio(grafo);

  const centralidadCompleta = {};

  grafo.nodos.forEach(nodo => {
    const id = nodo.id;

    // Combinar todas las métricas
    const grado = centralidadGrado[id]?.degree || 0;
    const intermediacion = centralidadIntermediacion[id]?.betweenness || 0;
    const cercania = centralidadCercania[id]?.closeness || 0;
    const vectorPropio = centralidadVectorPropio[id]?.eigenvector || 0;

    // Calcular score combinado ponderado
    const scoreCombinadoPonderado =
      grado * 0.25 +
      intermediacion * 0.35 +
      cercania * 0.25 +
      vectorPropio * 0.15;

    centralidadCompleta[id] = {
      // Métricas individuales
      degree: grado,
      betweenness: intermediacion,
      closeness: cercania,
      eigenvector: vectorPropio,

      // Métricas derivadas
      combined_score: scoreCombinadoPonderado,
      rank_importance: 0, // Se calculará después del ordenamiento

      // Clasificación criminal específica
      is_hub: grado > 0.7 && intermediacion > 0.5,
      is_bridge: intermediacion > 0.6,
      is_central_leader: scoreCombinadoPonderado > 0.7,
      is_key_connector: intermediacion > 0.4 && grado > 0.5,

      // Métricas adicionales de los cálculos individuales
      connections_count: centralidadGrado[id]?.connections_count || 0,
      paths_through: centralidadIntermediacion[id]?.paths_through || 0,
      average_distance: centralidadCercania[id]?.average_distance || Infinity,
      reachable_nodes: centralidadCercania[id]?.reachable_nodes || 0,
    };
  });

  // Calcular rankings
  const nodosPorImportancia = Object.keys(centralidadCompleta).sort(
    (a, b) =>
      centralidadCompleta[b].combined_score -
      centralidadCompleta[a].combined_score
  );

  nodosPorImportancia.forEach((nodoId, index) => {
    centralidadCompleta[nodoId].rank_importance = index + 1;
  });

  return centralidadCompleta;
};

/**
 * Identifica nodos críticos cuya eliminación fragmentaría la red
 * Esencial para estrategias de desarticulación de bandas
 */
export const identificarNodosCriticos = grafo => {
  const centralidades = calcularCentralidadCompleta(grafo);
  const nodosCriticos = [];

  Object.keys(centralidades).forEach(nodoId => {
    const metrica = centralidades[nodoId];

    // Simular eliminación del nodo
    const grafoSinNodo = eliminarNodoDelGrafo(grafo, nodoId);
    const componentesOriginales = contarComponentesConexas(grafo);
    const componentesSinNodo = contarComponentesConexas(grafoSinNodo);

    const esNodoCritico =
      componentesSinNodo > componentesOriginales || // Fragmenta la red
      metrica.betweenness > 0.5 || // Alta intermediación
      metrica.is_bridge || // Es puente
      metrica.combined_score > 0.6; // Alta importancia general

    if (esNodoCritico) {
      nodosCriticos.push({
        nodo_id: nodoId,
        tipo_criticidad: determinarTipoCriticidad(
          metrica,
          componentesSinNodo - componentesOriginales
        ),
        impacto_eliminacion: componentesSinNodo - componentesOriginales,
        centralidad_combinada: metrica.combined_score,
        intermediacion: metrica.betweenness,
        prioridad_intervencion: calcularPrioridadIntervencion(metrica),
      });
    }
  });

  return nodosCriticos.sort(
    (a, b) => b.prioridad_intervencion - a.prioridad_intervencion
  );
};

// === FUNCIONES AUXILIARES ===

/**
 * Encuentra caminos más cortos entre dos nodos usando BFS
 */
const encontrarCaminosCortos = (grafo, origen, destino) => {
  if (origen === destino) return [[origen]];

  const cola = [[origen]];
  const visitados = new Set();
  const caminos = [];
  let longitudMinima = Infinity;

  while (cola.length > 0) {
    const caminoActual = cola.shift();
    const nodoActual = caminoActual[caminoActual.length - 1];

    if (caminoActual.length > longitudMinima) continue;

    if (nodoActual === destino) {
      if (caminoActual.length < longitudMinima) {
        longitudMinima = caminoActual.length;
        caminos.length = 0; // Limpiar caminos más largos
      }
      if (caminoActual.length === longitudMinima) {
        caminos.push([...caminoActual]);
      }
      continue;
    }

    if (visitados.has(nodoActual)) continue;
    visitados.add(nodoActual);

    // Encontrar vecinos
    const vecinos = grafo.vinculos
      .filter(
        v =>
          v.persona_origen_id === nodoActual ||
          v.persona_destino_id === nodoActual
      )
      .map(v =>
        v.persona_origen_id === nodoActual
          ? v.persona_destino_id
          : v.persona_origen_id
      )
      .filter(vecino => !caminoActual.includes(vecino));

    vecinos.forEach(vecino => {
      cola.push([...caminoActual, vecino]);
    });
  }

  return caminos;
};

/**
 * Encuentra la distancia mínima entre dos nodos
 */
const encontrarDistanciaMinima = (grafo, origen, destino) => {
  if (origen === destino) return 0;

  const cola = [{ nodo: origen, distancia: 0 }];
  const visitados = new Set();

  while (cola.length > 0) {
    const { nodo, distancia } = cola.shift();

    if (nodo === destino) return distancia;
    if (visitados.has(nodo)) continue;

    visitados.add(nodo);

    // Encontrar vecinos
    const vecinos = grafo.vinculos
      .filter(
        v => v.persona_origen_id === nodo || v.persona_destino_id === nodo
      )
      .map(v =>
        v.persona_origen_id === nodo
          ? v.persona_destino_id
          : v.persona_origen_id
      )
      .filter(vecino => !visitados.has(vecino));

    vecinos.forEach(vecino => {
      cola.push({ nodo: vecino, distancia: distancia + 1 });
    });
  }

  return Infinity; // No hay camino
};

/**
 * Crea matriz de adyacencia ponderada por confianza
 */
const crearMatrizAdyacencia = grafo => {
  const nodos = grafo.nodos.map(n => n.id);
  const matriz = {};

  // Inicializar matriz
  nodos.forEach(nodo => {
    matriz[nodo] = {};
    nodos.forEach(otroNodo => {
      matriz[nodo][otroNodo] = 0;
    });
  });

  // Llenar con pesos de los vínculos
  grafo.vinculos.forEach(vinculo => {
    const peso = vinculo.nivel_confianza || 0.5;
    matriz[vinculo.persona_origen_id][vinculo.persona_destino_id] = peso;
    matriz[vinculo.persona_destino_id][vinculo.persona_origen_id] = peso; // Grafo no dirigido
  });

  return matriz;
};

/**
 * Elimina un nodo del grafo para análisis de criticidad
 */
const eliminarNodoDelGrafo = (grafo, nodoId) => {
  return {
    nodos: grafo.nodos.filter(n => n.id !== nodoId),
    vinculos: grafo.vinculos.filter(
      v => v.persona_origen_id !== nodoId && v.persona_destino_id !== nodoId
    ),
  };
};

/**
 * Cuenta componentes conexas en el grafo
 */
const contarComponentesConexas = grafo => {
  const visitados = new Set();
  let componentes = 0;

  grafo.nodos.forEach(nodo => {
    if (!visitados.has(nodo.id)) {
      // DFS para marcar toda la componente conexa
      const pila = [nodo.id];

      while (pila.length > 0) {
        const nodoActual = pila.pop();

        if (visitados.has(nodoActual)) continue;
        visitados.add(nodoActual);

        // Encontrar vecinos
        const vecinos = grafo.vinculos
          .filter(
            v =>
              v.persona_origen_id === nodoActual ||
              v.persona_destino_id === nodoActual
          )
          .map(v =>
            v.persona_origen_id === nodoActual
              ? v.persona_destino_id
              : v.persona_origen_id
          )
          .filter(vecino => !visitados.has(vecino));

        pila.push(...vecinos);
      }

      componentes++;
    }
  });

  return componentes;
};

/**
 * Determina el tipo de criticidad de un nodo
 */
const determinarTipoCriticidad = (metrica, impactoFragmentacion) => {
  if (impactoFragmentacion > 0) return 'fragmentador';
  if (metrica.betweenness > 0.7) return 'puente_critico';
  if (metrica.is_central_leader) return 'lider_central';
  if (metrica.is_key_connector) return 'conector_clave';
  return 'nodo_importante';
};

/**
 * Calcula prioridad de intervención basada en métricas combinadas
 */
const calcularPrioridadIntervencion = metrica => {
  return (
    metrica.combined_score * 0.4 +
    metrica.betweenness * 0.3 +
    metrica.degree * 0.2 +
    (metrica.is_central_leader ? 0.1 : 0)
  );
};

export default {
  calcularCentralidadGrado,
  calcularCentralidadIntermediacion,
  calcularCentralidadCercania,
  calcularCentralidadVectorPropio,
  calcularCentralidadCompleta,
  identificarNodosCriticos,
};
