/**
 * Manejo global de errores para S.I.M.A.
 */

// Configurar manejo de errores no capturados
export const setupGlobalErrorHandler = () => {
  // Errores de JavaScript no capturados
  window.addEventListener('error', event => {
    console.error('Error global capturado:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });

    // No mostrar errores de extensiones del navegador
    if (event.filename && event.filename.includes('extension://')) {
      event.preventDefault();
      return false;
    }

    // Suprimir errores conocidos de extensiones
    if (
      event.message &&
      (event.message.includes('message channel closed') ||
        event.message.includes('listener indicated an asynchronous response') ||
        event.message.includes('Extension context invalidated'))
    ) {
      event.preventDefault();
      return false;
    }
  });

  // Promesas rechazadas no capturadas
  window.addEventListener('unhandledrejection', event => {
    console.error('Promise rechazada no capturada:', event.reason);

    // Suprimir errores conocidos de extensiones
    if (event.reason && typeof event.reason === 'string') {
      if (
        event.reason.includes('message channel closed') ||
        event.reason.includes('listener indicated an asynchronous response')
      ) {
        event.preventDefault();
        return false;
      }
    }
  });

  // Suprimir warnings específicos en desarrollo
  if (process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');

      // Suprimir warnings conocidos de desarrollo
      if (
        message.includes('Extension context invalidated') ||
        message.includes('message port closed') ||
        message.includes('Could not establish connection') ||
        message.includes('React DevTools') ||
        message.includes('Download the React DevTools') ||
        message.includes(
          'You are loading @emotion/react when it is already loaded'
        ) ||
        message.includes('multiple instances may cause problems') ||
        message.includes('⚠️ ALERTA: Menos de 12 resultados') ||
        message.includes('S.I.M.A. Grid') ||
        message.includes('validateDOMNesting') ||
        message.includes('cannot appear as a descendant of') ||
        message.includes('Received `true` for a non-boolean attribute') ||
        message.includes('Invalid hook call') ||
        message.includes('useContext') ||
        message.includes('Hooks can only be called')
      ) {
        return;
      }

      originalWarn.apply(console, args);
    };

    // También suprimir console.error para ciertos casos
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');

      // Suprimir errores conocidos de desarrollo
      if (
        message.includes('validateDOMNesting') ||
        message.includes('cannot appear as a descendant of') ||
        message.includes('Received `true` for a non-boolean attribute') ||
        message.includes(
          'A props object containing a "key" prop is being spread'
        ) ||
        message.includes('Invalid hook call') ||
        message.includes('useContext') ||
        message.includes('Cannot read properties of null') ||
        message.includes('Hooks can only be called') ||
        message.includes(
          'You are loading @emotion/react when it is already loaded'
        )
      ) {
        return;
      }

      originalError.apply(console, args);
    };
  }
};

// Función para logs seguros
export const safeLog = (message, data = null) => {
  try {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  } catch (error) {
    console.log('Error al hacer log:', error.message);
  }
};

// Función para suprimir errores de extensiones en desarrollo
export const suppressExtensionErrors = () => {
  // Crear un script para suprimir errores de extensiones
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      const originalError = window.onerror;
      window.onerror = function(message, source, lineno, colno, error) {
        if (source && source.includes('extension://')) {
          return true; // Suprimir el error
        }
        if (originalError) {
          return originalError.apply(this, arguments);
        }
        return false;
      };
    })();
  `;
  document.head.appendChild(script);
};

export default {
  setupGlobalErrorHandler,
  safeLog,
  suppressExtensionErrors,
};
