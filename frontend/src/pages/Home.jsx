import Navbar from '../components/header/Navbar'
import Main from '../components/main/Main'
import Footer from '../components/footer/Footer'
import CategoryAllProducts from '../components/products/CategoryAllProducts';

function Home() {
    const products = [
        {id: 1, name: "Laptop", price: "₹50000"},
        {id: 2, name: "Laptop", price: "₹50000"},
        {id: 3, name: "Laptop", price: "₹50000"},
        {id: 4, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
        {id: 5, name: "Laptop", price: "₹50000"},
    ]

    return (
        <>
            <Navbar></Navbar>
            <Main></Main>
            <Footer></Footer>
            <CategoryAllProducts categoryName="Electronics" products={products}></CategoryAllProducts>
        </>
    )
}

export default Home;