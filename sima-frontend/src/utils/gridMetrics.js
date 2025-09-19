/**
 * Sistema de métricas específicas para operaciones policiales S.I.M.A.
 * Monitorea performance del Grid y usabilidad operativa
 */

export class SIMAGridMetrics {
  constructor() {
    this.startTime = null;
    this.metrics = {
      busquedas: 0,
      tiempoPromedioIdentificacion: 0,
      resultadosVisiblesSinScroll: 0,
      erroresLayout: 0,
      dispositivosTesteados: new Set(),
    };
  }

  // Iniciar tracking de búsqueda
  iniciarBusqueda() {
    this.startTime = performance.now();
    console.time('busqueda_sima');
    this.metrics.busquedas++;
  }

  // Finalizar tracking y calcular métricas
  finalizarBusqueda() {
    if (!this.startTime) return;

    const tiempoTotal = performance.now() - this.startTime;
    console.timeEnd('busqueda_sima');

    // Actualizar tiempo promedio
    this.metrics.tiempoPromedioIdentificacion =
      (this.metrics.tiempoPromedioIdentificacion + tiempoTotal) / 2;

    // Analizar visibilidad de resultados
    this.analizarVisibilidadResultados();

    // Log para análisis posterior
    this.logMetricas({
      tiempoBusqueda: tiempoTotal,
      timestamp: new Date().toISOString(),
      dispositivoInfo: this.getDispositivoInfo(),
    });

    this.startTime = null;
  }

  // Analizar cuántos resultados son visibles sin scroll
  analizarVisibilidadResultados() {
    const gridElement = document.querySelector('[data-grid="search-results"]');
    if (!gridElement) return;

    // Contar elementos visibles en viewport
    const cards = gridElement.querySelectorAll('[data-testid="card-result"]');
    let visibleCount = 0;

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (isVisible) visibleCount++;
    });

    this.metrics.resultadosVisiblesSinScroll = visibleCount;

    // Performance del grid
    const gridMetrics = {
      scrollHeight: gridElement.scrollHeight,
      clientHeight: gridElement.clientHeight,
      isScrollNeeded: gridElement.scrollHeight > gridElement.clientHeight,
      visibleCards: visibleCount,
      totalCards: cards.length,
    };

    console.log('S.I.M.A. Grid Analysis:', gridMetrics);

    // Verificar si cumple KPIs
    this.verificarKPIs(gridMetrics);

    return gridMetrics;
  }

  // Verificar cumplimiento de KPIs críticos
  verificarKPIs(gridMetrics) {
    const kpis = {
      tiempoIdentificacion: this.metrics.tiempoPromedioIdentificacion < 30000,
      resultadosVisibles: gridMetrics.visibleCards >= 12,
      scrollNecesario: gridMetrics.isScrollNeeded,
      performance: this.metrics.tiempoPromedioIdentificacion < 200,
    };

    console.log('KPIs S.I.M.A.:', kpis);

    // Alertar si hay problemas críticos
    if (!kpis.tiempoIdentificacion) {
      console.warn('⚠️ ALERTA: Tiempo de identificación excede 30 segundos');
    }

    if (gridMetrics.visibleCards < 12 && window.innerWidth >= 1366) {
      console.warn('⚠️ ALERTA: Menos de 12 resultados visibles en desktop');
    }

    return kpis;
  }

  // Obtener información del dispositivo
  getDispositivoInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
    };
  }

  // Log interno para análisis
  logMetricas(datos) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tipo: 'grid_metrics',
      datos: datos,
      metricas: this.metrics,
      sessionId: sessionStorage.getItem('session_id') || 'unknown',
      usuario: sessionStorage.getItem('usuario_policial') || 'unknown',
      comisaria: sessionStorage.getItem('comisaria_origen') || 'unknown',
    };

    // Almacenar en localStorage para análisis interno
    const logs = JSON.parse(localStorage.getItem('sima_grid_logs') || '[]');
    logs.push(logEntry);

    // Mantener solo los últimos 100 logs
    const logsLimitados = logs.slice(-100);
    localStorage.setItem('sima_grid_logs', JSON.stringify(logsLimitados));

    // Enviar a servidor interno si está disponible
    this.enviarLogInterno(logEntry);
  }

  // Enviar log a servidor interno S.I.M.A.
  async enviarLogInterno(logEntry) {
    try {
      const response = await fetch('/api/internal/grid-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token_policial')}`,
        },
        body: JSON.stringify(logEntry),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn('Log interno grid falló:', error);
      // Almacenar en queue para reintento posterior
      this.almacenarEnQueueLocal(logEntry);
    }
  }

  // Almacenar en queue local para reintento
  almacenarEnQueueLocal(logEntry) {
    const queue = JSON.parse(localStorage.getItem('sima_grid_queue') || '[]');
    queue.push(logEntry);
    localStorage.setItem('sima_grid_queue', JSON.stringify(queue.slice(-50)));
  }

  // Obtener métricas actuales
  getMetricas() {
    return {
      ...this.metrics,
      dispositivo: this.getDispositivoInfo(),
      ultimoAnalisis: this.analizarVisibilidadResultados(),
    };
  }

  // Reiniciar métricas
  reset() {
    this.metrics = {
      busquedas: 0,
      tiempoPromedioIdentificacion: 0,
      resultadosVisiblesSinScroll: 0,
      erroresLayout: 0,
      dispositivosTesteados: new Set(),
    };
  }
}

// Hook para usar métricas en componentes
export const useSIMAGridMetrics = () => {
  const metricsInstance = new SIMAGridMetrics();

  return {
    iniciarBusqueda: () => metricsInstance.iniciarBusqueda(),
    finalizarBusqueda: () => metricsInstance.finalizarBusqueda(),
    analizarGrid: () => metricsInstance.analizarVisibilidadResultados(),
    getMetricas: () => metricsInstance.getMetricas(),
    verificarKPIs: gridMetrics => metricsInstance.verificarKPIs(gridMetrics),
  };
};

// Instancia global para uso directo
export const simaGridMetrics = new SIMAGridMetrics();

export default SIMAGridMetrics;
