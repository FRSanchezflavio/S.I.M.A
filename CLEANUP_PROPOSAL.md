Propuesta de limpieza (rama: limpieza/cleanup-proposal)

Resumen: Esto es una propuesta no destructiva. No se eliminará nada hasta tu aprobación. 
Acciones recomendadas: archivar carpetas grandes y archivos generados, eliminar .bak y backups explícitos, y renombrar/archivar archivos duplicados.

Candidatos detectados:

1) Frontend build (puede ser regenerado):
- `sima-frontend/build/` (archivos .js, .map, .css, images)
  - motivo: archivos compilados que se regeneran con `npm run build`.
  - acción recomendada: mover a `archives/sima-frontend/build_YYYYMMDD.tar.gz` o eliminar si quieres ahorrar espacio.

2) Migraciones .bak y duplicadas (revisar):
- `backend/migrations/*.bak` — duplicados detectados:
  - `20250901_0001_enable_postgis.js.bak`
  - `20250901_0002_add_geolocation_fields.js.bak`
  - `20250902225925_enable_postgis.js.bak`
  - `20250902230006_add_geolocation_fields.js.bak`
  - Acción recomendada: conservar los `.js` activos; mover los `.bak` a `archives/migrations_bak/` o eliminarlos si confirmas que no contienen cambios necesarios.

3) Componentes backup en frontend:
- `sima-frontend/src/components/ListaAntecedentesPersonalesMejorada_BACKUP.jsx` 
  - motivo: duplicate/backups de componente.
  - acción recomendada: revisar diferencias y, si está obsoleto, mover a `archives/components/` o eliminar.

4) Map files / source maps / bundles grandes:
- `sima-frontend/build/static/js/*.js` y `*.map` y `*.css.map` — ocupan espacio.
  - acción: mover a `archives/`.

5) Archivos generados / package-lock grandes:
- `sima-frontend/package-lock.json` y `backend/package-lock.json` — no borrar; están en repo pero suelen ser grandes.
  - acción: conservar, no tocar.

6) `uploads/` y `uploads_test/`:
- `uploads/` existe y está vacía (según inspección).
- acción: conservar (confirmado por ti).

7) Otros: buscar archivos temporales o logs (no detectados en búsqueda inicial).

Siguiente paso propuesto (si apruebas):
- Mover los candidatos 1, 2 y 4 a `archives/` dentro del repo y commitear en `limpieza/cleanup-proposal` para revisión.  
- No tocar `uploads/` ni `package-lock.json`.

Preguntas para ti:
- ¿Confirmas que mueva `sima-frontend/build` y los `.bak` de migraciones a `archives/` y haga commit en la rama `limpieza/cleanup-proposal`?
- ¿Quieres que incluya un diff/preview de `ListaAntecedentesPersonalesMejorada_BACKUP.jsx` vs `ListaAntecedentesPersonalesMejorada.jsx` antes de decidir eliminar?

Si confirmas, aplicaré los movimientos (crear `archives/`, mover archivos, y commitear). No eliminaré nada permanentemente sin tu aprobación.