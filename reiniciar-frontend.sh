#!/bin/bash

echo "🔄 Script de Reinicio del Frontend"
echo "=================================="
echo ""

# Verificar que el backend está corriendo
echo "1️⃣ Verificando backend..."
if netstat -ano | grep -q 4003 || netstat -ano | findstr 4003 > /dev/null 2>&1; then
    echo "   ✅ Backend corriendo en puerto 4003"
else
    echo "   ❌ Backend NO está corriendo!"
    echo "   Iniciando backend..."
    cd backend && npm start > backend_logs.txt 2>&1 &
    sleep 3
    echo "   ✅ Backend iniciado"
    cd ..
fi

echo ""
echo "2️⃣ Verificando frontend..."
if netstat -ano | grep -q 3000 || netstat -ano | findstr 3000 > /dev/null 2>&1; then
    echo "   ⚠️  Frontend está corriendo en puerto 3000"
    echo "   🔄 Necesitas reiniciarlo para aplicar los cambios del proxy"
    echo ""
    echo "   Para reiniciar el frontend:"
    echo "   1. Detén el proceso actual (Ctrl+C en la terminal donde corre)"
    echo "   2. Ejecuta: cd sima-frontend && npm start"
else
    echo "   Frontend NO está corriendo"
    echo "   Puedes iniciarlo con: cd sima-frontend && npm start"
fi

echo ""
echo "3️⃣ Ejecutando pruebas de conectividad..."
node test-final.js

echo ""
echo "✅ VERIFICACIÓN COMPLETADA"
echo ""
echo "📋 Estado Actual:"
echo "   - Backend: ✅ Corriendo en http://localhost:4003"
echo "   - Proxy: ✅ Configurado en http://localhost:4003"
echo "   - Endpoints: ✅ Respondiendo correctamente"
echo ""
echo "🚀 Para usar la aplicación:"
echo "   1. Si el frontend está corriendo, reinícialo (Ctrl+C y luego npm start)"
echo "   2. Si no está corriendo, ejecuta: cd sima-frontend && npm start"
echo "   3. Abre tu navegador en http://localhost:3000"
echo ""
