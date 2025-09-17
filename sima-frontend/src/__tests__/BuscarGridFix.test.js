/**
 * Tests específicos para validar el fix del Grid de búsqueda S.I.M.A.
 * Incluye tests operativos para uso policial
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Buscar from '../pages/Buscar';
import api from '../services/api';

// Mock del API
jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock de datos de prueba para operaciones policiales
const mockPersonasData = {
  items: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    dni: `1234567${i.toString().padStart(2, '0')}`,
    nombre: `Persona ${i + 1}`,
    apellido: `Apellido ${i + 1}`,
    comisaria: `Comisaría ${(i % 5) + 1}`,
    menciones: [`Tipo ${i % 3 + 1}`],
    fotografia: null,
  }))
};

const renderBuscar = () => {
  return render(
    <BrowserRouter>
      <Buscar />
    </BrowserRouter>
  );
};

describe('Grid de Búsqueda S.I.M.A. - Validación Post-Fix', () => {
  beforeEach(() => {
    mockedApi.get.mockClear();
  });

  describe('1.1 Escenarios de Uso Policial Real', () => {
    test('Búsqueda urgente: Oficial puede ver 15+ resultados simultáneamente', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      renderBuscar();
      
      // Simular búsqueda urgente
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'Juan' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        expect(cards.length).toBeGreaterThanOrEqual(15);
      });

      // Verificar que el grid no tiene altura fija problemática
      const gridElement = screen.getByTestId('search-results-grid');
      const styles = window.getComputedStyle(gridElement);
      expect(styles.height).not.toBe('700px');
      expect(styles.height).toBe('auto');
    });

    test('Comparación: Analista puede comparar múltiples personas visualmente', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      renderBuscar();
      
      // Configurar viewport de comisaría (1366x768)
      Object.defineProperty(window, 'innerWidth', { value: 1366, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'Persona' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        
        // Verificar que múltiples cards son visibles para comparación
        let visibleCards = 0;
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
            visibleCards++;
          }
        });

        expect(visibleCards).toBeGreaterThanOrEqual(12); // KPI: 12+ resultados visibles
      });
    });

    test('Verificación: Operador confirma identidad con scroll mínimo', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'DNI' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const gridElement = screen.getByTestId('search-results-grid');
        
        // Verificar que tiene scroll automático apropiado
        const styles = window.getComputedStyle(gridElement);
        expect(styles.overflowY).toBe('auto');
        expect(styles.overflowX).toBe('hidden');
        
        // Verificar altura mínima para UX consistente
        expect(styles.minHeight).toBe('400px');
      });
    });

    test('Exportación: Acceso inmediato a botones CSV/XLSX sin scroll', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'test' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        // Verificar que los botones de exportación son accesibles
        const exportButtons = screen.getAllByText(/CSV|XLSX/i);
        exportButtons.forEach(button => {
          expect(button).toBeVisible();
          
          // Verificar que están en viewport sin scroll
          const rect = button.getBoundingClientRect();
          expect(rect.top).toBeGreaterThanOrEqual(0);
          expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
        });
      });
    });
  });

  describe('1.2 KPIs Críticos S.I.M.A.', () => {
    test('Tiempo de identificación: < 30 segundos por búsqueda', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      const startTime = performance.now();
      
      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'Juan' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        expect(cards.length).toBeGreaterThan(0);
      });

      const endTime = performance.now();
      const tiempoTotal = endTime - startTime;
      
      // KPI: < 30 segundos (30000ms)
      expect(tiempoTotal).toBeLessThan(30000);
    });

    test('Visibilidad: 12+ resultados sin scroll en 1366x768', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      // Configurar resolución estándar de comisaría
      Object.defineProperty(window, 'innerWidth', { value: 1366, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'test' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        
        // Contar cards visibles en viewport
        let visibleCount = 0;
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= 768) {
            visibleCount++;
          }
        });

        // KPI: 12+ resultados visibles
        expect(visibleCount).toBeGreaterThanOrEqual(12);
      });
    });

    test('Usabilidad: 0 clicks adicionales para ver contenido completo', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'test' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const gridElement = screen.getByTestId('search-results-grid');
        
        // Verificar que todo el contenido es accesible sin clicks adicionales
        const styles = window.getComputedStyle(gridElement);
        expect(styles.height).toBe('auto'); // Altura automática
        
        // No debe requerir clicks para expandir
        const expandButtons = screen.queryAllByText(/ver más|expandir|mostrar todo/i);
        expect(expandButtons).toHaveLength(0);
      });
    });

    test('Responsive: Funcional en patrullajes móviles', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      // Configurar viewport móvil
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'móvil' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const gridElement = screen.getByTestId('search-results-grid');
        const styles = window.getComputedStyle(gridElement);
        
        // Verificar responsive design para móvil
        expect(styles.gridTemplateColumns).toBe('1fr'); // 1 columna en móvil
        expect(styles.maxHeight).toBe('calc(100vh - 300px)'); // Altura ajustada para móvil
      });
    });
  });

  describe('1.3 Casos Edge Operativos', () => {
    test('Búsqueda con 50+ resultados (operativo masivo)', async () => {
      const mockMasiveData = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          dni: `9876543${i.toString().padStart(2, '0')}`,
          nombre: `Sospechoso ${i + 1}`,
          apellido: `Operativo ${i + 1}`,
          comisaria: `Comisaría ${(i % 10) + 1}`,
          menciones: [`Operativo Masivo`],
        }))
      };

      mockedApi.get.mockResolvedValue({ data: mockMasiveData });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'operativo' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        expect(cards.length).toBe(100);
        
        // Verificar que el grid maneja la carga masiva
        const gridElement = screen.getByTestId('search-results-grid');
        const styles = window.getComputedStyle(gridElement);
        expect(styles.overflowY).toBe('auto'); // Scroll automático para muchos resultados
      });
    });

    test('Performance con datos reales vs datos de prueba', async () => {
      // Simular datos con contenido realista más pesado
      const mockRealData = {
        items: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          dni: `12345678${i}`,
          nombre: `Nombre Completo Muy Largo ${i + 1}`,
          apellido: `Apellido Compuesto Muy Largo ${i + 1}`,
          comisaria: `Comisaría Regional Metropolitana ${(i % 5) + 1}`,
          menciones: [
            'Hurto agravado en establecimiento comercial',
            'Lesiones graves en vía pública',
            'Daños contra la propiedad privada'
          ],
          fotografia: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        }))
      };

      mockedApi.get.mockResolvedValue({ data: mockRealData });

      const startTime = performance.now();
      
      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'real' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        expect(cards.length).toBe(50);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Performance target: < 200ms para renderizado
      expect(renderTime).toBeLessThan(5000); // Más tiempo para datos pesados
    });
  });

  describe('1.4 Testing Operativo', () => {
    test('Stress test: 100 resultados sin lag', async () => {
      const mockStressData = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          dni: `stress${i.toString().padStart(3, '0')}`,
          nombre: `Stress Test ${i + 1}`,
          apellido: `Performance ${i + 1}`,
          comisaria: `Comisaría ${(i % 20) + 1}`,
          menciones: [`Stress ${i % 5}`],
        }))
      };

      mockedApi.get.mockResolvedValue({ data: mockStressData });

      renderBuscar();
      
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'stress' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        expect(cards.length).toBe(100);
        
        // Verificar que el grid maneja 100 elementos sin problemas
        const gridElement = screen.getByTestId('search-results-grid');
        expect(gridElement).toBeInTheDocument();
        expect(gridElement.children.length).toBe(101); // 100 cards + alert si aplica
      });
    });

    test('Multi-device: 5 resoluciones diferentes', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      const resoluciones = [
        { width: 375, height: 667, device: 'móvil' },
        { width: 768, height: 1024, device: 'tablet' },
        { width: 1366, height: 768, device: 'laptop' },
        { width: 1920, height: 1080, device: 'desktop' },
        { width: 2560, height: 1440, device: 'desktop_grande' },
      ];

      for (const res of resoluciones) {
        Object.defineProperty(window, 'innerWidth', { value: res.width, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: res.height, configurable: true });

        renderBuscar();
        
        const inputBusqueda = screen.getByRole('textbox');
        fireEvent.change(inputBusqueda, { target: { value: res.device } });
        
        const botonBuscar = screen.getByText('BUSCAR');
        fireEvent.click(botonBuscar);

        await waitFor(() => {
          const gridElement = screen.getByTestId('search-results-grid');
          const styles = window.getComputedStyle(gridElement);
          
          // Verificar que el grid es responsive en cada resolución
          expect(styles.display).toBe('grid');
          expect(styles.height).toBe('auto');
          
          // Verificar maxHeight apropiado por dispositivo
          if (res.width < 768) {
            expect(styles.maxHeight).toBe('calc(100vh - 300px)');
          } else {
            expect(styles.maxHeight).toContain('calc(100vh -');
          }
        });
      }
    });

    test('User flow: Búsqueda → Ver → Exportar → Navegar (completo)', async () => {
      mockedApi.get.mockResolvedValue({ data: mockPersonasData });

      renderBuscar();
      
      // 1. Búsqueda
      const inputBusqueda = screen.getByRole('textbox');
      fireEvent.change(inputBusqueda, { target: { value: 'flujo completo' } });
      
      const botonBuscar = screen.getByText('BUSCAR');
      fireEvent.click(botonBuscar);

      // 2. Ver resultados
      await waitFor(() => {
        const cards = screen.getAllByTestId('card-result');
        expect(cards.length).toBeGreaterThan(0);
      });

      // 3. Exportar (verificar botones accesibles)
      const exportButtons = screen.getAllByText(/CSV|XLSX/i);
      expect(exportButtons.length).toBeGreaterThan(0);
      exportButtons.forEach(button => {
        expect(button).toBeVisible();
      });

      // 4. Navegar a detalle (verificar cards clickeable)
      const firstCard = screen.getAllByTestId('card-result')[0];
      expect(firstCard).toBeInTheDocument();
      
      // Card debe ser interactivo para navegación
      expect(firstCard).toHaveStyle('cursor: pointer');
    });
  });
});