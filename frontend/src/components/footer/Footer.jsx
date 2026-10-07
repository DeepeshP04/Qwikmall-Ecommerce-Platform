import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const footerGroups = [
    {
        title: 'Your account',
        links: [
            { label: 'Account overview', to: '/account' },
        ],
    },
    {
        title: 'Help',
        links: [
            { label: 'Orders and account', to: '/account' },
            { label: 'Delivery and payment', to: '/checkout' },
            { label: 'Shopping cart', to: '/cart' },
        ],
    },
    {
        title: 'About',
        links: [
            { label: 'Home', to: '/' },
            { label: 'Browse products', to: '/products' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy policy', to: '/privacy' },
            { label: 'Terms of use', to: '/terms' },
        ],
    },
];

const socialLinks = [
    { label: 'Instagram', href: 'https://www.instagram.com/', icon: faInstagram },
    { label: 'Facebook', href: 'https://www.facebook.com/', icon: faFacebookF },
    { label: 'X', href: 'https://x.com/', icon: faXTwitter },
];

function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="site-footer">
            <div className="footer-main">
                <div className="footer-brand">
                    <Link className="footer-logo" to="/">Qwik<span>Mall</span></Link>
                    <p>
                        Discover products for everyday life. Browse the collection,
                        save your favorites, and manage your shopping in one place.
                    </p>
                    <Link className="footer-browse-link" to="/products">
                        Explore all products <span aria-hidden="true">→</span>
                    </Link>
                </div>

                {footerGroups.map((group) => (
                    <nav className="footer-link-group" aria-label={group.title} key={group.title}>
                        <h2>{group.title}</h2>
                        {group.links.map((link) => (
                            <Link to={link.to} key={`${group.title}-${link.label}`}>{link.label}</Link>
                        ))}
                    </nav>
                ))}

                <div className="footer-connect">
                    <h2>Connect with us</h2>
                    <p>Follow QwikMall and keep up with what’s new.</p>
                    <div className="footer-social-links">
                        {socialLinks.map((social) => (
                            <a
                                aria-label={social.label}
                                href={social.href}
                                key={social.label}
                                rel="noopener noreferrer"
                                target="_blank"
                                title={social.label}
                            >
                                <FontAwesomeIcon icon={social.icon} aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} QwikMall. All rights reserved.</p>
                <span className="footer-bottom-note">Made for easier everyday shopping.</span>
                <button className="footer-top-button" onClick={scrollToTop} type="button">
                    Back to top <FontAwesomeIcon icon={faArrowUp} aria-hidden="true" />
                </button>
            </div>
        </footer>
    );
}

export default Footer;
