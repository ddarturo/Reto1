# Auditoría del proyecto FerroCasa — Reto 1

**Repositorio revisado:** [ddarturo/Reto1](https://github.com/ddarturo/Reto1)
**Alcance:** revisión estática de `index.html`, estilos, JavaScript, catálogo JSON y README. No se ejecutó la aplicación en un navegador ni se realizaron pruebas automatizadas.
## Resumen ejecutivo

El proyecto cuenta con una página semántica, diseño adaptable apoyado en Bootstrap, catálogo cargado desde JSON, carrito con cálculo de importes y uso de varios mecanismos de almacenamiento web. Sus principales oportunidades de mejora son la seguridad al insertar datos persistidos en el DOM, la validación de los datos guardados, algunas funciones de interfaz sin comportamiento y diferencias entre la modularidad que describe el README y la estructura ejecutada.

Para confirmar el diseño responsive, el contraste y la navegación accesible se necesitan pruebas en navegador, varios tamaños de pantalla y, de ser posible, tecnologías de asistencia.

## Hallazgos, soluciones y faltantes

### HTML5 semántico y estructura accesible

**Cumple:** utiliza `header`, `nav`, `main`, `section`, `article` y `footer`; la página tiene un encabezado principal y secciones identificables.

**Error o mejora:** el modal de ubicación utiliza un encabezado `h5` después de encabezados `h1` y `h2`, lo que hace menos coherente la jerarquía. Parte del HTML también contiene comentarios explicativos extensos y estilos en línea.

**Solución:** cambiar el título del modal a un nivel coherente con el documento (por ejemplo, `h2`, verificando que no duplique la jerarquía visual); mover los estilos en línea a CSS y conservar comentarios breves que aporten contexto.

**Falta:** comprobar el documento con un validador HTML y probar el orden de lectura con teclado/lector de pantalla.

### CSS adaptable

**Cumple:** utiliza clases responsive de Bootstrap, Flexbox/Grid y dos media queries propias; también incluye tamaños de texto adaptables.

**Error o mejora:** la hoja evidencia ajustes para tablet y móvil, pero la revisión estática no demuestra que el diseño funcione sin desbordamientos en todos los tamaños. No se puede confirmar una estrategia mobile-first completa.

**Solución:** probar al menos móvil estrecho, móvil ancho, tablet y escritorio; corregir desbordamientos y ajustar los puntos de quiebre en función del contenido real.

**Falta:** validación visual real en navegador y revisión de zoom/reflow al 200–400%.

### Componentes reutilizables y ARIA

**Cumple:** el catálogo y las filas del carrito se generan con plantillas; Bootstrap aporta componentes de menú, modal y offcanvas; hay atributos ARIA para controles y mensajes.

**Errores o mejoras:**
- El botón de favoritos se muestra, pero no tiene una acción implementada.
- Los botones de incremento/decremento tienen etiquetas accesibles genéricas, que no identifican el producto afectado.
- La implementación efectiva está concentrada en `main.js`, en lugar de los módulos separados que describe el README.

**Solución:** implementar el comportamiento de favoritos o retirar ese control; incluir el nombre del producto en las etiquetas accesibles; separar vista, lógica del carrito, persistencia e inicialización en módulos ES6 coherentes, si se desea mantener la arquitectura modular documentada.

**Falta:** probar todos los controles usando únicamente teclado y lector de pantalla.

### Validaciones con expresiones regulares

**Cumple:** el formulario valida nombre y correo con regex; los campos se enlazan a sus mensajes mediante `aria-describedby` y actualizan `aria-invalid`.

**Errores o mejoras:**
- La expresión del nombre acepta letras y espacios, pero excluye nombres válidos con guion o apóstrofe.
- La validación se ejecuta al enviar; al editar un campo, se limpia el estado de error sin volver a validar inmediatamente.
- El formulario muestra una alerta de éxito, pero no envía ni almacena un mensaje de contacto.

**Solución:** definir los formatos admitidos para nombres y correo; validar en el envío y volver a validar el campo cuando cambia; comunicar el resultado en una región accesible. Si el objetivo es recibir mensajes, integrar un servicio/backend; si es una demostración, indicar explícitamente que el envío es simulado.

**Falta:** pruebas con entradas válidas, inválidas, acentuadas y límites de formato.

### Datos estáticos JSON/XML

**Cumple:** el catálogo se obtiene desde `data/productos.json`; se intenta conservar en IndexedDB y hay datos de respaldo ante fallos.

**Errores o mejoras:**
- La respuesta JSON se utiliza sin comprobar que sea un arreglo con productos válidos.
- Los datos de respaldo duplican el catálogo y pueden quedar desactualizados.
- Abrir el sitio con `file://` puede impedir `fetch`; el respaldo evita una caída completa, pero no reemplaza una instrucción de ejecución clara.

**Solución:** validar tipos y campos del catálogo antes de renderizar; centralizar los datos de respaldo o reutilizar la fuente JSON; documentar la ejecución mediante un servidor HTTP local.

**Falta:** pruebas de JSON inválido, respuesta HTTP fallida, IndexedDB bloqueada y caché vacía.

### Carrito de compras

**Cumple:** agrega y elimina productos, permite cambiar cantidades, limita incrementos según stock en la actualización y recalcula contador, subtotal, IVA y total.

**Errores o mejoras:**
- Al agregar por primera vez un producto no se comprueba si su stock es cero.
- El botón «Proceder al pago» se habilita cuando el carrito tiene productos, pero no tiene una acción de pago implementada.
- El cálculo de impuestos usa una tasa fija del 15%; debería confirmarse que corresponde al alcance del reto/país.

**Solución:** rechazar productos sin stock y no superar el stock disponible; implementar un flujo de confirmación/simulación o deshabilitar y etiquetar el pago como no disponible; documentar la tasa de impuesto aplicada.

**Falta:** pruebas de stock cero, stock máximo, carrito vacío, eliminación, persistencia y redondeo de importes.

### Persistencia web

**Cumple:** `localStorage` se usa para el carrito y ubicación; `sessionStorage` guarda la fecha de sesión; IndexedDB mantiene una caché del catálogo; se crea una cookie de demostración.

**Errores o mejoras:**
- `JSON.parse` del carrito no está protegido ante datos corruptos o manipulados.
- La lectura/escritura de `localStorage` y `sessionStorage` no maneja todos los casos de almacenamiento bloqueado o cuota excedida.
- La cookie se guarda, pero no se lee ni afecta una preferencia; su persistencia integral no está demostrada.
- En el guardado de IndexedDB se llama a `clear()` y luego se insertan registros; conviene manejar también errores de la transacción y cierre de conexiones.

**Solución:** validar y sanear los datos restaurados; ante formato inválido, registrar el error y recuperar con un carrito vacío seguro, notificando al usuario si corresponde; gestionar fallos de almacenamiento; dar un propósito real a la cookie o describirla como demostrativa.

**Falta:** pruebas con almacenamiento deshabilitado, datos inválidos y navegación entre sesiones.

### Accesibilidad integral (POUR)

**Cumple:** existen etiquetas asociadas a campos, textos alternativos, foco visible en CSS, controles nativos y algunas regiones `aria-live`.

**Errores o mejoras:**
- La secuencia de encabezados del modal necesita revisión.
- No se ha medido el contraste de todos los estados y colores.
- El estado y nombre accesible de todos los controles dinámicos no se han verificado con tecnologías de asistencia.
- Los botones de incremento/decremento y favoritos requieren etiquetas más descriptivas/comportamiento coherente.

**Solución:** revisar contraste WCAG, nombres accesibles, foco al abrir/cerrar modal y offcanvas, orden de tabulación y mensajes de error/éxito; probar manualmente con teclado y lector de pantalla.

**Falta:** evidencia de pruebas POUR/WCAG; ARIA por sí solo no confirma conformidad.

### Organización y modularidad

**Cumple:** el repositorio organiza HTML, CSS, datos y JavaScript en carpetas.

**Error:** el README presenta `app.js`, `repo.js`, `view.js` y `cart.js` como arquitectura del proyecto, mientras que `index.html` carga `js/main.js`, que reúne esas responsabilidades. La documentación y la implementación no coinciden.

**Solución:** elegir una sola estructura. O bien dividir y cargar módulos ES6 como describe el README, o actualizar el README para reflejar con precisión el `main.js` real.

**Falta:** una estructura consistente y validada con pruebas después de cualquier refactor.

### Presentación y documentación

**Cumple:** el README explica objetivo, tecnologías, persistencia, accesibilidad y estructura esperada.

**Error o mejora:** no ofrece instrucciones paso a paso para ejecutar el sitio localmente y su descripción de los archivos JS no coincide con el punto de entrada actual.

**Solución:** añadir instrucciones de inicio con un servidor local, describir el flujo real del proyecto y documentar las limitaciones del pago/contacto si son simulaciones.

**Falta:** documentación alineada con el estado actual y una guía reproducible de ejecución.

## Elementos que faltan o no se comprobaron

1. **Flujo de pago funcional** o una indicación explícita de que es una demostración.
2. **Acción de favoritos** o eliminación del control inactivo.
3. **Validación y recuperación robusta** de datos del carrito almacenados.
4. **Validación de stock cero** al añadir el primer artículo.
5. **Pruebas funcionales** del carrito, formulario, caché y escenarios de error.
6. **Pruebas responsive reales** en navegador.
7. **Verificación accesible manual** con teclado y lector de pantalla, además de medición del contraste.
8. **Coherencia entre README y código**, especialmente en la estructura de módulos.
9. **Instrucciones para ejecutar el proyecto** mediante HTTP local.

## Plan de mejora recomendado

### Prioridad alta
- Validar/sanitizar el carrito restaurado desde `localStorage`.
- Evitar interpolar valores persistidos o externos con `innerHTML`; construir nodos DOM y asignar texto con `textContent` cuando corresponda.
- Respetar stock cero desde la operación de agregar.

### Prioridad media
- Definir el comportamiento de pago, favoritos y envío del formulario.
- Mejorar etiquetas accesibles y revisar jerarquía de encabezados.
- Probar y robustecer fallos de almacenamiento/IndexedDB.

### Prioridad baja
- Alinear el README con la arquitectura real.
- Añadir una guía de ejecución local y una lista breve de pruebas manuales.
- Validar contraste y comportamiento visual en diferentes resoluciones.

## Conclusión

El proyecto tiene una base funcional y cubre la mayoría de los requisitos de la rúbrica. Para aumentar la calificación y la confiabilidad, conviene priorizar la seguridad y validación de datos persistidos, completar los controles visibles sin comportamiento, probar la accesibilidad y hacer que la documentación refleje el código realmente ejecutado.
