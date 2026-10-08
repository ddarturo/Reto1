// repo.js
// Este archivo maneja la obtención de datos (desde el JSON) y la persistencia o guardado (LocalStorage, IndexedDB, Cookies, SessionStorage)

const storage = {
  // --- LOCAL STORAGE ---
  // Guarda el carrito para que, si el usuario cierra el navegador, no pierda sus productos.
  saveCart(cartItems) {
    // Convierte los artículos a texto (JSON) y los guarda
    localStorage.setItem('ferrocasa_cart', JSON.stringify(cartItems));
  },
  
  // Obtiene el carrito guardado
  getCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem('ferrocasa_cart'));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error al parsear el carrito desde localStorage:', e);
      return [];
    }
  },

  // --- SESSION STORAGE ---
  // Guarda información que solo durará mientras la pestaña del navegador esté abierta
  setLastUpdate() {
    const now = new Date().toLocaleString(); // Obtenemos la hora actual del sistema
    sessionStorage.setItem('ferrocasa_last_update', now);
    return now;
  },
  getLastUpdate() {
    return sessionStorage.getItem('ferrocasa_last_update');
  },

  // --- COOKIES ---
  // Las cookies guardan pequeños datos que pueden tener una fecha de caducidad
  setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Calcula en milisegundos los días
        expires = "; expires=" + date.toUTCString();
    }
    // Guarda la cookie en el navegador con los parámetros de seguridad correctos
    document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Strict";
  },
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';'); // Separa todas las cookies por punto y coma
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
};

// --- INDEXED DB ---
// Es una base de datos más avanzada que vive en el navegador. 
// Aquí guardaremos los productos en modo "caché" por si se pierde la conexión o el fetch falla.
const db = {
  dbName: 'FerroCasaDB',
  dbVersion: 1,
  storeName: 'products',
  
  // Función para inicializar la base de datos
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = (event) => reject("IndexedDB error: " + event.target.error);
      
      request.onsuccess = (event) => {
        resolve(event.target.result); // Si se abre exitosamente, lo devolvemos
      };
      
      // onupgradeneeded se ejecuta la primera vez que se crea la base de datos
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(this.storeName)) {
          database.createObjectStore(this.storeName, { keyPath: 'id' }); // Creamos la "tabla" usando 'id' como clave
        }
      };
    });
  },

  // Guarda un arreglo de productos en la base de datos IndexedDB
  async saveProducts(products) {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], 'readwrite'); // Abrimos un permiso de lectura/escritura
      const store = transaction.objectStore(this.storeName);
      
      store.clear(); // Limpiamos productos anteriores para no duplicar
      
      // Insertamos cada producto nuevo
      products.forEach(product => {
        store.put(product);
      });
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (e) => reject(e.target.error);
    });
  },

  // Lee todos los productos guardados en la IndexedDB
  async getProducts() {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll(); // Pide todos los datos guardados
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }
};

// --- FUNCIÓN PRINCIPAL DE DATOS ---
// Obtiene los datos de productos. Intentará descargar el JSON local, pero si el navegador
// lo bloquea por seguridad (ej. abriéndolo como file://), utilizará datos de respaldo.
const fetchProducts = async () => {
  try {
    // 1. Intentamos leer el archivo productos.json utilizando fetch (Petición HTTP)
    const response = await fetch('data/productos.json');
    if (!response.ok) throw new Error('Network response was not ok');
    
    // Convertimos el texto JSON en un objeto JavaScript
    const products = await response.json();
    
    // 2. Si se descargó con éxito, lo guardamos en caché (IndexedDB) para uso futuro
    await db.saveProducts(products);
    return products;
    
  } catch (error) {
    // Si llegamos aquí, es porque el fetch falló (CORS policy al usar file:// o falta de internet)
    console.warn('Fetching from JSON failed, trying IndexedDB cache', error);
    
    let cachedProducts = null;
    try {
      // 3. Intentamos leer la caché por si ya los habíamos descargado antes
      cachedProducts = await db.getProducts();
    } catch (dbError) {
      console.warn('IndexedDB also failed or is blocked:', dbError);
    }
    
    // 4. Si la caché también está vacía (o bloqueada), entregamos unos datos "hardcodeados" (escritos a mano) de rescate
    if (!cachedProducts || cachedProducts.length === 0) {
      console.warn('IndexedDB is empty, using fallback data due to CORS restriction on file://');
      cachedProducts = [
        {
          "id": 1,
          "name": "Set de Destornilladores",
          "category": "Herramientas Manuales",
          "price": 89.99,
          "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo3tY8Z13C0rh-gEWvYxKMfvH3HkrWwC39ysTL1z2d1o85ckcUZgraU3g&s=10",
          "rating": 4.8,
          "stock": 15,
          "badge": "new"
        },
        {
          "id": 2,
          "name": "Manguera extensible de jardín",
          "category": "Jardín y exteriores",
          "price": 24.50,
          "image": "https://http2.mlstatic.com/D_NQ_NP_790048-MLM111596213039_052026-O.webp",
          "rating": 4.5,
          "stock": 30,
          "badge": "discount"
        },
        {
          "id": 3,
          "name": "Pintura Látex Interior Blanca 1 Galón",
          "category": "Pintura",
          "price": 18.00,
          "image": "https://promartecuador.vtexassets.com/arquivos/ids/249261-800-600?v=638939083304100000&width=800&height=600&aspect=true",
          "rating": 4.2,
          "stock": 50,
          "badge": ""
        },
        {
          "id": 4,
          "name": "Martillo Carpintero 16oz",
          "category": "Herramientas Manuales",
          "price": 12.99,
          "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz3XA324sIBuV6FGHtiIjCtiUNuV3oiesPCTw6A033KWof_k5oqj6zpDY&s=10",
          "rating": 4.9,
          "stock": 25,
          "badge": ""
        }
      ];
    }
    return cachedProducts;
  }
};



/**
 * Clase ShoppingCart (Carrito de Compras)
 * Esta clase maneja toda la lógica relacionada con el carrito: 
 * agregar, quitar, cambiar la cantidad y calcular los precios.
 */
class ShoppingCart {
  constructor() {
    // Cuando iniciamos el carrito, buscamos si ya hay productos guardados en el LocalStorage
    this.items = storage.getCart();
    
    // Aquí guardaremos las funciones (listeners) que queremos que se ejecuten cada vez que el carrito cambie
    this.listeners = [];
  }

  // Permite "suscribirse" a los cambios del carrito.
  // Cuando algo cambie, se llamará a esta función (por ejemplo, para actualizar la pantalla).
  subscribe(listener) {
    this.listeners.push(listener);
  }

  // Notifica a todos los suscritos que el carrito ha cambiado y guarda los cambios
  notify() {
    // Guarda el carrito actualizado en el LocalStorage para que no se pierda al recargar la página
    storage.saveCart(this.items);
    // Ejecuta las funciones que actualizan la vista en la pantalla
    this.listeners.forEach(listener => listener(this.items));
  }

  // Agrega un producto al carrito
  add(product) {
    // Busca si el producto ya está dentro del carrito
    const existing = this.items.find(item => item.id === product.id);
    
    if (existing) {
      // Si ya existe, simplemente le sumamos 1 a la cantidad (siempre que haya stock suficiente)
      if (existing.quantity < product.stock) {
        existing.quantity += 1;
      } else {
        alert('Lo sentimos, no hay más stock disponible de este producto.');
      }
    } else {
      // Si no existe, comprobamos que el producto tenga stock disponible
      if (product.stock > 0) {
        this.items.push({ ...product, quantity: 1 });
      } else {
        alert('Lo sentimos, este producto está agotado.');
      }
    }
    
    // Avisamos a la pantalla que el carrito se modificó
    this.notify();
  }

  // Elimina un producto entero del carrito, usando su ID
  remove(productId) {
    // Filtramos la lista para dejar solo aquellos productos que NO tengan el ID que queremos borrar
    this.items = this.items.filter(item => item.id !== productId);
    this.notify();
  }

  // Cambia la cantidad de un producto específico (por ejemplo, usando los botones + y -)
  updateQuantity(productId, quantity, maxStock) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        // Si la cantidad llega a 0, significa que el usuario quiere quitarlo del carrito
        this.remove(productId);
      } else if (quantity <= maxStock) {
        // Solo actualizamos si la nueva cantidad no supera el stock máximo
        item.quantity = quantity;
        this.notify();
      }
    }
  }

  // Calcula el subtotal (precio x cantidad de todos los productos)
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Calcula cuántos artículos hay en total (para mostrar en el iconito rojo del carrito)
  getCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}

// Exportamos una única instancia del carrito para usarla en todo el proyecto
const cart = new ShoppingCart();



// Función para prevenir inyección de HTML (XSS)
const escapeHTML = (str) => {
  return String(str).replace(/[&<>"']/g, (match) => {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[match];
  });
};

/**
 * Función encargada de dibujar los productos del catálogo en la pantalla.
 * @param {Array} products - Lista de productos (objetos) a mostrar.
 */
const renderProducts = (products) => {
  // Buscamos el elemento HTML donde inyectaremos las tarjetas de producto
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = ''; // Limpiamos el contenedor antes de empezar

  // Recorremos cada producto de la lista
  products.forEach(product => {
    // 1. Creamos una columna (div) para organizar el producto en la cuadrícula de Bootstrap
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-3'; // Responsive: Ocupa toda la fila en móvil, media en tablet, un cuarto en PC

    // 2. Si el producto tiene un "badge" (etiqueta como NUEVO o OFERTA), creamos el HTML para mostrarlo
    const badgeHtml = product.badge ? `<span class="product-badge ${product.badge}">${product.badge === 'new' ? 'NUEVO' : 'OFERTA'}</span>` : '';

    // 3. Escribimos la estructura de la tarjeta (HTML) mezclada con los datos del producto (Template Literals de JS)
    col.innerHTML = `
      <article class="product-card h-100 d-flex flex-column" aria-label="${escapeHTML(product.name)}">
        <div class="product-image">
          ${badgeHtml}
          <button class="wishlist" aria-label="Añadir a favoritos">
            <i class="bi bi-heart" aria-hidden="true"></i>
          </button>
          <img src="${escapeHTML(product.image)}" alt="Imagen de ${escapeHTML(product.name)}" loading="lazy">
        </div>
        <div class="product-body flex-grow-1">
          <small>${escapeHTML(product.category)}</small>
          <h3>${escapeHTML(product.name)}</h3>
          <div class="rating" aria-label="Calificación ${escapeHTML(product.rating)} de 5">
            <i class="bi bi-star-fill"></i>
            <span>${escapeHTML(product.rating)}</span>
          </div>
          <p class="stock">Stock disponible: ${escapeHTML(product.stock)}</p>
          <div class="product-footer">
            <strong>$${Number(product.price).toFixed(2)}</strong> <!-- toFixed(2) asegura que se muestren 2 decimales -->
            <button class="add-to-cart-btn btn btn-coral" data-id="${escapeHTML(product.id)}" aria-label="Añadir ${escapeHTML(product.name)} al carrito">
              <i class="bi bi-cart-plus" aria-hidden="true"></i> Añadir
            </button>
          </div>
        </div>
      </article>
    `;

    // 4. Buscamos el botón "Añadir" que acabamos de crear y le asignamos la función de clic
    const btn = col.querySelector('.add-to-cart-btn');
    btn.addEventListener('click', () => {
      cart.add(product); // Llama a la lógica de negocio (en cart.js)
    });

    // 5. Finalmente, pegamos esta columna construida en la pantalla (grid)
    grid.appendChild(col);
  });
};

/**
 * Función encargada de dibujar los elementos que el usuario tiene en su carrito
 * y actualizar los totales de dinero.
 * @param {Array} items - Artículos que están actualmente en el carrito.
 */
const renderCart = (items) => {
  // Capturamos los elementos de la interfaz donde inyectaremos información
  const cartContainer = document.getElementById('cartItems');
  const countBadge = document.getElementById('cartCount'); // El numerito rojo del carrito
  const subtotalEl = document.getElementById('cartSubtotal');
  const taxesEl = document.getElementById('cartTaxes');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn'); // El botón de "Proceder al pago"

  cartContainer.innerHTML = ''; // Limpiamos la lista anterior
  countBadge.textContent = cart.getCount(); // Actualizamos el numerito

  // Si no hay ningún artículo, mostramos un mensaje amigable y dejamos todo en 0
  if (items.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
        <i class="bi bi-cart-x"></i>
        <h3>El carrito está vacío</h3>
        <p>Agrega algunos productos para empezar.</p>
      </div>
    `;
    subtotalEl.textContent = '$0.00';
    taxesEl.textContent = '$0.00';
    totalEl.textContent = '$0.00';
    
    // Deshabilitamos el botón de pago si existe
    if (checkoutBtn) checkoutBtn.disabled = true;
    return; // Terminamos de ejecutar la función aquí temprano
  }
  
  // Si llegamos a esta línea, es porque sí hay elementos. Habilitamos el botón de pago:
  if (checkoutBtn) checkoutBtn.disabled = false;

  // Por cada artículo en el carrito, creamos una fila (linea) con su imagen, precio y botones de control
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-line';
    itemEl.innerHTML = `
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">
      <div>
        <h3>${escapeHTML(item.name)}</h3>
        <small>$${Number(item.price).toFixed(2)} c/u</small>
        <div class="quantity-controls">
          <button class="qty-btn" data-id="${escapeHTML(item.id)}" data-action="decrease" aria-label="Disminuir cantidad">-</button>
          <span class="fw-bold" aria-live="polite">${escapeHTML(item.quantity)}</span>
          <button class="qty-btn" data-id="${escapeHTML(item.id)}" data-action="increase" aria-label="Aumentar cantidad">+</button>
        </div>
      </div>
      <div class="text-end">
        <div class="fw-bold">$${(Number(item.price) * Number(item.quantity)).toFixed(2)}</div>
        <button class="remove-item mt-2" data-id="${escapeHTML(item.id)}" aria-label="Eliminar ${escapeHTML(item.name)} del carrito">
          <i class="bi bi-trash"></i> Eliminar
        </button>
      </div>
    `;

    cartContainer.appendChild(itemEl);
  });

  // Calculamos los totales matemáticos
  const subtotal = cart.getTotal();
  const taxes = subtotal * 0.15; // Suponemos un IVA del 15%
  const total = subtotal + taxes;

  // Actualizamos el texto en pantalla (el formato `$${variable}` permite inyectar variables en JS)
  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxesEl.textContent = `$${taxes.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  // Le agregamos eventos a los botoncitos redondos "+" y "-" para cambiar cantidades
  cartContainer.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const action = e.target.dataset.action;
      const item = items.find(i => i.id === id); // Buscamos a qué artículo se le dio clic
      
      if (action === 'decrease') {
        cart.updateQuantity(id, item.quantity - 1, item.stock);
      } else {
        cart.updateQuantity(id, item.quantity + 1, item.stock);
      }
    });
  });

  // Le agregamos el evento al botón de eliminar (el tachito de basura)
  cartContainer.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      cart.remove(id); // Llamamos a la lógica para borrar
    });
  });
};





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
    // reevaluamos el campo
    nameInput.addEventListener('input', () => {
      if (nameRegex.test(nameInput.value.trim())) {
        nameInput.classList.remove('is-invalid');
        nameInput.classList.add('is-valid');
        nameInput.setAttribute('aria-invalid', 'false');
      } else if (nameInput.value.trim() !== '') {
        nameInput.classList.add('is-invalid');
        nameInput.classList.remove('is-valid');
        nameInput.setAttribute('aria-invalid', 'true');
      }
    });

    emailInput.addEventListener('input', () => {
      if (emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
        emailInput.setAttribute('aria-invalid', 'false');
      } else if (emailInput.value.trim() !== '') {
        emailInput.classList.add('is-invalid');
        emailInput.classList.remove('is-valid');
        emailInput.setAttribute('aria-invalid', 'true');
      }
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

  // --- LÓGICA DE PAGO (Demostración) ---
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.items.length > 0) {
        alert('¡Gracias por tu compra en FerroCasa! Esta es una versión de demostración.');
        // Vaciar el carrito tras compra
        cart.items = [];
        cart.notify();
        // Cerrar offcanvas
        const cartCanvas = document.getElementById('cartCanvas');
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(cartCanvas);
        if (bsOffcanvas) bsOffcanvas.hide();
        
        // Devolver el foco al inicio para no perderlo
        document.getElementById('inicio').focus();
      }
    });
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
