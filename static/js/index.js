const API_URL = 'http://127.0.0.1:8000/api/products/'

fetch(API_URL)
.then(res => res.json())
.then(products => {

    let container = document.getElementById('container')

    products.slice(0,3).forEach(product => {

        container.innerHTML += `
        <div class="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
            <a class="product-item" href="cart.html">
                <img src="${product.image}" class="img-fluid product-thumbnail">
                <h3 class="product-title">${product.name}</h3>
                <strong class="product-price">$${product.price}</strong>
            </a>
        </div>
        `

    })

})