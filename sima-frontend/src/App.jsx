import { BrowserRouter } from 'react-router-dom';
import RoutesApp from './routes';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <RoutesApp />
      </BrowserRouter>
    </ToastProvider>
  );
}
