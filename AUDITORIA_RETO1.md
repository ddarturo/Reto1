# Auditoría de accesibilidad, UX, responsive y funcionalidad

**Proyecto:** FerroCasa — Reto 1
**Repositorio:** [ddarturo/Reto1](https://github.com/ddarturo/Reto1)
**Fecha:** 2026-10-07
**Alcance:** revisión estática de `index.html`, `assets/styles.css`, los archivos de `js/`, `data/productos.json` y `README.md`.
**Método:** inspección del código y comprobación sintáctica de `js/main.js` con `node --check`. No se ejecutó la aplicación en un navegador ni se probaron tecnologías de asistencia o viewports reales. No se modificaron los archivos auditados; este informe es el único archivo de auditoría.

## 1. Resumen ejecutivo

El sitio tiene una base razonable: declara el idioma español, usa elementos semánticos, presenta un catálogo desde JSON, incorpora controles de Bootstrap para el menú, el modal y el carrito lateral, y define un indicador de foco visible. El formulario enlaza campos con sus mensajes y utiliza validaciones JavaScript.

La inspección encontró riesgos y faltantes que conviene atender antes de considerar el flujo robusto: datos del carrito persistidos se insertan mediante `innerHTML`; un JSON corrupto en `localStorage` puede detener el script; el campo pierde su estado de error al empezar a editarlo aunque siga inválido; el botón de pago no tiene comportamiento asociado; y el primer agregado no verifica el stock.

No se puede afirmar que el diseño pase WCAG 2.2 AA ni que sea visualmente correcto en todos los dispositivos sin pruebas de navegador, teclado, contraste y lector de pantalla.

## 2. Hallazgos por severidad

### Críticos

- **Ninguno identificado en esta revisión estática.** Esto no equivale a una certificación de seguridad o accesibilidad; no se ejecutaron pruebas dinámicas.

### Altos

- **Ninguno confirmado como alto con la evidencia disponible.** El riesgo de inyección DOM descrito abajo requiere que el contenido almacenado o el catálogo haya sido manipulado, por lo que se registra como hallazgo medio y condicional.

### Medios

#### M-01. Datos persistidos y del catálogo se interpolan como HTML

- **Criterio relacionado:** manejo seguro de datos no confiables y prevención de inyección DOM.
- **Estado:** riesgo condicional confirmado por inspección estática; no se ejecutó un exploit.
- **Evidencia:** el carrito se recupera desde `localStorage` con `JSON.parse` en [js/main.js](js/main.js#L13-L15) y sus campos `image` y `name` se interpolan en una plantilla asignada a `innerHTML` en [js/main.js](js/main.js#L379-L398). Los datos del catálogo también se interpolan al construir las tarjetas en [js/main.js](js/main.js#L299-L323). La misma lógica de renderizado está presente en [js/view.js](js/view.js#L22-L48) y [js/view.js](js/view.js#L102-L126).
- **Impacto:** si el contenido persistido o la fuente de productos se modifica para incluir marcado, puede crearse contenido HTML inesperado; dependiendo del campo y del payload, existe riesgo de ejecución de código en el origen del sitio.
- **Corrección recomendada:** construir el DOM con `createElement` y asignar contenido textual mediante `textContent`; validar URLs de imágenes con protocolos permitidos; validar la forma de cada producto y del carrito antes de renderizar. No confiar en que `localStorage` o IndexedDB sean datos confiables.

#### M-02. Datos corruptos en `localStorage` pueden detener toda la aplicación

- **Criterio relacionado:** robustez y recuperación ante errores de almacenamiento.
- **Estado:** confirmado por flujo del código; no se probó en navegador.
- **Evidencia:** `getCart()` ejecuta `JSON.parse` sin `try/catch` ni comprobación de tipo en [js/main.js](js/main.js#L13-L16). La instancia del carrito llama a `storage.getCart()` durante su construcción en [js/main.js](js/main.js#L202-L205), antes de que el manejador `DOMContentLoaded` proteja otras operaciones.
- **Impacto:** un valor malformado en `ferrocasa_cart` provoca una excepción al cargar el script y puede impedir inicializar la interfaz, el formulario y el catálogo.
- **Corrección recomendada:** tratar errores de parseo explícitamente, validar que el resultado tenga la estructura esperada y recuperar un carrito vacío de forma visible y registrada. Manejar también fallos de acceso a `localStorage`.

#### M-03. La validación visual y ARIA se limpia antes de que el valor sea válido

- **Criterio relacionado:** WCAG 2.2, 3.3.1 Error Identification y 4.1.3 Status Messages; consistencia de formulario.
- **Estado:** comportamiento incorrecto confirmado por inspección estática; no se probó con lector de pantalla.
- **Evidencia:** después de un envío inválido se añade `is-invalid` y `aria-invalid="true"` en [js/main.js](js/main.js#L501-L515). En cuanto el usuario escribe, el controlador elimina `is-invalid` y cambia `aria-invalid` a `false`, sin volver a validar el nuevo valor, en [js/main.js](js/main.js#L533-L537).
- **Impacto:** un campo todavía inválido deja de mostrarse y anunciarse como error. La persona puede creer que ya corrigió el problema aunque el envío vuelva a fallar.
- **Corrección recomendada:** al editar, volver a validar el campo o conservar el estado hasta que su valor sea válido; mantener sincronizados el estilo visual, `aria-invalid` y el mensaje asociado.

#### M-04. La operación «Proceder al pago» no tiene acción implementada

- **Criterio relacionado:** expectativa funcional y prevención de callejones sin salida en UX.
- **Estado:** no se encontró manejador para el botón en el JavaScript cargado por la página.
- **Evidencia:** el botón aparece en [index.html](index.html#L173) y `renderCart` únicamente alterna su estado `disabled` según haya artículos en [js/main.js](js/main.js#L349-L374). No se observa un listener de pago en el punto de entrada [index.html](index.html#L178-L180).
- **Impacto:** el usuario puede llenar el carrito y activar un botón que no continúa el proceso.
- **Corrección recomendada:** implementar un flujo de confirmación o pago de demostración claramente identificado; si no forma parte del alcance, cambiar el texto o dejarlo deshabilitado con una explicación accesible.

#### M-05. El primer agregado de un producto no comprueba el stock

- **Criterio relacionado:** consistencia del inventario y prevención de acciones inválidas.
- **Estado:** confirmado por inspección estática.
- **Evidencia:** el método `add()` solo compara con `product.stock` cuando el producto ya existe; de lo contrario siempre agrega cantidad uno en [js/main.js](js/main.js#L224-L239). El control de stock de `updateQuantity()` no corrige el primer agregado.
- **Impacto:** un producto con stock cero puede entrar al carrito y habilitar el botón de pago.
- **Corrección recomendada:** validar stock disponible antes de añadir y comunicar claramente el resultado al usuario.

#### M-06. No hay enlace de salto al contenido principal

- **Criterio relacionado:** WCAG 2.2, 2.4.1 Bypass Blocks, nivel A.
- **Estado:** ausencia observable en el marcado inspeccionado.
- **Evidencia:** el `body` comienza con el encabezado del sitio en [index.html](index.html#L15-L16), y no se encuentra un enlace de salto antes de la navegación. El `main` usa `id="inicio"` en [index.html](index.html#L48).
- **Impacto:** quienes navegan repetidamente con teclado o lector de pantalla deben recorrer el encabezado antes de llegar al contenido.
- **Corrección recomendada:** añadir como primer elemento interactivo un enlace «Saltar al contenido», dirigido al `main`, y hacerlo visible al recibir foco.

### Bajos

#### B-01. Jerarquía de encabezados mejorable en el modal

- **Criterio relacionado:** navegación estructural con tecnologías de asistencia.
- **Estado:** mejora recomendada.
- **Evidencia:** las secciones principales usan `h1` y `h2`; el título del modal de ubicación está marcado como `h5` en [index.html](index.html#L111-L115).
- **Impacto:** la navegación por encabezados puede presentar un salto de nivel difícil de interpretar.
- **Corrección recomendada:** elegir el nivel adecuado al contexto del diálogo y conservar la apariencia mediante clases CSS, no mediante un nivel de encabezado arbitrario.

#### B-02. El número del carrito no tiene anuncio dinámico explícito

- **Criterio relacionado:** WCAG 2.2, 4.1.3 Status Messages.
- **Estado:** mejora a verificar con lector de pantalla.
- **Evidencia:** el contador se actualiza cambiando `textContent` en [js/main.js](js/main.js#L351-L353), pero el elemento `cartCount` no tiene `aria-live` en [index.html](index.html#L38-L39). La cantidad dentro de cada fila sí usa `aria-live="polite"` en [js/main.js](js/main.js#L386).
- **Impacto:** el cambio del total de artículos podría no anunciarse sin mover el foco.
- **Corrección recomendada:** proporcionar una región de estado breve y no intrusiva para confirmar cambios del carrito; verificar que no produzca anuncios repetidos o excesivos.

#### B-03. No se declara una preferencia de movimiento reducido

- **Criterio relacionado:** WCAG 2.2, 2.3.3 Animation from Interactions (AAA) y buena práctica UX.
- **Estado:** mejora recomendada; no se establece aquí un incumplimiento AA.
- **Evidencia:** la hoja usa desplazamiento suave y transiciones, por ejemplo en [assets/styles.css](assets/styles.css#L14) y [assets/styles.css](assets/styles.css#L66-L67), sin una regla `prefers-reduced-motion` en la hoja inspeccionada.
- **Corrección recomendada:** reducir o desactivar desplazamientos y transiciones no esenciales cuando el sistema indique `prefers-reduced-motion: reduce`.

#### B-04. La estructura modular descrita no coincide con el punto de entrada activo

- **Criterio relacionado:** mantenibilidad y claridad del proyecto.
- **Estado:** diferencia confirmada entre documentación y HTML.
- **Evidencia:** el README describe `app.js`, `repo.js`, `view.js` y `cart.js` como módulos en [README.md](README.md#L15-L18). Sin embargo, la página solo carga `js/main.js` al final de [index.html](index.html#L178-L180). Los otros archivos existen, pero no son importados por esa página.
- **Impacto:** puede resultar confuso saber qué lógica está activa y se mantiene; los cambios en módulos no cargados no necesariamente afectan al sitio.
- **Corrección recomendada:** elegir una arquitectura única: cargar módulos ES con `type="module"` y organizar imports, o documentar que `main.js` es la implementación activa.

#### B-05. La cookie de demostración se guarda, pero no se utiliza

- **Criterio relacionado:** claridad del propósito de persistencia y minimización de datos.
- **Estado:** confirmado por inspección estática.
- **Evidencia:** se establece `ferrocasa_visited` en [js/main.js](js/main.js#L452-L456); la función `getCookie()` está definida en el código de persistencia, pero no se encontró una lectura de esa cookie en el punto de entrada.
- **Impacto:** la cookie no modifica la experiencia y puede dar la impresión de persistencia funcional cuando solo se escribe como demostración.
- **Corrección recomendada:** usarla para un propósito explícito o retirar la escritura y documentar su carácter demostrativo.

#### B-06. Contraste, objetivos táctiles y reflow requieren medición real

- **Criterio relacionado:** WCAG 2.2, 1.4.3 Contrast (Minimum), 1.4.10 Reflow y 2.5.8 Target Size (Minimum).
- **Estado:** no determinado con esta revisión; no se deben declarar conformes ni fallidos sin medición.
- **Evidencia:** existen colores de texto y superficies definidos en [assets/styles.css](assets/styles.css#L1-L10), un foco visible en [assets/styles.css](assets/styles.css#L19), dos media queries propias en [assets/styles.css](assets/styles.css#L157-L158), y controles pequeños para cantidades en [assets/styles.css](assets/styles.css#L147). Bootstrap aporta puntos de quiebre adicionales.
- **Impacto:** el código por sí solo no confirma las relaciones de contraste finales, el tamaño táctil efectivo ni la ausencia de overflow a anchos extremos.
- **Corrección recomendada:** medir los pares de color y probar la interfaz con viewport estrecho, zoom y dispositivos táctiles; ajustar dimensiones/espaciado donde las mediciones lo requieran.

## 3. Aspectos que cumplen o tienen una base útil

### Estructura e idioma

- `lang="es"`, metadatos, viewport y título están declarados en [index.html](index.html#L1-L10).
- Se identifican `header`, `nav`, `main`, `section` y `footer`; el contenido principal tiene un `h1` y los apartados principales `h2` en [index.html](index.html#L16-L100).
- El catálogo se renderiza usando elementos `article` en [js/main.js](js/main.js#L299-L323).

### Formularios y mensajes

- Los campos tienen etiquetas asociadas mediante `for`/`id`, `required`, mensajes vinculados con `aria-describedby` y una región `aria-live` en [index.html](index.html#L78-L87).
- El JavaScript declara patrones de validación y actualiza `aria-invalid` durante el envío en [js/main.js](js/main.js#L491-L520). La mejora M-03 describe la inconsistencia al editar.

### Foco, teclado y componentes

- CSS define un contorno visible para botones, enlaces e inputs con `:focus-visible` en [assets/styles.css](assets/styles.css#L19).
- El menú móvil, modal de ubicación y carrito lateral usan botones nativos y atributos de control/etiquetado de Bootstrap en [index.html](index.html#L25-L40), [index.html](index.html#L111-L154).
- Bootstrap aporta comportamiento de teclado a sus componentes cuando se carga correctamente; no se verificó aquí el flujo completo con teclado.

### Catálogo y persistencia

- El catálogo se solicita desde `data/productos.json` y se intenta guardar en IndexedDB en [js/main.js](js/main.js#L120-L130).
- El carrito y la ubicación usan `localStorage`; el pie de página usa `sessionStorage`; también existe caché IndexedDB y escritura de cookie en [js/main.js](js/main.js#L8-L45), [js/main.js](js/main.js#L448-L456).
- Hay una ruta de recuperación con datos de respaldo cuando falla la descarga o la caché, en [js/main.js](js/main.js#L131-L190).

### Prueba realizada

- `node --check js/main.js`: **correcto**. Esta comprobación solo valida sintaxis JavaScript; no prueba la ejecución en navegador ni los comportamientos de interfaz.

## 4. Pruebas que faltan para cerrar la auditoría

1. Ejecutar la página mediante un servidor HTTP y revisar la consola del navegador.
2. Probar flujos de catálogo, carrito, formulario, modal y offcanvas con ratón y teclado.
3. Probar un carrito válido, vacío, manipulado y con JSON corrupto en `localStorage`.
4. Probar productos con stock cero y con stock agotado.
5. Medir contraste con los colores finales y revisar foco en todos los fondos.
6. Verificar lectores de pantalla para errores de formulario y cambios del contador del carrito.
7. Medir reflow/overflow en anchos estrechos, resolución móvil y zoom al 200–400%.
8. Revisar objetivos táctiles, `prefers-reduced-motion` y comportamiento al abrir/cerrar modal y offcanvas.
9. Validar el HTML y el JSON con herramientas apropiadas.

## 5. Recomendaciones priorizadas

1. Sustituir la interpolación insegura de datos por construcción DOM segura y validar los datos persistidos.
2. Manejar errores de parseo y acceso al almacenamiento para evitar que falle toda la página.
3. Corregir el estado de validación mientras el usuario edita el formulario.
4. Implementar el comportamiento de pago o indicar que es una demostración.
5. Comprobar stock antes del primer agregado y comunicar el resultado.
6. Añadir un enlace de salto al contenido y completar pruebas de accesibilidad.
7. Alinear el punto de entrada JavaScript con la documentación y revisar preferencias de movimiento reducido.
8. Medir contraste, objetivos táctiles y reflow en navegador antes de afirmar cumplimiento WCAG.

## Conclusión

El proyecto incluye varias buenas bases de semántica, interacción y persistencia. La revisión estática también detecta riesgos concretos de robustez y manejo de datos, además de controles cuya acción no está implementada. La conformidad visual y WCAG queda pendiente de pruebas reales; este informe no presenta como realizadas verificaciones que no se ejecutaron.
