import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import {
  setupGlobalErrorHandler,
  suppressExtensionErrors,
} from './utils/errorHandler';

// Configurar manejo de errores globales
setupGlobalErrorHandler();

// Suprimir errores de extensiones del navegador
suppressExtensionErrors();

const root = createRoot(document.getElementById('root'));
root.render(<App />);
