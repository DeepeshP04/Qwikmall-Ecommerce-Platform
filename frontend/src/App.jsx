import './App.css'
import {BrowserRouter, Routes, Route, useSearchParams} from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import CategoryProductsPage from './pages/CategoryProductsPage'
import ProductPage from './pages/ProductPage'
import { createContext, useState } from 'react'

const AuthContext = createContext()

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <BrowserRouter>
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
      <Routes>
        <Route path='/' element={<Home></Home>}/>
        <Route path='signup' element={<Signup></Signup>}/>
        <Route path='login' element={<Login></Login>}/>
        <Route path='/category/:categoryId' element={<CategoryProductsPage></CategoryProductsPage>}/>
        <Route path='product/:productId' element={<ProductPage></ProductPage>}/>
      </Routes>
    </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App
export {AuthContext}
