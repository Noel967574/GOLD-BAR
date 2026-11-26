import { useState } from 'react';
import { useCart } from '../cart-store.jsx';
import { money } from '../api.js';
import JewelryArt from './JewelryArt.jsx';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  function addToBag() {
    add(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="product-card">
      <div className="product-photo">
        {product.image_url && !imageFailed ? (
          <img src={product.image_url} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <JewelryArt category={product.category} name={product.name} />
        )}
        <span className="product-karat">{product.karat}k solid gold</span>
        {Boolean(product.featured) && <span className="product-featured">Bestseller</span>}
      </div>
      <div className="product-info">
        <div className="product-title-row">
          <div>
            <p className="product-category">{product.category} · {Number(product.weight_grams).toFixed(1)}g</p>
            <h3>{product.name}</h3>
          </div>
          <strong className="product-price">{money(product.price_cents)}</strong>
        </div>
        <p className="product-description">{product.description}</p>
        <button className="btn product-add" onClick={addToBag} disabled={!product.stock}>
          {added ? 'Added to bag ✓' : product.stock ? 'Add to bag' : 'Sold out'}
        </button>
      </div>
    </article>
  );
}
