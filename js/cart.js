import { storage } from './repo.js';

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
      }
    } else {
      // Si no existe, lo agregamos como un nuevo elemento con cantidad = 1
      this.items.push({ ...product, quantity: 1 });
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
export const cart = new ShoppingCart();
