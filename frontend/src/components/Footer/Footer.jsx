import './Footer.css';

function Footer () {
    return (
        <div className="footer">
            <div className="footer-links">
                <a className="about" href="">About Us</a>
                <a className="contact" href="">Contact Us</a>
                <a className="privacy" href="">Privacy</a>
                <a className="terms" href="">Terms of Use</a>
            </div>
            <div className="copyright-space">
                <p className="copyright">© 2025 Qwikmall</p>
            </div>
        </div>
    )
}

export default Footer;