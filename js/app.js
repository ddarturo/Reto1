import { fetchProducts, storage } from './repo.js';
import { cart } from './cart.js';
import { renderProducts, renderCart } from './view.js';

/**
 * app.js es el punto de entrada principal. 
 * Todo lo que está dentro de DOMContentLoaded se ejecutará sólo cuando 
 * el navegador haya terminado de leer y dibujar el HTML.
 */
document.addEventListener('DOMContentLoaded', async () => {
  
  // --- ÚLTIMA ACTUALIZACIÓN ---
  // Obtenemos la hora actual (simulando una sesión) y la imprimimos en el pie de página
  const lastUpdate = storage.setLastUpdate();
  document.getElementById('lastUpdateText').textContent = `Última actualización: ${lastUpdate}`;

  // --- COOKIES ---
  // Configuramos una cookie de prueba. Usamos un bloque try-catch por si 
  // el navegador bloquea las cookies cuando el archivo es local (file://).
  try {
    storage.setCookie('ferrocasa_visited', 'true', 7);
  } catch (e) {
    console.warn('Cookies may be disabled on file://');
  }

  // --- LÓGICA DE SELECCIÓN DE CIUDAD ---
  // Buscamos los botones que representan a las ciudades en la ventanita modal
  const locationOptions = document.querySelectorAll('.location-option');
  const locationLabel = document.getElementById('locationLabel'); // El texto en la cabecera
  
  // Revisamos si el usuario ya había elegido una ciudad antes (leyendo de LocalStorage)
  const savedLocation = localStorage.getItem('ferrocasa_location');
  if (savedLocation) {
    locationLabel.textContent = savedLocation;
  }

  // A cada botón de ciudad le decimos qué hacer si le hacen clic
  locationOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const city = e.currentTarget.dataset.city; // Leemos el atributo data-city="Quito..."
      locationLabel.textContent = city; // Cambiamos el texto arriba
      localStorage.setItem('ferrocasa_location', city); // Lo guardamos para la próxima visita
      
      // Cerramos la ventana modal usando Bootstrap JS
      const modalEl = document.getElementById('locationModal');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    });
  });

  // --- VALIDACIÓN DEL FORMULARIO DE CONTACTO ---
  const form = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  // "Regex" (Expresiones regulares) para validar que el texto sea correcto
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; // Sólo letras mayúsculas, minúsculas, acentos y espacios
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato estandar de correo nombre@dominio.algo

  if (form) {
    // Escuchamos el evento 'submit' que ocurre al presionar "Enviar Mensaje"
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Evitamos que la página se recargue automáticamente
      let isValid = true; // Asumimos que todo está bien, a menos que probemos lo contrario

      // Verificamos el nombre usando el Regex
      if (!nameRegex.test(nameInput.value.trim())) {
        nameInput.classList.add('is-invalid'); // Le pone un borde rojo
        nameInput.setAttribute('aria-invalid', 'true'); // Le dice a los lectores de pantalla que hay un error
        isValid = false;
      } else {
        nameInput.classList.remove('is-invalid');
        nameInput.classList.add('is-valid'); // Le pone un borde verde
        nameInput.setAttribute('aria-invalid', 'false');
      }

      // Verificamos el correo
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('is-invalid');
        emailInput.setAttribute('aria-invalid', 'true');
        isValid = false;
      } else {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
        emailInput.setAttribute('aria-invalid', 'false');
      }

      // Si no hubo errores...
      if (isValid) {
        alert('¡Mensaje enviado con éxito!');
        form.reset(); // Vaciamos las cajas de texto
        nameInput.classList.remove('is-valid');
        emailInput.classList.remove('is-valid');
      }
    });

    // Pequeño truco de "Experiencia de Usuario": Si el usuario empieza a escribir de nuevo, 
    // le borramos la alerta roja de error.
    [nameInput, emailInput].forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
      });
    });
  }

  // --- INICIALIZACIÓN DEL CARRITO ---
  try {
    // Le decimos al carrito que cada vez que cambie, llame a la función renderCart (dibujar)
    cart.subscribe(renderCart);
    // Lo dibujamos por primera vez con lo que ya tenga guardado
    renderCart(cart.items);
  } catch (e) {
    console.error('Error rendering cart', e);
  }

  // --- OBTENCIÓN Y RENDERIZADO DEL CATÁLOGO ---
  try {
    // Llamamos a la función asíncrona que va a descargar el archivo JSON
    const products = await fetchProducts();
    renderProducts(products); // Si es exitoso, los pintamos en pantalla
  } catch (error) {
    console.error('Critical error loading products:', error);
    // Si ocurre un desastre total, mostramos el contenedor vacío para que no colapse
    renderProducts([]);
  }
});
