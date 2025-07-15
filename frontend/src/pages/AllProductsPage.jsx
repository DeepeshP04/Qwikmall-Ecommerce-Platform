import Footer from "../components/footer/Footer";
import Navbar from "../components/header/Navbar";
import CategoryAllProducts from "../components/products/CategoryAllProducts";
import { useEffect, useState } from "react";
import Loader from "../components/Loader/loader";

function AllProductsPage () {
    const [allProducts, setAllProducts] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        fetch(`http://localhost:5000/products/`)
        .then(res => res.json())
        .then(data => {
            setAllProducts(data.data.products || [])
            console.log(data.data)
            setIsLoading(false)
        })
        .catch(err => {
            setIsLoading(false)
            console.log("Failed to fetch all products", err)
        })
    }, [])

    return (
        <>
            <Navbar />
            {isLoading ? <Loader /> : <CategoryAllProducts categoryName="None" products={allProducts}/>}
            <Footer />
        </>
    )
}

export default AllProductsPage; 