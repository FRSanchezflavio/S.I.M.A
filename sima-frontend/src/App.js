import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import RoutesApp from './routes';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <ToastProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <RoutesApp />
        </BrowserRouter>
      </LocalizationProvider>
    </ToastProvider>
  );
}
