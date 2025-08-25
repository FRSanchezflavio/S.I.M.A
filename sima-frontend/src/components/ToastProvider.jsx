import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Snackbar, Alert } from '@mui/material';
import { setToastFn } from '../utils/toastBus';

const ToastCtx = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState('info');

  const showToast = useCallback((message, type = 'info') => {
    setMsg(message);
    setSeverity(type);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    setToastFn(showToast);
  }, [showToast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3500}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          sx={{ width: '100%' }}
        >
          {msg}
        </Alert>
      </Snackbar>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
