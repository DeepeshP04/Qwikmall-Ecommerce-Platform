import Navbar from '../components/header/Navbar'
import Main from '../components/main/Main'
import Footer from '../components/footer/Footer'
import FilterPanel from '../components/products/FilterPanel';

function Home() {
    return (
        <>
            <Navbar></Navbar>
            <Main></Main>
            <Footer></Footer>
            <FilterPanel></FilterPanel>
        </>
    )
}

export default Home;