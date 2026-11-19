import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api.js';
import Seo from '../../components/Seo.jsx';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    Promise.all([api.orders(), api.paymentInfo()])
      .then(([orderRows, payment]) => {
        setOrders(orderRows);
        setPaymentInfo(payment);
      })
      .catch((e) => setError(e.message));
  }, []);

  async function copyAddress(orderId) {
    try {
      await navigator.clipboard.writeText(paymentInfo.address);
      setCopied(orderId);
    } catch {
      setError('Copy unavailable. Select and copy the Bitcoin address shown on your order.');
    }
  }

  return (
    <>
      <Seo title="My orders" noindex />
      <div className="account-heading"><div><p className="eyebrow">Your Aurelia account</p><h1>My orders</h1></div><Link className="btn gold-btn" to="/shop">Shop jewelry</Link></div>
      {error && <p className="form-note error">{error}</p>}
      {!orders ? <p className="muted">Loading your orders…</p> : orders.length === 0 ? (
        <div className="empty-orders"><span>✦</span><h2>Your story starts with a first piece.</h2><p>When you place an order, we’ll keep all your details and updates here.</p><Link className="btn gold-btn" to="/shop">Explore the collection</Link></div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <header className="order-card-head">
                <div><span className="muted">Order #{order.id}</span><strong>Placed {new Date(`${order.created_at}Z`).toLocaleDateString()}</strong></div>
                <span className={`order-status ${order.status}`}>{order.status}</span>
                <span className={`payment-status ${order.payment_status}`}>{order.payment_status === 'confirmed' ? 'Payment confirmed' : order.payment_status === 'pending' ? 'Payment pending' : 'Payment not required'}</span>
                <strong className="order-total">{money(order.total_cents)}</strong>
              </header>
              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-line" key={item.id}>
                    <span>{item.product_name} <small>{item.karat}k solid gold · {Number(item.weight_grams).toFixed(1)}g</small></span>
                    <span>× {item.quantity}</span><strong>{money(item.unit_cents * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              {order.payment_method === 'bitcoin' && order.payment_status === 'pending' && paymentInfo && (
                <div className="order-bitcoin-instructions">
                  <strong>Bitcoin payment required · {money(order.total_cents)}</strong>
                  <p>Send the BTC equivalent using your wallet’s current rate. Bitcoin network only; payments are manually verified.</p>
                  <div className="bitcoin-address-row"><input readOnly aria-label={`Bitcoin address for order ${order.id}`} value={paymentInfo.address} /><button className="btn gold-btn sm" onClick={() => copyAddress(order.id)}>Copy address</button></div>
                  {copied === order.id && <small className="form-note success">Address copied.</small>}
                </div>
              )}
              <footer className="order-card-foot"><span>{order.payment_method === 'bitcoin' ? 'Bitcoin (BTC) · Bitcoin network' : order.payment_method}</span><span>Delivering to {order.city}, {order.country}</span></footer>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
