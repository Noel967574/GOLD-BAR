import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api.js';
import { useAuth } from '../../auth-store.jsx';
import Seo from '../../components/Seo.jsx';

export default function Overview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.orders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  const latest = orders?.[0];
  return (
    <>
      <Seo title="My account" noindex />
      <section className="account-welcome">
        <p className="eyebrow">Aurelia Gold · Your account</p>
        <h1>Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1>
        <p>Keep an eye on your orders and find something meaningful for your next moment.</p>
        <Link className="btn gold-btn" to="/shop">Explore the collection <span aria-hidden="true">→</span></Link>
      </section>
      {error && <p className="form-note error">{error}</p>}
      {latest && (
        <section className="account-latest">
          <div className="block-head"><div><p className="eyebrow">Most recent</p><h2>Order #{latest.id}</h2></div><Link className="text-link" to="/dashboard/orders">View all orders →</Link></div>
          <div className="latest-order-row"><div><span className={`order-status ${latest.status}`}>{latest.status}</span><p>{latest.items.map((item) => `${item.product_name} × ${item.quantity}`).join(' · ')}</p></div><strong>{money(latest.total_cents)}</strong></div>
        </section>
      )}
      {!orders && !error && <p className="muted">Loading your account…</p>}
    </>
  );
}
