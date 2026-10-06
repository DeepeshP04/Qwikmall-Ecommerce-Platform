import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import CategoryProductsPage from './pages/CategoryProductsPage'
import ProductPage from './pages/ProductPage'
import { createContext, useContext, useState, useEffect } from 'react'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import AllProductsPage from './pages/AllProductsPage';
import { ToastContainer } from 'react-toastify'
import UserAccount from './pages/UserAccount'
import LegalPage from './pages/LegalPage'
import Loader from './components/loader/Loader'
import AdminPage from './pages/AdminPage'

const AuthContext = createContext()

function ProtectedRoute({ children }) {
  const { isLoggedIn, isAuthLoading } = useContext(AuthContext)
  const location = useLocation()

  if (isAuthLoading) {
    return <Loader />
  }

  return isLoggedIn
    ? children
    : <Navigate to="/login" replace state={{ from: location }} />
}

function GuestRoute({ children }) {
  const { isLoggedIn, isAuthLoading } = useContext(AuthContext)

  if (isAuthLoading) {
    return <Loader />
  }

  return isLoggedIn ? <Navigate to="/" replace /> : children
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkAuthStatus() {
      try {
        const response = await fetch('http://localhost:5000/auth/status', {
          credentials: "include",
        })
        const data = await response.json()

        if (isMounted) {
          setIsLoggedIn(Boolean(data?.data?.logged_in))
          if (!response.ok && response.status !== 401) {
            console.error("Unable to check authentication status:", data?.message || response.statusText)
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false)
          console.error("Unable to check authentication status:", error)
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    checkAuthStatus()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <BrowserRouter>
    <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn, isAuthLoading}}>
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/signup' element={<GuestRoute><Signup /></GuestRoute>}/>
        <Route path='/login' element={<GuestRoute><Login /></GuestRoute>}/>
        <Route path='/privacy' element={<LegalPage />}/>
        <Route path='/terms' element={<LegalPage />}/>
        <Route path='/admin' element={<AdminPage />}/>
        <Route path='/category/:categoryName' element={<CategoryProductsPage />}/>
        <Route path='/product/:productId' element={<ProductPage />}/>
        <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>}/>
        <Route path='/checkout' element={<ProtectedRoute><Checkout /></ProtectedRoute>}/>
        <Route path='/products' element={<AllProductsPage />}/>
        <Route path='/account' element={<ProtectedRoute><UserAccount /></ProtectedRoute>}/>
        <Route path='*' element={<Navigate to="/" replace />}/>
      </Routes>
      <ToastContainer />
    </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App
export {AuthContext}
