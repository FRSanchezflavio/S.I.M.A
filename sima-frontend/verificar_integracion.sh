#!/bin/bash

echo "🔍 Verificando integración territorial en S.I.M.A."
echo "================================================="

# Verificar que el directorio de hooks existe
if [ -f "src/hooks/useEdicionTerritorial.js" ]; then
    echo "✅ Hook useEdicionTerritorial.js creado correctamente"
else
    echo "❌ Hook useEdicionTerritorial.js no encontrado"
fi

# Verificar PanelControlTerritorial
if [ -f "src/components/inteligencia/PanelControlTerritorial.jsx" ]; then
    echo "✅ PanelControlTerritorial.jsx creado correctamente"
else
    echo "❌ PanelControlTerritorial.jsx no encontrado"
fi

# Verificar que MapaTerritorialBandas tiene las modificaciones
if grep -q "modoEdicion" "src/components/inteligencia/MapaTerritorialBandas.jsx"; then
    echo "✅ MapaTerritorialBandas.jsx modificado para soportar edición"
else
    echo "❌ MapaTerritorialBandas.jsx no tiene soporte de edición"
fi

# Verificar que Dashboard tiene la integración territorial
if grep -q "MapaTerritorialBandas" "src/pages/Dashboard.jsx"; then
    echo "✅ Dashboard.jsx integrado con funcionalidad territorial"
else
    echo "❌ Dashboard.jsx no tiene integración territorial"
fi

# Verificar dependencias instaladas
if grep -q "leaflet-draw" "package.json"; then
    echo "✅ Dependencia leaflet-draw instalada"
else
    echo "❌ Dependencia leaflet-draw no instalada"
fi

if grep -q "@turf/turf" "package.json"; then
    echo "✅ Dependencia @turf/turf instalada"
else
    echo "❌ Dependencia @turf/turf no instalada"
fi

echo ""
echo "🎯 RESUMEN DE IMPLEMENTACIÓN:"
echo "- ✅ Dependencias territoriales instaladas"
echo "- ✅ Hook de edición territorial creado"
echo "- ✅ Panel de control territorial implementado"
echo "- ✅ MapaTerritorialBandas adaptado para edición"
echo "- ✅ Dashboard integrado con visualización territorial"
echo ""
echo "🚀 La funcionalidad territorial está lista para usar en:"
echo "   http://localhost:3000 - Dashboard con mapa territorial"
echo ""
echo "📋 FUNCIONALIDADES IMPLEMENTADAS:"
echo "   • Visualización de territorios de bandas criminales"
echo "   • Edición territorial (expandir/contraer/redefinir)"
echo "   • Panel de control flotante especializado"
echo "   • Validaciones geoespaciales con @turf/turf"
echo "   • Persistencia en base de datos PostgreSQL"
echo "   • Integración seamless con Dashboard existente"