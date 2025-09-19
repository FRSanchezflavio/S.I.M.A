import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Alert,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Refresh,
  Download,
  Settings,
  Info,
  FilterList,
  Fullscreen,
} from '@mui/icons-material';

const VisualizadorRedCriminal = ({
  personaId,
  onPersonaSelect,
  configuracion = {},
  altura = 600,
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [datosRed, setDatosRed] = useState({ nodos: [], vinculos: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configuracionLocal, setConfiguracionLocal] = useState({
    profundidad: 3,
    nivelConfianzaMin: 0.3,
    mostrarEtiquetas: true,
    colorearPorTipo: true,
    mostrarFuerza: true,
    algoritmoLayout: 'force',
    escalaFuerza: 1.0,
    ...configuracion,
  });
  const [dialogoConfig, setDialogoConfig] = useState(false);
  const [nodoSeleccionado, setNodoSeleccionado] = useState(null);
  const [zoom, setZoom] = useState(null);

  // Cargar datos de la red
  useEffect(() => {
    if (personaId) {
      cargarDatosRed();
    }
  }, [
    personaId,
    configuracionLocal.profundidad,
    configuracionLocal.nivelConfianzaMin,
  ]);

  // Inicializar visualización cuando cambien los datos
  useEffect(() => {
    if (datosRed.nodos.length > 0) {
      inicializarVisualizacion();
    }
  }, [
    datosRed,
    configuracionLocal.algoritmoLayout,
    configuracionLocal.escalaFuerza,
  ]);

  const cargarDatosRed = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/inteligencia/vinculaciones/analisis/red/${personaId}?` +
          `profundidad=${configuracionLocal.profundidad}&` +
          `nivel_confianza_min=${configuracionLocal.nivelConfianzaMin}&` +
          `incluir_metricas=true&incluir_clusters=true`
      );

      if (!response.ok) {
        throw new Error('Error al cargar datos de la red');
      }

      const datos = await response.json();
      setDatosRed(datos.red_completa);
    } catch (err) {
      setError(err.message);
      console.error('Error cargando red criminal:', err);
    } finally {
      setLoading(false);
    }
  };

  const inicializarVisualizacion = () => {
    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);

    // Limpiar SVG anterior
    svg.selectAll('*').remove();

    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width;
    const height = altura;

    svg.attr('width', width).attr('height', height);

    // Configurar zoom
    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    setZoom(zoomBehavior);

    // Grupo principal para elementos zoomables
    const g = svg.append('g');

    // Configurar simulación de fuerzas
    const simulacion = configurarSimulacion(width, height);

    // Crear elementos visuales
    const { enlaces, nodos, etiquetas } = crearElementosVisuales(g, simulacion);

    // Configurar interacciones
    configurarInteracciones(nodos, enlaces, etiquetas, simulacion);

    // Inicializar simulación
    simulacion.nodes(datosRed.nodos);
    simulacion.force('link').links(datosRed.vinculos);
    simulacion.alpha(1).restart();
  };

  const configurarSimulacion = (width, height) => {
    const simulacion = d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id(d => d.id)
          .distance(d => calcularDistanciaEnlace(d))
          .strength(
            d => configuracionLocal.escalaFuerza * calcularFuerzaEnlace(d)
          )
      )
      .force(
        'charge',
        d3.forceManyBody().strength(d => calcularCargaNodo(d))
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide().radius(d => calcularRadioNodo(d) + 5)
      );

    // Algoritmos adicionales según configuración
    if (configuracionLocal.algoritmoLayout === 'radial') {
      simulacion.force(
        'radial',
        d3.forceRadial(d => d.nivel * 80 + 50, width / 2, height / 2)
      );
    }

    return simulacion;
  };

  const crearElementosVisuales = (g, simulacion) => {
    // Definir marcadores para las flechas
    const defs = g.append('defs');

    Object.keys(TIPOS_VINCULACION).forEach(tipo => {
      defs
        .append('marker')
        .attr('id', `flecha-${tipo}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', TIPOS_VINCULACION[tipo].color);
    });

    // Crear enlaces
    const enlaces = g
      .append('g')
      .attr('class', 'enlaces')
      .selectAll('line')
      .data(datosRed.vinculos)
      .enter()
      .append('line')
      .attr('class', 'enlace')
      .attr('stroke', d => obtenerColorEnlace(d))
      .attr('stroke-width', d => calcularAnchoEnlace(d))
      .attr('stroke-opacity', d => calcularOpacidadEnlace(d))
      .attr('marker-end', d => `url(#flecha-${d.tipo})`)
      .style('cursor', 'pointer');

    // Crear nodos
    const nodos = g
      .append('g')
      .attr('class', 'nodos')
      .selectAll('circle')
      .data(datosRed.nodos)
      .enter()
      .append('circle')
      .attr('class', 'nodo')
      .attr('r', d => calcularRadioNodo(d))
      .attr('fill', d => obtenerColorNodo(d))
      .attr('stroke', d => obtenerBordeNodo(d))
      .attr('stroke-width', d => calcularAnchobordeNodo(d))
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    // Crear etiquetas (si están habilitadas)
    let etiquetas = null;
    if (configuracionLocal.mostrarEtiquetas) {
      etiquetas = g
        .append('g')
        .attr('class', 'etiquetas')
        .selectAll('text')
        .data(datosRed.nodos)
        .enter()
        .append('text')
        .attr('class', 'etiqueta')
        .attr('dx', d => calcularRadioNodo(d) + 8)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-family', 'Arial, sans-serif')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .text(d => truncarTexto(d.nombre, 15));
    }

    // Configurar animación de la simulación
    simulacion.on('tick', () => {
      enlaces
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodos.attr('cx', d => d.x).attr('cy', d => d.y);

      if (etiquetas) {
        etiquetas.attr('x', d => d.x).attr('y', d => d.y);
      }
    });

    return { enlaces, nodos, etiquetas };
  };

  const configurarInteracciones = (nodos, enlaces, etiquetas, simulacion) => {
    // Click en nodo
    nodos.on('click', (event, d) => {
      event.stopPropagation();
      setNodoSeleccionado(d);
      if (onPersonaSelect) {
        onPersonaSelect(d.id);
      }
      resaltarConexiones(d, nodos, enlaces);
    });

    // Hover en nodo
    nodos
      .on('mouseover', (event, d) => {
        mostrarTooltipNodo(event, d);
        resaltarConexiones(d, nodos, enlaces);
      })
      .on('mouseout', () => {
        ocultarTooltip();
        restablecerEstilos(nodos, enlaces);
      });

    // Click en enlace
    enlaces.on('click', (event, d) => {
      event.stopPropagation();
      mostrarInfoEnlace(d);
    });

    // Funciones de drag
    function dragStarted(event, d) {
      if (!event.active) simulacion.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulacion.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  // Funciones de cálculo de estilos
  const calcularRadioNodo = nodo => {
    const baseSize = 8;
    const factorNivel = Math.max(1, 4 - nodo.nivel);
    const factorCentralidad = nodo.centralidad || 1;
    return baseSize + factorNivel * 2 + factorCentralidad * 3;
  };

  const obtenerColorNodo = nodo => {
    if (!configuracionLocal.colorearPorTipo) {
      return '#69b3a2';
    }

    if (nodo.nivel === 0) return '#ff6b6b'; // Persona central
    if (nodo.es_lider_banda) return '#4ecdc4';
    if (nodo.en_banda) return '#45b7d1';
    return '#96ceb4'; // Por defecto
  };

  const obtenerBordeNodo = nodo => {
    if (nodoSeleccionado && nodoSeleccionado.id === nodo.id) {
      return '#ff4757';
    }
    return '#fff';
  };

  const calcularAnchobordeNodo = nodo => {
    if (nodoSeleccionado && nodoSeleccionado.id === nodo.id) {
      return 3;
    }
    return 1.5;
  };

  const obtenerColorEnlace = enlace => {
    if (!configuracionLocal.colorearPorTipo) {
      return '#999';
    }

    const colores = {
      familiar_sangre: '#e74c3c',
      complice_directo: '#e67e22',
      socio_comercial: '#f39c12',
      jerarquia_comando: '#9b59b6',
      coordinacion_operativa: '#3498db',
      amistad_personal: '#2ecc71',
    };

    return colores[enlace.tipo] || '#95a5a6';
  };

  const calcularAnchoEnlace = enlace => {
    const factorConfianza = enlace.nivel_confianza || 0.5;
    const factorFuerza = FACTORES_FUERZA[enlace.fuerza] || 0.5;
    return 1 + factorConfianza * factorFuerza * 4;
  };

  const calcularOpacidadEnlace = enlace => {
    return 0.3 + enlace.nivel_confianza * 0.7;
  };

  const calcularDistanciaEnlace = enlace => {
    const baseDistance = 100;
    const factorFuerza = FACTORES_FUERZA[enlace.fuerza] || 0.5;
    return baseDistance * (1.5 - factorFuerza);
  };

  const calcularFuerzaEnlace = enlace => {
    const factorConfianza = enlace.nivel_confianza || 0.5;
    const factorFuerza = FACTORES_FUERZA[enlace.fuerza] || 0.5;
    return factorConfianza * factorFuerza;
  };

  const calcularCargaNodo = nodo => {
    const baseCarga = -300;
    const factorNivel = Math.max(0.5, 2 - nodo.nivel * 0.3);
    return baseCarga * factorNivel;
  };

  // Funciones de interacción
  const resaltarConexiones = (nodoFoco, nodos, enlaces) => {
    const nodosConectados = new Set();
    nodosConectados.add(nodoFoco.id);

    // Encontrar nodos conectados
    enlaces.each(function (d) {
      if (d.source.id === nodoFoco.id) {
        nodosConectados.add(d.target.id);
      } else if (d.target.id === nodoFoco.id) {
        nodosConectados.add(d.source.id);
      }
    });

    // Aplicar estilos de resaltado
    nodos
      .style('opacity', d => (nodosConectados.has(d.id) ? 1.0 : 0.3))
      .attr('stroke-width', d => (nodosConectados.has(d.id) ? 2 : 1));

    enlaces
      .style('opacity', d =>
        d.source.id === nodoFoco.id || d.target.id === nodoFoco.id ? 1.0 : 0.1
      )
      .attr('stroke-width', d =>
        d.source.id === nodoFoco.id || d.target.id === nodoFoco.id
          ? calcularAnchoEnlace(d) * 1.5
          : calcularAnchoEnlace(d)
      );
  };

  const restablecerEstilos = (nodos, enlaces) => {
    nodos.style('opacity', 1.0).attr('stroke-width', 1.5);

    enlaces
      .style('opacity', calcularOpacidadEnlace)
      .attr('stroke-width', calcularAnchoEnlace);
  };

  const mostrarTooltipNodo = (event, nodo) => {
    // Implementar tooltip usando biblioteca como Tippy.js o tooltip nativo
    console.log('Tooltip nodo:', nodo);
  };

  const ocultarTooltip = () => {
    // Ocultar tooltip
  };

  const mostrarInfoEnlace = enlace => {
    console.log('Info enlace:', enlace);
  };

  const truncarTexto = (texto, maxLength) => {
    return texto.length > maxLength
      ? texto.substring(0, maxLength - 3) + '...'
      : texto;
  };

  // Controles de zoom
  const zoomIn = () => {
    if (zoom) {
      d3.select(svgRef.current).transition().call(zoom.scaleBy, 1.5);
    }
  };

  const zoomOut = () => {
    if (zoom) {
      d3.select(svgRef.current)
        .transition()
        .call(zoom.scaleBy, 1 / 1.5);
    }
  };

  const resetearZoom = () => {
    if (zoom) {
      d3.select(svgRef.current)
        .transition()
        .call(zoom.transform, d3.zoomIdentity);
    }
  };

  const actualizarConfiguracion = nuevaConfig => {
    setConfiguracionLocal(prev => ({
      ...prev,
      ...nuevaConfig,
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Cargando red criminal...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
          <Button onClick={cargarDatosRed} variant="outlined">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Barra de herramientas */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            Red Criminal - {datosRed.nodos.length} personas,{' '}
            {datosRed.vinculos.length} vínculos
          </Typography>

          <Box display="flex" gap={1}>
            <Tooltip title="Acercar">
              <IconButton onClick={zoomIn} size="small">
                <ZoomIn />
              </IconButton>
            </Tooltip>

            <Tooltip title="Alejar">
              <IconButton onClick={zoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </Tooltip>

            <Tooltip title="Resetear zoom">
              <IconButton onClick={resetearZoom} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>

            <Tooltip title="Configuración">
              <IconButton onClick={() => setDialogoConfig(true)} size="small">
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Controles rápidos */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <FormControlLabel
            control={
              <Switch
                checked={configuracionLocal.mostrarEtiquetas}
                onChange={e =>
                  actualizarConfiguracion({
                    mostrarEtiquetas: e.target.checked,
                  })
                }
              />
            }
            label="Mostrar nombres"
          />

          <FormControlLabel
            control={
              <Switch
                checked={configuracionLocal.colorearPorTipo}
                onChange={e =>
                  actualizarConfiguracion({ colorearPorTipo: e.target.checked })
                }
              />
            }
            label="Colorear por tipo"
          />
        </Box>

        {/* Contenedor del SVG */}
        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: altura,
            border: '1px solid #ddd',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
        </Box>

        {/* Información del nodo seleccionado */}
        {nodoSeleccionado && (
          <Box
            mt={2}
            p={2}
            bgcolor="background.paper"
            borderRadius={1}
            border="1px solid #ddd"
          >
            <Typography variant="subtitle1" gutterBottom>
              {nodoSeleccionado.nombre}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label={`Nivel: ${nodoSeleccionado.nivel}`} size="small" />
              <Chip label={`DNI: ${nodoSeleccionado.dni}`} size="small" />
              {nodoSeleccionado.en_banda && (
                <Chip label="En banda" color="warning" size="small" />
              )}
              {nodoSeleccionado.es_lider_banda && (
                <Chip label="Líder" color="error" size="small" />
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      {/* Diálogo de configuración */}
      <Dialog
        open={dialogoConfig}
        onClose={() => setDialogoConfig(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configuración de Visualización</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <FormControl fullWidth>
              <InputLabel>Algoritmo de Layout</InputLabel>
              <Select
                value={configuracionLocal.algoritmoLayout}
                onChange={e =>
                  actualizarConfiguracion({ algoritmoLayout: e.target.value })
                }
                label="Algoritmo de Layout"
              >
                <MenuItem value="force">Fuerzas dirigidas</MenuItem>
                <MenuItem value="radial">Radial</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography gutterBottom>
                Profundidad de la red: {configuracionLocal.profundidad}
              </Typography>
              <Slider
                value={configuracionLocal.profundidad}
                onChange={(e, value) =>
                  actualizarConfiguracion({ profundidad: value })
                }
                min={1}
                max={5}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography gutterBottom>
                Nivel mínimo de confianza:{' '}
                {configuracionLocal.nivelConfianzaMin}
              </Typography>
              <Slider
                value={configuracionLocal.nivelConfianzaMin}
                onChange={(e, value) =>
                  actualizarConfiguracion({ nivelConfianzaMin: value })
                }
                min={0}
                max={1}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography gutterBottom>
                Escala de fuerza: {configuracionLocal.escalaFuerza}
              </Typography>
              <Slider
                value={configuracionLocal.escalaFuerza}
                onChange={(e, value) =>
                  actualizarConfiguracion({ escalaFuerza: value })
                }
                min={0.1}
                max={3}
                step={0.1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Button
              variant="contained"
              onClick={() => setDialogoConfig(false)}
              fullWidth
            >
              Aplicar configuración
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// Constantes de configuración
const TIPOS_VINCULACION = {
  familiar_sangre: { color: '#e74c3c', label: 'Familiar (Sangre)' },
  familiar_politico: { color: '#e67e22', label: 'Familiar (Político)' },
  complice_directo: { color: '#f39c12', label: 'Cómplice Directo' },
  socio_comercial: { color: '#f1c40f', label: 'Socio Comercial' },
  jerarquia_comando: { color: '#9b59b6', label: 'Jerarquía/Comando' },
  coordinacion_operativa: { color: '#3498db', label: 'Coordinación Operativa' },
  amistad_personal: { color: '#2ecc71', label: 'Amistad Personal' },
  rival_competencia: { color: '#e74c3c', label: 'Rival/Competencia' },
};

const FACTORES_FUERZA = {
  muy_fuerte: 1.0,
  fuerte: 0.8,
  moderada: 0.6,
  debil: 0.4,
  muy_debil: 0.2,
};

export default VisualizadorRedCriminal;
