import axios from 'axios';
import { toast } from '../utils/toastBus';

// Usando proxy de CRA, baseURL relativa
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token = null) {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config || {};
    const status = error?.response?.status;
    if (status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then(token => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch(err => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken,
        });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    // Toast homogéneo para 4xx/5xx si no se suprime
    const suppress =
      original?.headers?.['x-toast-suppress'] === '1' ||
      original?.xToastSuppress;
    if (!suppress) {
      const msg =
        error?.response?.data?.message || `Error ${status || ''}`.trim();
      if (status >= 500) toast('Error del servidor', 'error');
      else if (status >= 400) toast(msg || 'Error en la solicitud', 'warning');
      else toast('Error de red', 'error');
    }
    return Promise.reject(error);
  }
);

export default api;
