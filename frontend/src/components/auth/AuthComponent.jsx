import { useEffect, useState } from 'react';
import './AuthComponent.css'
import { Link } from 'react-router-dom';

function AuthComponent({ isLogin }) {
    const [phone, setPhone] = useState("")

    function handleAuth () {
        if (isLogin) {
            fetch('http://localhost:5000/auth/login/send-code', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(
                    {phone: phone}
                )
            })
            .then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.log("Error sending code", err))
        } else {

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
                        { !isLogin && (<input id="username" type='text' name='username' placeholder='Enter Username' required></input>)} 
                        <div className='phone-space'>
                            <span id="country-code-span">+91</span>
                            <input id="phone" type="tel" name="phone" placeholder="Enter Phone Number" pattern='[0-9]{10}' minLength="10" maxLength="10" required onChange={(e) => setPhone("+91" + e.target.value)}></input>
                        </div>
                        <p id="error-message"></p>
                    </div>
                    <div className="terms-section">
                        <p>By continuing, you agree to QwikMall's <a href=''>Terms of Use</a> and <a href=''>Privacy Policy</a>.</p>
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit" onClick={handleAuth}>Request OTP</button>
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