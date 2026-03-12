const API_URL = "/api/products/products/";

fetch(API_URL)
.then(res => res.json())
.then(data => {

    let products = data.results;

    let container = document.getElementById("container");

    function imageUrl(path) {
        if (!path) return '/static/images/product-1.png';
        if (path.startsWith('http') || path.startsWith('/')) return path;
        return `/media/${path}`;
    }

    products.slice(0,3).forEach(product => {
        const img = imageUrl(product.image || product.image_url || '');

        container.innerHTML += `
        <div class="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
            <a class="product-item" href="cart.html">
                <img src="${img}" class="img-fluid product-thumbnail">
                <h3 class="product-title">${product.name}</h3>
                <strong class="product-price">$${product.price}</strong>
            </a>
        </div>
        `;

    });

})
.catch(error => console.log(error));