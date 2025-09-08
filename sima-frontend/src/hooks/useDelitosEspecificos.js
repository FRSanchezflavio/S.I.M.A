import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gestión de delitos específicos de cada sujeto
 * Estos delitos son independientes de los registros oficiales y no aparecen en la búsqueda
 */
export const useDelitosEspecificos = sujetoId => {
  const [delitos, setDelitos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clave única para localStorage por sujeto
  const storageKey = `delitos_especificos_${sujetoId}`;

  // Generar ID único para delitos
  const generateId = () => {
    return `delito_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Cargar delitos desde localStorage al inicializar
  useEffect(() => {
    if (!sujetoId) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedDelitos = JSON.parse(stored);
        setDelitos(Array.isArray(parsedDelitos) ? parsedDelitos : []);
      }
    } catch (err) {
      console.error('Error cargando delitos específicos:', err);
      setDelitos([]);
    }
  }, [sujetoId, storageKey]);

  // Guardar delitos en localStorage
  const saveToStorage = useCallback(
    nuevosDelitos => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nuevosDelitos));
      } catch (err) {
        console.error('Error guardando delitos específicos:', err);
      }
    },
    [storageKey]
  );

  // Agregar nuevo delito
  const agregarDelito = useCallback(
    async nuevoDelito => {
      if (!sujetoId) {
        throw new Error('ID de sujeto requerido');
      }

      setLoading(true);
      setError(null);

      try {
        // Validar campos requeridos
        if (!nuevoDelito.tipo || !nuevoDelito.descripcion) {
          throw new Error('Tipo y descripción son campos obligatorios');
        }

        // Crear delito con estructura completa
        const delito = {
          id: generateId(),
          tipo: nuevoDelito.tipo,
          modalidad: nuevoDelito.modalidad || '',
          descripcion: nuevoDelito.descripcion,
          lugar: nuevoDelito.lugar || '',
          comisaria_hecho: nuevoDelito.comisaria_hecho || '',
          estado: nuevoDelito.estado || 'activo',
          juzgado: nuevoDelito.juzgado || '',
          fecha_hecho:
            nuevoDelito.fecha_hecho || new Date().toISOString().split('T')[0],
          fecha_carga: new Date().toISOString(),
          observaciones: nuevoDelito.observaciones || '',
          fotos: nuevoDelito.fotos || [],
          sujetoId: sujetoId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Verificar duplicados por tipo y fecha
        const existeDuplicado = delitos.some(
          d =>
            d.tipo === delito.tipo &&
            d.fecha_hecho === delito.fecha_hecho &&
            d.descripcion === delito.descripcion
        );

        if (existeDuplicado) {
          throw new Error('Ya existe un delito similar para esta fecha');
        }

        const nuevosDelitos = [...delitos, delito];
        setDelitos(nuevosDelitos);
        saveToStorage(nuevosDelitos);

        return delito;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sujetoId, delitos, saveToStorage]
  );

  // Actualizar delito existente
  const actualizarDelito = useCallback(
    async (delitoId, datosActualizados) => {
      setLoading(true);
      setError(null);

      try {
        const nuevosDelitos = delitos.map(delito => {
          if (delito.id === delitoId) {
            return {
              ...delito,
              ...datosActualizados,
              updatedAt: new Date().toISOString(),
            };
          }
          return delito;
        });

        setDelitos(nuevosDelitos);
        saveToStorage(nuevosDelitos);

        return nuevosDelitos.find(d => d.id === delitoId);
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [delitos, saveToStorage]
  );

  // Eliminar delito
  const eliminarDelito = useCallback(
    async delitoId => {
      setLoading(true);
      setError(null);

      try {
        const nuevosDelitos = delitos.filter(delito => delito.id !== delitoId);
        setDelitos(nuevosDelitos);
        saveToStorage(nuevosDelitos);

        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [delitos, saveToStorage]
  );

  // Obtener delitos por estado
  const getDelitosPorEstado = useCallback(
    estado => {
      return delitos.filter(delito => delito.estado === estado);
    },
    [delitos]
  );

  // Obtener estadísticas
  const getEstadisticas = useCallback(() => {
    const total = delitos.length;
    const activos = delitos.filter(d => d.estado === 'activo').length;
    const resueltos = delitos.filter(d => d.estado === 'resuelto').length;
    const archivados = delitos.filter(d => d.estado === 'archivado').length;

    const tiposUnicos = [...new Set(delitos.map(d => d.tipo))];
    const modalidadesUnicas = [
      ...new Set(delitos.map(d => d.modalidad).filter(Boolean)),
    ];

    return {
      total,
      activos,
      resueltos,
      archivados,
      tiposUnicos,
      modalidadesUnicas,
    };
  }, [delitos]);

  // Limpiar todos los delitos
  const limpiarDelitos = useCallback(() => {
    setDelitos([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    delitos,
    loading,
    error,
    agregarDelito,
    actualizarDelito,
    eliminarDelito,
    getDelitosPorEstado,
    getEstadisticas,
    limpiarDelitos,
    total: delitos.length,
  };
};

export default useDelitosEspecificos;
