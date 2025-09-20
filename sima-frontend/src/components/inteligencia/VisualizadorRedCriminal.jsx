import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Refresh,
  Settings,
  Download,
  Fullscreen,
  CenterFocusStrong,
  Timeline,
  AccountTree,
  Group,
} from '@mui/icons-material';
import * as d3 from 'd3';
import api from '../../services/api';
import { useToast } from '../ToastProvider';

// Configuración de colores para tipos de nodos
const NODE_COLORS = {
  persona_principal: '#1976d2', // Azul principal
  persona_secundaria: '#42a5f5', // Azul claro
  persona_investigada: '#f44336', // Rojo
  banda_detectada: '#9c27b0', // Púrpura
  ubicacion: '#4caf50', // Verde
  evento: '#ff9800', // Naranja
};

// Configuración de tipos de enlaces
const LINK_STYLES = {
  complice_directo: { color: '#f44336', width: 3, dasharray: 'none' },
  familiar_sangre: { color: '#2196f3', width: 2, dasharray: 'none' },
  comunicacion_frecuente: { color: '#ff9800', width: 1, dasharray: '5,5' },
  socio_comercial: { color: '#4caf50', width: 2, dasharray: 'none' },
  jerarquia_comando: { color: '#9c27b0', width: 4, dasharray: 'none' },
  conflicto_territorial: { color: '#f44336', width: 2, dasharray: '10,5' },
  otro_criminal: { color: '#757575', width: 1, dasharray: '3,3' },
};

const VisualizadorRedCriminal = ({
  vinculacionesData = null,
  personaFocal = null,
  onPersonaSeleccionada = null,
  height = 600,
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [centralityMetrics, setCentralityMetrics] = useState({});
  const [detectedCommunities, setDetectedCommunities] = useState([]);
  const { showToast } = useToast();

  // Estados de configuración
  const [config, setConfig] = useState({
    algoritmo_layout: 'force_directed',
    mostrar_etiquetas: true,
    filtrar_por_confianza: 0.3,
    agrupar_comunidades: true,
    resaltar_caminos: false,
    mostrar_centralidad: false,
    tamano_nodo_por_grado: true,
  });

  const [dialogConfig, setDialogConfig] = useState(false);

  useEffect(() => {
    if (vinculacionesData) {
      processNetworkData(vinculacionesData);
    } else if (personaFocal) {
      fetchNetworkData();
    }
  }, [vinculacionesData, personaFocal, config.filtrar_por_confianza]);

  useEffect(() => {
    if (networkData.nodes.length > 0) {
      renderNetwork();
    }
  }, [networkData, config]);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const params = {
        persona_id: personaFocal?.id,
        profundidad: 2,
        min_confianza: config.filtrar_por_confianza,
        incluir_metricas: true,
      };

      const response = await api.get(
        '/api/inteligencia/vinculaciones/network-visualization',
        { params }
      );
      setNetworkData(response.data.networkData);
      setCentralityMetrics(response.data.metricas);
      setDetectedCommunities(response.data.comunidades || []);
    } catch (error) {
      console.error('Error cargando datos de red:', error);
      showToast('Error al cargar la visualización de red', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processNetworkData = data => {
    // Procesar datos de vinculaciones para formato D3
    const nodesMap = new Map();
    const links = [];

    // Crear nodos únicos
    data.forEach(vinculacion => {
      if (!nodesMap.has(vinculacion.persona_origen_id)) {
        nodesMap.set(vinculacion.persona_origen_id, {
          id: vinculacion.persona_origen_id,
          nombre: `${vinculacion.persona_origen?.apellido}, ${vinculacion.persona_origen?.nombre}`,
          tipo: 'persona_principal',
          grado: 0,
          foto: vinculacion.persona_origen?.foto_principal,
          dni: vinculacion.persona_origen?.dni,
        });
      }

      if (!nodesMap.has(vinculacion.persona_destino_id)) {
        nodesMap.set(vinculacion.persona_destino_id, {
          id: vinculacion.persona_destino_id,
          nombre: `${vinculacion.persona_destino?.apellido}, ${vinculacion.persona_destino?.nombre}`,
          tipo: 'persona_secundaria',
          grado: 0,
          foto: vinculacion.persona_destino?.foto_principal,
          dni: vinculacion.persona_destino?.dni,
        });
      }

      // Incrementar grado de conexiones
      const origenNode = nodesMap.get(vinculacion.persona_origen_id);
      const destinoNode = nodesMap.get(vinculacion.persona_destino_id);
      origenNode.grado++;
      destinoNode.grado++;

      // Crear enlace
      if (vinculacion.nivel_confianza >= config.filtrar_por_confianza) {
        links.push({
          source: vinculacion.persona_origen_id,
          target: vinculacion.persona_destino_id,
          tipo: vinculacion.tipo_vinculacion,
          confianza: vinculacion.nivel_confianza,
          descripcion: vinculacion.descripcion,
          estado: vinculacion.estado_vinculacion,
        });
      }
    });

    setNetworkData({
      nodes: Array.from(nodesMap.values()),
      links: links,
    });
  };

  const renderNetwork = () => {
    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);

    // Limpiar SVG anterior
    svg.selectAll('*').remove();

    const width = container.node()?.getBoundingClientRect().width || 800;
    const height_actual = height;

    // Configurar SVG
    svg.attr('width', width).attr('height', height_actual);

    // Crear grupo principal con zoom
    const g = svg.append('g');

    // Configurar zoom
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Configurar simulación de fuerzas
    const simulation = d3
      .forceSimulation(networkData.nodes)
      .force(
        'link',
        d3
          .forceLink(networkData.links)
          .id(d => d.id)
          .distance(d => 100 - d.confianza * 50)
          .strength(d => d.confianza)
      )
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength(d => (config.agrupar_comunidades ? -200 : -100))
      )
      .force('center', d3.forceCenter(width / 2, height_actual / 2))
      .force(
        'collision',
        d3
          .forceCollide()
          .radius(d =>
            config.tamano_nodo_por_grado
              ? Math.max(8, Math.min(25, d.grado * 3))
              : 15
          )
      );

    // Crear escalas
    const nodeColorScale = d3
      .scaleOrdinal()
      .domain(Object.keys(NODE_COLORS))
      .range(Object.values(NODE_COLORS));

    const nodeSizeScale = d3
      .scaleLinear()
      .domain(d3.extent(networkData.nodes, d => d.grado))
      .range([8, 25]);

    // Crear enlaces
    const links = g
      .append('g')
      .selectAll('line')
      .data(networkData.links)
      .join('line')
      .attr('stroke', d => LINK_STYLES[d.tipo]?.color || '#999')
      .attr('stroke-width', d => LINK_STYLES[d.tipo]?.width || 1)
      .attr('stroke-dasharray', d => LINK_STYLES[d.tipo]?.dasharray || 'none')
      .attr('opacity', d => 0.3 + d.confianza * 0.7);

    // Crear nodos
    const nodes = g
      .append('g')
      .selectAll('circle')
      .data(networkData.nodes)
      .join('circle')
      .attr('r', d =>
        config.tamano_nodo_por_grado
          ? Math.max(8, Math.min(25, d.grado * 3))
          : 15
      )
      .attr('fill', d => {
        if (config.mostrar_centralidad && centralityMetrics[d.id]) {
          const centralityValue = centralityMetrics[d.id].betweenness || 0;
          return d3.interpolateReds(centralityValue);
        }
        return nodeColorScale(d.tipo);
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => {
        setSelectedNode(d);
        onPersonaSeleccionada?.(d);
      })
      .on('mouseover', function (event, d) {
        // Resaltar nodo y conexiones
        d3.select(this).attr('stroke-width', 4);

        // Mostrar tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0,0,0,0.8)')
          .style('color', 'white')
          .style('padding', '10px')
          .style('border-radius', '5px')
          .style('pointer-events', 'none')
          .style('z-index', 1000);

        tooltip
          .html(
            `
          <strong>${d.nombre}</strong><br/>
          DNI: ${d.dni}<br/>
          Conexiones: ${d.grado}<br/>
          ${
            centralityMetrics[d.id]
              ? `Centralidad: ${(
                  centralityMetrics[d.id].betweenness * 100
                ).toFixed(1)}%`
              : ''
          }
        `
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('stroke-width', 2);
        d3.selectAll('.tooltip').remove();
      });

    // Agregar etiquetas si está habilitado
    if (config.mostrar_etiquetas) {
      const labels = g
        .append('g')
        .selectAll('text')
        .data(networkData.nodes)
        .join('text')
        .text(d => d.nombre.split(',')[0]) // Solo apellido
        .attr('font-size', '10px')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('fill', '#333')
        .style('pointer-events', 'none');

      simulation.on('tick', () => {
        links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodes.attr('cx', d => d.x).attr('cy', d => d.y);

        labels
          .attr('x', d => d.x)
          .attr(
            'y',
            d =>
              d.y +
              (config.tamano_nodo_por_grado
                ? Math.max(8, Math.min(25, d.grado * 3)) + 15
                : 25)
          );
      });
    } else {
      simulation.on('tick', () => {
        links
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodes.attr('cx', d => d.x).attr('cy', d => d.y);
      });
    }

    // Funciones de drag
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Funciones de control de zoom
    window.zoomIn = () => {
      svg.transition().call(zoom.scaleBy, 1.5);
    };

    window.zoomOut = () => {
      svg.transition().call(zoom.scaleBy, 1 / 1.5);
    };

    window.resetZoom = () => {
      svg.transition().call(zoom.transform, d3.zoomIdentity);
    };

    window.centerView = () => {
      const bounds = g.node().getBBox();
      const fullWidth = width;
      const fullHeight = height_actual;
      const widthRatio = fullWidth / bounds.width;
      const heightRatio = fullHeight / bounds.height;
      const scale = Math.min(widthRatio, heightRatio) * 0.8;
      const translate = [
        fullWidth / 2 - scale * (bounds.x + bounds.width / 2),
        fullHeight / 2 - scale * (bounds.y + bounds.height / 2),
      ];

      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    };
  };

  const exportNetworkImage = () => {
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = `red_criminal_${
        new Date().toISOString().split('T')[0]
      }.png`;
      link.href = canvas.toDataURL();
      link.click();
    };

    img.src =
      'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
  };

  return (
    <Box>
      {/* Barra de herramientas */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h6">Visualización de Red Criminal</Typography>
          </Grid>

          <Grid item xs />

          {/* Controles de zoom */}
          <Grid item>
            <Tooltip title="Acercar">
              <IconButton onClick={() => window.zoomIn?.()}>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Alejar">
              <IconButton onClick={() => window.zoomOut?.()}>
                <ZoomOut />
              </IconButton>
            </Tooltip>
            <Tooltip title="Centrar vista">
              <IconButton onClick={() => window.centerView?.()}>
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reiniciar zoom">
              <IconButton onClick={() => window.resetZoom?.()}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Controles de configuración */}
          <Grid item>
            <Tooltip title="Configuración">
              <IconButton onClick={() => setDialogConfig(true)}>
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exportar imagen">
              <IconButton onClick={exportNetworkImage}>
                <Download />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        {/* Filtros rápidos */}
        <Grid container spacing={2} sx={{ mt: 1 }} alignItems="center">
          <Grid item xs={12} md={3}>
            <Typography gutterBottom>
              Confianza mínima:{' '}
              {(config.filtrar_por_confianza * 100).toFixed(0)}%
            </Typography>
            <Slider
              value={config.filtrar_por_confianza}
              onChange={(e, value) =>
                setConfig(prev => ({
                  ...prev,
                  filtrar_por_confianza: value,
                }))
              }
              min={0.1}
              max={1.0}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.mostrar_etiquetas}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      mostrar_etiquetas: e.target.checked,
                    }))
                  }
                />
              }
              label="Mostrar nombres"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.mostrar_centralidad}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      mostrar_centralidad: e.target.checked,
                    }))
                  }
                />
              }
              label="Colorear por centralidad"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.tamano_nodo_por_grado}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      tamano_nodo_por_grado: e.target.checked,
                    }))
                  }
                />
              }
              label="Tamaño por conexiones"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Área de visualización */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={selectedNode ? 9 : 12}>
          <Card>
            <CardContent sx={{ p: 1 }}>
              {loading && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height={height}
                >
                  <CircularProgress />
                </Box>
              )}

              <div ref={containerRef} style={{ width: '100%' }}>
                <svg
                  ref={svgRef}
                  style={{ display: loading ? 'none' : 'block' }}
                />
              </div>

              {networkData.nodes.length === 0 && !loading && (
                <Alert severity="info" sx={{ m: 2 }}>
                  No hay datos de red para mostrar. Ajuste los filtros o
                  seleccione una persona focal.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de información del nodo seleccionado */}
        {selectedNode && (
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información del Nodo
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Nombre:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedNode.nombre}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  DNI:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedNode.dni}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Conexiones:
                </Typography>
                <Chip label={selectedNode.grado} color="primary" size="small" />

                {centralityMetrics[selectedNode.id] && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Métricas de Centralidad:
                    </Typography>
                    <Typography variant="caption" display="block">
                      Intermediación:{' '}
                      {(
                        centralityMetrics[selectedNode.id].betweenness * 100
                      ).toFixed(1)}
                      %
                    </Typography>
                    <Typography variant="caption" display="block">
                      Cercanía:{' '}
                      {(
                        centralityMetrics[selectedNode.id].closeness * 100
                      ).toFixed(1)}
                      %
                    </Typography>
                    <Typography variant="caption" display="block">
                      Grado:{' '}
                      {(
                        centralityMetrics[selectedNode.id].degree * 100
                      ).toFixed(1)}
                      %
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Dialog de configuración avanzada */}
      <Dialog
        open={dialogConfig}
        onClose={() => setDialogConfig(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configuración de Visualización</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Algoritmo de Layout</InputLabel>
                <Select
                  value={config.algoritmo_layout}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      algoritmo_layout: e.target.value,
                    }))
                  }
                  label="Algoritmo de Layout"
                >
                  <MenuItem value="force_directed">
                    Dirigido por Fuerzas
                  </MenuItem>
                  <MenuItem value="circular">Circular</MenuItem>
                  <MenuItem value="hierarchical">Jerárquico</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.agrupar_comunidades}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        agrupar_comunidades: e.target.checked,
                      }))
                    }
                  />
                }
                label="Agrupar comunidades detectadas"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.resaltar_caminos}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        resaltar_caminos: e.target.checked,
                      }))
                    }
                  />
                }
                label="Resaltar caminos críticos"
              />
            </Grid>
          </Grid>

          {detectedCommunities.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Comunidades Detectadas ({detectedCommunities.length})
              </Typography>
              <List dense>
                {detectedCommunities.map((comunidad, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`Comunidad ${index + 1}`}
                      secondary={`${
                        comunidad.miembros.length
                      } miembros - Densidad: ${(
                        comunidad.densidad * 100
                      ).toFixed(1)}%`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={comunidad.miembros.length}
                        size="small"
                        color="primary"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogConfig(false)}>Cerrar</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDialogConfig(false);
              renderNetwork();
            }}
          >
            Aplicar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisualizadorRedCriminal;
