# TASKS — Rollpix_ProductGallery

To-do vivo de la sesión actual de trabajo. Se mantiene actualizado durante el desarrollo.
No es un historial — para historial está git log.

## En progreso
- WE-57003: review + ship de 1.10.0 (cliente aprobó en stage el 2026-09-29) y deploy a prod de Marcovecchio.

## Pendiente — deuda de estándar previa a 1.10.0 (normalizar en un ticket propio)
Se decidió publicar 1.10.0 sin esto porque ninguna falta la introduce este cambio:
- `manual.md` en castellano (instalación, cada campo de config, uso, FAQ, troubleshooting).
- `docs/ACCEPTANCE.md`.
- `i18n/en_US.csv` + `es_AR.csv` completos (~140 strings: `__()` en PHP/PHTML y labels/comments de `system.xml`); hoy sólo están los de WE-57003.
- `phpstan.neon` nivel 5 y pasarlo.
- `Logger/Handler.php` (`var/log/rollpix_productgallery.log`) y `Setup/Uninstall.php` (limpiar `rollpix_gallery/*`).
- Sacar el fallback `ObjectManager::getInstance()` de `ViewModel/GalleryConfig.php:41` (inyectar `Filesystem` siempre).

## Hecho (sesión actual)
- `rollpix_gallery/sticky/target` (source `StickyTarget`), CSS `rp-sticky-gallery`, `gallery-sticky.js` generalizado e inicializado sólo para `gallery`.
- Probado inyectando CSS+JS sobre la PDP de prod de Marcovecchio: 1280×900 (galería fija a 161 px, se suelta al final del wrapper), 1366×657 (al bajar se pega por abajo y al subir vuelve al offset), 390×844 (no toca el `top`).
