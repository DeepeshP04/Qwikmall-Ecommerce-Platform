const productCard = document.querySelectorAll(".product-card")

productCard.forEach(element => {
    element.addEventListener("click", showAllProducts)
});

function showAllProducts(){
    window.location.href = "/categories_all_products"
}