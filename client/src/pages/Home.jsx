import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.products().then(setProducts).catch((e) => setError(e.message));
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <Seo title="Fine gold, for every day" description="Discover beautifully made solid gold jewelry in 14k, 18k and 22k. Find your forever piece at Aurelia Gold." />
      <section className="gold-hero">
        <div className="gold-hero-copy">
          <p className="eyebrow">Solid gold. Thoughtfully made.</p>
          <h1>A little gold.<br /><em>A lot of meaning.</em></h1>
          <p>Jewelry to mark your moments, made in the gold you love and designed to last a lifetime.</p>
          <div className="hero-cta">
            <Link className="btn gold-btn" to="/shop">Explore the collection <span aria-hidden="true">→</span></Link>
            <Link className="hero-text-link" to="/about">Our story</Link>
          </div>
          <div className="hero-assurance"><span>14k, 18k & 22k solid gold</span><span>Free shipping over $150</span></div>
        </div>
        <div className="gold-hero-art" role="img" aria-label="Gold jewelry styled on a warm neutral background">
          <div className="gold-orbit orbit-one" /><div className="gold-orbit orbit-two" />
          <div className="gold-sculpture"><span>Au</span></div>
          <div className="art-caption"><span>THE EVERYDAY EDIT</span><strong>Made for your story</strong></div>
          <div className="art-sparkle sparkle-one">✦</div><div className="art-sparkle sparkle-two">✧</div>
        </div>
      </section>

      <section className="trust-strip">
        <div><strong>01</strong><span>Solid gold, never plated</span></div>
        <div><strong>02</strong><span>Made for everyday wear</span></div>
        <div><strong>03</strong><span>Thoughtful, lasting quality</span></div>
      </section>

      <section className="container featured-section">
        <div className="section-title-row">
          <div><p className="eyebrow">The pieces you love</p><h2>Our most-loved gold</h2></div>
          <Link className="text-link" to="/shop">Shop all jewelry <span aria-hidden="true">→</span></Link>
        </div>
        {error ? <p className="form-note error">{error}</p> : featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : <p className="muted">Our collection is being prepared. Please check back soon.</p>}
      </section>

      <section className="care-section">
        <div className="care-inner">
          <p className="eyebrow">A better kind of forever</p>
          <h2>Choose gold that<br /><em>goes with you.</em></h2>
          <p>From rich 14k to luminous 18k and timeless 22k, each piece is crafted from solid gold and made to be part of your everyday.</p>
          <Link className="btn dark-outline" to="/shop">Find your gold</Link>
        </div>
        <div className="karat-notes">
          {[['14k', 'Durable, everyday brilliance'], ['18k', 'A little more golden glow'], ['22k', 'Rich, traditional warmth']].map(([karat, desc]) => (
            <Link to="/shop" className="karat-note" key={karat}><strong>{karat}</strong><span>{desc}</span><b aria-hidden="true">↗</b></Link>
          ))}
        </div>
      </section>
    </>
  );
}
