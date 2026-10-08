// repo.js
// Este archivo maneja la obtención de datos (desde el JSON) y la persistencia o guardado (LocalStorage, IndexedDB, Cookies, SessionStorage)

export const storage = {
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

  // Guarda y obtiene los favoritos en LocalStorage
  saveFavorites(favoritesArray) {
    localStorage.setItem('ferrocasa_favorites', JSON.stringify(favoritesArray));
  },
  getFavorites() {
    try {
      const parsed = JSON.parse(localStorage.getItem('ferrocasa_favorites'));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
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
export const db = {
  dbName: 'FerroCasaDB2',
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
export const fetchProducts = async () => {
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
          "category": "Herramientas",
          "price": 89.99,
          "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo3tY8Z13C0rh-gEWvYxKMfvH3HkrWwC39ysTL1z2d1o85ckcUZgraU3g&s=10",
          "rating": 4.8,
          "stock": 15,
          "badge": "new"
        },
        {
          "id": 2,
          "name": "Manguera extensible de jardín",
          "category": "Jardín",
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
          "category": "Construcción",
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
