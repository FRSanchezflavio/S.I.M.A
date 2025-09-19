/**
 * Simbología Policial Oficial de Tucumán
 * Configuración de íconos y colores según imagen proporcionada
 */

// Configuración de colores por tipo
export const COLORES_TIPOS = {
  // ROBOS AGRAVADOS
  robo_agravado_asaltante: '#ff0000', // Rojo
  robo_agravado_asaltante_banda: '#ff3333',
  robo_agravado_motovehiculo: '#ff6600', // Naranja
  robo_agravado_piranha_motovehiculo: '#ff9900',
  robo_agravado_automotor: '#cc0000',
  robo_agravado_entradera: '#990000',
  robo_agravado_ariete: '#660000',

  // ROBOS SIMPLES
  robo_piranha_motovehiculos: '#0066ff', // Azul
  robo_piranha: '#0099ff',
  robo_arrebato: '#ffff00', // Amarillo
  robo_clavero_autos: '#ffcc00',
  robo_motovehiculos: '#00cc00', // Verde
  robo_automotor: '#cccccc', // Gris
  robo_escruche: '#ff6600', // Naranja
  robo_boquetero: '#cc00cc', // Magenta
  robo_rompe_vidrio: '#0000ff', // Azul oscuro
  robo_oportunista: '#000000', // Negro

  // HURTOS
  hurto_punga: '#00cccc', // Cian
  hurto_mechera: '#00ff00', // Verde claro
  hurto_oportunista: '#ffff00', // Amarillo
  hurto_motovehiculo: '#666666', // Gris oscuro
  hurto_automotor: '#999999', // Gris
  hurto_inhibidor_alarmas: '#ffffff', // Blanco
  hurto_escalamiento: '#ff9900', // Naranja
  hurto_viuda_negra: '#000000', // Negro

  // ESTAFAS
  estafa_cuento_tio: '#0066cc', // Azul diamante

  // TENTATIVAS (mismo color base pero con borde punteado)
  tentativa: '#ff0000', // Borde rojo para tentativas
};

// Configuración de formas geométricas según la imagen
export const FORMAS_GEOMETRICAS = {
  // ROBOS AGRAVADOS - Triángulos
  robo_agravado_asaltante: 'triangle-up',
  robo_agravado_asaltante_banda: 'triangle-up-outline',
  robo_agravado_motovehiculo: 'triangle-right',
  robo_agravado_piranha_motovehiculo: 'triangle-right-outline',
  robo_agravado_automotor: 'triangle-left',
  robo_agravado_entradera: 'triangle-down',
  robo_agravado_ariete: 'triangle-left-outline',

  // ROBOS SIMPLES - Círculos
  robo_piranha_motovehiculos: 'circle',
  robo_piranha: 'circle',
  robo_arrebato: 'triangle-up',
  robo_clavero_autos: 'triangle-up',
  robo_motovehiculos: 'triangle-up',
  robo_automotor: 'triangle-up',
  robo_escruche: 'triangle-up',
  robo_boquetero: 'triangle-up',
  robo_rompe_vidrio: 'triangle-right',
  robo_oportunista: 'triangle-down',

  // HURTOS - Círculos
  hurto_punga: 'circle',
  hurto_mechera: 'circle',
  hurto_oportunista: 'circle',
  hurto_motovehiculo: 'circle',
  hurto_automotor: 'circle',
  hurto_inhibidor_alarmas: 'circle',
  hurto_escalamiento: 'circle',
  hurto_viuda_negra: 'circle',

  // ESTAFAS - Rombo
  estafa_cuento_tio: 'diamond',
};

// Mapeo de códigos de modalidad a configuración
export const MODALIDADES_MAPA = {
  // ROBOS AGRAVADOS
  asaltante: {
    tipo: 'robo_agravado_asaltante',
    nombre: 'Robo Agravado Asaltante',
    forma: 'triangle-up',
    color: '#ff0000',
  },
  asaltante_En_Banda: {
    tipo: 'robo_agravado_asaltante_banda',
    nombre: 'Robo Agravado Asaltante en Banda',
    forma: 'triangle-up-outline',
    color: '#ff3333',
  },
  robo_motovehiculo: {
    tipo: 'robo_agravado_motovehiculo',
    nombre: 'Robo Agravado de Motovehículo',
    forma: 'triangle-right',
    color: '#ff6600',
  },
  robo_automotor: {
    tipo: 'robo_agravado_automotor',
    nombre: 'Robo Agravado de Automotor',
    forma: 'triangle-left',
    color: '#cc0000',
  },
  entradera: {
    tipo: 'robo_agravado_entradera',
    nombre: 'Robo Agravado Entradera',
    forma: 'triangle-down',
    color: '#990000',
  },
  arriete: {
    tipo: 'robo_agravado_ariete',
    nombre: 'Robo Agravado Ariete',
    forma: 'triangle-left-outline',
    color: '#660000',
  },
  piranha_motovehiculo: {
    tipo: 'robo_agravado_piranha_motovehiculo',
    nombre: 'Robo Agravado Piraña de Motovehículo',
    forma: 'triangle-right-outline',
    color: '#ff9900',
  },

  // ROBOS SIMPLES
  boquetero: {
    tipo: 'robo_boquetero',
    nombre: 'Robo Boquetero',
    forma: 'triangle-up',
    color: '#cc00cc',
  },
  clavero_De_Autos: {
    tipo: 'robo_clavero_autos',
    nombre: 'Robo Clavero de Autos',
    forma: 'triangle-up',
    color: '#ffcc00',
  },
  arrebato: {
    tipo: 'robo_arrebato',
    nombre: 'Robo Arrebato',
    forma: 'triangle-up',
    color: '#ffff00',
  },
  piraña: {
    tipo: 'robo_piranha',
    nombre: 'Robo Piraña',
    forma: 'circle',
    color: '#0099ff',
  },
  piranha_motovehiculos: {
    tipo: 'robo_piranha_motovehiculos',
    nombre: 'Robo Piraña de Motovehículos',
    forma: 'circle',
    color: '#0066ff',
  },
  escruche: {
    tipo: 'robo_escruche',
    nombre: 'Robo Escruche',
    forma: 'triangle-up',
    color: '#ff6600',
  },
  rompe_vidrio: {
    tipo: 'robo_rompe_vidrio',
    nombre: 'Robo Rompe Vidrio',
    forma: 'triangle-right',
    color: '#0000ff',
  },
  motovehiculos: {
    tipo: 'robo_motovehiculos',
    nombre: 'Robo de Motovehículos',
    forma: 'triangle-up',
    color: '#00cc00',
  },
  automotor: {
    tipo: 'robo_automotor',
    nombre: 'Robo de Automotor',
    forma: 'triangle-up',
    color: '#cccccc',
  },

  // HURTOS
  punga: {
    tipo: 'hurto_punga',
    nombre: 'Hurto Punga',
    forma: 'circle',
    color: '#00cccc',
  },
  mechera: {
    tipo: 'hurto_mechera',
    nombre: 'Hurto Mechera',
    forma: 'circle',
    color: '#00ff00',
  },
  oportunista: {
    tipo: 'hurto_oportunista',
    nombre: 'Hurto Oportunista',
    forma: 'circle',
    color: '#ffff00',
  },
  escalamiento: {
    tipo: 'hurto_escalamiento',
    nombre: 'Hurto Escalamiento',
    forma: 'circle',
    color: '#ff9900',
  },
  inhibidor_alarmas: {
    tipo: 'hurto_inhibidor_alarmas',
    nombre: 'Hurto Inhibidor de Alarmas',
    forma: 'circle',
    color: '#ffffff',
  },
  hurto_motovehiculo: {
    tipo: 'hurto_motovehiculo',
    nombre: 'Hurto de Motovehículo',
    forma: 'circle',
    color: '#666666',
  },
  hurto_automotor: {
    tipo: 'hurto_automotor',
    nombre: 'Hurto de Automotor',
    forma: 'circle',
    color: '#999999',
  },
  viuda_negra: {
    tipo: 'hurto_viuda_negra',
    nombre: 'Hurto Viuda Negra',
    forma: 'circle',
    color: '#000000',
  },

  // ESTAFAS
  cuento_del_tio: {
    tipo: 'estafa_cuento_tio',
    nombre: 'Estafa Cuento del Tío',
    forma: 'diamond',
    color: '#0066cc',
  },

  // Default para casos no mapeados
  default: {
    tipo: 'general',
    nombre: 'Delito General',
    forma: 'circle',
    color: '#666666',
  },
};

// Función para obtener configuración de ícono
export const getConfiguracionIcono = (modalidad, esTentativa = false) => {
  // Normalizar modalidad para comparación
  const modalidadNormalizada = modalidad ? modalidad.toLowerCase().trim() : '';

  // Buscar configuración exacta
  let config =
    MODALIDADES_MAPA[modalidad] || MODALIDADES_MAPA[modalidadNormalizada];

  // Si no se encuentra, buscar por palabras clave
  if (!config) {
    const modalidadKeys = Object.keys(MODALIDADES_MAPA);
    const modalidadEncontrada = modalidadKeys.find(
      key =>
        modalidadNormalizada.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(modalidadNormalizada)
    );

    if (modalidadEncontrada) {
      config = MODALIDADES_MAPA[modalidadEncontrada];
    }
  }

  // Fallback al default
  if (!config) {
    config = MODALIDADES_MAPA.default;
  }

  // Si es tentativa, agregar borde punteado
  if (esTentativa) {
    return {
      ...config,
      esTentativa: true,
      nombre: `Tentativa de ${config.nombre}`,
    };
  }

  return config;
};

// Función para crear ícono SVG personalizado
export const crearIconoSVG = config => {
  const { forma, color, esTentativa } = config;
  const size = 24;
  const strokeWidth = esTentativa ? 3 : 2;
  const strokeDasharray = esTentativa ? '4,2' : 'none';
  const strokeColor = esTentativa ? '#ff0000' : '#ffffff';

  let path = '';
  let viewBox = `0 0 ${size} ${size}`;

  switch (forma) {
    case 'triangle-up':
      path = `M${size / 2} 2 L${size - 2} ${size - 2} L2 ${size - 2} Z`;
      break;
    case 'triangle-up-outline':
      path = `M${size / 2} 2 L${size - 2} ${size - 2} L2 ${size - 2} Z`;
      break;
    case 'triangle-right':
      path = `M2 2 L${size - 2} ${size / 2} L2 ${size - 2} Z`;
      break;
    case 'triangle-left':
      path = `M${size - 2} 2 L2 ${size / 2} L${size - 2} ${size - 2} Z`;
      break;
    case 'triangle-left-outline':
      path = `M${size - 2} 2 L2 ${size / 2} L${size - 2} ${size - 2} Z`;
      break;
    case 'triangle-right-outline':
      path = `M2 2 L${size - 2} ${size / 2} L2 ${size - 2} Z`;
      break;
    case 'triangle-down':
      path = `M2 2 L${size - 2} 2 L${size / 2} ${size - 2} Z`;
      break;
    case 'circle':
      path = `M${size / 2} ${size / 2} m-${size / 2 - 2} 0 a${size / 2 - 2} ${
        size / 2 - 2
      } 0 1 0 ${size - 4} 0 a${size / 2 - 2} ${size / 2 - 2} 0 1 0 -${
        size - 4
      } 0`;
      break;
    case 'diamond':
      path = `M${size / 2} 2 L${size - 2} ${size / 2} L${size / 2} ${
        size - 2
      } L2 ${size / 2} Z`;
      break;
    default:
      path = `M${size / 2} ${size / 2} m-${size / 2 - 2} 0 a${size / 2 - 2} ${
        size / 2 - 2
      } 0 1 0 ${size - 4} 0 a${size / 2 - 2} ${size / 2 - 2} 0 1 0 -${
        size - 4
      } 0`;
  }

  return `
    <svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="${path}" 
        fill="${color}" 
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        opacity="0.9"
      />
    </svg>
  `;
};

// Función para determinar si es tentativa
export const esTentativa = (descripcion = '', modalidad = '') => {
  const textoCompleto = `${descripcion} ${modalidad}`.toLowerCase();
  return (
    textoCompleto.includes('tentativa') ||
    textoCompleto.includes('intento') ||
    textoCompleto.includes('frustrado')
  );
};

export default {
  COLORES_TIPOS,
  FORMAS_GEOMETRICAS,
  MODALIDADES_MAPA,
  getConfiguracionIcono,
  crearIconoSVG,
  esTentativa,
};
