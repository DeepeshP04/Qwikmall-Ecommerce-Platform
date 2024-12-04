const angleDownBtn = document.querySelector(".angle-down-btn");
const searchInput = document.querySelector("#search-input");

angleDownBtn.addEventListener("click", dropdownItem)
searchInput.addEventListener("keydown", (event) => {
    if(event.key == "Enter" && searchInput.value.trim() != ""){
        searchProducts()
    }
})

function dropdownItem(){
    const dropdownDiv = document.querySelector(".dropdown")

    if(dropdownDiv.style.display == "none"){
        dropdownDiv.style.display = "block"
    }else{
        dropdownDiv.style.display = "none"
    }
}

function searchProducts(){

}