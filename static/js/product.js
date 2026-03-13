const API_URL = '/api/products/products/';

async function fetchProducts({ page = 1, page_size = 12, search = '', ordering = '' } = {}) {
	const params = new URLSearchParams();
	params.set('page', page);
	params.set('page_size', page_size);
	if (search) params.set('search', search);
	if (ordering) params.set('ordering', ordering);

	const res = await fetch(`${API_URL}?${params.toString()}`);
	if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
	return res.json();
}

function renderProducts(data) {
	const container = document.getElementById('container');
	if (!container) return;
	container.innerHTML = '';

	const products = Array.isArray(data) ? data : (data.results || []);
	console.log('renderProducts: found', (products && products.length) || 0, 'products');

	function imageUrl(path) {
		if (!path) return '/static/images/product-1.png';
		if (path.startsWith('http') || path.startsWith('/')) return path;
		return `/media/${path}`;
	}

	products.forEach(product => {
		const img = imageUrl(product.image || product.image_url || '');
		const pid = product.id || product.pk || '';
		const html = `
		<div class="col-12 col-md-4 col-lg-3 mb-5">
			<a class="product-item" href="/products/cart/">
				<img src="${img}" class="img-fluid product-thumbnail">
				<h3 class="product-title">${product.name || ''}</h3>
				<strong class="product-price">$${product.price || ''}</strong>

				<span class="icon-cross">
					<img src="/static/images/cross.svg" class="img-fluid">
				</span>
			</a>
			<div class="mt-2 text-center">
				<button class="btn btn-sm btn-primary btn-add-cart" data-product-id="${pid}">Add to cart</button>
			</div>
		</div>
		`;
		container.innerHTML += html;
	});

	// Delegated handler for Add to cart buttons
	container.addEventListener('click', (e) => {
		const btn = e.target.closest('.btn-add-cart');
		if (!btn) return;
		const pid = btn.getAttribute('data-product-id');
		console.log('Add to cart clicked', pid);
		if (!pid) {
			console.warn('Product id missing for add-to-cart');
			return;
		}
		if (typeof window.addToCart === 'function') {
			try { window.addToCart(Number(pid), 1); } catch (err) { console.error('addToCart call failed', err); }
		} else {
			// fallback: call API directly, include CSRF if available
			const csrftoken = (function(){
				const name='csrftoken'; let cookieValue=null; if(document.cookie&&document.cookie!==''){document.cookie.split(';').forEach(c=>{const t=c.trim(); if(t.startsWith(name+'=')){cookieValue=decodeURIComponent(t.substring(name.length+1));}});} return cookieValue;
			})();
			fetch('/api/cart/add/', {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json', ...(csrftoken?{'X-CSRFToken':csrftoken}:{}) },
				body: JSON.stringify({ product_id: Number(pid), quantity: 1 })
			}).then(r => { console.log('fallback addToCart', r.status); return r.text(); }).then(t=>console.log('fallback resp', t)).catch(err => console.error(err));
		}
	});
}

function renderPagination(data) {
	const paginateRoot = document.getElementById('pagination');
	if (!paginateRoot || !data) return;
	paginateRoot.innerHTML = '';
	const current = data.current_page || 1;
	const total = data.total_pages || Math.ceil((data.count || 0) / (data.page_size || 12));

	for (let p = 1; p <= total; p++) {
		const btn = document.createElement('button');
		btn.className = (p === current) ? 'btn btn-primary me-2' : 'btn btn-outline-primary me-2';
		btn.textContent = p;
		btn.addEventListener('click', () => load({ page: p }));
		paginateRoot.appendChild(btn);
	}
}

async function load(opts = {}) {
	try {
		const data = await fetchProducts(opts);
		renderProducts(data);
		renderPagination(data);
	} catch (err) {
		console.error('Failed to load products', err);
	}
}

// initial load when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	load({ page: 1, page_size: 12 });
});