# Propuesta Detallada de Limpieza (análisis estático)

Fecha: 22 de septiembre de 2025
Rama: `limpieza/cleanup-proposal`

Objetivo: Priorizar y describir acciones seguras para archivar/eliminar archivos detectados como no o poco usados en un análisis heurístico del frontend.

Resumen de hallazgos clave:
- `errorSuppression.js`: en uso. Referencia detectada en `sima-frontend/src/index.js` (se llama `setupGlobalErrorHandler()`), por lo que NO debe ser archivado.
- `fichaGenerator.js`: archivo vacío; aparece como candidato para archivar con riesgo muy bajo (probablemente placeholder).
- `__tests__/BuscarGridFix.test.js`: test unitario/e2e local. No referenciado en el repo (CI unknown). Riesgo bajo — puede archivarse si no forma parte de la suite CI.
- `PDF_DOCUMENTATION.md`: documentación integrada en `src/utils/`. Riesgo bajo — mover a `docs/` o `archives/docs/` es apropiado.

Detalles y recomendaciones por archivo

1) `sima-frontend/src/utils/errorSuppression.js`
- Tipo: utilidad runtime
- Detección: `git grep` muestra `setupGlobalErrorHandler` importado/llamado en `sima-frontend/src/index.js`.
- Riesgo: ALTO si se elimina (puede romper comportamiento de manejo de errores en desarrollo).
- Recomendación: Conservar en `src/utils/`. Si quieres reducir ruido, podríamos mover parte de su lógica a un módulo `dev-only` (pero mantener import en `index.js`). No archivar.

2) `sima-frontend/src/utils/fichaGenerator.js`
- Tipo: utilidad (actualmente archivo vacío)
- Detección: no exporta nada (vacío) y no aparece referenciado.
- Riesgo: MUY BAJO
- Recomendación: Archivar a `archives/utils/fichaGenerator.js` y dejar un `TODO` en `CLEANUP_PROPOSAL_DETAILED.md` indicando que si se necesitara restaurarlo, se puede mover de `archives/`.

3) `sima-frontend/src/__tests__/BuscarGridFix.test.js`
- Tipo: test
- Detección: no referenciado por el código de aplicación; probablemente diseñado para pruebas locales/manuales.
- Riesgo: BAJO
- Recomendación: Archivar a `archives/tests/` si no está incluido en CI; alternativa conservar en `tests/` central (`__tests__` en la raíz) si se desea mantener estructura. Si prefieres eliminar, sugeriría archivar primero.

4) `sima-frontend/src/utils/PDF_DOCUMENTATION.md`
- Tipo: documentación técnica
- Detección: no referenciado (es doc standalone)
- Riesgo: MUY BAJO
- Recomendación: Mover a `docs/` o `archives/docs/`. Propongo `docs/pdf/` o `archives/docs/` según quieras mantener documentación en repo principal o solo en archivo de archivo.

Notas operativas y siguientes pasos recomendados:
- Acción segura inmediata: mover/archivar `fichaGenerator.js`, `__tests__/BuscarGridFix.test.js`, y `PDF_DOCUMENTATION.md` a `archives/` con commit en `limpieza/cleanup-proposal`.
- Validación: después de archivar, ejecutar `npm test` (frontend) y levantar la app localmente para validar que no hay roturas; especialmente confirmar `index.js` aún importa `errorSuppression.js` correctamente.
- Riesgos dinámicos: esta heurística busca nombres y exports usados estáticamente — puede no detectar usos dinámicos (import() dinámico, require por construcción de strings). Revisar manualmente componentes que podrían usar plugins o carga dinámica.
- PR: crear PR desde `limpieza/cleanup-proposal` al branch base (p. ej. `flavioBase` o `main`) con la lista de cambios y pedir revisión antes de eliminación definitiva.

Propuesta de acciones (serie de commits, no destructivos):
1. `chore(archive): move fichaGenerator.js -> archives/utils/` (commit)
2. `chore(archive): move BuscarGridFix.test.js -> archives/tests/` (commit)
3. `chore(archive): move PDF_DOCUMENTATION.md -> docs/pdf/` (o `archives/docs/`) (commit)
4. Ejecutar `npm test` y levantar frontend localmente; arreglar si aparece algo roto.

¿Deseas que aplique ahora la acción segura (archivar los 3 candidatos listados) y cree los commits en `limpieza/cleanup-proposal`? Si confirmas, ejecutaré los `git mv` y commitearé los cambios y luego ejecutaré tests básicos de frontend (si están presentes). Si prefieres revisar otro conjunto de candidatos primero, dímelo.
