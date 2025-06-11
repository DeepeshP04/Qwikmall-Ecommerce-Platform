import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import CategoryProductsPage from './pages/CategoryProductsPage'
import ProductPage from './pages/ProductPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home></Home>}/>
        <Route path='signup' element={<Signup></Signup>}/>
        <Route path='login' element={<Login></Login>}/>
        <Route path='/category/:categorySlug' element={<CategoryProductsPage></CategoryProductsPage>}/>
        <Route path='product/:productId' element={<ProductPage></ProductPage>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
