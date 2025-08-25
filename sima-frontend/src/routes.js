import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cargar from './pages/Cargar';
import Buscar from './pages/Buscar';
import PersonaDetalle from './pages/PersonaDetalle';
import Registros from './pages/Registros';
import RegistroDetalle from './pages/RegistroDetalle';
import RegistroNuevo from './pages/RegistroNuevo';
import ProtectedRoute from './components/ProtectedRoute';

export default function RoutesApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cargar" element={<Cargar />} />
        <Route path="/buscar" element={<Buscar />} />
        <Route path="/registros" element={<Registros />} />
        <Route path="/registros/nuevo" element={<RegistroNuevo />} />
        <Route path="/registros/:id" element={<RegistroDetalle />} />
        <Route path="/personas/:id" element={<PersonaDetalle />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
