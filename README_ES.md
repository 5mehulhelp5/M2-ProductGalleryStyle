# Rollpix Product Gallery para Magento 2

[English version](README.md)

Modulo moderno de galeria de producto estilo editorial para Magento 2 que reemplaza la galeria Fotorama por defecto. Incluye cuatro modos de layout (vertical, grilla, fashion, slider), cinco tipos de zoom (hover, click, lightbox, modal, deshabilitado), navegacion por miniaturas con highlight deslizante y modo overlay, efecto de foco por scroll, tabs accordion inline, carga shimmer, animaciones fade-in, experiencia mobile-first con carrusel y soporte completo de video (MP4, YouTube, Vimeo) en paginas de producto y listings de categoria.

![Magento 2](https://img.shields.io/badge/Magento-2.4.7--2.4.8-orange.svg)
![PHP](https://img.shields.io/badge/PHP-8.1--8.4-blue.svg)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)

## Caracteristicas

### Modos de Layout
- **Vertical**: Imagenes apiladas en una sola columna, info del producto al costado
- **Grilla**: Grilla de imagenes multi-columna (2 o 3 columnas) con sidebar de info
- **Fashion**: Patron alternado 1-2 imagenes (1 ancho completo, 2 mitad, repetir)
- **Slider**: Una imagen a la vez con transiciones configurables, flechas, dots, teclado y navegacion con rueda del mouse
- **Posicion configurable**: Galeria a la izquierda o derecha
- **Ratios de columna flexibles**: De 20/80 a 80/20 en incrementos de 5% (13 opciones)
- **Espacio entre imagenes ajustable**: Configurar separacion entre imagenes (0-40px)

### Opciones del Slider
- **Efectos de transicion**: Fade (cruzado), Slide (direccional), Zoom-fade (zoom out + fade)
- **Direccion del slide**: Horizontal o Vertical
- **Flechas de navegacion**: Botones anterior/siguiente con estilos compatibles con Luma
- **Indicadores de puntos**: Navegacion clickeable con puntos debajo del slider
- **Navegacion con rueda del mouse**: Scroll para cambiar de slide (configurable)
- **Soporte de teclado**: Teclas de flecha para navegar

### Navegacion por Miniaturas (Layout Slider)
- **Posiciones**: Izquierda, Derecha o Debajo de la imagen del slider
- **Estilos de visualizacion**: Fuera (al lado de la imagen) u Overlay (flotando dentro de la imagen con fondo blur)
- **Forma de miniatura**: Cuadrado (recortado) o Preservar proporcion original
- **Highlight deslizante**: Indicador animado de borde que se desliza entre miniaturas al cambiar (estilo Fotorama)
- **Correccion de flechas overlay**: Las flechas del slider se desplazan automaticamente cuando las miniaturas overlay estan activas

### Opciones de Zoom
- **Lupa hover**: Zoom al pasar el mouse con indicador de lente y vista ampliada (lado derecho o dentro de la imagen)
- **Zoom click**: Click para hacer zoom in-situ, click de nuevo para resetear
- **Lightbox**: Visualizacion de imagen a pantalla completa con navegacion GLightbox, soporte tactil y de teclado
- **Zoom Modal**: Overlay a pantalla completa con todas las imagenes del producto apiladas verticalmente; al clickear la imagen N se scrollea hasta esa imagen. Incluye indicador de scroll con animacion bounce que se oculta tras 3 segundos o al scrollear. Cerrar con boton X, click en el overlay o tecla Escape
- **Nivel de zoom configurable**: Magnificacion de 2x a 10x (modos hover y click)
- **Opcion deshabilitado**: Desactivar zoom completamente

### Tabs Accordion Inline
- Mover las tabs de detalle del producto (Descripcion, Info Adicional, Opiniones) dentro de la columna de info como secciones accordion colapsables
- Truncado de descripcion con gradiente y enlace "Leer mas" (altura maxima configurable)
- Solo desktop: en mobile se restauran las tabs originales de Magento

### Efectos y Animaciones
- **Carga Shimmer**: Placeholder animado con shimmer mientras cargan las imagenes, con fade-in suave al completar. Incluye fallback JS (4s) y fallback CSS (5s)
- **Fade-in al scrollear**: Animacion sutil de opacidad + deslizamiento hacia arriba cuando las imagenes entran al viewport (alternativa al shimmer)
- **Foco por Scroll**: Destaca la imagen mas cercana al centro del viewport mientras aplica fade y/o blur a las imagenes que se alejan. Opciones: Fade, Blur, Ambos o Deshabilitado. Solo para layouts de stack (Vertical, Grilla, Fashion). Manejo inteligente de imagenes altas/verticales que abarcan todo el viewport
- **Contador de imagenes**: Indicador de posicion fijo mostrando imagen actual/total (layout slider)

### Panel Sticky
- **Dos modos Sticky**:
  - **Modo Frame**: El panel de info scrollea dentro de un contenedor de altura fija
  - **Modo Scroll Natural**: El panel de info queda fijo arriba mientras las imagenes scrollean
- **Offset configurable**: Ajustar distancia superior para sitios con headers fijos
- **Activar/Desactivar**: Habilitar o deshabilitar el comportamiento sticky

### Experiencia Mobile
- **Carrusel deslizable**: Carrusel de imagenes tactil con indicadores de puntos overlay
- **Carrusel sticky**: La imagen queda fija arriba mientras la info del producto scrollea sobre ella
- **Altura dinamica del slide**: El wrapper se adapta a la altura de cada imagen (sin espacio en blanco)
- **Opcion stack vertical**: Layout alternativo de stack para mobile

### Soporte de Video (Pagina de Producto)
- **Videos MP4 locales**: Reproduccion HTML5 `<video>` para archivos MP4 asignados como imagenes de producto
- **YouTube y Vimeo**: Iframes embebidos inline con facade de miniatura + boton play (carga lazy)
- **Tamaño del reproductor**: Proporcion 16:9 o coincidir con las dimensiones de la imagen del producto
- **Ajuste de video**: Cover (recortar para rellenar) o Contain (mostrar video completo con letterbox)
- **Autoplay / Loop / Muted / Controles**: Todos configurables por separado
- **IntersectionObserver**: Los videos se reproducen automaticamente al ser visibles, se pausan al salir del viewport
- **postMessage API**: Control limpio de reproduccion/pausa para iframes de YouTube y Vimeo

### Soporte de Video (Listing de Categoria)
- **Video en cards de listing**: Reemplazar imagen del producto con video en paginas de categoria y resultados de busqueda
- **MP4, YouTube y Vimeo**: Todos los proveedores soportados, auto-detectados desde la galeria de medios de Magento
- **Tamaño del reproductor**: Coincidir dimensiones de imagen (usa el contenedor de Magento) o proporcion 16:9 independiente
- **Ajuste de video**: Cover o Contain dentro del card de listing
- **Boton Play/Stop**: Control opcional overlay en videos del listing
- **Shimmer para todas las imagenes**: Placeholder animado de carga para todas las imagenes del listing (no solo videos)
- **Carga batch**: Datos de video cargados por coleccion (una query por pagina, no por producto)

### Rendimiento
- **Lazy Loading**: Carga diferida nativa para imagenes; IntersectionObserver para videos
- **Liviano**: Sin dependencias pesadas, GLightbox pesa solo ~2KB gzipped
- **Variables CSS**: Estilos dinamicos sin recarga de pagina
- **requestAnimationFrame**: Interacciones suaves basadas en scroll

## Requisitos

| Requisito | Version |
|-----------|---------|
| Magento | 2.4.7 - 2.4.8 |
| PHP | 8.1 - 8.4 |
| Tema | Luma o temas basados en Luma |

## Instalacion

### Via Composer (Recomendado)

```bash
composer require rollpix/module-product-gallery
bin/magento module:enable Rollpix_ProductGallery
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

### Instalacion Manual

1. Crear la estructura de directorios:
```bash
mkdir -p app/code/Rollpix/ProductGallery
```

2. Descargar y extraer los archivos del modulo en `app/code/Rollpix/ProductGallery/`

3. Habilitar el modulo:
```bash
bin/magento module:enable Rollpix_ProductGallery
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

## Configuracion

Navegar a **Tiendas > Configuracion > Rollpix > Product Gallery**

### Configuracion de Layout

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Tipo de Layout | Vertical, Grilla, Fashion o Slider | Vertical |
| Posicion de Galeria | Izquierda o Derecha | Izquierda |
| Ratio de Columnas | 40/60, 50/50 o 60/40 (modo vertical) | 50/50 |
| Ratio de Grilla | De 20/80 a 80/20 en incrementos de 5% (grilla/fashion/slider) | 70/30 |
| Columnas de Imagen en Grilla | 2 o 3 columnas (modo grilla) | 2 |
| Espacio entre Imagenes | Separacion en pixeles (0-40) | 20px |
| Direccion del Slider | Horizontal o Vertical (modo slider) | Horizontal |
| Transicion del Slider | Fade, Slide o Zoom-fade (modo slider) | Fade |
| Flechas de Navegacion | Mostrar botones anterior/siguiente (modo slider) | Si |
| Indicadores de Puntos | Mostrar navegacion con puntos (modo slider) | Si |
| Navegacion con Rueda | Scroll para cambiar slides (modo slider) | Si |
| Navegacion por Miniaturas | Izquierda, Derecha, Abajo o Deshabilitado (modo slider) | Deshabilitado |
| Estilo de Miniaturas | Fuera u Overlay (modo slider) | Fuera |
| Forma de Miniaturas | Cuadrado (recortado) o Preservar proporcion (modo slider) | Cuadrado |

### Configuracion de Zoom

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Tipo de Zoom | Lupa Hover, Zoom Click, Lightbox, Zoom Modal o Deshabilitado | Hover |
| Nivel de Zoom | Nivel de magnificacion 2x-10x (modos hover y click) | 3x |
| Posicion de Ventana de Zoom | Lado Derecho o Dentro de la Imagen (modo hover) | Derecha |

### Efectos y Animaciones

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Carga Shimmer | Placeholder animado mientras cargan las imagenes | No |
| Fade-in al Scroll | Animacion de opacidad + deslizamiento al entrar al viewport (requiere shimmer desactivado) | No |
| Efecto Foco por Scroll | Fade, Blur, Ambos o Deshabilitado. Destaca imagen centrada (solo layouts stack) | Deshabilitado |
| Contador de Imagenes | Indicador de posicion para layout slider | No |

### Tabs del Producto

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Tabs Accordion Inline | Mover tabs dentro de info del producto como accordion colapsable | No |
| Altura Max Descripcion | Altura maxima antes del enlace "Leer mas" (0 para deshabilitar) | 0 |

### Configuracion del Panel Sticky

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Habilitar Sticky | Mantener info del producto fija al scrollear | Si |
| Modo Sticky | Frame (panel scrolleable) o Scroll Natural (fijo arriba) | Scroll Natural |
| Offset Superior | Distancia desde arriba en pixeles | 20px |

### Configuracion de Video (Pagina de Producto)

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Habilitar Video | Habilitar reproduccion de video en paginas de producto | Si |
| Autoplay | Reproducir video automaticamente al cargar la pagina | Si |
| Loop | Reproducir video en bucle | Si |
| Silenciado | Silenciar video por defecto | Si |
| Mostrar Controles | Mostrar controles nativos de video | No |
| Tamaño del Reproductor | Proporcion de video (16:9) o Coincidir dimensiones de imagen | Video (16:9) |
| Ajuste del Video | Cover (recortar para rellenar) o Contain (video completo) | Cover |
| Carga Lazy | Cargar video solo cuando sea visible | Si |

### Configuracion de Video (Listing de Categoria)

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Habilitar Video en Listing | Mostrar videos en paginas de categoria/busqueda | Si |
| Autoplay en Listing | Reproducir videos automaticamente en cards del listing | Si |
| Mostrar Boton Play/Stop | Boton de control overlay play/stop | Si |
| Tamaño del Reproductor | Coincidir dimensiones de imagen o Proporcion de video (16:9) | Coincidir imagen |
| Ajuste del Video | Cover (recortar para rellenar) o Contain (video completo) | Cover |

### Configuracion Mobile

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| Comportamiento Mobile | Stack Vertical o Carrusel Deslizable | Carrusel |

## Diagramas

### Desktop - Layout Vertical (50/50)
```
+---------------------------------------------+
|  +-------------+    +---------------------+ |
|  |             |    | Titulo Producto     | |
|  |   Imagen 1  |    | $99.00              | |
|  |             |    |                     | |
|  +-------------+    | [Agregar al Carrito] | |
|                     |                     | |
|  +-------------+    | Descripcion...      | |
|  |             |    |                     | |
|  |   Imagen 2  |    |  (Panel Sticky)     | |
|  |             |    |                     | |
|  +-------------+    +---------------------+ |
|                                             |
|  +-------------+                            |
|  |   Imagen 3  |                            |
|  +-------------+                            |
+---------------------------------------------+
```

### Desktop - Layout Grilla (70/30, 2 columnas)
```
+----------------------------------+--------------+
|  +----------+  +----------+     |              |
|  |  Img 1   |  |  Img 2   |     |  Producto    |
|  +----------+  +----------+     |  $99.00      |
|  +----------+  +----------+     |              |
|  |  Img 3   |  |  Img 4   |     |  [Agregar    |
|  +----------+  +----------+     |   al Carrito]|
|  +----------+                   |              |
|  |  Img 5   |                   |  (Sticky)    |
|  +----------+                   |              |
|         70%                     |     30%      |
+----------------------------------+--------------+
```

### Desktop - Layout Fashion
```
+----------------------------------+--------------+
|  +---------------------------+  |              |
|  |     Imagen 1 (completa)   |  |  Producto    |
|  +---------------------------+  |  $99.00      |
|  +------------+ +------------+  |              |
|  |   Img 2    | |   Img 3    |  |  [Agregar    |
|  +------------+ +------------+  |   al Carrito]|
|  +---------------------------+  |              |
|  |     Imagen 4 (completa)   |  |  (Sticky)    |
|  +---------------------------+  |              |
+----------------------------------+--------------+
```

### Desktop - Layout Slider con Miniaturas
```
+----------------------------------+--------------+
|  +--+ +----------------------+  |              |
|  |M1| |                      |  |  Producto    |
|  +--+ |    < Imagen 2 >      |  |  $99.00      |
|  |M2| |                      |  |              |
|  +--+ |                      |  |  [Agregar    |
|  |M3| +----------------------+  |   al Carrito]|
|  +--+      o  *  o  o  o       |              |
+----------------------------------+--------------+
```

### Zoom Modal (stack pantalla completa)
```
+---------------------------------------------+
|                                         [X] |
|                                             |
|         +-------------------------+         |
|         |       Imagen 1          |         |
|         +-------------------------+         |
|         +-------------------------+         |
|         |       Imagen 2          |         |
|         +-------------------------+         |
|         +-------------------------+         |
|         |       Imagen 3          |         |
|         +-------------------------+         |
|                                             |
|               v Scroll para ver mas         |
+---------------------------------------------+
```

### Carrusel Mobile (Sticky)
```
+---------------+
|               |  <- Imagen fija
|   Imagen 1    |    arriba mientras
|               |    se scrollea
|   * o o o o   |  <- Indicadores overlay
+---------------+
| Titulo        |  <- Scrollea sobre
| $99.00        |    la imagen
| [Al Carrito]  |
+---------------+
```

## Estructura de Archivos

```
app/code/Rollpix/ProductGallery/
+-- registration.php
+-- composer.json
+-- README.md
+-- README_ES.md
+-- LICENSE
+-- etc/
|   +-- module.xml
|   +-- config.xml
|   +-- acl.xml
|   +-- di.xml
|   +-- frontend/
|   |   +-- di.xml
|   |   +-- events.xml
|   +-- adminhtml/
|       +-- system.xml
+-- Block/
|   +-- Adminhtml/System/Config/
|       +-- ModuleInfo.php
+-- Model/
|   +-- Config.php
|   +-- VideoUrlParser.php
|   +-- ProductVideoDataLoader.php
|   +-- Config/Source/
|       +-- LayoutType.php
|       +-- ColumnRatio.php
|       +-- GridRatio.php
|       +-- GridImageColumns.php
|       +-- GalleryPosition.php
|       +-- ImageGap.php
|       +-- ZoomType.php
|       +-- ZoomLevel.php
|       +-- ZoomPosition.php
|       +-- StickyMode.php
|       +-- MobileBehavior.php
|       +-- SliderDirection.php
|       +-- SliderTransition.php
|       +-- ThumbnailPosition.php
|       +-- ThumbnailStyle.php
|       +-- ThumbnailShape.php
|       +-- FocusStyle.php
|       +-- VideoObjectFit.php
|       +-- ListingPlayerSize.php
+-- Observer/
|   +-- AddVideoDataToCollection.php
+-- Plugin/Catalog/Block/Product/
|   +-- ImagePlugin.php
|   +-- ImageFactoryPlugin.php
+-- ViewModel/
|   +-- GalleryConfig.php
|   +-- ListingVideoConfig.php
+-- view/
    +-- frontend/
        +-- layout/
        |   +-- catalog_product_view.xml
        |   +-- catalog_category_view.xml
        |   +-- catalogsearch_result_index.xml
        |   +-- default.xml
        +-- templates/
        |   +-- product/view/
        |   |   +-- gallery-vertical.phtml
        |   +-- product/listing/
        |       +-- video-init.phtml
        |       +-- effects-init.phtml
        +-- requirejs-config.js
        +-- web/
            +-- css/
            |   +-- gallery-vertical.css
            |   +-- gallery-listing.css
            +-- js/
                +-- gallery-zoom.js
                +-- gallery-carousel.js
                +-- gallery-sticky.js
                +-- gallery-slider.js
                +-- gallery-tabs.js
                +-- gallery-effects.js
                +-- gallery-thumbnails.js
                +-- gallery-modal-zoom.js
                +-- gallery-video.js
                +-- gallery-listing-video.js
                +-- gallery-listing-effects.js
```

## Personalizacion

### Variables CSS

El modulo usa propiedades CSS personalizadas que pueden sobreescribirse:

```css
.rp-product-wrapper {
    --rp-col-1: 1fr;           /* Ancho primera columna */
    --rp-col-2: 1fr;           /* Ancho segunda columna */
    --rp-gallery-order: 1;     /* Orden de la galeria (1 o 2) */
    --rp-info-order: 2;        /* Orden del panel de info (1 o 2) */
    --rp-sticky-offset: 20px;  /* Offset superior sticky */
    --rp-image-gap: 20px;      /* Espacio entre imagenes */
    --rp-grid-cols: 2;         /* Layout grilla: columnas de imagen */
}
```

### Compatibilidad con Temas

Si tu tema usa selectores diferentes, puede ser necesario ajustar el CSS. El modulo apunta a:

- `.catalog-product-view` - Clase body de la pagina de producto
- `.column.main` - Area de contenido principal
- `.product-info-main` - Contenedor de info del producto

### Extender el Modulo

Para agregar funcionalidad personalizada:

1. **Sobreescribir el template**: Copiar `gallery-vertical.phtml` a tu tema
2. **Agregar CSS personalizado**: Crear un archivo `_extend.less` en tu tema
3. **Modificar comportamiento JS**: Crear un mixin para los componentes JS

## Solucion de Problemas

### El zoom no funciona

1. Abrir DevTools del navegador (F12) y revisar la Consola por errores
2. Verificar que el modulo esta generando: "Rollpix Gallery Zoom initialized"
3. Limpiar todas las caches:
```bash
rm -rf pub/static/frontend/*
rm -rf var/view_preprocessed/*
bin/magento setup:static-content:deploy -f
bin/magento cache:flush
```

### Problemas de layout con tema personalizado

1. Verificar que tu tema extiende Luma
2. Revisar si tu tema sobreescribe `catalog_product_view.xml`
3. Asegurar que el contenedor `.product-info-main` existe

### Sticky no funciona

1. Verificar que el contenedor padre tiene altura suficiente
2. Revisar si otra regla CSS sobreescribe `position: sticky`
3. Asegurar que no hay `overflow: hidden` en elementos padre

### Las imagenes no cargan

1. Verificar que el producto tiene imagenes asignadas
2. Verificar que las URLs de las imagenes son accesibles
3. Revisar la consola del navegador por errores 404

## Soporte de Navegadores

- Chrome (ultima version)
- Firefox (ultima version)
- Safari (ultima version)
- Edge (ultima version)
- Mobile Safari (iOS 12+)
- Chrome para Android

## Contribuir

Las contribuciones son bienvenidas. Seguir estos pasos:

1. Fork del repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commitear los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

### Estandares de Codigo

- Seguir los [Estandares de Codigo de Magento 2](https://developer.adobe.com/commerce/php/coding-standards/)
- Usar PSR-12 para codigo PHP
- Documentar todos los metodos publicos

## Roadmap

- [ ] Configuracion admin para habilitar/deshabilitar por categoria
- [ ] Integracion con PageBuilder

## Changelog

### 1.7.2 (2026-03-02)
- **Soporte de video en paginas de producto (PDP)**: HTML5 `<video>` inline para MP4 locales; YouTube y Vimeo embebidos con facade de miniatura, iframe lazy-loaded e IntersectionObserver play/pause via postMessage
- **Soporte de video en listings de categoria**: Reemplazar imagen del producto con video MP4, YouTube o Vimeo en paginas de categoria y busqueda. Proveedor auto-detectado desde la galeria de medios de Magento
- **Config Tamaño del Reproductor (PDP)**: Proporcion de video 16:9 o coincidir dimensiones de la imagen del producto (lee tamano de pixel real desde disco)
- **Config Tamaño del Reproductor (Listing)**: Coincidir el contenedor de imagen de Magento (preserva layout) o proporcion 16:9 independiente
- **Config Ajuste de Video**: Cover (recortar para rellenar) o Contain (letterbox) para PDP y listing
- **Boton Play/Stop**: Control opcional overlay de reproduccion/pausa para videos en listing
- **Shimmer para todas las imagenes del listing**: Placeholder animado de carga para todas las imagenes en listing/busqueda (no solo videos)
- **Carga batch de video**: Observer pre-carga datos de video para toda la coleccion en una query DB por pagina
- Nuevos archivos: `Model/VideoUrlParser.php`, `Model/ProductVideoDataLoader.php`, `Observer/AddVideoDataToCollection.php`, `Plugin/.../ImagePlugin.php`, `Plugin/.../ImageFactoryPlugin.php`, `ViewModel/ListingVideoConfig.php`, `gallery-video.js`, `gallery-listing-video.js`, `gallery-listing-effects.js`, `gallery-listing.css`

### 1.5.0 (2026-02-15)
- **Zoom Modal**: Nuevo tipo de zoom que abre un overlay a pantalla completa con todas las imagenes del producto apiladas verticalmente; al clickear la imagen N se scrollea el modal hasta esa imagen. Indicador de scroll con animacion bounce, se oculta tras 3 segundos o al primer scroll. Cerrar con boton X, click en overlay o tecla Escape
- **Efecto Foco por Scroll**: Nuevo efecto para layouts stack (Vertical, Grilla, Fashion) que destaca la imagen mas cercana al centro del viewport mientras aplica fade y/o blur a las imagenes que se alejan. Opciones: Fade, Blur, Ambos o Deshabilitado. Incluye zona muerta para la imagen centrada y manejo inteligente de imagenes altas/verticales que abarcan todo el viewport
- **Highlight deslizante de miniaturas**: Indicador animado de borde que se desliza entre miniaturas al cambiar (transicion estilo Fotorama)
- **Opcion de forma de miniatura**: Nueva configuracion admin para preservar la proporcion de la imagen en las miniaturas en lugar de forzar recorte cuadrado
- **Flechas/dots condicionales del slider**: Las flechas y dots ya no se renderizan en el HTML cuando estan deshabilitados en admin (corrige problema de override CSS !important)
- Fix conflicto shimmer + fade-in: mutuamente excluyentes en template y JS (shimmer tiene prioridad)
- Fix shimmer que no resuelve: deteccion robusta de carga de imagen con fallback JS (4s) y fallback CSS (5s)
- Aumento de contraste en animacion shimmer para mejor visibilidad
- Fix strips de miniaturas overlay superpuestas con flechas de navegacion del slider
- Layout Fashion: la ultima imagen huerfana ya no se fuerza a ancho completo

### 1.4.0 (2026-02-14)
- **Layout Slider**: Nuevo layout de una imagen a la vez con transiciones configurables (fade, slide, zoom-fade), direccion (horizontal, vertical), flechas de navegacion, indicadores de puntos, soporte de teclado y rueda del mouse
- **Navegacion por miniaturas** (layout slider): Strip de miniaturas en posicion izquierda, derecha o inferior con destacado de estado activo
- **Modo overlay de miniaturas**: Miniaturas y dots flotan dentro de la imagen con fondo blur en lugar de ocupar espacio al lado
- **Efecto de carga shimmer**: Placeholder animado mientras cargan las imagenes, fade-in suave al completar
- **Fade-in al scrollear**: Animacion sutil de opacidad + deslizamiento al entrar al viewport
- **Contador de imagenes**: Indicador de posicion fijo mostrando conteo actual/total (layout slider)
- Resets comprehensivos de botones Luma en flechas del slider, dots y botones de miniaturas
- Reemplazo de layout masonry por layout slider
- Shimmer/fade-in condicional: fade-in deshabilitado cuando shimmer esta activo
- Resets de estilos hover/focus en boton "Leer mas" del accordion

### 1.3.1 (2026-02-13)
- Opciones de ratio grilla/fashion expandidas: de 20/80 a 80/20 (13 opciones en incrementos de 5%)
- Parseo dinamico de ratio en ViewModel (soporta cualquier valor de ratio)
- Panel de info del modulo en config admin: branding ROLLPIX, enlace al repo GitHub, version dinamica desde composer.json
- Fix bloque ModuleInfo: usar `Template\Context` en lugar de `Block\Context`
- Fix registration.php: usar constante `ComponentRegistrar::MODULE`
- Fix estilos de boton accordion: reset comprehensivo Luma/Hyva para todos los estados
- Ocultar accordion en mobile, restaurar tabs originales de Magento
- Fix colapso de layout mobile: eliminar efectos extra de hover/focus
- Fix espaciado de carrusel mobile: reducir espacio entre imagen e info del producto

### 1.3.0 (2026-02-13)
- Tabs accordion inline: mover tabs de detalle del producto (Descripcion, Info Adicional, Opiniones) dentro de la columna de info como secciones accordion colapsables (configurable)
- Truncado de descripcion con gradiente y enlace "Leer mas" (altura maxima configurable)
- Layout Fashion: nuevo patron alternado 1-2 imagenes (1 ancho completo, 2 mitad, repetir)

### 1.2.4 (2026-02-07)
- Fix Hyva: forzar layout de columna unica en `<section>` interna de product-info (Hyva envuelve info del producto en una seccion grid de Tailwind)

### 1.2.3 (2026-02-07)
- Forzar layout de 1 columna en pagina de producto para compatibilidad con Hyva
- Forzar display grid y ancho completo en todos los hijos directos del wrapper
- Overrides de ancho Hyva/Tailwind con !important en hijos del wrapper

### 1.2.2 (2026-02-07)
- Fix compatibilidad con tema Hyva: columna de info del producto ahora llena el ancho completo del grid
- Reset de restricciones de ancho Tailwind/Hyva en product-info-main y columnas de galeria

### 1.2.1 (2026-02-06)
- Soporte para PHP 8.4

### 1.2.0 (2026-02-06)
- Carrusel mobile: imagen sticky arriba mientras se scrollea (info scrollea sobre la imagen)
- Carrusel mobile: indicadores de puntos overlay sobre la imagen
- Carrusel mobile: altura dinamica del wrapper por slide (elimina espacio en blanco)
- Mobile: fixes de overflow para todos los ancestros del wrapper de Magento para soportar sticky
- Mobile: prefijo `-webkit-sticky` para soporte iOS Safari

### 1.1.0 (2026-02-05)
- Layout grilla: grilla de imagenes multi-columna con sidebar de info
- Ratios configurables de grilla: 70/30, 75/25, 80/20
- Columnas de imagen configurables en grilla: 2 o 3
- Modo zoom click: click para hacer zoom in-situ, click de nuevo para resetear
- Modos de panel sticky: Frame (scrolleable) y Scroll Natural (fijo arriba)
- Nivel de zoom extendido a 10x
- Resultado de zoom usa posicionamiento fijo del viewport (sigue al cursor)
- Grupos de config admin reordenados: Layout, Zoom, Sticky, Mobile

### 1.0.0 (2025-01-26)
- Version inicial
- Layout de galeria vertical
- Funcionalidad de zoom hover
- Soporte lightbox (GLightbox)
- Carrusel mobile
- Panel sticky de info del producto
- Configuracion admin completa

## Licencia

Este proyecto esta licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para mas detalles.

## Creditos

- [GLightbox](https://biati-digital.github.io/glightbox/) - Libreria lightbox liviana
- Inspirado en paginas de producto editoriales de sitios e-commerce de moda lideres

## Soporte

- **Issues**: [GitHub Issues](https://github.com/rollpix/magento2-product-gallery/issues)
- **Documentacion**: [Wiki](https://github.com/rollpix/magento2-product-gallery/wiki)

---

Hecho con ❤️ por [Rollpix](https://rollpix.com)
