import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Importación segura con manejo de errores
let heatLayerModule = null;
let isHeatLayerAvailable = false;

try {
  heatLayerModule = require('leaflet.heat');
  isHeatLayerAvailable = true;
} catch (error) {
  console.warn(
    'leaflet.heat no disponible. Usando círculos como alternativa para heatmap.'
  );
  isHeatLayerAvailable = false;
}

const HeatmapLayer = ({
  data = [],
  options = {},
  fallbackToCircles = true,
  onError = null,
}) => {
  const map = useMap();
  const heatLayerRef = useRef(null);
  const [error, setError] = useState(null);

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

  // Función para obtener color basado en intensidad
  const getColorByIntensity = intensidad => {
    if (intensidad >= 0.8) return '#e74c3c'; // Rojo
    if (intensidad >= 0.6) return '#e67e22'; // Naranja
    if (intensidad >= 0.4) return '#f1c40f'; // Amarillo
    if (intensidad >= 0.2) return '#2ecc71'; // Verde
    return '#3498db'; // Azul
  };

  // Función para crear capa de círculos como alternativa
  const createCircleLayer = data => {
    const circleGroup = L.layerGroup();

    data.forEach(punto => {
      if (punto.lat && punto.lng) {
        const intensidad = parseFloat(punto.intensidad || 1);
        const circle = L.circle(
          [parseFloat(punto.lat), parseFloat(punto.lng)],
          {
            radius: Math.max(intensidad * 200, 50), // Radio mínimo de 50m
            fillColor: getColorByIntensity(intensidad),
            fillOpacity: Math.min(intensidad * 0.6, 0.8),
            color: getColorByIntensity(intensidad),
            weight: 2,
            opacity: 0.8,
          }
        );

        // Agregar popup con información
        if (punto.nombre || punto.descripcion) {
          circle.bindPopup(`
            <div style="font-family: Arial, sans-serif; font-size: 12px;">
              <strong>${punto.nombre || 'Punto de interés'}</strong><br/>
              Intensidad: ${(intensidad * 100).toFixed(0)}%<br/>
              ${punto.descripcion || ''}
            </div>
          `);
        }

        circleGroup.addLayer(circle);
      }
    });

    return circleGroup;
  };

  useEffect(() => {
    if (!map) return;

    try {
      setError(null);

      // Remover capa anterior si existe
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      if (!data || data.length === 0) return;

      // Preparar y validar datos
      const heatData = data
        .map(punto => {
          const lat = parseFloat(punto.lat || punto.latitude);
          const lng = parseFloat(
            punto.lng || punto.longitude || punto.longitud
          );
          const intensidad = parseFloat(
            punto.intensidad || punto.intensity || 1
          );

          if (isNaN(lat) || isNaN(lng) || isNaN(intensidad)) {
            console.warn('Dato inválido en heatmap:', punto);
            return null;
          }

          return [lat, lng, Math.max(0, Math.min(1, intensidad))]; // Normalizar intensidad
        })
        .filter(punto => punto !== null);

      if (heatData.length === 0) {
        console.warn('No hay datos válidos para el heatmap');
        return;
      }

      // Intentar crear heatmap nativo, o usar círculos como fallback
      if (isHeatLayerAvailable && L.heatLayer) {
        try {
          heatLayerRef.current = L.heatLayer(heatData, defaultOptions);
          heatLayerRef.current.addTo(map);
        } catch (heatError) {
          console.warn(
            'Error creando heatmap nativo, usando círculos:',
            heatError
          );
          if (fallbackToCircles) {
            heatLayerRef.current = createCircleLayer(data);
            heatLayerRef.current.addTo(map);
          }
        }
      } else if (fallbackToCircles) {
        heatLayerRef.current = createCircleLayer(data);
        heatLayerRef.current.addTo(map);
      }
    } catch (err) {
      const errorMsg = `Error en HeatmapLayer: ${err.message}`;
      console.error(errorMsg, err);
      setError(errorMsg);

      if (onError) {
        onError(err);
      }
    }

    // Cleanup function
    return () => {
      if (
        heatLayerRef.current &&
        map &&
        map.hasLayer &&
        map.hasLayer(heatLayerRef.current)
      ) {
        try {
          map.removeLayer(heatLayerRef.current);
        } catch (cleanupError) {
          console.warn('Error limpiando heatmap layer:', cleanupError);
        }
      }
    };
  }, [map, data, options, fallbackToCircles, onError]);

  // Mostrar error si existe
  if (error) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #ff6b6b',
          zIndex: 1000,
          maxWidth: '300px',
        }}
      >
        <strong>Error en Heatmap:</strong>
        <br />
        <small>{error}</small>
      </div>
    );
  }

  return null;
};

export default HeatmapLayer;
