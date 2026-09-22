// Estado global
let data = JSON.parse(localStorage.getItem('atcb_data')) || structuredClone(INITIAL_DATA);
let cart = JSON.parse(localStorage.getItem('atcb_cart')) || [];
let currentCat = 'all';
let editingProdId = null;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  updateCartCount();
  // Previews en admin
  document.getElementById('editHistoria')?.addEventListener('input', previewHistoria);
  document.getElementById('newGalImg')?.addEventListener('change', previewGalImg);
  document.getElementById('prodImg')?.addEventListener('change', previewProdImg);
  document.getElementById('prodName')?.addEventListener('input', previewProdText);
  document.getElementById('prodDesc')?.addEventListener('input', previewProdText);
  document.getElementById('prodPrice')?.addEventListener('input', previewProdText);
});

function saveData() {
  localStorage.setItem('atcb_data', JSON.stringify(data));
}
function saveCart() {
  localStorage.setItem('atcb_cart', JSON.stringify(cart));
  updateCartCount();
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.nav-btn[data-sec="${id}"]`);
  if (btn) btn.classList.add('active');
  document.getElementById('mainNav').classList.remove('open');
  if (id === 'catalogo') renderProducts();
  if (id === 'carrito') renderCart();
  if (id === 'inicio') renderGallery();
  if (id === 'admin') {
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
  }
}

// ========== INICIO ==========
function renderGallery() {
  const allImgs = data.gallery.map(g => g.img);
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = data.gallery.map((g, idx) => {
    const slides = allImgs.map((src, i) => 
      `<img src="${src}" class="${i === 0 ? 'active' : ''}" onerror="this.src='images/logo.png'">`
    ).join('');
    return `
    <div class="gallery-item" data-slide-idx="${idx}" onclick="openLightbox(${idx})">
      <div class="slides">${slides}</div>
      <p>${g.desc}</p>
    </div>`;
  }).join('');
  startSlideshows();
  document.getElementById('historiaText').innerHTML = data.historia.split('\n\n').map(p => `<p>${p}</p>`).join('');
  document.getElementById('phoneDisplay').textContent = data.phone;
  document.querySelector('.btn.whatsapp').href = `https://wa.me/${data.whatsapp}`;
  document.querySelector('.btn.instagram').href = `https://instagram.com/${data.instagram}`;
}

let lbIndex = 0;
function openLightbox(idx) {
  lbIndex = idx;
  const g = data.gallery[lbIndex];
  if (!g) return;
  document.getElementById('lbImg').src = g.img;
  document.getElementById('lbDesc').textContent = g.desc;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(e) {
  if (e.target.id === 'lightbox' || e.target.classList.contains('lb-close')) {
    document.getElementById('lightbox').classList.remove('open');
  }
}
function lbNav(dir) {
  lbIndex = (lbIndex + dir + data.gallery.length) % data.gallery.length;
  const g = data.gallery[lbIndex];
  document.getElementById('lbImg').src = g.img;
  document.getElementById('lbDesc').textContent = g.desc;
}

let slideTimers = [];
function startSlideshows() {
  slideTimers.forEach(clearInterval);
  slideTimers = [];
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    const imgs = item.querySelectorAll('.slides img');
    if (imgs.length < 2) return;
    let cur = 0;
    const t = setInterval(() => {
      imgs[cur].classList.remove('active');
      cur = (cur + 1) % imgs.length;
      imgs[cur].classList.add('active');
    }, 2800 + i * 400);
    slideTimers.push(t);
  });
}

function openContact() {
  window.open(`https://wa.me/${data.whatsapp}?text=Hola,%20quiero%20solicitar%20una%20cotización%20o%20asistencia%20técnica.`, '_blank');
}

// ========== CATALOGO ==========
document.getElementById('catFilters')?.addEventListener('click', e => {
  if (e.target.classList.contains('cat-btn')) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCat = e.target.dataset.cat;
    renderProducts();
  }
});

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const filtered = currentCat === 'all' ? data.products : data.products.filter(p => p.cat === currentCat);
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--muted);grid-column:1/-1;">No hay productos en esta categoría.</p>';
    return;
  }
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}" onerror="this.src='images/logo.png'">
      <div class="info">
        <h3>${p.name}</h3>
        ${!p.available ? '<span class="agotado">AGOTADO</span>' : ''}
        <p class="desc">${p.desc}</p>
        <button class="btn primary add-btn pulse-add" ${!p.available ? 'disabled style="opacity:0.5"' : ''} 
          onclick="addToCart(${p.id})">${p.available ? 'Agregar al Carrito' : 'No disponible'}</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  const prod = data.products.find(p => p.id === id);
  if (!prod || !prod.available) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: prod.id, name: prod.name, price: prod.price, img: prod.img, qty: 1 });
  saveCart();

  // Animación botón
  const btn = event.target;
  btn.classList.add('bounce-btn');
  btn.textContent = '✓ Agregado';
  setTimeout(() => {
    btn.textContent = 'Agregar al Carrito';
    btn.classList.remove('bounce-btn');
  }, 900);

  // Fly to cart
  const card = btn.closest('.product-card');
  const img = card.querySelector('img');
  const cartBtn = document.getElementById('cartNavBtn');
  if (img && cartBtn) {
    const rect = img.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();
    const fly = document.createElement('img');
    fly.src = img.src;
    fly.className = 'fly-img';
    fly.style.left = rect.left + 'px';
    fly.style.top = rect.top + 'px';
    fly.style.width = rect.width + 'px';
    fly.style.height = rect.height + 'px';
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      fly.style.left = (cartRect.left + cartRect.width/2 - 30) + 'px';
      fly.style.top = (cartRect.top + cartRect.height/2 - 30) + 'px';
      fly.style.width = '40px';
      fly.style.height = '40px';
      fly.style.opacity = '0.4';
    });
    setTimeout(() => fly.remove(), 750);
  }

  // Pulse carrito
  cartBtn.classList.add('pulse-cart');
  setTimeout(() => cartBtn.classList.remove('pulse-cart'), 1500);
}

// ========== CARRITO ==========
function renderCart() {
  const list = document.getElementById('cartItems');
  const orderBtn = document.getElementById('orderBtn');
  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Tu carrito está vacío. ¡Ve al catálogo!</p>';
    if (orderBtn) orderBtn.classList.remove('pulse-order');
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" onerror="this.src='images/logo.png'">
      <div class="details">
        <h4>${item.name}</h4>
      </div>
      <div class="qty">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <button class="btn secondary" style="padding:0.4rem 0.8rem;" onclick="removeFromCart(${item.id})">Eliminar</button>
    </div>
  `).join('');
  if (orderBtn) orderBtn.classList.add('pulse-order');
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  if (confirm('¿Vaciar todo el carrito?')) {
    cart = [];
    saveCart();
    renderCart();
  }
}

function sendWhatsApp() {
  if (cart.length === 0) { alert('El carrito está vacío'); return; }
  let msg = 'Hola! Quiero hacer el siguiente pedido:%0A%0A';
  cart.forEach(i => {
    msg += `• ${i.name} x${i.qty}%0A`;
  });
  msg += `%0AGracias!`;
  window.open(`https://wa.me/${data.whatsapp}?text=${msg}`, '_blank');
  cart = [];
  saveCart();
  renderCart();
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const btn = document.getElementById('cartNavBtn');
  if (count > 0) btn.classList.add('pulse-cart');
  else btn.classList.remove('pulse-cart');
}

// ========== ADMIN ==========
function loginAdmin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === data.adminPass) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminData();
  } else {
    alert('Clave incorrecta');
  }
}

function logoutAdmin() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminPass').value = '';
}

function showAdminTab(id) {
  document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}

function loadAdminData() {
  document.getElementById('editHistoria').value = data.historia;
  document.getElementById('editPhone').value = data.phone;
  document.getElementById('editWhatsapp').value = data.whatsapp;
  document.getElementById('editInstagram').value = data.instagram;
  renderGalleryAdmin();
  renderProductsAdmin();
  previewHistoria();
}

function previewHistoria() {
  const txt = document.getElementById('editHistoria').value;
  document.getElementById('previewHistoria').innerHTML = txt.split('\n\n').map(p => `<p>${p}</p>`).join('') || '<em>Vista previa vacía</em>';
}

function saveHistoria() {
  data.historia = document.getElementById('editHistoria').value;
  saveData();
  alert('Historia guardada');
  renderGallery();
}

function renderGalleryAdmin() {
  const list = document.getElementById('galleryAdminList');
  list.innerHTML = data.gallery.map(g => `
    <div class="admin-item">
      <img src="${g.img}" onerror="this.src='images/logo.png'">
      <span>${g.desc}</span>
      <div class="actions">
        <button class="btn secondary" onclick="deleteGallery(${g.id})">Borrar</button>
      </div>
    </div>
  `).join('');
}

function previewGalImg() {
  const file = document.getElementById('newGalImg').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewGal').innerHTML = `<img src="${e.target.result}"><p>${document.getElementById('newGalDesc').value || 'Sin descripción'}</p>`;
  };
  reader.readAsDataURL(file);
}

function addGalleryItem() {
  const desc = document.getElementById('newGalDesc').value.trim();
  const file = document.getElementById('newGalImg').files[0];
  if (!desc || !file) { alert('Completa descripción e imagen'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const id = Date.now();
    data.gallery.push({ id, desc, img: e.target.result });
    saveData();
    renderGalleryAdmin();
    document.getElementById('newGalDesc').value = '';
    document.getElementById('newGalImg').value = '';
    document.getElementById('previewGal').innerHTML = '';
    alert('Proyecto agregado');
  };
  reader.readAsDataURL(file);
}

function deleteGallery(id) {
  if (confirm('¿Borrar este proyecto?')) {
    data.gallery = data.gallery.filter(g => g.id !== id);
    saveData();
    renderGalleryAdmin();
  }
}

function renderProductsAdmin() {
  const list = document.getElementById('productsAdminList');
  list.innerHTML = data.products.map(p => `
    <div class="admin-item">
      <img src="${p.img}" onerror="this.src='images/logo.png'">
      <div>
        <strong>${p.name}</strong> - $${p.price} <br>
        <small>${p.cat} | ${p.available ? 'Disponible' : 'Agotado'}</small>
      </div>
      <div class="actions">
        <button class="btn primary" onclick="editProduct(${p.id})">Editar</button>
        <button class="btn secondary" onclick="deleteProduct(${p.id})">Borrar</button>
      </div>
    </div>
  `).join('');
}

function previewProdImg() {
  const file = document.getElementById('prodImg').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    updateProdPreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

function previewProdText() {
  updateProdPreview();
}

function updateProdPreview(imgSrc) {
  const name = document.getElementById('prodName').value || 'Nombre';
  const price = document.getElementById('prodPrice').value || '0';
  const desc = document.getElementById('prodDesc').value || 'Descripción';
  const img = imgSrc || (editingProdId ? data.products.find(p => p.id === editingProdId)?.img : 'images/logo.png');
  document.getElementById('previewProd').innerHTML = `
    <img src="${img}" style="max-height:120px">
    <h4>${name}</h4>
    <p>$${price}</p>
    <p style="font-size:0.85rem;color:var(--muted)">${desc.substring(0,100)}${desc.length>100?'...':''}</p>
  `;
}

function editProduct(id) {
  const p = data.products.find(x => x.id === id);
  if (!p) return;
  editingProdId = id;
  document.getElementById('editProdId').value = id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodCat').value = p.cat;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodDesc').value = p.desc;
  document.getElementById('prodStock').checked = p.available;
  document.getElementById('prodImg').value = '';
  updateProdPreview(p.img);
  showAdminTab('productosAdmin');
  document.querySelectorAll('.admin-tab')[1].classList.add('active');
}

function saveProduct() {
  const name = document.getElementById('prodName').value.trim();
  const cat = document.getElementById('prodCat').value;
  const price = parseFloat(document.getElementById('prodPrice').value) || 0;
  const desc = document.getElementById('prodDesc').value.trim();
  const available = document.getElementById('prodStock').checked;
  const file = document.getElementById('prodImg').files[0];
  const id = editingProdId || Date.now();

  if (!name) { alert('Nombre obligatorio'); return; }

  const finish = (img) => {
    const existing = data.products.findIndex(p => p.id === id);
    const prod = { id, name, cat, price, desc, img: img || (existing >= 0 ? data.products[existing].img : 'images/logo.png'), available };
    if (existing >= 0) data.products[existing] = prod;
    else data.products.push(prod);
    saveData();
    renderProductsAdmin();
    clearProdForm();
    alert('Producto guardado');
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = e => finish(e.target.result);
    reader.readAsDataURL(file);
  } else {
    finish(null);
  }
}

function clearProdForm() {
  editingProdId = null;
  document.getElementById('editProdId').value = '';
  document.getElementById('prodName').value = '';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodDesc').value = '';
  document.getElementById('prodImg').value = '';
  document.getElementById('prodStock').checked = true;
  document.getElementById('previewProd').innerHTML = '';
}

function deleteProduct(id) {
  if (confirm('¿Borrar este producto?')) {
    data.products = data.products.filter(p => p.id !== id);
    saveData();
    renderProductsAdmin();
  }
}

function saveConfig() {
  data.phone = document.getElementById('editPhone').value;
  data.whatsapp = document.getElementById('editWhatsapp').value.replace(/\D/g, '');
  data.instagram = document.getElementById('editInstagram').value.replace('@', '');
  saveData();
  alert('Configuración guardada');
  renderGallery();
}

function savePass() {
  const np = document.getElementById('editPass').value.trim();
  if (np.length < 4) { alert('Mínimo 4 caracteres'); return; }
  data.adminPass = np;
  saveData();
  alert('Clave actualizada');
  document.getElementById('editPass').value = '';
}

function renderAll() {
  renderGallery();
  renderProducts();
}
