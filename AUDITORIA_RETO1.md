# Auditoría de accesibilidad, UX, responsive y funcionalidad

**Proyecto:** FerroCasa — Reto 1
**Repositorio:** [ddarturo/Reto1](https://github.com/ddarturo/Reto1)
**Fecha:** 2026-10-07
**Alcance:** revisión estática de `index.html`, `assets/styles.css`, archivos JavaScript, `data/productos.json` y `README.md`.
**Método:** inspección de código y comprobación sintáctica de `js/main.js` con `node --check`. No se ejecutó la aplicación en un navegador ni se probaron tecnologías de asistencia o viewports reales. No se modificaron los archivos auditados; este informe es el único archivo nuevo.

## 1. Resumen ejecutivo

El sitio tiene una base funcional: declara el idioma español, usa elementos semánticos, carga un catálogo desde JSON, incorpora controles Bootstrap para el menú, el modal y el carrito lateral, y define un indicador de foco visible. El formulario enlaza los campos con sus mensajes y utiliza validaciones JavaScript.

La revisión encontró riesgos y faltantes que conviene corregir: datos del carrito persistidos se interpolan en `innerHTML`; un JSON corrupto en `localStorage` puede detener el script; los errores de formulario se limpian antes de comprobar que el valor sea válido; el botón de pago no tiene una acción asociada; y el primer agregado de un producto no verifica el stock.

La revisión fue estática: no permite afirmar que el diseño cumpla WCAG 2.2 AA ni que funcione correctamente en todos los dispositivos. Para ello hacen falta pruebas de navegador, teclado, contraste, lector de pantalla y distintos tamaños de pantalla.

## 2. Hallazgos por severidad

### Críticos

- No se identificaron hallazgos críticos en la revisión estática. Esto no equivale a una certificación de seguridad o accesibilidad.

### Altos

- No se confirmó un hallazgo alto con la evidencia disponible. El riesgo de inyección DOM se clasifica como medio y condicional, ya que requiere contenido manipulado en el almacenamiento o en la fuente de datos.

### Medios

- **M-01.** Inserción de datos persistidos y del catálogo mediante `innerHTML`.
- **M-02.** Datos corruptos en `localStorage` pueden interrumpir la inicialización de la aplicación.
- **M-03.** La validación visual y ARIA se quita al editar un campo, aunque su valor todavía pueda ser inválido.
- **M-04.** El botón «Proceder al pago» no tiene una acción implementada.
- **M-05.** El primer agregado de un producto no comprueba el stock.
- **M-06.** Falta un enlace para saltar directamente al contenido principal.

### Bajos

- **B-01.** El encabezado del modal produce un salto en la jerarquía de encabezados.
- **B-02.** El contador del carrito no declara una región de estado dinámica.
- **B-03.** No se contempla la preferencia `prefers-reduced-motion`.
- **B-04.** La estructura JavaScript del README no coincide con el punto de entrada que carga la página.
- **B-05.** Se escribe una cookie demostrativa, pero no se usa para recuperar una preferencia.
- **B-06.** Contraste, objetivos táctiles y reflow requieren mediciones y pruebas en navegador; no se pueden declarar conformes o fallidos solo con esta inspección.

## 3. Evidencia concreta: archivo y elemento afectado

### Hallazgos medios

#### M-01. Datos insertados como HTML

- El carrito se recupera sin validar desde `localStorage` en [js/main.js](js/main.js#L13-L16).
- Los campos del carrito, incluidos nombre e imagen, se insertan en una plantilla `innerHTML` en [js/main.js](js/main.js#L379-L398).
- Los datos del catálogo se interpolan en la tarjeta en [js/main.js](js/main.js#L299-L323).
- La misma lógica aparece en [js/view.js](js/view.js#L22-L48) y [js/view.js](js/view.js#L102-L126).

#### M-02. Parseo no protegido del carrito

- `getCart()` ejecuta `JSON.parse` sin manejo de error ni verificación de tipo en [js/main.js](js/main.js#L13-L16).
- El constructor de `ShoppingCart` llama a `storage.getCart()` durante la carga del script en [js/main.js](js/main.js#L202-L205).

#### M-03. Estado de error del formulario

- El envío agrega `is-invalid` y `aria-invalid="true"` cuando el valor no cumple el patrón en [js/main.js](js/main.js#L501-L515).
- El evento `input` quita el estado inválido y cambia `aria-invalid` a `false` sin comprobar el nuevo valor en [js/main.js](js/main.js#L533-L537).
- Los mensajes se enlazan con los inputs mediante `aria-describedby` y `aria-live` en [index.html](index.html#L78-L87).

#### M-04. Pago sin acción

- El botón está definido en [index.html](index.html#L173).
- `renderCart` únicamente habilita o deshabilita el botón según haya artículos en [js/main.js](js/main.js#L349-L374).
- La página carga `main.js` como script de entrada en [index.html](index.html#L178-L180); en ese archivo no se observa un manejador de pago.

#### M-05. Validación de stock

- `add()` comprueba stock solo cuando el producto ya está en el carrito; en el caso nuevo agrega cantidad uno sin comprobar el stock en [js/main.js](js/main.js#L224-L239).
- La actualización posterior limita la cantidad en [js/main.js](js/main.js#L250-L264), pero esto no evita el primer agregado sin stock.

#### M-06. Salto al contenido

- El `body` inicia con el encabezado y no incluye un enlace de salto antes de la navegación en [index.html](index.html#L15-L16).
- El contenido principal está marcado con `main id="inicio"` en [index.html](index.html#L48).

### Hallazgos bajos

#### B-01. Jerarquía del modal

- El título del modal de ubicación está marcado como `h5` en [index.html](index.html#L111-L115), mientras las secciones principales tienen encabezados `h1` y `h2`.

#### B-02. Anuncio del contador

- El contador se actualiza mediante `textContent` en [js/main.js](js/main.js#L351-L353).
- El elemento `cartCount` no declara `aria-live` en [index.html](index.html#L38-L39); la cantidad individual sí tiene `aria-live` en [js/main.js](js/main.js#L386).

#### B-03. Movimiento reducido

- Hay desplazamiento suave en [assets/styles.css](assets/styles.css#L14) y transición de tarjetas en [assets/styles.css](assets/styles.css#L66-L67).
- No se encontró una regla `prefers-reduced-motion` en la hoja de estilos.

#### B-04. Documentación y punto de entrada

- El README presenta `app.js`, `repo.js`, `view.js` y `cart.js` como módulos del proyecto en [README.md](README.md#L15-L18).
- La página carga `js/main.js` en [index.html](index.html#L178-L180); los otros archivos no se importan desde ese HTML.

#### B-05. Cookie demostrativa

- Se establece `ferrocasa_visited` en [js/main.js](js/main.js#L452-L456).
- La cookie no se consulta para recuperar o aplicar una preferencia en el punto de entrada.

#### B-06. Responsive, contraste y objetivos táctiles

- Los colores principales están definidos en [assets/styles.css](assets/styles.css#L1-L10), el foco visible en [assets/styles.css](assets/styles.css#L19), los botones de cantidad en [assets/styles.css](assets/styles.css#L147) y los breakpoints CSS propios en [assets/styles.css](assets/styles.css#L157-L158).
- No se ejecutaron mediciones de contraste, reflow ni tamaño táctil. Bootstrap aporta además sus propios breakpoints, por lo que una inspección de CSS aislada no demuestra el comportamiento final.

## 4. Recomendación de corrección para cada hallazgo

### Medios

- **M-01:** construir nodos con `createElement` y usar `textContent` para texto. Validar los productos y las URL de imágenes antes de renderizar; no tratar `localStorage` ni IndexedDB como fuentes confiables.
- **M-02:** capturar errores de parseo y validar la forma de los datos. Ante datos inválidos, recuperar un carrito vacío con notificación o registro claro. Manejar también errores al acceder al almacenamiento.
- **M-03:** al editar, volver a validar el campo o mantener el error hasta que el valor sea válido. Mantener sincronizados la clase visual, `aria-invalid` y el mensaje relacionado.
- **M-04:** implementar un flujo real o una confirmación de demostración claramente identificada. Si el pago queda fuera del alcance, deshabilitar el botón y explicar el motivo de forma accesible.
- **M-05:** comprobar existencia y stock antes de agregar el producto por primera vez; comunicar cuando no haya unidades disponibles.
- **M-06:** añadir como primer elemento interactivo un enlace «Saltar al contenido», apuntarlo al `main` y mostrarlo al recibir foco.

### Bajos

- **B-01:** elegir un nivel de encabezado acorde con la jerarquía del documento y ajustar su apariencia visual con CSS en lugar de usar un nivel semántico incorrecto.
- **B-02:** anunciar cambios importantes del carrito mediante una región de estado breve y no intrusiva; comprobar que no genere anuncios repetidos.
- **B-03:** añadir una regla `@media (prefers-reduced-motion: reduce)` que elimine o reduzca desplazamientos y transiciones no esenciales.
- **B-04:** elegir una estructura única: cargar módulos ES con `type="module"` e imports coherentes, o actualizar el README para describir `main.js` como punto de entrada real.
- **B-05:** usar la cookie para una preferencia explícita o eliminar la escritura y dejar claro que es solo una demostración.
- **B-06:** medir contrastes con una herramienta WCAG y probar tamaños táctiles, reflow y overflow en navegador; ajustar únicamente los elementos que fallen las pruebas.

## 5. Pruebas que deberían repetirse después de corregir

1. Ejecutar el sitio mediante un servidor HTTP y revisar la consola del navegador.
2. Validar el HTML y `data/productos.json` con herramientas apropiadas.
3. Probar catálogo, carrito, formulario, modal y offcanvas con ratón y teclado.
4. Probar el carrito vacío, con datos válidos, con datos manipulados y con JSON corrupto en `localStorage`.
5. Probar productos con stock cero, stock disponible y stock agotado.
6. Verificar que los errores del formulario sigan visibles y anunciados hasta que cada campo sea válido.
7. Probar el pago o la explicación de que es una demostración; confirmar que no existan botones sin respuesta.
8. Completar navegación de teclado con `Tab`, `Shift+Tab`, `Enter` y `Space`, y revisar el foco al abrir/cerrar modal y carrito.
9. Probar con lector de pantalla los nombres de controles, errores y cambios del contador.
10. Medir contraste y comprobar reflow/overflow en móvil estrecho, tamaños habituales y zoom al 200–400%.
11. Comprobar el tamaño y separación de objetivos táctiles en dispositivo o emulación móvil.
12. Activar `prefers-reduced-motion: reduce` y confirmar que se reduzcan las animaciones no esenciales.
13. Repetir `node --check js/main.js` y comprobar si la arquitectura documentada coincide con los scripts realmente cargados.

## 6. Conclusión

FerroCasa incluye bases útiles de HTML semántico, controles Bootstrap, validación de formulario y persistencia. La revisión detecta riesgos concretos de robustez al manejar datos guardados, inconsistencias en el estado de validación, falta de comportamiento de pago y validación incompleta de stock. También identifica mejoras accesibles y diferencias entre el README y el punto de entrada JavaScript.

Las correcciones recomendadas deben verificarse después con pruebas funcionales, de teclado, tecnologías de asistencia, contraste y distintos tamaños de pantalla. La comprobación de sintaxis de JavaScript pasó, pero no sustituye esas pruebas de ejecución.
