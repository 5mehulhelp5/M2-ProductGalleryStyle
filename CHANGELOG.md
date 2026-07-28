# Changelog

Todos los cambios notables de este módulo están documentados en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el módulo adhiere a [Semantic Versioning](https://semver.org/lang/es/).

> Nota: este archivo se creó el 2026-07-28 como parte de la normalización al baseline Rollpix. Las versiones anteriores a la entrada de abajo no están documentadas acá — ver el historial de git y los releases de GitHub.

---

## [1.9.1] — 2026-07-28

### Fixed

- **`fix(listing)`**: el **shimmer de las cards del listado quedaba visible aunque la imagen ya estuviera pintada**, y volvía a aparecer completo en cada visita a la misma categoría — el merchant lo reportó como "es como que la imagen nunca queda cacheada". Medido en producción (Marcovecchio): en la segunda visita **28 de 28 imágenes venían de disk-cache** (`transferSize = 0`, `complete = true`, listas a los 810 ms) y aun así había **24 shimmers activos**; el destape recién ocurría a los ~2.2 s.
  - Causa: la clase `rp-loaded` que apaga el shimmer sólo la aplicaba `gallery-listing-effects.js`, un módulo RequireJS con `domReady!`. Eso ata el destape a que RequireJS resuelva **toda** la cadena de módulos de la página (~190 archivos en este parque con módulos de terceros), no a que la imagen esté lista. La cache del browser funcionaba perfecto; lo que llegaba tarde era el JS.
  - Fix: nuevo `product/listing/shimmer-critical.phtml`, inyectado en el `<head>` vía `head.additional`. Es un script inline sin dependencias (ni jQuery, ni RequireJS, ni `domReady`) que registra un listener de `load`/`error` **en fase de captura** sobre `document` — los eventos `load` de `<img>` no burbujean pero sí se capturan — antes de que el parser llegue a las imágenes del listado. Suma un barrido inicial en rAF acotado, más `DOMContentLoaded` y `load`, para las imágenes que ya estaban `complete`.
  - `gallery-listing-effects.js` queda como responsable **sólo del contenido que entra por AJAX** (paginación de Amasty Shopby, swatches, widgets lazy). Ambos comparten la clase `rp-loaded`.
  - Los bloques de shimmer ahora respetan `ifconfig="rollpix_gallery/effects/shimmer_enabled"`: con el efecto apagado ya no se emite ningún script.

- **`fix(listing)`**: **N+1 de queries en el listado**. `AddVideoDataPlugin` cargaba los datos de video en batch pero seteaba `rp_listing_video` **sólo en los productos que tenían video**. Un producto sin video quedaba indistinguible de "el batch nunca corrió", así que `ImagePlugin::getVideoHtml()` caía al fallback `loadVideoDataDirect()` y ejecutaba **una query con 4 JOINs por cada card sin video** — en un listado de 24 productos sin video, 24 queries extra por request. Ahora el batch marca los misses con `false` e `ImagePlugin` corta ahí.

- **`fix(listing)`**: `gallery-listing-effects.js` **acumulaba handlers y timers**. El `MutationObserver` sobre `document.body` re-inicializaba cualquier card sin `rp-loaded` en cada mutación del DOM (constante en Luma), apilando un handler `load` y un `setTimeout` de 4 s por disparo. Ahora hay un guard de re-entrada por nodo y las ráfagas de mutaciones se agrupan en un solo scan por frame.

- **`fix(listing)`**: `ImagePlugin::injectVideoHtml()` usaba `preg_replace` con el HTML del video como string de reemplazo, donde `$1`, `$0` y `\1` se interpretan como backreferences — una URL de video con `$` en el querystring rompía el markup en silencio. Reemplazado por `preg_replace_callback`.

- **`fix(listing)`**: el wrapper `.rp-listing-shimmer` se agregaba incluso sobre HTML vacío, dejando un contenedor animando para siempre (sin `<img>` adentro nunca llega un evento `load` que lo destape). Ahora se omite si no hay contenido y no se anida si ya está aplicado.

### Changed

- **`refactor(di)`**: `ImagePlugin` ya no usa `ObjectManager::getInstance()` como fallback de `ResourceConnection`; la dependencia pasa a ser obligatoria por constructor, según el estándar Rollpix.
- **`refactor(sql)`**: `loadVideoDataDirect()` pasa `store_id` con `quoteInto()` en vez de concatenarlo en las condiciones de JOIN. No era explotable (el valor venía casteado a `int`), pero deja de depender de eso.
