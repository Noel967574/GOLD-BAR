import { useEffect, useState } from 'react';
import { api, money } from '../api.js';
import Seo from '../components/Seo.jsx';
import ContentEditor from '../components/ContentEditor.jsx';
import { useAuth } from '../auth-store.jsx';

const emptyProduct = {
  name: '', description: '', karat: 18, category: 'Rings', weightGrams: '', price: '', imageUrl: '', stock: 0, featured: false, active: false
};
const orderTransitions = {
  awaiting_payment: ['awaiting_payment', 'cancelled'],
  processing: ['processing', 'shipped', 'delivered', 'cancelled'],
  shipped: ['shipped', 'delivered'],
  delivered: ['delivered'],
  cancelled: ['cancelled']
};

function ProductManager() {
  const [products, setProducts] = useState(null);
  const [draft, setDraft] = useState(emptyProduct);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  async function load() {
    setProducts(await api.admin.products());
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  function edit(product) {
    setDraft({ ...product, price: product.priceCents ? (product.priceCents / 100).toFixed(2) : '' });
    setNotice('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadImage(file) {
    setError('');
    setNotice('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPEG or WebP product photo.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Product photos must be smaller than 4 MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the selected photo.'));
        reader.onerror = () => reject(new Error('Could not read the selected photo.'));
        reader.readAsDataURL(file);
      });
      const result = await api.admin.uploadProductImage(dataUrl);
      set('imageUrl', result.imageUrl);
      setNotice('Photo uploaded. Save the product to keep this photo attached.');
    } catch (e) {
      setError(e.message);
    } finally {
      setUploadingImage(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      if (draft.id) await api.admin.updateProduct(draft.id, draft);
      else await api.admin.createProduct(draft);
      setDraft(emptyProduct);
      setNotice('Product saved. Your storefront is up to date.');
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(product) {
    if (!window.confirm(`Delete "${product.name}"? This will remove it from the catalog. Existing order history will be kept.`)) return;
    setError('');
    setNotice('');
    try {
      await api.admin.deleteProduct(product.id);
      if (draft.id === product.id) setDraft(emptyProduct);
      setNotice(`${product.name} was deleted.`);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  function set(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="admin-products">
      <form className="product-editor" onSubmit={save}>
        <div className="editor-heading"><div><p className="eyebrow">Store inventory</p><h2>{draft.id ? `Edit ${draft.name}` : 'Add a gold piece'}</h2></div>{draft.id && <button className="btn ghost" type="button" onClick={() => setDraft(emptyProduct)}>Cancel edit</button>}</div>
        <div className="admin-form-grid">
          <label>Product name<input value={draft.name} onChange={(e) => set('name', e.target.value)} required maxLength="100" /></label>
          <label>Category<select value={draft.category} onChange={(e) => set('category', e.target.value)}>{['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants', 'Other'].map((category) => <option key={category}>{category}</option>)}</select></label>
          <label>Gold purity<select value={draft.karat} onChange={(e) => set('karat', Number(e.target.value))}>{[9, 10, 14, 18, 22, 24].map((k) => <option key={k} value={k}>{k}k</option>)}</select></label>
          <label>Weight (grams)<input type="number" step="0.1" min="0" value={draft.weightGrams} onChange={(e) => set('weightGrams', e.target.value)} /></label>
          <label>Price (USD)<input type="number" step="0.01" min="0" value={draft.price} onChange={(e) => set('price', e.target.value)} /></label>
          <label>Stock quantity<input type="number" step="1" min="0" value={draft.stock} onChange={(e) => set('stock', e.target.value)} required /></label>
          <label className="admin-image-field">Upload product photo<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploadingImage} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(file); e.target.value = ''; }} />{uploadingImage && <span>Uploading photo…</span>}</label>
          {draft.imageUrl && <button className="btn ghost sm admin-remove-image" type="button" onClick={() => set('imageUrl', '')}>Remove photo</button>}
          {draft.imageUrl && <img className="admin-product-preview" src={draft.imageUrl} alt={`Preview of ${draft.name || 'product photo'}`} />}
          <label className="admin-description-field">Description<textarea rows="3" maxLength="1000" value={draft.description} onChange={(e) => set('description', e.target.value)} /></label>
        </div>
        <div className="admin-product-flags"><label className="check"><input type="checkbox" checked={draft.featured} onChange={(e) => set('featured', e.target.checked)} /> Feature on the homepage</label><label className="check"><input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} /> Available in storefront</label></div>
        {!draft.active && <p className="muted">Hidden drafts can have missing price or weight. Add the required details before making a product available.</p>}
        {error && <p className="form-note error">{error}</p>}{notice && <p className="form-note success">{notice}</p>}
        <button className="btn gold-btn" type="submit" disabled={uploadingImage}>{draft.id ? 'Save product changes' : 'Add product to store'}</button>
      </form>

      <div className="admin-section-heading"><div><p className="eyebrow">Products</p><h2>Manage your collection</h2></div></div>
      {error && !products && <p className="form-note error">{error}</p>}
      {!products ? <p className="muted">Loading products…</p> : (
        <div className="admin-table-wrap"><table className="table admin-table">
          <thead><tr><th>Piece</th><th>Purity</th><th>Price</th><th>Weight</th><th>Stock</th><th>Visibility</th><th /></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id}><td><strong>{p.name}</strong><small>{p.category}</small></td><td>{p.karat}k</td><td>{p.priceCents ? money(p.priceCents) : 'Not set'}</td><td>{Number(p.weightGrams) > 0 ? `${Number(p.weightGrams).toFixed(1)}g` : 'Not set'}</td><td>{p.stock}</td><td><span className={`pill ${p.active ? 'approved' : 'rejected'}`}>{p.active ? 'Live' : 'Hidden'}</span></td><td><div className="admin-product-actions"><button className="btn ghost sm" onClick={() => edit(p)}>Edit</button><button className="btn ghost sm admin-delete-button" onClick={() => remove(p)}>Delete</button></div></td></tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

function OrderManager() {
  const [orders, setOrders] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const [orderRows, payment] = await Promise.all([api.admin.orders(), api.paymentInfo()]);
    setOrders(orderRows);
    setPaymentInfo(payment);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function update(order, status) {
    setError('');
    try {
      await api.admin.updateOrder(order.id, { status });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function confirmPayment(order) {
    setError('');
    try {
      await api.admin.confirmOrderPayment(order.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="admin-orders">
      <div className="admin-section-heading"><div><p className="eyebrow">Fulfillment</p><h2>Customer orders</h2></div><span className="muted">{orders?.length ?? '…'} total</span></div>
      {error && <p className="form-note error">{error}</p>}
      {paymentInfo && <div className="admin-wallet"><div><span>Bitcoin payment wallet · {paymentInfo.network}</span><strong>{paymentInfo.address}</strong></div><a href={`https://mempool.space/address/${paymentInfo.address}`} target="_blank" rel="noreferrer">Check wallet activity ↗</a></div>}
      {!orders ? <p className="muted">Loading orders…</p> : orders.length === 0 ? <div className="admin-empty">New orders will appear here as soon as a customer checks out.</div> : (
        <div className="admin-order-list">{orders.map((order) => (
          <article className="admin-order-card" key={order.id}>
            <div className="admin-order-top">
              <div><span className="muted">Order #{order.id}</span><strong>{order.customer_name}</strong><small>{order.account_email}</small></div>
              <div><span className="muted">Placed</span><strong>{new Date(`${order.created_at}Z`).toLocaleDateString()}</strong></div>
              <div><span className="muted">Total</span><strong>{money(order.total_cents)}</strong></div>
              <div className="admin-payment-control"><span className="muted">{order.payment_method === 'bitcoin' ? 'Bitcoin payment' : 'Payment method'}</span><strong>{order.payment_method === 'bitcoin' ? 'Bitcoin (BTC)' : order.payment_method}</strong><span className={`payment-status ${order.payment_status}`}>{order.payment_status}</span>{order.payment_method === 'bitcoin' && order.payment_status === 'pending' && <button className="btn gold-btn sm" onClick={() => confirmPayment(order)}>Confirm payment</button>}</div>
              <label className="order-status-control">Fulfillment<select value={order.status} onChange={(e) => update(order, e.target.value)}>{(orderTransitions[order.status] || [order.status]).filter((status) => !(status === 'cancelled' && order.payment_method === 'bitcoin' && order.payment_status === 'confirmed')).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            </div>
            <div className="admin-order-content">
              <div>{order.items.map((item) => <p key={item.id}>{item.product_name} <span>{item.karat}k · Qty {item.quantity} · {money(item.unit_cents * item.quantity)}</span></p>)}</div>
              <div className="admin-delivery"><strong>Ship to</strong>{order.address}, {order.city}, {order.postal_code}, {order.country}<br />{order.phone}<br />{order.email}</div>
            </div>
          </article>
        ))}</div>
      )}
    </div>
  );
}

function CustomerManager() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.admin.users().then(setCustomers).catch((e) => setError(e.message));
  }, []);
  if (error) return <p className="form-note error">{error}</p>;
  if (!customers) return <p className="muted">Loading customers…</p>;
  return <div className="admin-table-wrap"><table className="table admin-table"><thead><tr><th>Customer</th><th>Account</th><th>Joined</th><th>Orders</th></tr></thead><tbody>
    {customers.map((customer) => <tr key={customer.id}><td><strong>{customer.name || 'Customer'}</strong></td><td>{customer.email}</td><td>{new Date(`${customer.created_at}Z`).toLocaleDateString()}</td><td>{customer.order_count}</td></tr>)}
  </tbody></table></div>;
}

function Inbox() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.admin.submissions().then(setRows).catch((e) => setError(e.message));
  }, []);
  if (error) return <p className="form-note error">{error}</p>;
  if (!rows) return <p className="muted">Loading messages…</p>;
  if (!rows.length) return <p className="muted">No messages yet.</p>;
  return <div className="admin-inbox">{rows.map((row) => <article className="inbox-row" key={row.id}><div><strong>{row.name || row.email}</strong><span>{row.email} · {row.kind} · {row.created_at}</span></div><p>{row.payload.message || 'Newsletter signup'}</p></article>)}</div>;
}

export default function AdminConsole() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('orders');
  const tabs = [['orders', 'Orders'], ['products', 'Products'], ['customers', 'Customers'], ['content', 'Storefront'], ['inbox', 'Messages']];

  return (
    <div className="container admin gold-admin">
      <Seo title="Store studio" noindex />
      <div className="admin-head"><div><p className="eyebrow">Aurelia Gold · Store studio</p><h1>Good afternoon.</h1></div><div className="row-actions"><span className="muted">{user.email}</span><button className="btn ghost" onClick={logout}>Sign out</button></div></div>
      <div className="tabs">{tabs.map(([key, label]) => <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>)}</div>
      <div className="panel admin-panel">
        {tab === 'orders' && <OrderManager />}
        {tab === 'products' && <ProductManager />}
        {tab === 'customers' && <CustomerManager />}
        {tab === 'content' && <ContentEditor />}
        {tab === 'inbox' && <Inbox />}
      </div>
    </div>
  );
}
