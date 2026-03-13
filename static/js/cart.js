const API_BASE = '/api/cart/';

function safeText(v) {
  return String(v == null ? '' : v);
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

async function fetchCart() {
  try {
    const res = await fetch(API_BASE + 'view/', { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.cart_items || []);

    const cartcontainer = document.getElementById('cart-items');
    if (!cartcontainer) return;
    cartcontainer.innerHTML = '';

    items.forEach(element => {
      const productName = safeText(element.product_name || element.product || 'Product');
      const price = safeText(element.price || '0.00');
      const quantity = safeText(element.quantity || 1);
      const total = safeText(element.total || (price * quantity));
      const cartItemId = element.id || element.cart_item_id || '';
      const productImage = element.image_url || '/static/images/product-1.png';

      cartcontainer.innerHTML += `
        <tr>
          <td class="product-thumbnail">
            <img src="${productImage}" alt="Image" class="img-fluid">
          </td>
          <td class="product-name">
            <h2 class="h5 text-black">${productName}</h2>
          </td>
          <td>$${price}</td>
          <td>
            <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
              <div class="input-group-prepend">
                <button class="btn btn-outline-black decrease" type="button" onclick="decreaseCart(${cartItemId})">&minus;</button>
              </div>
              <input type="text" class="form-control text-center quantity-amount" value="${quantity}" aria-label="quantity">
              <div class="input-group-append">
                <button class="btn btn-outline-black increase" type="button" onclick="increaseCart(${cartItemId})">&plus;</button>
              </div>
            </div>
          </td>
          <td>$${total}</td>
          <td><button class="btn btn-black btn-sm" onclick="removeCart(${cartItemId})">X</button></td>
        </tr>`;
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
  }
}

async function increaseCart(id) {
  if (!id) return;
  try {
    const res = await fetch(API_BASE + `cart/increase/${id}/`, { method: 'POST', credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCookie('csrftoken') } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error('increaseCart error', e);
  }
  fetchCart();
}

async function decreaseCart(id) {
  if (!id) return;
  try {
    const res = await fetch(API_BASE + `cart/decrease/${id}/`, { method: 'POST', credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRFToken': getCookie('csrftoken') } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error('decreaseCart error', e);
  }
  fetchCart();
}

async function removeCart(id) {
  if (!id) return;
  try {
    const res = await fetch(API_BASE + 'remove/', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify({ cart_item_id: id })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error('removeCart error', e);
  }
  fetchCart();
}

window.fetchCart = fetchCart;
window.increaseCart = increaseCart;
window.decreaseCart = decreaseCart;
window.removeCart = removeCart;

async function addToCart(productId, quantity = 1) {
  if (!productId) return;
  console.log('addToCart', productId, quantity);
  try {
    const res = await fetch(API_BASE + 'add/', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    const text = await res.text();
    console.log('addToCart response', res.status, text);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error('addToCart error', e);
  }
  fetchCart();
}

window.addToCart = addToCart;

// Auto-load cart when the page is ready
document.addEventListener('DOMContentLoaded', () => {
  try { fetchCart(); } catch (e) { console.error(e); }
});