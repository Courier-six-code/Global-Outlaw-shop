const products = [
  { id: 's1', name: 'Outlaw Logo Tee', price: 40.0, image: 'BCO.6dc9e41d-3216-4c3f-be6c-e71a3864c4ac.png', category: 'shirts' },
  { id: 's2', name: 'Midnight Street Tee', price: 45.0, image: 'BCO.b2de1f41-150a-434f-8d8d-cb536be7a834.png', category: 'shirts' },
  { id: 's3', name: 'Neon Grid Tee', price: 50.0, image: 'BCO.b3a7f3a2-d159-4552-8c38-5c65532cb057.png', category: 'shirts' },
  { id: 's4', name: 'Waveform Tee', price: 55.0, image: 'Copilot_20251027_083815.png', category: 'shirts' },
  { id: 'k1', name: 'Turbo Runner', price: 60.0, image: 'BCO.2c90bf75-8e4b-4c23-b18b-b2725382a769.png', category: 'shoes' },
  { id: 'k2', name: 'Night Ops Sneaker', price: 70.0, image: 'BCO.5c19bc3a-204c-4a19-b99b-c4838ad3dd5e.png', category: 'shoes' },
  { id: 'k3', name: 'Echo High-Top', price: 80.0, image: 'BCO.fb9cd7f3-cc0a-4b14-be3f-85018f8e01ed.png', category: 'shoes' },
  { id: 'k4', name: 'Aero Glide', price: 90.0, image: 'download.png', category: 'shoes' }
];

const slider = document.querySelector('.slider');
const slideShirts = document.getElementById('slide-shirts');
const slideShoes = document.getElementById('slide-shoes');
const navButtons = document.querySelectorAll('[data-section]');
const shirtsGrid = document.getElementById('shirtsGrid');
const shoesGrid = document.getElementById('shoesGrid');
const cartDrawer = document.getElementById('cartDrawer');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutDialog = document.getElementById('checkoutDialog');
const checkoutForm = document.getElementById('checkoutForm');
const backdrop = document.getElementById('backdrop');

function showSection(sectionId) {
  if (!slideShirts || !slideShoes) return;
  const isShirts = sectionId === 'shirts';
  // Toggle visibility via class
  slideShirts.classList.toggle('hidden', !isShirts);
  slideShoes.classList.toggle('hidden', isShirts);
  // Update accessibility state
  slideShirts.setAttribute('aria-hidden', String(!isShirts));
  slideShoes.setAttribute('aria-hidden', String(isShirts));
}

function setRouteFromHash() {
  const hash = location.hash.toLowerCase();
  if (hash.includes('shoes')) {
    showSection('shoes');
  } else {
    showSection('shirts');
  }
}

function navigateTo(section) {
  if (section === 'shoes') {
    location.hash = '#/shoes';
  } else if (section === 'shirts') {
    if (history.length > 1) history.back();
    else location.hash = '#/shirts';
  }
}

navButtons.forEach((b) => {
  b.addEventListener('click', () => {
    const target = b.getAttribute('data-section');
    navigateTo(target);
  });
});

function formatCurrency(v) {
  return `$${v.toFixed(2)}`;
}

function createCard(p) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='Picture1.png';" />
    <div class="content">
      <div class="row"><strong>${p.name}</strong><span class="price">${formatCurrency(p.price)}</span></div>
      <button class="primary" data-add="${p.id}">Add to Cart</button>
    </div>
  `;
  return el;
}

function renderProducts() {
  if (shirtsGrid) shirtsGrid.innerHTML = '';
  if (shoesGrid) shoesGrid.innerHTML = '';
  products.filter(p => p.category === 'shirts').forEach(p => shirtsGrid.appendChild(createCard(p)));
  products.filter(p => p.category === 'shoes').forEach(p => shoesGrid.appendChild(createCard(p)));
}

let cart = {};

function loadCart() {
  try {
    const raw = localStorage.getItem('gos_cart');
    cart = raw ? JSON.parse(raw) : {};
  } catch { cart = {}; }
}

function saveCart() {
  localStorage.setItem('gos_cart', JSON.stringify(cart));
}

function cartCount() {
  return Object.values(cart).reduce((a, c) => a + c.qty, 0);
}

function cartTotal() {
  return Object.values(cart).reduce((a, c) => a + c.qty * c.price, 0);
}

function updateCartUI() {
  cartItemsEl.innerHTML = '';
  Object.values(cart).forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='Picture1.png';" />
      <div>
        <div class="row"><strong>${item.name}</strong><span class="price">${formatCurrency(item.price)}</span></div>
        <div class="qty">
          <button data-dec="${item.id}">-</button>
          <span>${item.qty}</span>
          <button data-inc="${item.id}">+</button>
        </div>
      </div>
      <button class="icon-btn" data-del="${item.id}">Remove</button>
    `;
    cartItemsEl.appendChild(row);
  });
  cartTotalEl.textContent = formatCurrency(cartTotal());
  cartCountEl.textContent = cartCount();
  saveCart();
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  if (!cart[id]) cart[id] = { id: p.id, name: p.name, price: p.price, image: p.image, qty: 0 };
  cart[id].qty += 1;
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  updateCartUI();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartUI();
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.matches('[data-add]')) addToCart(t.getAttribute('data-add'));
  if (t.matches('[data-inc]')) changeQty(t.getAttribute('data-inc'), 1);
  if (t.matches('[data-dec]')) changeQty(t.getAttribute('data-dec'), -1);
  if (t.matches('[data-del]')) removeFromCart(t.getAttribute('data-del'));
});

function openCart() {
  cartDrawer.classList.add('open');
  backdrop.classList.add('show');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  backdrop.classList.remove('show');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
backdrop.addEventListener('click', () => { closeCart(); if (checkoutDialog.open) checkoutDialog.close('cancel'); });

clearCartBtn.addEventListener('click', () => { cart = {}; updateCartUI(); });

checkoutBtn.addEventListener('click', () => {
  if (cartCount() === 0) return;
  if (typeof checkoutDialog.showModal === 'function') checkoutDialog.showModal();
  else checkoutDialog.setAttribute('open', '');
});

checkoutDialog.addEventListener('close', () => {
  if (checkoutDialog.returnValue === 'submit') {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    if (!name || !email || !address) return;
    cart = {};
    updateCartUI();
    closeCart();
    alert('Order placed! A confirmation has been sent.');
  }
});

checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  checkoutDialog.close('submit');
});

renderProducts();
loadCart();
updateCartUI();
setRouteFromHash();
window.addEventListener('hashchange', setRouteFromHash);
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
