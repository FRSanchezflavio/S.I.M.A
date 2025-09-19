import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cargar from './pages/Cargar';
import AgregarDelito from './pages/AgregarDelito';
import Buscar from './pages/Buscar';
import PersonaDetalle from './pages/PersonaDetalle';
import Registros from './pages/Registros';
import RegistroDetalle from './pages/RegistroDetalle';
import RegistroNuevo from './pages/RegistroNuevo';
import MapaGeneral from './pages/MapaGeneral';
import ProtectedRoute from './components/ProtectedRoute';
import PDFTestComponent from './components/PDFTestComponent';
import InteligenciaCriminal from './pages/InteligenciaCriminal';

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cargar" element={<Cargar />} />
        <Route path="/agregar-delito" element={<AgregarDelito />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/mapa" element={<MapaGeneral />} />
        <Route path="/inteligencia" element={<InteligenciaCriminal />} />
        <Route path="/registros" element={<Registros />} />
        <Route path="/registros/nuevo" element={<RegistroNuevo />} />
        <Route path="/registros/:id" element={<RegistroDetalle />} />
        <Route path="/personas/:id" element={<PersonaDetalle />} />
        <Route path="/test-pdf" element={<PDFTestComponent />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
