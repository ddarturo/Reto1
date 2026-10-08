import { cart } from './cart.js';

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
export const renderProducts = (products) => {
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
export const renderCart = (items) => {
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
