# Propuesta Final de Limpieza del Repositorio S.I.M.A

Fecha: 22 de septiembre de 2025
Rama de trabajo: `limpieza/cleanup-proposal`

Resumen ejecutivo
-----------------
Propongo una limpieza conservadora y segura del repositorio que reduzca artefactos compilados, backups redundantes y archivos no referenciados, preservando todo lo necesario para desarrollo y pruebas. Las acciones se agrupan en categorías (archivado no destructivo, eliminación propuesta tras periodo de revisión, y tareas de validación). Todas las acciones se realizarán en la rama `limpieza/cleanup-proposal` y se documentarán en commits atómicos. No se tocará `uploads/`.

Principios de la limpieza
------------------------
- No destructiva por defecto: mover a `archives/` en lugar de borrar.
- Hacer commits atómicos y claros por cada grupo de archivos movidos.
- Mantener la capacidad de revertir los cambios fácilmente (branch separado y commits descriptivos).
- Ejecutar pruebas y verificación mínima tras cada paso cuando sea posible.
- Involucrar revisión antes de eliminación definitiva.

Acciones propuestas (priorizadas)
---------------------------------
1) Archivar artefactos compilados y builds
- Qué: Mover `sima-frontend/build/` → `archives/sima-frontend/build/` (ya realizado).
- Riesgo: NULO (builds no necesarios en VCS).
- Motivo: Reduce tamaño del repo.
- Estado: Completado en `limpieza/cleanup-proposal`.

2) Archivar backups de migraciones
- Qué: Mover `backend/migrations/*.js.bak` → `archives/migrations_bak/` (ya realizado).
- Riesgo: NULO.
- Estado: Completado.

3) Archivar componentes y archivos no referenciados (análisis heurístico)
- Qué: Mover archivos detectados al directorio `archives/` manteniendo estructura.
  - `sima-frontend/src/utils/fichaGenerator.js` → `archives/utils/fichaGenerator.js` (archivo vacío)
  - `sima-frontend/src/__tests__/BuscarGridFix.test.js` → `archives/tests/BuscarGridFix.test.js`
  - `sima-frontend/src/utils/PDF_DOCUMENTATION.md` → `archives/docs/PDF_DOCUMENTATION.md`
  - `sima-frontend/src/components/ListaAntecedentesPersonalesMejorada_BACKUP.jsx` → `archives/components/ListaAntecedentesPersonalesMejorada_BACKUP.jsx`
- Riesgo: BAJO (archivado no destructivo).
- Estado: Completado.

4) Mantener utilidades runtime necesarias
- Qué: NO remover `sima-frontend/src/utils/errorSuppression.js` (detectado en `index.js`).
- Riesgo: ALTO si se elimina.
- Acción: dejar en `src/`.

5) Limpieza de otros candidatos (fases siguientes)
- Buscar activos grandes no referenciados (`uploads_test`, `build` antiguos fuera de `sima-frontend/build`, imágenes huérfanas en `public/` o `build/` antes de archivar).
- Identificar dependencias no usadas en `package.json` (opcional, más riesgoso — propuesto solo si se desea reducir dependencias).

Plan de validación
------------------
- Después de archivado: (i) levantar frontend localmente; (ii) levantar backend en puerto libre; (iii) probar flujo principal (login, búsqueda, páginas clave como `PersonaDetalle`, `RedesCriminales`).
- Ejecutar pruebas unitarias/CI si existen (en este repo no hay script `test` en `sima-frontend`, así que pruebas manuales son necesarias).

Propuesta de timeline y PR
--------------------------
- Paso 1 (inmediato): Revisar lista de cambios en `limpieza/cleanup-proposal` y confirmar.
- Paso 2 (0–1 día): Abrir PR desde `limpieza/cleanup-proposal` a `flavioBase` para revisión por el equipo.
- Paso 3 (7 días): Si no hay comentarios que requieran revertir, proceder a eliminar archivos archivados del branch `limpieza/cleanup-proposal` y/o del branch objetivo después de merge (o mantener `archives/` en repo según preferencia).

Archivos movidos en esta propuesta (resumen)
-------------------------------------------
- `sima-frontend/build/` → `archives/sima-frontend/build/` (realizado)
- `backend/migrations/*.js.bak` → `archives/migrations_bak/` (realizado)
- `sima-frontend/src/components/ListaAntecedentesPersonalesMejorada_BACKUP.jsx` → `archives/components/` (realizado)
- `sima-frontend/src/utils/fichaGenerator.js` → `archives/utils/` (realizado)
- `sima-frontend/src/__tests__/BuscarGridFix.test.js` → `archives/tests/` (realizado)
- `sima-frontend/src/utils/PDF_DOCUMENTATION.md` → `archives/docs/` (realizado)

Recomendaciones finales
-----------------------
- Mantener `archives/` en el repo durante al menos 7 días tras PR para revertir con facilidad.
- Revisar y ejecutar pruebas manuales para los flujos críticos.
- Después de la aprobación, considerar la eliminación física de `archives/` (o moverlo fuera del repo a un zip/backup externo) si se quiere reducir tamaño histórico.

¿Aprobás que abra el PR desde `limpieza/cleanup-proposal` hacia `flavioBase` con estos cambios y la descripción anterior? Si sí, lo creo y empujo el branch remoto (ya está push) y abro el PR. Si prefieres otro target branch para la PR, indícalo.