# Reto 1: Carrito de Compras - FerroCasa

Este proyecto es el resultado del Reto 1, en el cual se desarrolló un sitio web funcional tipo "carrito de compras" para una ferretería (FerroCasa), integrando múltiples tecnologías y buenas prácticas de desarrollo web.

## 📁 Estructura del Proyecto

El proyecto está estructurado de manera modular para separar responsabilidades:

- `index.html`: Archivo principal con la estructura semántica (header, nav, main, footer).
- `assets/`: 
  - `styles.css`: Contiene los estilos base, uso de variables de CSS y clases adaptables, basado en el diseño provisto en `ferreteria-bootstrap`.
- `data/`:
  - `productos.json`: Catálogo de productos simulando una base de datos u API local.
- `js/`:
  - `main.js`: Es el único punto de entrada cargado en el HTML. Se generó combinando la lógica de los archivos fuente (`app.js`, `repo.js`, `view.js` y `cart.js`) en un solo script tradicional (`<script src="js/main.js"></script>`) para sortear el bloqueo de seguridad (CORS) que aplican los navegadores cuando se usa `type="module"` mediante el protocolo `file://`.
  - `app.js`, `repo.js`, `view.js`, `cart.js`: Archivos de desarrollo (fuentes) que organizan la lógica de negocio en módulos separados.

## 🛠️ Explicación Técnica

- **HTML5 Semántico**: Uso correcto de etiquetas como `<header>`, `<nav>`, `<main>`, `<section>`, y `<article>`.
- **CSS3 Adaptable**: Uso de flexbox, grid y media queries (a través de Bootstrap 5 y estilos propios) para asegurar un diseño *responsive* en dispositivos móviles, tablets y escritorio.
- **JavaScript ES6+**: Uso de módulos, promesas, *async/await*, *arrow functions*, *template literals* y *destructuring*.
- **Carga de Datos**: Uso de `fetch` para cargar la información estática desde el archivo local `productos.json`.
- **Validaciones**: Se implementaron expresiones regulares (`regex`) en `app.js` para validar que el nombre contenga solo letras y el correo tenga un formato válido, con mensajes accesibles (`aria-describedby`).

## 💾 Persistencia de Datos

Para cumplir con el requerimiento de utilizar múltiples mecanismos de almacenamiento, se implementaron:

1. **LocalStorage**: Guarda de forma persistente los elementos del carrito de compras.
2. **SessionStorage**: Guarda y muestra la fecha/hora de la "última actualización" de la sesión actual (visible en el footer).
3. **IndexedDB**: Actúa como un caché para los productos obtenidos del archivo JSON, permitiendo cargar el catálogo incluso si falla el *fetch* original (simulando capacidades *offline*).
4. **Cookies**: Guarda una preferencia genérica (`ferrocasa_visited`) como demostración del mecanismo.

## ♿ Observaciones sobre Accesibilidad

Se incorporaron diversas técnicas para garantizar la accesibilidad del sitio:
- **Atributos ARIA**: Uso de `aria-label`, `aria-hidden`, `aria-describedby`, `aria-invalid` y `aria-live` para mejorar la compatibilidad con lectores de pantalla (por ejemplo, en notificaciones de cambios en la cantidad del carrito).
- **Contraste y Foco**: Estilos definidos (en `styles.css` heredados) para que los elementos interactables (botones, enlaces) tengan un foco (`outline`) claramente visible.
- **Navegación por Teclado**: Todo el flujo de compra, navegación por pestañas y modal es navegable enteramente usando el teclado, aprovechando los modales y offcanvas nativos de Bootstrap configurados adecuadamente.
