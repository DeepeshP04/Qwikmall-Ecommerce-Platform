import { data, useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import CategoryAllProducts from "../components/products/CategoryAllProducts";
import { useEffect, useState } from "react";

function CategoryProductsPage () {
    const {categoryId} = useParams()
    const [categoryProducts, setCategoryProducts] = useState({category_name: "", products: []})

    useEffect(() => {
        fetch(`http://localhost:5000/products/category/${categoryId}`)
        .then(res => res.json())
        .then(data => setCategoryProducts(data))
        .catch(err => console.log("Failed to fetch products", err))
    }, [categoryId])

    return (
        <>
            <Navbar></Navbar>
            <CategoryAllProducts categoryName={categoryProducts.category_name} products={categoryProducts.products}></CategoryAllProducts>
            <Footer></Footer>
        </>
    )
}

export default CategoryProductsPage;