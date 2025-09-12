// Script de testing para antecedentes personales
// Ejecutar en la consola del navegador en la página PersonaDetalle

function testAntecedentesPersonales(personaId) {
  console.log('=== TESTING ANTECEDENTES PERSONALES ===');
  console.log('Persona ID:', personaId);

  // Crear datos de prueba
  const testDelito = {
    id: `delito_${Date.now()}_test`,
    tipo: 'robo',
    modalidad: 'con_violencia',
    descripcion:
      'Delito de prueba creado automáticamente desde formulario de carga',
    lugar: 'Av. Test 123',
    comisaria_hecho: 'Comisaría de Prueba',
    estado: 'en_proceso',
    juzgado: '',
    fecha_hecho: '2025-09-09',
    fecha_carga: new Date().toISOString(),
    observaciones:
      'Este es un delito de prueba para verificar que el sistema funciona',
    fotos: [],
    sujetoId: personaId.toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Guardar en localStorage
  const storageKey = `delitos_especificos_${personaId}`;
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  existing.push(testDelito);
  localStorage.setItem(storageKey, JSON.stringify(existing));

  console.log('Delito de prueba agregado:', testDelito);
  console.log('Total delitos en localStorage:', existing.length);

  // Verificar
  const verification = localStorage.getItem(storageKey);
  console.log('Verificación - Datos guardados:', verification);

  // Instrucciones
  console.log('');
  console.log('INSTRUCCIONES:');
  console.log('1. Recarga la página para ver los cambios');
  console.log('2. Ve a la pestaña "Antecedentes Personales"');
  console.log('3. Deberías ver el delito de prueba listado');
  console.log('');
  console.log('Para limpiar datos de prueba, ejecuta:');
  console.log(`localStorage.removeItem('${storageKey}')`);
}

// Función para limpiar todos los datos de antecedentes
function limpiarAntecedentes(personaId) {
  const storageKey = `delitos_especificos_${personaId}`;
  localStorage.removeItem(storageKey);
  console.log('Antecedentes limpiados para persona:', personaId);
}

// Función para listar todos los antecedentes
function listarAntecedentes(personaId) {
  const storageKey = `delitos_especificos_${personaId}`;
  const datos = localStorage.getItem(storageKey);
  if (datos) {
    const parsed = JSON.parse(datos);
    console.log('Antecedentes encontrados:', parsed);
    return parsed;
  } else {
    console.log('No hay antecedentes para persona:', personaId);
    return [];
  }
}

console.log('=== HERRAMIENTAS DE DEBUG CARGADAS ===');
console.log('Funciones disponibles:');
console.log('- testAntecedentesPersonales(personaId) - Crear datos de prueba');
console.log('- limpiarAntecedentes(personaId) - Limpiar datos');
console.log('- listarAntecedentes(personaId) - Ver datos actuales');
console.log('');
console.log('Ejemplo de uso:');
console.log(
  'testAntecedentesPersonales(123); // Reemplaza 123 con el ID real de la persona'
);
