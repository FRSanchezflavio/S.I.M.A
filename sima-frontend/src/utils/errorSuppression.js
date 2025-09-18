/**
 * Utilidad para suprimir errores específicos del navegador y extensiones
 * que no afectan la funcionalidad de la aplicación
 */

// Suprimir errores específicos de extensiones del navegador
const suppressBrowserExtensionErrors = () => {
  const originalConsoleError = console.error;

  console.error = (...args) => {
    const message = args.join(' ');

    // Suprimir errores conocidos de extensiones
    if (
      message.includes('message channel closed') ||
      message.includes('listener indicated an asynchronous response') ||
      message.includes('Extension context invalidated') ||
      message.includes('react-devtools')
    ) {
      // No mostrar estos errores en la consola
      return;
    }

    // Mostrar otros errores normalmente
    originalConsoleError.apply(console, args);
  };
};

// Suprimir warnings específicos de desarrollo
const suppressDevWarnings = () => {
  const originalConsoleWarn = console.warn;

  console.warn = (...args) => {
    const message = args.join(' ');

    // Suprimir warnings específicos de desarrollo
    if (
      message.includes('React DevTools') ||
      message.includes('Download the React DevTools') ||
      message.includes('⚠️ ALERTA: Menos de 12 resultados') ||
      message.includes('S.I.M.A. Grid')
    ) {
      return;
    }

    originalConsoleWarn.apply(console, args);
  };
};

// Configurar global error handler para errores no capturados
const setupGlobalErrorHandler = () => {
  window.addEventListener('error', event => {
    // Suprimir errores específicos de extensiones
    if (
      event.message?.includes('message channel closed') ||
      event.message?.includes('listener indicated an asynchronous response') ||
      event.filename?.includes('extension://')
    ) {
      event.preventDefault();
      return false;
    }
  });

  window.addEventListener('unhandledrejection', event => {
    // Suprimir promise rejections específicos de extensiones
    if (
      event.reason?.message?.includes('message channel closed') ||
      event.reason?.message?.includes(
        'listener indicated an asynchronous response'
      )
    ) {
      event.preventDefault();
      return false;
    }
  });
};

// Inicializar supresión de errores
export const initErrorSuppression = () => {
  if (process.env.NODE_ENV === 'development') {
    suppressBrowserExtensionErrors();
    suppressDevWarnings();
    setupGlobalErrorHandler();

    console.log('🔇 Error suppression iniciado para desarrollo');
  }
};

export default {
  initErrorSuppression,
  suppressBrowserExtensionErrors,
  suppressDevWarnings,
  setupGlobalErrorHandler,
};
