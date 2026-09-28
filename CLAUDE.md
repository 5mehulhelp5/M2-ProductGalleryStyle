# Rollpix_ProductGallery — contexto para agentes

Paquete `rollpix/module-product-gallery`, repo [ROLLPIX/M2-ProductGalleryStyle](https://github.com/ROLLPIX/M2-ProductGalleryStyle). Reemplaza la galería Fotorama de la PDP por layouts editoriales (vertical, grid, fashion, slider) y agrega efectos al listado. Config en `rollpix_gallery/*` (Stores → Configuration → Rollpix → Product Gallery).

## Piezas principales

- `Model/Config.php` — lectura de toda la config; `getJsConfig()` arma el JSON que reciben los componentes JS por `data-mage-init`.
- `ViewModel/GalleryConfig.php` — fachada de `Config` para las plantillas.
- `view/frontend/layout/catalog_product_view.xml` — envuelve galería + `product-info-main` en el container `.rp-product-wrapper` (grid de dos columnas).
- `view/frontend/templates/product/view/gallery-vertical.phtml` — plantilla única de la galería de PDP: clases de estado sobre `.rp-product-gallery` (`rp-layout-*`, `rp-sticky-*`, …) y un `<style>` inline con las variables `--rp-*`.
- `view/frontend/web/js/` — un componente por feature (`gallery-zoom`, `gallery-slider`, `gallery-carousel`, `gallery-tabs`, `gallery-sticky`, …) y el mixin `swatch-gallery-bridge` sobre `Magento_Swatches/js/swatch-renderer`.

## Sticky (`rollpix_gallery/sticky/*`)

- `enabled` + `target` (`info` | `gallery`) + `mode` (`frame` | `scroll`, sólo para `info`) + `offset` (px, sumarle la altura del header fijo del tema).
- `target=info`: `product-info-main` es sticky por CSS (`gallery-vertical.css`); no hay JS.
- `target=gallery`: la galería lleva `rp-sticky-gallery` (sticky por CSS desde 768 px) y se inicializa `rpStickyScroll` (`gallery-sticky.js`), que reescribe `top` por dirección de scroll cuando la galería no entra en pantalla. El panel de info queda `static`.
- En mobile el sticky lo maneja el carrusel (`.rp-carousel-active`), no esto.

## Notas

- Muchos sitios tienen JS bundling prendido: un cambio en JS se verifica buscando el marcador en `pub/static/.../js/bundle/bundle*.min.js`.
- Versionado: tags con `v` (`v1.9.2`), release en GitHub para que RCPM lo tome.

<!-- Generado automáticamente por baseline (WE-57003). Refinar a medida que se trabaja en el módulo. -->
