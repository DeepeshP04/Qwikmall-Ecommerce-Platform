import './App.css'
import AuthComponent from './components/auth/AuthComponent'
import Signup from './components/auth/signup/Signup'
import Footer from './components/footer/Footer'
import Navbar from './components/header/Navbar'
import Main from './components/main/Main'

function App() {

  return (
    <>
      <Navbar></Navbar>
      <Main></Main>
      <Signup></Signup>
      <Footer></Footer>
    </>
  )
}

export default App
