const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Reemplazar Hero
const originalHero = `    <section class="hero-section" aria-labelledby="hero-title">
      <div class="container">
        <div class="hero-content">
          <p class="eyebrow">FERRETERÍA · HERRAMIENTAS · CONSTRUCCIÓN</p>
          <h1 id="hero-title">Tu ferretería.<br><em>Todo proyecto.</em></h1>
          <p class="hero-copy">Taladros, tornillos, pinturas y materiales para reparar, construir y mejorar tu casa.</p>
          <ul class="hero-categories" aria-label="Productos de ferretería">
            <li><i class="bi bi-tools" aria-hidden="true"></i> Herramientas</li>
            <li><i class="bi bi-palette" aria-hidden="true"></i> Pinturas</li>
            <li><i class="bi bi-nut" aria-hidden="true"></i> Tornillería</li>
          </ul>
          <div class="d-flex flex-wrap gap-3">
            <a class="btn btn-coral btn-lg" href="#catalogo">Comprar herramientas <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
            <a class="btn btn-outline-light btn-lg" href="#proyectos">Ver ideas de proyecto</a>
          </div>
          <dl class="hero-stats row g-3 mb-0">
            <div class="col-4"><dt>+12 mil</dt><dd>productos</dd></div>
            <div class="col-4"><dt>24 h</dt><dd>entrega local</dd></div>
            <div class="col-4"><dt>4.8/5</dt><dd>opiniones</dd></div>
          </dl>
        </div>
      </div>
    </section>
    
    <section class="trust-strip" aria-label="Servicios FerroCasa">
      <div class="container row g-0 mx-auto">
        <div class="col-md-4 trust-item"><i class="bi bi-shield-check" aria-hidden="true"></i><span><strong>Compra con respaldo</strong>Garantía en marcas seleccionadas</span></div>
        <div class="col-md-4 trust-item"><i class="bi bi-shop" aria-hidden="true"></i><span><strong>Retira donde quieras</strong>Más de 8 tiendas disponibles</span></div>
        <div class="col-md-4 trust-item"><i class="bi bi-headset" aria-hidden="true"></i><span><strong>Te ayudamos a elegir</strong>Asesoría para cada proyecto</span></div>
      </div>
    </section>`;

html = html.replace(/<section class="hero-section"[\s\S]*?<\/section>/, originalHero);

// 2. Insertar Categorías antes de <section id="catalogo"
const categoriesHTML = `
    <!-- Sección de Categorías extraída de ferreteria-bootstrap -->
    <section id="categorias" class="section-padding" aria-labelledby="categories-title">
      <div class="container">
        <div class="section-heading d-flex justify-content-between align-items-end gap-3 mb-4">
          <div><p class="eyebrow eyebrow-dark mb-2">ENCUENTRA TU PRÓXIMO PASO</p><h2 id="categories-title">Compra por categoría</h2></div>
          <a class="text-link d-none d-md-inline" href="#catalogo">Ver todo <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
        </div>
        <div class="row g-3 category-grid">
          <div class="col-6 col-lg-3"><button class="category-card category-tools cat-filter-btn" type="button" data-category="Herramientas"><span class="category-icon"><i class="bi bi-tools" aria-hidden="true"></i></span><strong>Herramientas</strong></button></div>
          <div class="col-6 col-lg-3"><button class="category-card category-build cat-filter-btn" type="button" data-category="Construcción"><span class="category-icon"><i class="bi bi-bricks" aria-hidden="true"></i></span><strong>Construcción</strong></button></div>
          <div class="col-6 col-lg-3"><button class="category-card category-home cat-filter-btn" type="button" data-category="Pintura"><span class="category-icon"><i class="bi bi-house-heart" aria-hidden="true"></i></span><strong>Pintura</strong></button></div>
          <div class="col-6 col-lg-3"><button class="category-card category-garden cat-filter-btn" type="button" data-category="Jardín"><span class="category-icon"><i class="bi bi-flower1" aria-hidden="true"></i></span><strong>Jardín</strong></button></div>
        </div>
      </div>
    </section>
`;

if (!html.includes('id="categorias"')) {
  html = html.replace('<!-- Sección del catálogo de productos -->', categoriesHTML + '\n    <!-- Sección del catálogo de productos -->');
}

// 3. Reemplazar Footer
const originalFooter = `  <footer id="contacto" class="site-footer"><div class="container"><div class="row g-4"><div class="col-lg-4"><a class="brand footer-brand" href="#inicio"><span class="brand-mark"><i class="bi bi-tools" aria-hidden="true"></i></span><span>Ferro<span>Casa</span></span></a><p class="footer-copy">Todo lo que necesitas para construir, reparar y transformar.</p></div><div class="col-6 col-lg-2"><h2>Compra</h2><a href="#catalogo">Herramientas</a><a href="#catalogo">Construcción</a><a href="#catalogo">Ofertas</a></div><div class="col-6 col-lg-2"><h2>Ayuda</h2><a href="#ayuda">Envíos y retiros</a><a href="#ayuda">Cambios y devoluciones</a><a href="#ayuda">Contáctanos</a></div><div class="col-lg-4"><h2>Recibe ideas para tu próximo proyecto</h2><form class="newsletter-form" id="newsletterForm"><label class="visually-hidden" for="email">Tu correo electrónico</label><input id="email" type="email" placeholder="Tu correo electrónico" required><button class="btn btn-coral" type="submit" aria-label="Suscribirse al boletín"><i class="bi bi-arrow-right" aria-hidden="true"></i></button></form><p class="form-message" id="formMessage" role="status"></p></div></div><div class="footer-bottom"><span>© 2026 FerroCasa</span><span>Compra segura · Privacidad · Términos</span></div></div></footer>`;

html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, originalFooter);

fs.writeFileSync('index.html', html);
console.log('HTML parcheado.');
