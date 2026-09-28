# TASKS — Rollpix_ProductGallery

To-do vivo de la sesión actual de trabajo. Se mantiene actualizado durante el desarrollo.
No es un historial — para historial está git log.

## En progreso
- WE-57003: opción *Elemento fijo* = Galería de imágenes. Falta el deploy a TEST (stage Marcovecchio 100926) y el QA.

## Pendiente
- i18n: `i18n/` se creó en WE-57003 sólo con los strings nuevos; faltan los del resto del admin.
- Publicar 1.10.0 (incluye el fix 1.9.3 de WE-56006, que está en `main` sin tag).

## Hecho (sesión actual)
- `rollpix_gallery/sticky/target` (source `StickyTarget`), CSS `rp-sticky-gallery`, `gallery-sticky.js` generalizado e inicializado sólo para `gallery`.
- Probado inyectando CSS+JS sobre la PDP de prod de Marcovecchio: 1280×900 (galería fija a 161 px, se suelta al final del wrapper), 1366×657 (al bajar se pega por abajo y al subir vuelve al offset), 390×844 (no toca el `top`).
