import { useEffect, useState } from 'react';
import './AuthComponent.css'
import { Link } from 'react-router-dom';

function AuthComponent({ isLogin }) {
    const [phone, setPhone] = useState("")
    const [error, setError] = useState("")
    const[codeSent, setCodeSent] = useState(false)
    const [code, setCode] = useState("")
    const [username, setUsername] = useState("")

    function validatePhone () {
        const regex = /^[0-9]{10}$/
        return regex.test(phone)
    }

    function handleAuth () {
        // Login
        if (isLogin) {
            // Send code for login
            if (!codeSent) {
                if (!validatePhone()) {
                    setError("Phone number must be exactly 10 digits.")
                } else{
                    setError("")

                    const fullPhone = "+91" + phone
                    fetch('http://localhost:5000/auth/login/send-code', {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json"
                        },
                        body: JSON.stringify(
                            {phone: fullPhone}
                        ),
                        credentials: "include"
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data?.success) {
                            setCodeSent(true)
                        }
                    })
                    .catch(err => console.log("Error sending code", err))
                }
            // Verify code for login
            } else {
                if (code.length !== 6){
                    setError("Enter a valid 6-digit code.")
                    return
                } else {
                    setError("")
                    fetch("http://localhost:5000/auth/login/verify-code", {
                        method: "POST", 
                        headers: {
                            "Content-type": "application/json"
                        },
                        body: JSON.stringify(
                            {code: code}
                        ),
                        credentials: "include"
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            console.log("Logged in!")
                        } else{
                            setError(data.message || "Verification failed")
                        }
                    })
                    .catch(err => console.log("Verification error", err))
                }
            }
        // Signup
        } else {
            if (!codeSent) {
                if (!validatePhone()) {
                    setError("Phone number must be exactly 10 digits.")
                } else {
                    setError("")

                    fetch("http://localhost:5000/auth/signup/send-code", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(
                            {username: username, phone: phone}
                        ),
                        credentials: "include"
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success){
                            setCodeSent(true)
                        }
                    })
                    .catch(err => console.log("Error sending code", err))
                }
            }
        }
    }

    return (
        <div className="auth-container">
            <div className="left-box">
                <span>{ isLogin ? "Login" : "Looks like you're new here!" }</span>
                <p>{ isLogin ? "Get access to your Orders, Wishlist and Recommendations" : "Sign up with your mobile number to get started" }</p>
            </div>
            <div className="right-box">
                <div className="form-section">
                    <div className="input-section">
                        { !isLogin && (<input id="username" type='text' name='username' placeholder='Enter Username' required onChange={(e) => setUsername(e.target.value)}></input>)} 
                        {!codeSent ? (<div className='phone-space'>
                            <span id="country-code-span">+91</span>
                            <input id="phone" type="tel" name="phone" placeholder="Enter Phone Number" minLength="10" maxLength="10" required onChange={(e) => setPhone(e.target.value)}></input>
                        </div>) : (
                            <input id="code" type='number' placeholder='Enter code' maxLength="6" required onChange={(e) => setCode(e.target.value)}></input>
                        )}
                        {error && <p id="error-message">{error}</p>}
                    </div>
                    <div className="terms-section">
                        {!codeSent && (<p>By continuing, you agree to QwikMall's <a href=''>Terms of Use</a> and <a href=''>Privacy Policy</a>.</p>)}
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit" onClick={handleAuth}>{!codeSent ? "Request OTP" : "Verify Code"}</button>
                    </div>
                </div>
                <div className="go-to-login-section">
                    <Link to={ isLogin ? "/signup" : "/login" }>{ isLogin ? "New to Qwikmall? Create an account" : "Existing User? Log in" }</Link>
                </div>
            </div>
        </div>
    )
}

export default AuthComponent;