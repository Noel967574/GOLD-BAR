import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import Seo from '../components/Seo.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [karat, setKarat] = useState('All karats');
  const [category, setCategory] = useState('All pieces');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All pieces', ...new Set(products.map((p) => p.category))], [products]);
  const karats = useMemo(() => ['All karats', ...new Set(products.map((p) => String(p.karat)))], [products]);
  const visible = products.filter((p) =>
    (karat === 'All karats' || p.karat === Number(karat)) &&
    (category === 'All pieces' || p.category === category)
  );

  return (
    <div className="shop-page">
      <Seo title="Shop solid gold" description="Shop thoughtfully made solid gold jewelry in 14k, 18k and 22k." />
      <section className="shop-intro">
        <div className="container">
          <p className="eyebrow">The collection</p>
          <h1>Gold, made to<br />be <em>kept.</em></h1>
          <p>Everyday heirlooms in solid gold. Find your favorite piece in the karat that feels right for you.</p>
          <div className="shop-promises"><span>✦ Solid gold, always</span><span>✦ Complimentary shipping over $150</span><span>✦ 30-day returns</span></div>
        </div>
      </section>

      <section className="container shop-collection">
        <div className="collection-heading">
          <div><p className="eyebrow">Find your forever piece</p><h2>Shop the collection</h2></div>
          <span className="muted">{visible.length} {visible.length === 1 ? 'piece' : 'pieces'}</span>
        </div>
        <div className="shop-filters" aria-label="Filter products">
          <div className="filter-chips">
            {categories.map((item) => (
              <button key={item} className={`filter-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
          <label className="karat-filter">Gold purity
            <select value={karat} onChange={(e) => setKarat(e.target.value)}>
              {karats.map((item) => <option key={item} value={item}>{item === 'All karats' ? item : `${item}k`}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="form-note error">{error}</p>}
        {loading ? <p className="muted">Finding your next favorite…</p> : visible.length ? (
          <div className="product-grid">
            {visible.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : <div className="empty-products"><h3>No pieces in this selection just yet</h3><p>Try another category or carat.</p></div>}
      </section>
    </div>
  );
}
