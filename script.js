// Estado global
let data = { historia: '', phone: '', whatsapp: '', instagram: '', adminPass: 'atcb2024', products: [], gallery: [] };
let cart = JSON.parse(localStorage.getItem('atcb_cart')) || [];
let currentCat = 'all';
let editingProdId = null;
let dataReady = false;

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true);
  try {
    data = await loadFromFirebase();
    dataReady = true;
    renderAll();
    updateCartCount();
  } catch (err) {
    console.error(err);
    alert('Error cargando datos de Firebase. Revisa la consola y las reglas de seguridad.');
    data = structuredClone(INITIAL_DATA);
    renderAll();
  }
  showLoading(false);

  document.getElementById('editHistoria')?.addEventListener('input', previewHistoria);
  document.getElementById('newGalImg')?.addEventListener('change', previewGalImg);
  document.getElementById('prodImg')?.addEventListener('change', previewProdImg);
  document.getElementById('prodName')?.addEventListener('input', previewProdText);
  document.getElementById('prodDesc')?.addEventListener('input', previewProdText);
});

function showLoading(on) {
  let el = document.getElementById('fbLoading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fbLoading';
    el.innerHTML = '<div class="spinner"></div><p>Cargando...</p>';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(10,22,40,0.9);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#00b4ff;font-size:1.2rem;';
    document.body.appendChild(el);
  }
  el.style.display = on ? 'flex' : 'none';
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
  if (!grid) return;
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
  const hist = document.getElementById('historiaText');
  if (hist) hist.innerHTML = (data.historia || '').split('\n\n').map(p => `<p>${p}</p>`).join('');
  const phoneEl = document.getElementById('phoneDisplay');
  if (phoneEl) phoneEl.textContent = data.phone;
  const wa = document.querySelector('.btn.whatsapp');
  if (wa) wa.href = `https://wa.me/${data.whatsapp}`;
  const ig = document.querySelector('.btn.instagram');
  if (ig) ig.href = `https://instagram.com/${data.instagram}`;
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
  if (!data.gallery.length) return;
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
  if (!grid) return;
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
  else cart.push({ id: prod.id, name: prod.name, img: prod.img, qty: 1 });
  saveCart();

  const btn = event.target;
  btn.classList.add('bounce-btn');
  btn.textContent = '✓ Agregado';
  setTimeout(() => {
    btn.textContent = 'Agregar al Carrito';
    btn.classList.remove('bounce-btn');
  }, 900);

  const card = btn.closest('.product-card');
  const img = card?.querySelector('img');
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
      fly.style.left = (cartRect.left + cartRect.width / 2 - 30) + 'px';
      fly.style.top = (cartRect.top + cartRect.height / 2 - 30) + 'px';
      fly.style.width = '40px';
      fly.style.height = '40px';
      fly.style.opacity = '0.4';
    });
    setTimeout(() => fly.remove(), 750);
  }
  cartBtn?.classList.add('pulse-cart');
  setTimeout(() => cartBtn?.classList.remove('pulse-cart'), 1500);
}

// ========== CARRITO ==========
function renderCart() {
  const list = document.getElementById('cartItems');
  const orderBtn = document.getElementById('orderBtn');
  if (!list) return;
  if (cart.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--muted);padding:2rem;">Tu carrito está vacío. ¡Ve al catálogo!</p>';
    if (orderBtn) orderBtn.classList.remove('pulse-order');
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" onerror="this.src='images/logo.png'">
      <div class="details"><h4>${item.name}</h4></div>
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
  cart.forEach(i => { msg += `• ${i.name} x${i.qty}%0A`; });
  msg += '%0AGracias!';
  window.open(`https://wa.me/${data.whatsapp}?text=${msg}`, '_blank');
  cart = [];
  saveCart();
  renderCart();
}

function updateCartCount() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = count;
  const btn = document.getElementById('cartNavBtn');
  if (btn) {
    if (count > 0) btn.classList.add('pulse-cart');
    else btn.classList.remove('pulse-cart');
  }
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
  document.getElementById('editHistoria').value = data.historia || '';
  document.getElementById('editPhone').value = data.phone || '';
  document.getElementById('editWhatsapp').value = data.whatsapp || '';
  document.getElementById('editInstagram').value = data.instagram || '';
  renderGalleryAdmin();
  renderProductsAdmin();
  previewHistoria();
}

function previewHistoria() {
  const txt = document.getElementById('editHistoria').value;
  document.getElementById('previewHistoria').innerHTML = txt.split('\n\n').map(p => `<p>${p}</p>`).join('') || '<em>Vista previa vacía</em>';
}

async function saveHistoria() {
  data.historia = document.getElementById('editHistoria').value;
  showLoading(true);
  try {
    await saveConfigToFb(data);
    alert('Historia guardada en Firebase');
    renderGallery();
  } catch (e) {
    alert('Error al guardar: ' + e.message);
  }
  showLoading(false);
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

async function addGalleryItem() {
  const desc = document.getElementById('newGalDesc').value.trim();
  const file = document.getElementById('newGalImg').files[0];
  if (!desc || !file) { alert('Completa descripción e imagen'); return; }
  showLoading(true);
  try {
    const id = Date.now();
    const imgUrl = await uploadImage(file, `gallery/${id}_${file.name}`);
    const item = { id, desc, img: imgUrl };
    await saveGalleryItemToFb(item);
    data.gallery.unshift(item);
    renderGalleryAdmin();
    document.getElementById('newGalDesc').value = '';
    document.getElementById('newGalImg').value = '';
    document.getElementById('previewGal').innerHTML = '';
    alert('Proyecto guardado en Firebase');
  } catch (e) {
    alert('Error: ' + e.message);
  }
  showLoading(false);
}

async function deleteGallery(id) {
  if (!confirm('¿Borrar este proyecto?')) return;
  const item = data.gallery.find(g => g.id === id);
  showLoading(true);
  try {
    await deleteGalleryFromFb(id, item?.img);
    data.gallery = data.gallery.filter(g => g.id !== id);
    renderGalleryAdmin();
    alert('Borrado');
  } catch (e) {
    alert('Error: ' + e.message);
  }
  showLoading(false);
}

function renderProductsAdmin() {
  const list = document.getElementById('productsAdminList');
  list.innerHTML = data.products.map(p => `
    <div class="admin-item">
      <img src="${p.img}" onerror="this.src='images/logo.png'">
      <div>
        <strong>${p.name}</strong><br>
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
  reader.onload = e => updateProdPreview(e.target.result);
  reader.readAsDataURL(file);
}

function previewProdText() { updateProdPreview(); }

function updateProdPreview(imgSrc) {
  const name = document.getElementById('prodName').value || 'Nombre';
  const desc = document.getElementById('prodDesc').value || 'Descripción';
  const img = imgSrc || (editingProdId ? data.products.find(p => p.id === editingProdId)?.img : 'images/logo.png');
  document.getElementById('previewProd').innerHTML = `
    <img src="${img}" style="max-height:120px">
    <h4>${name}</h4>
    <p style="font-size:0.85rem;color:var(--muted)">${desc.substring(0, 100)}${desc.length > 100 ? '...' : ''}</p>
  `;
}

function editProduct(id) {
  const p = data.products.find(x => x.id === id);
  if (!p) return;
  editingProdId = id;
  document.getElementById('editProdId').value = id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodCat').value = p.cat;
  document.getElementById('prodDesc').value = p.desc;
  document.getElementById('prodStock').checked = p.available;
  document.getElementById('prodImg').value = '';
  updateProdPreview(p.img);
  showAdminTab('productosAdmin');
  document.querySelectorAll('.admin-tab')[1]?.classList.add('active');
}

async function saveProduct() {
  const name = document.getElementById('prodName').value.trim();
  const cat = document.getElementById('prodCat').value;
  const desc = document.getElementById('prodDesc').value.trim();
  const available = document.getElementById('prodStock').checked;
  const file = document.getElementById('prodImg').files[0];
  const id = editingProdId || Date.now();

  if (!name) { alert('Nombre obligatorio'); return; }

  showLoading(true);
  try {
    let imgUrl = editingProdId ? (data.products.find(p => p.id === id)?.img || '') : '';
    if (file) {
      imgUrl = await uploadImage(file, `products/${id}_${file.name}`);
    }
    if (!imgUrl) imgUrl = 'images/logo.png';

    const prod = { id, name, cat, price: 0, desc, img: imgUrl, available };
    await saveProductToFb(prod);

    const existing = data.products.findIndex(p => p.id === id);
    if (existing >= 0) data.products[existing] = prod;
    else data.products.unshift(prod);

    renderProductsAdmin();
    clearProdForm();
    alert('Producto guardado en Firebase');
  } catch (e) {
    alert('Error: ' + e.message);
  }
  showLoading(false);
}

function clearProdForm() {
  editingProdId = null;
  document.getElementById('editProdId').value = '';
  document.getElementById('prodName').value = '';
  document.getElementById('prodDesc').value = '';
  document.getElementById('prodImg').value = '';
  document.getElementById('prodStock').checked = true;
  document.getElementById('previewProd').innerHTML = '';
}

async function deleteProduct(id) {
  if (!confirm('¿Borrar este producto?')) return;
  const prod = data.products.find(p => p.id === id);
  showLoading(true);
  try {
    await deleteProductFromFb(id, prod?.img);
    data.products = data.products.filter(p => p.id !== id);
    renderProductsAdmin();
    alert('Producto borrado');
  } catch (e) {
    alert('Error: ' + e.message);
  }
  showLoading(false);
}

async function saveConfig() {
  data.phone = document.getElementById('editPhone').value;
  data.whatsapp = document.getElementById('editWhatsapp').value.replace(/\D/g, '');
  data.instagram = document.getElementById('editInstagram').value.replace('@', '');
  showLoading(true);
  try {
    await saveConfigToFb(data);
    alert('Configuración guardada en Firebase');
    renderGallery();
  } catch (e) {
    alert('Error: ' + e.message);
  }
  showLoading(false);
}

async function savePass() {
  const np = document.getElementById('editPass').value.trim();
  if (np.length < 4) { alert('Mínimo 4 caracteres'); return; }
  data.adminPass = np;
  showLoading(true);
  try {
    await saveConfigToFb(data);
    alert('Clave actualizada');
    document.getElementById('editPass').value = '';
  } catch (e) {
    alert('Error: ' + e.message);
  }
  showLoading(false);
}

function renderAll() {
  renderGallery();
  renderProducts();
}
