import { Link, useLocation } from 'react-router-dom';
import Footer from '../components/footer/Footer';
import Navbar from '../components/header/Navbar';
import './LegalPage.css';

const legalDocuments = {
    '/privacy': {
        title: 'Privacy Policy',
        paragraphs: [
            'QwikMall uses the account details you provide, such as your name, phone number, and email address, to support account features.',
            'Saved addresses and shopping activity are used to provide checkout, cart, order, and wishlist features. Keep verification codes private and use your account settings to review your profile information.',
        ],
    },
    '/terms': {
        title: 'Terms of Use',
        paragraphs: [
            'Use QwikMall and its account features lawfully and provide accurate information when placing an order.',
            'Product availability and order details are presented in the storefront and checkout flow. An order is subject to confirmation by the service.',
        ],
    },
};

function LegalPage() {
    const { pathname } = useLocation()
    const document = legalDocuments[pathname]

    return (
        <>
            <Navbar />
            <main className="legal-page">
                <article className="legal-content">
                    <h1>{document.title}</h1>
                    {document.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    <Link to="/">Back to shopping</Link>
                </article>
            </main>
            <Footer />
        </>
    )
}

export default LegalPage;
