async function fetcart() {
    try{
        const response=await fetch('api/cart/')
        const data=await response.json()
        const cartcontainer=document.getElementById('cart-items');
        cartcontainer.innerHTML=''
        data.forEach(element => {
cartcontainer.innerHTML+=`
<tr>
                           <td class="product-thumbnail">
                            <img src="images/product-1.png" alt="Image" class="img-fluid">
                          </td>
                          <td class="product-name">
                            <h2 class="h5 text-black">${element.product}</h2>
                          </td>
                          <td>$${element.price}</td>
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
                          <td>$${element.total}</td>
                          <td><a href="#" class="btn btn-black btn-sm">X</a></td> 
                        </tr>`
        });
    }
     catch(error) {
        console.error("Error fetching cart:", error);
    }
}

async function increaseCart(id) {
    await fetch(`/api/cart/increase/${id}/`, {
        method: "POST"
    });

    fetchCart();
}
async function decreaseCart(id) {
    await fetch(`api/cart/decrease/${id}`,{
        method:"POST"
    });
    fetchCart()
    
}
async function removeCart(id) {
    await fetch(`/api/cart/remove/${id}/`, {
        method: "DELETE"
    });

    fetchCart();
}