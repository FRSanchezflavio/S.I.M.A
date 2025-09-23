# Propuesta Parcial de Archivos No Referenciados (heurístico)

Fecha: 22 de septiembre de 2025
Rama: `limpieza/cleanup-proposal`

Resumen: Resultado del análisis heurístico rápido en `sima-frontend/src/` buscando archivos que no aparecen referenciados por nombre en el repositorio.

Candidatos detectados:

- `sima-frontend/src/__tests__/BuscarGridFix.test.js`
  - Tipo: test
  - Recomendación: archivar en `archives/tests/` si no se usa en CI; conservar si realizan pruebas locales.

- `sima-frontend/src/utils/PDF_DOCUMENTATION.md`
  - Tipo: documentación
  - Recomendación: archivar en `docs/` o `archives/docs/` (no es código ejecutable).

- `sima-frontend/src/utils/errorSuppression.js`
  - Tipo: utilidad JS
  - Recomendación: revisar export default/funciones; si no hay imports, archivar en `archives/utils/` y dejar nota en `CLEANUP_PROPOSAL.md`.

- `sima-frontend/src/utils/fichaGenerator.js`
  - Tipo: utilidad JS
  - Recomendación: revisar su API; si está replicada por `usePDFGenerator.js` y `PDFDownloadButton.jsx`, considerarla para archivar.

Notas:
- Este análisis es heurístico: archivos con usos dinámicos (import() dinámico, nombres construidos en tiempo de ejecución) pueden aparecer como "no referenciados" aunque sí se usen.
- Siguiente paso sugerido: para cada candidato, ejecutar `git grep -n "<exportedIdentifier>"` y revisar manualmente las dependencias; correr la app y tests tras archivar para validar.

Acción realizada: este archivo creado y commiteado en `limpieza/cleanup-proposal`.
