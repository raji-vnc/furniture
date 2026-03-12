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

	function imageUrl(path) {
		if (!path) return '/static/images/product-1.png';
		if (path.startsWith('http') || path.startsWith('/')) return path;
		return `/media/${path}`;
	}

	products.forEach(product => {
		const img = imageUrl(product.image || product.image_url || '');
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
		</div>
		`;
		container.innerHTML += html;
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