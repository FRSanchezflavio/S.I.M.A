import { useState, useCallback, useRef } from 'react';
import * as turf from '@turf/turf';

/**
 * Hook personalizado para edición territorial
 * Maneja los estados y operaciones de edición de territorios de bandas
 */
export const useEdicionTerritorial = (bandaId, onCambio) => {
  const [modoEdicion, setModoEdicion] = useState('visualizar');
  const [territorioOriginal, setTerritorioOriginal] = useState(null);
  const [territorioModificado, setTerritorioModificado] = useState(null);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Referencia para el control de dibujo de Leaflet
  const drawControlRef = useRef(null);
  const drawnItemsRef = useRef(null);

  /**
   * Inicializar edición para una banda específica
   */
  const inicializarEdicion = useCallback(async banda => {
    try {
      setLoading(true);
      setError(null);

      // Guardar territorio original
      setTerritorioOriginal({
        poligonos_territorio: banda.poligonos_territorio || [],
        latitud_centro: banda.latitud_centro || banda.centro?.[0],
        longitud_centro: banda.longitud_centro || banda.centro?.[1],
        radio_influencia_km: banda.radio_influencia_km || banda.radio_km,
      });

      setTerritorioModificado(null);
      setCambiosPendientes(false);
    } catch (err) {
      setError('Error al inicializar edición territorial');
      console.error('Error inicializando edición:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validar territorio usando reglas de negocio del S.I.M.A.
   */
  const validarTerritorio = useCallback((nuevoPoligono, bandaIdActual) => {
    const validaciones = {
      valido: true,
      errores: [],
      advertencias: [],
    };

    if (!nuevoPoligono || nuevoPoligono.length < 3) {
      validaciones.valido = false;
      validaciones.errores.push('El territorio debe tener al menos 3 puntos');
      return validaciones;
    }

    try {
      // Crear polígono con turf para validaciones geoespaciales
      const poligonoTurf = turf.polygon([nuevoPoligono]);
      const area = turf.area(poligonoTurf);
      const areaKm2 = area / 1000000; // Convertir m² a km²

      // Validar área mínima y máxima
      if (areaKm2 < 0.01) {
        validaciones.errores.push(
          'El territorio es muy pequeño (mín. 0.01 km²)'
        );
        validaciones.valido = false;
      }

      if (areaKm2 > 100) {
        validaciones.errores.push('El territorio es muy grande (máx. 100 km²)');
        validaciones.valido = false;
      }

      // Validar que esté dentro de los límites de Tucumán
      const limitesGeograficos = {
        norte: -26.0,
        sur: -28.0,
        este: -64.0,
        oeste: -66.5,
      };

      const bbox = turf.bbox(poligonoTurf);
      const [oeste, sur, este, norte] = bbox;

      if (
        norte > limitesGeograficos.norte ||
        sur < limitesGeograficos.sur ||
        este > limitesGeograficos.este ||
        oeste < limitesGeograficos.oeste
      ) {
        validaciones.advertencias.push(
          'El territorio se extiende fuera de los límites de Tucumán'
        );
      }

      // Validar que el polígono sea válido
      if (!turf.booleanValid(poligonoTurf)) {
        validaciones.valido = false;
        validaciones.errores.push('El territorio tiene una geometría inválida');
      }
    } catch (err) {
      validaciones.valido = false;
      validaciones.errores.push('Error al validar el territorio');
      console.error('Error en validación territorial:', err);
    }

    return validaciones;
  }, []);

  /**
   * Calcular centro de un polígono
   */
  const calcularCentro = useCallback(poligono => {
    if (!poligono || poligono.length === 0) return [0, 0];

    try {
      const poligonoTurf = turf.polygon([poligono]);
      const centroide = turf.centroid(poligonoTurf);
      return centroide.geometry.coordinates.reverse(); // [lat, lng]
    } catch (err) {
      console.error('Error calculando centro:', err);
      return [0, 0];
    }
  }, []);

  /**
   * Calcular radio aproximado del territorio
   */
  const calcularRadio = useCallback(poligono => {
    if (!poligono || poligono.length === 0) return 0;

    try {
      const poligonoTurf = turf.polygon([poligono]);
      const centroide = turf.centroid(poligonoTurf);
      const bbox = turf.bbox(poligonoTurf);

      // Calcular distancia desde el centroide a las esquinas del bbox
      const esquinasSuperior = turf.point([bbox[2], bbox[3]]);
      const distancia = turf.distance(centroide, esquinasSuperior, {
        units: 'kilometers',
      });

      return Math.round(distancia * 100) / 100; // Redondear a 2 decimales
    } catch (err) {
      console.error('Error calculando radio:', err);
      return 0;
    }
  }, []);

  /**
   * Procesar cambio en el territorio
   */
  const procesarCambioTerritorial = useCallback(
    (nuevoPoligono, bandaIdActual) => {
      const validacion = validarTerritorio(nuevoPoligono, bandaIdActual);

      if (!validacion.valido) {
        setError(validacion.errores.join('. '));
        return false;
      }

      const centro = calcularCentro(nuevoPoligono);
      const radio = calcularRadio(nuevoPoligono);

      setTerritorioModificado({
        poligonos_territorio: [nuevoPoligono],
        latitud_centro: centro[0],
        longitud_centro: centro[1],
        radio_influencia_km: radio,
      });

      setCambiosPendientes(true);
      setError(null);

      // Mostrar advertencias si las hay
      if (validacion.advertencias.length > 0) {
        console.warn('Advertencias territoriales:', validacion.advertencias);
      }

      return true;
    },
    [validarTerritorio, calcularCentro, calcularRadio]
  );

  /**
   * Guardar cambios territoriales
   */
  const guardarCambios = useCallback(async () => {
    if (!territorioModificado || !bandaId) {
      setError('No hay cambios para guardar');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/inteligencia/bandas/${bandaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...territorioModificado,
          modificado_por: 'usuario_territorial',
          timestamp_modificacion: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const resultado = await response.json();

      // Actualizar territorio original con los nuevos datos
      setTerritorioOriginal(territorioModificado);
      setTerritorioModificado(null);
      setCambiosPendientes(false);

      // Llamar callback de cambio
      if (onCambio) {
        onCambio({
          banda_id: bandaId,
          territorio: territorioModificado,
          resultado,
        });
      }

      return true;
    } catch (err) {
      setError(`Error al guardar territorio: ${err.message}`);
      console.error('Error guardando territorio:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [bandaId, territorioModificado, onCambio]);

  /**
   * Cancelar cambios y restaurar original
   */
  const cancelarCambios = useCallback(() => {
    setTerritorioModificado(null);
    setCambiosPendientes(false);
    setError(null);

    // Limpiar elementos dibujados
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
  }, []);

  /**
   * Cambiar modo de edición
   */
  const cambiarModo = useCallback(
    nuevoModo => {
      // Si hay cambios pendientes, preguntar antes de cambiar
      if (cambiosPendientes && nuevoModo !== modoEdicion) {
        const confirmar = window.confirm(
          'Hay cambios sin guardar. ¿Deseas descartarlos y cambiar de modo?'
        );
        if (!confirmar) return false;

        cancelarCambios();
      }

      setModoEdicion(nuevoModo);
      setError(null);
      return true;
    },
    [modoEdicion, cambiosPendientes, cancelarCambios]
  );

  return {
    // Estados
    modoEdicion,
    territorioOriginal,
    territorioModificado,
    cambiosPendientes,
    loading,
    error,

    // Referencias
    drawControlRef,
    drawnItemsRef,

    // Funciones
    inicializarEdicion,
    procesarCambioTerritorial,
    guardarCambios,
    cancelarCambios,
    cambiarModo,
    validarTerritorio,
    calcularCentro,
    calcularRadio,
  };
};

/**
 * Hook para notificaciones territoriales
 */
export const useNotificacionesTerritorial = () => {
  /**
   * Mostrar notificación territorial
   * Nota: Integra con el sistema de toasts existente del S.I.M.A.
   */
  const notificarCambioTerritorial = useCallback((tipo, datos) => {
    // Por ahora usando console, se debe integrar con el sistema de toasts existente
    const mensaje = generarMensajeNotificacion(tipo, datos);

    switch (tipo) {
      case 'expansion':
      case 'contraccion':
      case 'redefinicion':
        console.info('✅', mensaje);
        // showToast(mensaje, 'success'); // Descomentar cuando esté disponible
        break;
      case 'conflicto':
      case 'advertencia':
        console.warn('⚠️', mensaje);
        // showToast(mensaje, 'warning');
        break;
      case 'error':
        console.error('❌', mensaje);
        // showToast(mensaje, 'error');
        break;
      case 'validacion':
        console.info('ℹ️', mensaje);
        // showToast(mensaje, 'info');
        break;
      default:
        console.log(mensaje);
    }
  }, []);

  const generarMensajeNotificacion = (tipo, datos) => {
    const banda = datos?.banda?.nombre || 'Banda desconocida';

    switch (tipo) {
      case 'expansion':
        return `Territorio expandido: ${banda} (+${
          datos.areaAnadida || 0
        } km²)`;
      case 'contraccion':
        return `Territorio contraído: ${banda} (-${
          datos.areaReducida || 0
        } km²)`;
      case 'redefinicion':
        return `Territorio redefinido: ${banda} (${datos.areaNueva || 0} km²)`;
      case 'conflicto':
        return `⚠️ Conflicto territorial detectado: ${banda} con ${
          datos.bandasEnConflicto?.join(', ') || 'otras bandas'
        }`;
      case 'advertencia':
        return `Advertencia territorial: ${
          datos.mensaje || 'Verificar límites'
        }`;
      case 'error':
        return `Error territorial en ${banda}: ${
          datos.error || 'Error desconocido'
        }`;
      case 'validacion':
        return `Validación territorial: ${
          datos.mensaje || 'Verificación completada'
        }`;
      default:
        return `Cambio territorial: ${banda}`;
    }
  };

  return {
    notificarCambioTerritorial,
  };
};
