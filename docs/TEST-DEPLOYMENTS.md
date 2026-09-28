# TEST Deployments — Rollpix_ProductGallery

Log de deployments al servidor TEST para validación previa al review/ship.
Cada entrada documenta qué se deployó, cuándo, quién, y el resultado de la validación.

---

## 2026-09-28 15:55 — Lautaro Martinez

**Commit:** `9633448` (963344859d1f7892faf4731516986c7c7d6840f9)
**Branch:** `feat/WE-57003-sticky-gallery-target`
**Mensaje:** feat: sticky gallery option (Sticky Element = Image gallery) (WE-57003)
**Ambiente:** stage Marcovecchio ishop16-100926 (https://marcovecchio-100926.stage16.rollpix.com/), árbol de la rama copiado sobre `vendor/rollpix/module-product-gallery` (el push a GitHub quedó pendiente). Backup del 1.9.2 original en `~/bkp-we57003-20260928-185448`.
**Config:** `rollpix_gallery/sticky/enabled=1`, `target=gallery`, `offset=161` (default scope).

**Qué se está probando:**
Galería fija en la PDP mientras scrollea la descripción (WE-57003), incluida una galería más alta que la pantalla.

**Estado:** ⏳ Pendiente de validación (QA)

**Resultado:** verificación del builder en `fox-non-stop-fleece-n31676`. A 1280×900 la galería queda fija a 161 px y se suelta al final de `.rp-product-wrapper`. A 1366×657, al bajar queda `top=-53` (bottom 637, miniaturas visibles) y al subir vuelve a 161. A 390×844 sigue el carrusel sticky de siempre, sin `top` inline. Info panel `static`. Consola sin errores nuevos (sólo One Tap y el pixel de Meta, igual que en prod). _Falta el OK de QA._
