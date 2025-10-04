#!/bin/bash

# Script de prueba completa de carga de persona
echo "🧪 Iniciando prueba completa de carga de persona..."
echo "="

# 1. Obtener token de autenticación
echo "📝 Paso 1: Autenticando..."
TOKEN=$(curl -s -X POST http://localhost:4003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","password":"admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token de autenticación"
  exit 1
fi

echo "✅ Token obtenido correctamente"
echo ""

# 2. Crear persona con todos los campos
echo "📤 Paso 2: Enviando datos de persona..."
RESPONSE=$(curl -s -X POST http://localhost:4003/api/personas \
  -H "Authorization: Bearer $TOKEN" \
  -F "nombre=Juan Carlos" \
  -F "apellido=Pérez González" \
  -F "dni=87654321" \
  -F "alias=El Flaco" \
  -F "edad=35" \
  -F "genero=masculino" \
  -F "nacionalidad=Argentina" \
  -F "direccion=Av. Siempre Viva 742" \
  -F "provincia=tucuman" \
  -F "telefono=381-4567890" \
  -F "tipo_delito=robo" \
  -F "modalidad=arriete" \
  -F "direccion_hecho=Calle Falsa 123" \
  -F "comisaria=Comisaria 1a" \
  -F "comisaria_hecho=Comisaria 2a" \
  -F "UnidadesRegionales=URC" \
  -F "descripcion_fisica=Altura aproximada 1.75m, contextura delgada, cabello negro corto, ojos marrones, tatuaje en brazo derecho" \
  -F "observaciones=Sujeto conocido en la zona, antecedentes previos" \
  -F "latitud=-26.8083" \
  -F "longitud=-65.2176" \
  -F "latitud_hecho=-26.8283" \
  -F "longitud_hecho=-65.2376" \
  -F "fecha_carga=2025-10-03" \
  -F "fotos=@test_foto.png")

echo ""
echo "📊 Respuesta del servidor:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# 3. Verificar el resultado
if echo "$RESPONSE" | grep -q '"success":true'; then
  PERSONA_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "✅ ¡Persona creada exitosamente!"
  echo "🆔 ID de la persona: $PERSONA_ID"
  echo ""
  echo "📋 Resumen de datos enviados:"
  echo "   • Nombre completo: Juan Carlos Pérez González"
  echo "   • Alias: El Flaco"
  echo "   • DNI: 87654321"
  echo "   • Edad: 35 años"
  echo "   • Género: Masculino"
  echo "   • Dirección residencia: Av. Siempre Viva 742"
  echo "   • Dirección hecho: Calle Falsa 123"
  echo "   • Tipo delito: Robo"
  echo "   • Modalidad: Arriete"
  echo "   • Comisaría jurisdicción: Comisaria 1a"
  echo "   • Comisaría del hecho: Comisaria 2a"
  echo "   • Unidad Regional: URC"
  echo "   • Georeferenciación residencia: -26.8083, -65.2176"
  echo "   • Georeferenciación hecho: -26.8283, -65.2376"
  echo "   • Descripción física: Incluida"
  echo "   • Observaciones: Incluidas"
  echo "   • Fotografías: 1 imagen cargada"
else
  echo "❌ Error al crear la persona"
  echo "Detalles del error:"
  echo "$RESPONSE"
fi

echo ""
echo "🎯 Prueba completada"
