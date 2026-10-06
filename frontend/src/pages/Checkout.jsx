import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import './Checkout.css';

const DELIVERY_STEPS = ['Delivery address', 'Payment method', 'Review'];
const DEFAULT_PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives.' },
  { id: 'upi', label: 'UPI', description: 'Pay instantly via UPI apps.' },
  { id: 'card', label: 'Debit / Credit Card', description: 'Use your card for a quick checkout.' },
];

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState({ items: [], total_price: 0, cart_id: null });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    const fetchCartAndAddress = async () => {
      try {
        setLoading(true);
        setError('');

        const cartResponse = await fetch('http://localhost:5000/cart/', { credentials: 'include' });
        const cartData = await cartResponse.json();

        if (!cartResponse.ok) {
          throw new Error(cartData.message || 'Unable to load cart.');
        }

        const normalizedCart = {
          ...cartData.data,
          items: cartData.data.items || [],
          total_price: cartData.data.total_price || 0,
        };

        const selectedIds = location.state?.selectedCartItemIds;
        const itemsForCheckout = Array.isArray(selectedIds)
          ? normalizedCart.items.filter((item) => selectedIds.includes(item.item_id))
          : normalizedCart.items;
        const checkoutSubtotal = itemsForCheckout.reduce(
          (sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0),
          0
        );
        setCart({
          ...normalizedCart,
          items: itemsForCheckout,
          total_price: checkoutSubtotal,
        });

        const addressResponse = await fetch('http://localhost:5000/users/addresses', { credentials: 'include' });
        const addressData = await addressResponse.json();

        if (addressResponse.ok && addressData.data) {
          const parsedAddresses = Array.isArray(addressData.data) ? addressData.data : [addressData.data];
          setAddresses(parsedAddresses);

          const defaultAddress = parsedAddresses.find((address) => address.is_default) || parsedAddresses[0];
          if (defaultAddress) {
            setSelectedAddressId(String(defaultAddress.id));
          }
        } else if (addressResponse.status !== 404) {
          console.warn('Unable to load saved addresses:', addressData.message || addressResponse.statusText);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong while loading checkout details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndAddress();
  }, [location.state]);

  const shippingFee = useMemo(() => (cart.items.length ? 40 : 0), [cart.items.length]);
  const subtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0),
    [cart.items]
  );
  const total = subtotal + shippingFee;

  const selectedAddress = addresses.find((address) => String(address.id) === selectedAddressId) || null;

  const canContinueFromAddress = activeStep === 0 ? !!selectedAddress : true;
  const canContinueFromPayment = activeStep === 1 ? !!selectedPaymentMethod : true;

  const goToNextStep = () => {
    if (activeStep === 0 && !selectedAddress) {
      setError('Please choose a delivery address before continuing.');
      return;
    }

    if (activeStep === 1 && !selectedPaymentMethod) {
      setError('Please select a payment method before continuing.');
      return;
    }

    setError('');
    setActiveStep((current) => Math.min(current + 1, DELIVERY_STEPS.length - 1));
  };

  const goToPreviousStep = () => {
    setError('');
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please choose a delivery address first.');
      return;
    }

    try {
      setPlacingOrder(true);
      setError('');

      const response = await fetch('http://localhost:5000/orders/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          address_id: Number(selectedAddressId),
          payment_method: selectedPaymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to place order.');
      }

      navigate('/account');
    } catch (err) {
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <div className="checkout-container">
            <div className="checkout-main">
              <div className="checkout-header">
                <h1>Checkout</h1>
              </div>
              <div className="checkout-loading">Loading checkout details...</div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !cart.items.length && !addresses.length) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <div className="checkout-error">
            <h2>Checkout unavailable</h2>
            <p>{error}</p>
            <Link to="/cart" className="primary-btn">Back to cart</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!cart.items.length) {
    return (
      <>
        <Navbar />
        <div className="checkout-page">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before starting checkout.</p>
            <Link to="/" className="primary-btn">Continue shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          <main className="checkout-main">
            <div className="checkout-header">
              <h1>Checkout</h1>
              <button type="button" onClick={() => navigate('/cart')}>Back to cart</button>
            </div>

            <div className="checkout-steps">
              {DELIVERY_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`checkout-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'complete' : ''}`}
                >
                  {index + 1}. {step}
                </div>
              ))}
            </div>

            {activeStep === 0 && (
              <section className="checkout-section">
                <h2>Select delivery address</h2>
                <div className="address-list">
                  {addresses.length ? (
                    addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`address-card ${String(address.id) === selectedAddressId ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId(String(address.id))}
                      >
                        <div className="address-card-header">
                          <strong>{address.label || 'Address'}{address.is_default ? ' (Default)' : ''}</strong>
                          <span className="option-badge">{String(address.id) === selectedAddressId ? '✓' : ''}</span>
                        </div>
                        <p>{address.address_line1}</p>
                        <p>
                          {address.address_line2 ? `${address.address_line2}, ` : ''}
                          {address.city}, {address.state} - {address.postal_code}, {address.country}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="review-card">
                      <p>No saved addresses found. Add one from your account to continue.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeStep === 1 && (
              <section className="checkout-section">
                <h2>Select payment method</h2>
                <div className="payment-list">
                  {DEFAULT_PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`payment-card ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="payment-card-header">
                        <strong>{method.label}</strong>
                        <span className="option-badge">{selectedPaymentMethod === method.id ? '✓' : ''}</span>
                      </div>
                      <p>{method.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeStep === 2 && (
              <section className="checkout-section">
                <h2>Review items and shipping</h2>
                <div className="checkout-review">
                  <div className="review-card">
                    <h3>Shipping to</h3>
                    {selectedAddress ? (
                      <div>
                        <p>{selectedAddress.address_line1}</p>
                        <p>
                          {selectedAddress.address_line2 ? `${selectedAddress.address_line2}, ` : ''}
                          {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}, {selectedAddress.country}
                        </p>
                      </div>
                    ) : (
                      <p>No delivery address selected.</p>
                    )}
                  </div>

                  <div className="review-card">
                    <h3>Payment</h3>
                    <p>
                      {DEFAULT_PAYMENT_METHODS.find((method) => method.id === selectedPaymentMethod)?.label || 'No payment method selected'}
                    </p>
                  </div>

                  <div className="review-card">
                    <h3>Items</h3>
                    <div className="checkout-items">
                      {cart.items.map((item) => (
                        <div className="checkout-item" key={item.item_id || item.product.id}>
                          <div className="checkout-item-info">
                            <img src={item.product.img_url || 'https://via.placeholder.com/64'} alt={item.product.name} />
                            <div>
                              <div className="checkout-item-name">{item.product.name}</div>
                              <div className="checkout-item-meta">Qty: {item.quantity}</div>
                            </div>
                          </div>
                          <div className="checkout-item-price">{formatPrice(Number(item.product.price) * Number(item.quantity))}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {error && <p className="checkout-error-message">{error}</p>}

            <div className="checkout-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={goToPreviousStep}
                disabled={activeStep === 0}
              >
                Previous
              </button>

              {activeStep < DELIVERY_STEPS.length - 1 ? (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={goToNextStep}
                  disabled={!canContinueFromAddress && activeStep === 0 || !canContinueFromPayment && activeStep === 1}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || !selectedAddress}
                >
                  {placingOrder ? 'Placing order...' : 'Place order'}
                </button>
              )}
            </div>
          </main>

          <aside className="checkout-aside">
            <h3>Order summary</h3>
            <div className="review-summary">
              <div className="summary-row">
                <span>Items</span>
                <span>{cart.items.length}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Checkout;
