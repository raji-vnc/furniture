const API_BASE='http://127.0.0.1:8000/api/cart/cart/';

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

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});
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
    <tr>
    <td class="product-thumbnail">
                            <img src="images/product-1.png" alt="Image" class="img-fluid">
                          </td>
                          <td class="product-name">
                            <h2 class="h5 text-black">${item.name}</h2>
                          </td>
                          <td>$${item.price}</td>
                          <td>
                            <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
                              <div class="input-group-prepend">
                                <button class="btn btn-outline-black decrease" type="button">&minus;</button>
                              </div>
                              <input type="text" class="form-control text-center quantity-amount" value="1" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
                              <div class="input-group-append">
                                <button class="btn btn-outline-black increase" type="button">&plus;</button>
                              </div>
                            </div>
        
                          </td>
                          <td>$49.00</td>
                          <td><a href="#" class="btn btn-black btn-sm">X</a></td
    
    </tr>  `
      ;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}
 
//  const API_BASE = 'http://127.0.0.1:8000/api/cart/';

// document.addEventListener('DOMContentLoaded', () => {
//   loadCart();
// });

// async function loadCart() {
//   try {
//     const response = await fetch(API_BASE, {
//       credentials: 'include'
//     });

//     const data = await response.json();
//     console.log('CART:', data);

//     renderCartItems(data);

//   } catch (error) {
//     console.error(error);
//   }
// }

// function renderCartItems(data) {
//   const tbody = document.getElementById('cart-items');
//   tbody.innerHTML = '';

//   const items = data.items || data;

//   if (!items.length) {
//     tbody.innerHTML = `<tr><td colspan="6">Cart empty</td></tr>`;
//     return;
//   }

//   items.forEach(item => {
//     const total = (item.price * item.quantity).toFixed(2);

//     const row = `
//     <tr>
//       <td><img src="/media/${item.image}" width="50"></td>
//       <td>${item.name}</td>
//       <td>$${item.price}</td>
//       <td>${item.quantity}</td>
//       <td>$${total}</td>
//       <td><button>X</button></td>
//     </tr>
//     `;

//     tbody.insertAdjacentHTML('beforeend', row);
//   });
// }



