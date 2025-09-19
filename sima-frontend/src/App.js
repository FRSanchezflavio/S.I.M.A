import { BrowserRouter } from 'react-router-dom';
import RoutesApp from './routes';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <RoutesApp />
      </BrowserRouter>
    </ToastProvider>
  );
}
