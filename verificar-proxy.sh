#!/bin/bash

echo "🔍 Verificando configuración del proxy..."
echo ""

# Verificar que el backend está corriendo
echo "1. Verificando backend en puerto 4003..."
if netstat -ano | grep -q 4003 || netstat -ano | findstr 4003 > /dev/null 2>&1; then
    echo "   ✅ Backend está corriendo en el puerto 4003"
else
    echo "   ❌ Backend NO está corriendo en el puerto 4003"
    exit 1
fi

# Verificar la configuración del proxy en package.json
echo ""
echo "2. Verificando configuración del proxy en frontend..."
PROXY_CONFIG=$(grep '"proxy"' sima-frontend/package.json | cut -d'"' -f4)
echo "   Proxy configurado: $PROXY_CONFIG"

if [ "$PROXY_CONFIG" = "http://localhost:4003" ]; then
    echo "   ✅ Proxy configurado correctamente"
else
    echo "   ⚠️  Proxy configurado en: $PROXY_CONFIG"
    echo "   ⚠️  Debería estar en: http://localhost:4003"
fi

# Probar conectividad directa
echo ""
echo "3. Probando conectividad directa al backend..."
node test-connection.js

echo ""
echo "🎉 Verificación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Si el frontend está corriendo, reinícialo para aplicar los cambios del proxy"
echo "   2. Ejecuta: cd sima-frontend && npm start"
echo "   3. El frontend debería conectarse correctamente al backend en el puerto 4003"
echo ""
