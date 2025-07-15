import './App.css'
import {BrowserRouter, Routes, Route, useSearchParams} from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import CategoryProductsPage from './pages/CategoryProductsPage'
import ProductPage from './pages/ProductPage'
import { createContext, useState, useEffect } from 'react'
import Cart from './pages/Cart'

const AuthContext = createContext()

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('http://localhost:5000/auth/status', {credentials: "include"})
    .then(res => res.json())
    .then(data => {
      setIsLoggedIn(data.data.logged_in)
    })
  }, [])

  return (
    <BrowserRouter>
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
      <Routes>
        <Route path='/' element={<Home></Home>}/>
        <Route path='signup' element={<Signup></Signup>}/>
        <Route path='login' element={<Login></Login>}/>
        <Route path='/category/:categoryName' element={<CategoryProductsPage></CategoryProductsPage>}/>
        <Route path='product/:productId' element={<ProductPage></ProductPage>}/>
        <Route path='cart' element={<Cart></Cart>}/>
      </Routes>
    </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App
export {AuthContext}
