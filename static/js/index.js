const API_URL='http://127.0.0.1.8000/api/products'

fetch(API_URL)
.then(res=>res.json())
.then(products=>{
    let container=document.getElementById('container')
    products.slice(0,3).forEach(element => {
       container.innerHTML+=`` 
    });
})