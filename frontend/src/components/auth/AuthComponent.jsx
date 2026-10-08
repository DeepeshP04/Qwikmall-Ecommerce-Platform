import { useContext, useEffect, useState } from 'react';
import './AuthComponent.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { API_URL } from '../../config/api';

function AuthComponent({ isLogin, redirectTo, showAuthSwitch = true }) {
    const [phone, setPhone] = useState("")
    const [error, setError] = useState("")
    const [codeSent, setCodeSent] = useState(false)
    const [code, setCode] = useState("")
    const [username, setUsername] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [otpCooldown, setOtpCooldown] = useState(0)
    const { setIsLoggedIn } = useContext(AuthContext)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (otpCooldown === 0) {
            return undefined
        }

        const timer = window.setTimeout(() => {
            setOtpCooldown((seconds) => Math.max(seconds - 1, 0))
        }, 1000)

        return () => window.clearTimeout(timer)
    }, [otpCooldown])

    function validatePhone() {
        return /^[0-9]{10}$/.test(phone)
    }

    async function requestOtp() {
        setError("")

        if (!validatePhone()) {
            setError("Phone number must be exactly 10 digits.")
            return
        }
        if (!isLogin && !username.trim()) {
            setError("Enter a username.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(
                `${API_URL}/auth/${isLogin ? "login" : "signup"}/request-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...(isLogin ? {} : { username: username.trim() }),
                        mobile: `+91${phone}`,
                    }),
                    credentials: "include",
                },
            )
            const data = await response.json()

            if (!response.ok || !data?.success) {
                setError(data?.message || "Unable to send a verification code. Please try again.")
                return
            }

            setCodeSent(true)
            setCode("")
            setOtpCooldown(30)
        } catch {
            setError("Unable to send a verification code. Please check your connection and try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    async function handleAuth(event) {
        event.preventDefault()

        if (!codeSent) {
            await requestOtp()
            return
        }

        setError("")
        if (!/^[0-9]{6}$/.test(code)) {
            setError("Enter a valid 6-digit code.")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(
                `${API_URL}/auth/${isLogin ? "login" : "signup"}/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                    credentials: "include",
                },
            )
            const data = await response.json()

            if (!response.ok || !data?.success) {
                setError(data?.message || "Verification failed. Check the code and try again.")
                return
            }

            setIsLoggedIn(true)
            navigate(redirectTo || location.state?.from?.pathname || "/", { replace: true })
        } catch {
            setError("Unable to verify the code. Please check your connection and try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleBackToPhone() {
        setCodeSent(false)
        setCode("")
        setError("")
    }

    function handleInputKeyDown(event) {
        if (event.key === "Enter") {
            event.preventDefault()
            if (!isSubmitting) {
                handleAuth(event)
            }
        }
    }

    return (
        <div className="auth-container">
            <div className="left-box">
                <span>{isLogin ? "Login" : "Looks like you're new here!"}</span>
                <p>{isLogin ? "Get access to your Orders, Wishlist and Recommendations" : "Sign up with your mobile number to get started"}</p>
            </div>
            <div className="right-box">
                <form className="form-section" onSubmit={handleAuth}>
                    <div className="input-section">
                        {!isLogin && !codeSent && (
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Enter Username"
                                autoComplete="username"
                                aria-label="Username"
                                required
                                value={username}
                                onKeyDown={handleInputKeyDown}
                                onChange={(event) => setUsername(event.target.value)}
                            />
                        )}
                        {!codeSent ? (
                            <div className="phone-space">
                                <span id="country-code-span">+91</span>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter Phone Number"
                                    aria-label="10-digit phone number"
                                    autoComplete="tel-national"
                                    inputMode="numeric"
                                    pattern="[0-9]{10}"
                                    minLength="10"
                                    maxLength="10"
                                    required
                                    value={phone}
                                    onKeyDown={handleInputKeyDown}
                                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                                />
                            </div>
                        ) : (
                            <>
                                <button className="back-button" type="button" onClick={handleBackToPhone}>
                                    ← Back
                                </button>
                                <input
                                    id="code"
                                    type="text"
                                    name="code"
                                    placeholder="Enter 6-digit code"
                                    aria-label="6-digit verification code"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength="6"
                                    required
                                    value={code}
                                    onKeyDown={handleInputKeyDown}
                                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                />
                            </>
                        )}
                        {error && <p id="error-message" role="alert">{error}</p>}
                    </div>
                    <div className="terms-section">
                        {!codeSent && (
                            <p>
                                By continuing, you agree to QwikMall's <Link to="/terms">Terms of Use</Link> and{' '}
                                <Link to="/privacy">Privacy Policy</Link>.
                            </p>
                        )}
                    </div>
                    <div className="button-section">
                        <button id="submit-btn" type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? (codeSent ? "Verifying..." : "Requesting OTP...")
                                : (codeSent ? "Verify Code" : "Request OTP")}
                        </button>
                        {codeSent && (
                            <button
                                className="resend-code-button"
                                type="button"
                                onClick={requestOtp}
                                disabled={isSubmitting || otpCooldown > 0}
                            >
                                {isSubmitting
                                    ? "Sending code..."
                                    : otpCooldown > 0
                                        ? `Get code again in 00:${String(otpCooldown).padStart(2, "0")}`
                                        : "Get code again"}
                            </button>
                        )}
                    </div>
                </form>
                {showAuthSwitch && (
                    <div className="go-to-login-section">
                        <Link to={isLogin ? "/signup" : "/login"}>{isLogin ? "New to Qwikmall? Create an account" : "Existing User? Log in"}</Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AuthComponent;
