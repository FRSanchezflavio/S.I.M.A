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
} from '@mui/icons-material';

// DATOS DE PRUEBA PARA VISUALIZACIÓN
const DATOS_PRUEBA = {
  nodos: [
    {
      id: 1,
      nombre: 'Carlos Mendez',
      nivel: 0,
      centralidad: 0.9,
      es_lider_banda: true,
      dni: '12345678',
    },
    {
      id: 2,
      nombre: 'Ana Gutierrez',
      nivel: 1,
      centralidad: 0.7,
      en_banda: true,
      dni: '23456789',
    },
    {
      id: 3,
      nombre: 'Luis Rodriguez',
      nivel: 1,
      centralidad: 0.6,
      en_banda: true,
      dni: '34567890',
    },
    {
      id: 4,
      nombre: 'Maria Lopez',
      nivel: 2,
      centralidad: 0.4,
      en_banda: false,
      dni: '45678901',
    },
    {
      id: 5,
      nombre: 'Pedro Silva',
      nivel: 2,
      centralidad: 0.3,
      en_banda: false,
      dni: '56789012',
    },
    {
      id: 6,
      nombre: 'Sofia Martinez',
      nivel: 1,
      centralidad: 0.5,
      en_banda: true,
      dni: '67890123',
    },
  ],
  vinculos: [
    {
      id: 1,
      source: 1,
      target: 2,
      tipo: 'familiar_sangre',
      nivel_confianza: 0.9,
      fuerza: 'muy_fuerte',
    },
    {
      id: 2,
      source: 1,
      target: 3,
      tipo: 'complice_directo',
      nivel_confianza: 0.8,
      fuerza: 'fuerte',
    },
    {
      id: 3,
      source: 2,
      target: 4,
      tipo: 'amistad_personal',
      nivel_confianza: 0.6,
      fuerza: 'moderada',
    },
    {
      id: 4,
      source: 3,
      target: 5,
      tipo: 'socio_comercial',
      nivel_confianza: 0.7,
      fuerza: 'fuerte',
    },
    {
      id: 5,
      source: 1,
      target: 6,
      tipo: 'jerarquia_comando',
      nivel_confianza: 0.8,
      fuerza: 'fuerte',
    },
    {
      id: 6,
      source: 6,
      target: 4,
      tipo: 'coordinacion_operativa',
      nivel_confianza: 0.5,
      fuerza: 'moderada',
    },
  ],
};

const VisualizadorRedCriminal = ({
  personaId = 1,
  onPersonaSelect,
  configuracion = {},
  altura = 600,
  personas = [],
  vinculaciones = [],
}) => {
  const svgRef = useRef();
  const containerRef = useRef();

  // Procesar datos reales si están disponibles
  const procesarDatosReales = () => {
    if (personas.length === 0) {
      return DATOS_PRUEBA;
    }

    // Convertir personas a nodos
    const nodos = personas.slice(0, 15).map((persona, index) => ({
      id: persona.dni || persona.id || index,
      nombre: `${persona.nombre} ${persona.apellido}`.trim(),
      nivel: index === 0 ? 0 : Math.floor(Math.random() * 3) + 1,
      centralidad: Math.random(),
      es_lider_banda: index === 0,
      en_banda: Math.random() > 0.4,
      dni: persona.dni,
      telefono: persona.telefono,
      direccion: persona.direccion,
    }));

    // Convertir vinculaciones a vínculos
    let vinculos = [];

    if (vinculaciones.length > 0) {
      vinculos = vinculaciones
        .map(vinculo => ({
          id:
            vinculo.id ||
            `${vinculo.persona_origen_id}-${vinculo.persona_destino_id}`,
          source: vinculo.persona_origen_id,
          target: vinculo.persona_destino_id,
          tipo: vinculo.tipo_vinculo,
          nivel_confianza: vinculo.nivel_confianza || 0.5,
          fuerza:
            vinculo.nivel_confianza > 0.8
              ? 'muy_fuerte'
              : vinculo.nivel_confianza > 0.6
              ? 'fuerte'
              : 'moderada',
          estado: vinculo.estado,
          evidencias: vinculo.evidencias,
        }))
        .filter(
          vinculo =>
            nodos.find(n => n.id == vinculo.source) &&
            nodos.find(n => n.id == vinculo.target)
        );
    } else {
      // Generar vínculos de demo
      for (let i = 1; i < Math.min(nodos.length, 8); i++) {
        if (Math.random() > 0.4) {
          vinculos.push({
            id: `demo-${i}`,
            source: nodos[0].id,
            target: nodos[i].id,
            tipo: 'complice_directo',
            nivel_confianza: Math.random(),
            fuerza: 'fuerte',
          });
        }
      }
    }

    return { nodos, vinculos };
  };

  const [datosRed, setDatosRed] = useState(procesarDatosReales());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulacion, setSimulacion] = useState(null);
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

  // Actualizar datos cuando cambien las props
  useEffect(() => {
    const nuevosdatos = procesarDatosReales();
    setDatosRed(nuevosdatos);
  }, [personas, vinculaciones]);

  // Inicializar visualización cuando cambien los datos
  useEffect(() => {
    if (datosRed.nodos.length > 0 && containerRef.current) {
      setTimeout(() => {
        inicializarVisualizacion();
      }, 100);
    }
  }, [
    datosRed,
    configuracionLocal.algoritmoLayout,
    configuracionLocal.escalaFuerza,
  ]);

  const inicializarVisualizacion = () => {
    if (!containerRef.current || !svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Limpiar SVG anterior
    svg.selectAll('*').remove();

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width || 800;
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
    const sim = configurarSimulacion(width, height);
    setSimulacion(sim);

    // Crear elementos visuales
    const { enlaces, nodos, etiquetas } = crearElementosVisuales(g, sim);

    // Configurar interacciones
    configurarInteracciones(nodos, enlaces, etiquetas, sim);

    // Inicializar simulación
    sim.nodes([...datosRed.nodos]);
    sim.force('link').links([...datosRed.vinculos]);
    sim.alpha(1).restart();
  };

  const configurarSimulacion = (width, height) => {
    const sim = d3
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
      sim.force(
        'radial',
        d3.forceRadial(d => d.nivel * 80 + 50, width / 2, height / 2)
      );
    }

    return sim;
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
      .attr('stroke-width', d => calcularAnchoBordeNodo(d))
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
        resaltarConexiones(d, nodos, enlaces);
      })
      .on('mouseout', () => {
        restablecerEstilos(nodos, enlaces);
      });

    // Click en enlace
    enlaces.on('click', (event, d) => {
      event.stopPropagation();
      console.log('Enlace seleccionado:', d);
    });
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

  const calcularAnchoBordeNodo = nodo => {
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
    return 0.3 + (enlace.nivel_confianza || 0.5) * 0.7;
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
            position: 'relative',
          }}
        >
          <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
        </Box>

        {/* Leyenda de colores */}
        <Box
          mt={2}
          p={2}
          bgcolor="background.paper"
          borderRadius={1}
          border="1px solid #ddd"
        >
          <Typography variant="subtitle2" gutterBottom>
            Leyenda de Vínculos:
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {Object.entries(TIPOS_VINCULACION).map(([tipo, config]) => (
              <Chip
                key={tipo}
                label={config.label}
                size="small"
                style={{ backgroundColor: config.color, color: 'white' }}
              />
            ))}
          </Box>
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
              <Chip
                label={`Centralidad: ${(
                  nodoSeleccionado.centralidad * 100
                ).toFixed(0)}%`}
                size="small"
              />
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
