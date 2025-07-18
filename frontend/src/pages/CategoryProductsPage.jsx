import { useParams } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import CategoryAllProducts from "../components/products/CategoryAllProducts";
import { useEffect, useState } from "react";
import Loader from "../components/Loader/loader";

function CategoryProductsPage () {
    const {categoryId} = useParams()
    const [categoryProducts, setCategoryProducts] = useState({category_name: "", products: []})
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        fetch(`http://localhost:5000/products/category/${categoryId}`)
        .then(res => res.json())
        .then(data => {
            setCategoryProducts(data)
            setIsLoading(false)
        })
        .catch(err => console.log("Failed to fetch products", err))
    }, [categoryId])

    return (
        <>
            <Navbar></Navbar>
            {isLoading ? <Loader /> : <CategoryAllProducts categoryName={categoryProducts.category_name} products={categoryProducts.products}></CategoryAllProducts>}
            <Footer></Footer>
        </>
    )
}

export default CategoryProductsPage;