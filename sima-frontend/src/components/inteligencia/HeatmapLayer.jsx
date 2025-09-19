import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat'; // Requiere npm install leaflet.heat

const HeatmapLayer = ({ data = [], options = {} }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  const defaultOptions = {
    radius: 25,
    blur: 15,
    maxZoom: 17,
    max: 1.0,
    minOpacity: 0.3,
    gradient: {
      0.0: '#3498db', // Azul (baja intensidad)
      0.2: '#2ecc71', // Verde
      0.4: '#f1c40f', // Amarillo
      0.6: '#e67e22', // Naranja
      0.8: '#e74c3c', // Rojo
      1.0: '#8e44ad', // Morado (alta intensidad)
    },
    ...options,
  };

  useEffect(() => {
    if (!map || !data.length) return;

    // Remover capa anterior si existe
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Preparar datos para el heatmap
    // Formato: [lat, lng, intensidad]
    const heatData = data
      .map(punto => [
        parseFloat(punto.lat),
        parseFloat(punto.lng),
        parseFloat(punto.intensidad || 1),
      ])
      .filter(
        punto => !isNaN(punto[0]) && !isNaN(punto[1]) && !isNaN(punto[2])
      );

    if (heatData.length === 0) return;

    // Crear nueva capa de calor
    heatLayerRef.current = L.heatLayer(heatData, defaultOptions);
    heatLayerRef.current.addTo(map);

    // Cleanup function
    return () => {
      if (heatLayerRef.current && map) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, data, options]);

  useEffect(() => {
    // Actualizar opciones si cambian
    if (heatLayerRef.current) {
      heatLayerRef.current.setOptions(defaultOptions);
    }
  }, [options]);

  return null; // Este componente no renderiza nada directamente
};

export default HeatmapLayer;
