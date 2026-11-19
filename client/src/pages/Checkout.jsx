import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../auth-store.jsx';
import { useCart } from '../cart-store.jsx';
import JewelryArt from '../components/JewelryArt.jsx';
import Seo from '../components/Seo.jsx';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotalCents, setQuantity, clear } = useCart();
  const [form, setForm] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'bitcoin'
  });
  const [error, setError] = useState('');
  const [copyNote, setCopyNote] = useState('');
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const shipping = subtotalCents >= 15000 || subtotalCents === 0 ? 0 : 1200;

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function placeOrder(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const result = await api.createOrder({
        ...form,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity }))
      });
      clear();
      setOrder(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (order) {
    return (
      <section className="container checkout-page order-success">
        <Seo title="Order received" noindex />
        <div className="success-mark">✓</div>
        <p className="eyebrow">Thank you for choosing us</p>
        <h1>Your order is in good hands.</h1>
        <p>Order <strong>#{order.orderId}</strong> has been received. Your total is <strong>{money(order.totalCents)}</strong>.</p>
        <div className="bitcoin-payment">
          <div className="bitcoin-payment-title"><span>₿</span><div><strong>Pay with Bitcoin</strong><small>Bitcoin network only</small></div></div>
          <p>Send the Bitcoin equivalent of <strong>{money(order.totalCents)}</strong> to this address. Use your wallet’s current BTC/USD rate. Network fees are separate.</p>
          <label className="bitcoin-address-label">Bitcoin payment address
            <span className="bitcoin-address-row"><input readOnly value={order.payment.address} aria-label="Bitcoin payment address" /><button className="btn gold-btn" type="button" onClick={async () => {
              try {
                await navigator.clipboard.writeText(order.payment.address);
                setCopyNote('Address copied.');
              } catch {
                setCopyNote('Copy unavailable. Select and copy the address above.');
              }
            }}>Copy</button></span>
          </label>
          {copyNote && <p className="form-note">{copyNote}</p>}
          <p className="bitcoin-warning">Send BTC on the <strong>{order.payment.network}</strong> network only. Payments are checked manually before your order is processed. Bitcoin payment is not automatically verified.</p>
        </div>
        <p className="muted">We’ll send order updates to {form.email}. Your order is awaiting payment until it is verified.</p>
        <div className="hero-cta"><Link className="btn gold-btn" to="/dashboard/orders">Track your order</Link><Link className="hero-text-link" to="/shop">Keep exploring</Link></div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="container checkout-page empty-cart">
        <Seo title="Your bag" noindex />
        <p className="eyebrow">Your bag</p><h1>Nothing in your bag just yet.</h1>
        <p className="muted">Take a look through the collection and find a piece that feels like you.</p>
        <Link className="btn gold-btn" to="/shop">Explore the collection</Link>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container checkout-page">
        <Seo title="Your bag" noindex />
        <p className="eyebrow">Your bag</p><h1>Your pieces are waiting.</h1>
        <div className="checkout-guest">
          {items.map(({ product, quantity }) => <div className="checkout-guest-item" key={product.id}><JewelryArt category={product.category} name={product.name} /><span><strong>{product.name}</strong><small>{product.karat}k solid gold · Qty {quantity}</small></span><strong>{money(product.price_cents * quantity)}</strong></div>)}
          <div className="summary-total grand-total"><span>Subtotal</span><strong>{money(subtotalCents)}</strong></div>
          <p>Sign in or create an account to finish checkout and track your order.</p>
          <div className="hero-cta"><Link className="btn gold-btn" to="/login?next=%2Fcheckout">Sign in to checkout</Link><Link className="hero-text-link" to="/register?next=%2Fcheckout">Create account</Link></div>
        </div>
      </section>
    );
  }

  return (
    <section className="container checkout-page">
      <Seo title="Checkout" noindex />
      <p className="eyebrow">Secure checkout</p><h1>Make it yours.</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <div className="checkout-step"><span>01</span><div><h2>Delivery details</h2><p>Where should we send your gold?</p></div></div>
          <div className="checkout-fields">
            {[['customerName', 'Full name', 'text'], ['email', 'Email address', 'email'], ['phone', 'Phone number', 'tel'], ['address', 'Street address', 'text'], ['city', 'City', 'text'], ['postalCode', 'Postal code', 'text'], ['country', 'Country', 'text']].map(([key, label, type]) => (
              <label className={key === 'address' ? 'field-span' : ''} key={key}>{label}<input type={type} autoComplete={key === 'customerName' ? 'name' : key === 'email' ? 'email' : key === 'phone' ? 'tel' : key === 'address' ? 'street-address' : 'off'} value={form[key]} onChange={(e) => set(key, e.target.value)} required /></label>
            ))}
          </div>
          <div className="checkout-step"><span>02</span><div><h2>Payment</h2><p>Pay securely with Bitcoin.</p></div></div>
          <div className="payment-option bitcoin-option"><span className="bitcoin-symbol">₿</span><span><strong>Bitcoin (BTC)</strong><small>Bitcoin network · send after placing your order</small></span><strong>BTC</strong></div>
          {error && <p className="form-note error">{error}</p>}
          <button className="btn gold-btn checkout-submit" type="submit" disabled={sending}>{sending ? 'Placing your order…' : `Place order · ${money(subtotalCents + shipping)}`}</button>
          <p className="checkout-disclaimer">Your USD total is converted to BTC using the rate in your wallet. Payments are manually verified; your order will not be processed until payment is confirmed.</p>
        </form>

        <aside className="order-summary">
          <h2>Your bag <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></h2>
          <div className="summary-items">
            {items.map(({ product, quantity }) => (
              <div className="summary-item" key={product.id}>
                <div className="summary-thumb"><JewelryArt category={product.category} name={product.name} /></div>
                <div className="summary-product"><strong>{product.name}</strong><small>{product.karat}k solid gold · Qty {quantity}</small><div className="summary-qty"><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => setQuantity(product.id, quantity - 1)}>−</button><button type="button" aria-label={`Add one ${product.name}`} onClick={() => setQuantity(product.id, quantity + 1)}>+</button></div></div>
                <strong>{money(product.price_cents * quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-total"><span>Subtotal</span><strong>{money(subtotalCents)}</strong></div>
          <div className="summary-total"><span>Shipping</span><strong>{shipping === 0 ? 'Complimentary' : money(shipping)}</strong></div>
          <div className="summary-total grand-total"><span>Total</span><strong>{money(subtotalCents + shipping)}</strong></div>
          <p className="shipping-note">Complimentary delivery on orders over $150.</p>
        </aside>
      </div>
    </section>
  );
}
