const api='api/cart/';
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
            }
        });
    }
    return cookieValue;
}

const CSRF_TOKEN = getCookie('csrftoken');

async function loadCart() {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN,
      },
      credentials: 'include',  // sends session cookie for IsAuthenticated
    });
 
    if (response.status === 401 || response.status === 403) {
      alert('Please log in to view your cart.');
      return;
    }
 
    const items = await response.json();
    renderCartItems(items);
    updateCartTotal(items);
 
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}
 
function renderCartItems(items) {
  const tbody = document.getElementById('cart-items');
  tbody.innerHTML = '';
 
  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <p class="text-muted">Your cart is empty.</p>
        </td>
      </tr>`;
    return;
  }
 
  items.forEach(item => {
    const total = (item.price * item.quantity).toFixed(2);
    const row = `
      <tr id="row-${item.id}">
        <td class="product-thumbnail">
          <img src="${item.image || '/static/images/product-placeholder.png'}" 
               alt="${item.product_name}" class="img-fluid" style="width:80px;">
        </td>
        <td class="product-name">
          <h2 class="h5 text-black">${item.product_name}</h2>
        </td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>
          <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
            <div class="input-group-prepend">
              <button class="btn btn-outline-black decrease" type="button" 
                      onclick="changeQuantity(${item.id}, -1)">&minus;</button>
            </div>
            <input type="text" class="form-control text-center quantity-amount" 
                   id="qty-${item.id}" value="${item.quantity}" readonly>
            <div class="input-group-append">
              <button class="btn btn-outline-black increase" type="button" 
                      onclick="changeQuantity(${item.id}, 1)">&plus;</button>
            </div>
          </div>
        </td>
        <td id="total-${item.id}">$${total}</td>
        <td>
          <a href="#" class="btn btn-black btn-sm" onclick="removeItem(${item.id})">X</a>
        </td>
      </tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}
 



