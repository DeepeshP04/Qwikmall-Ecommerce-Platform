import './App.css'
import AuthComponent from './components/auth/signup/AuthComponent'
import Footer from './components/footer/Footer'
import Navbar from './components/header/Navbar'
import Main from './components/main/Main'

function App() {

  return (
    <>
      <Navbar></Navbar>
      <Main></Main>
      <AuthComponent></AuthComponent>
      <Footer></Footer>
    </>
  )
}

export default App
