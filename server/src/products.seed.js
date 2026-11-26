import { db } from './db.js';

const products = [
  {
    name: 'Sculpted Signet Ring',
    slug: 'sculpted-signet-ring',
    description: 'A modern heirloom with a softly contoured face and a comfortable, polished band.',
    karat: 18,
    category: 'Rings',
    weightGrams: 4.2,
    priceCents: 89500,
    imageUrl: '/products/sculpted-signet-ring.svg',
    legacyImageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85',
    stock: 8,
    featured: 1
  },
  {
    name: 'Everyday Gold Hoops',
    slug: 'everyday-gold-hoops',
    description: 'Light-catching, hollow hoops made for everyday wear, finished by hand.',
    karat: 14,
    category: 'Earrings',
    weightGrams: 2.8,
    priceCents: 54500,
    imageUrl: '/products/everyday-gold-hoops.svg',
    legacyImageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85',
    stock: 12,
    featured: 1
  },
  {
    name: 'Fine Paperclip Chain',
    slug: 'fine-paperclip-chain',
    description: 'A sleek, adjustable chain with elongated links and a secure lobster clasp.',
    karat: 18,
    category: 'Necklaces',
    weightGrams: 5.1,
    priceCents: 119000,
    imageUrl: '/products/fine-paperclip-chain.svg',
    legacyImageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
    stock: 6,
    featured: 1
  },
  {
    name: 'Classic Rope Bracelet',
    slug: 'classic-rope-bracelet',
    description: 'A timeless twisted-rope profile with a secure clasp and a warm, rich finish.',
    karat: 14,
    category: 'Bracelets',
    weightGrams: 6.4,
    priceCents: 99500,
    imageUrl: '/products/classic-rope-bracelet.svg',
    legacyImageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85',
    stock: 5,
    featured: 0
  },
  {
    name: 'Petite Diamond Pendant',
    slug: 'petite-diamond-pendant',
    description: 'A delicate gold setting and a sparkling diamond, made to layer.',
    karat: 18,
    category: 'Necklaces',
    weightGrams: 1.9,
    priceCents: 168000,
    imageUrl: '/products/petite-diamond-pendant.svg',
    legacyImageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85',
    stock: 4,
    featured: 0
  },
  {
    name: 'Horizon Wedding Band',
    slug: 'horizon-wedding-band',
    description: 'A clean, softly rounded band with a satin finish and polished edges.',
    karat: 22,
    category: 'Rings',
    weightGrams: 3.6,
    priceCents: 109000,
    imageUrl: '/products/horizon-wedding-band.svg',
    legacyImageUrl: 'https://images.unsplash.com/photo-1603561596112-db6f0bb9d8d8?auto=format&fit=crop&w=1000&q=85',
    stock: 7,
    featured: 0
  }
];

const sellerProducts = [
  {
    name: '14k Solid Twisted Diamond-Cut Rope Chain Necklace',
    slug: 'seller-14k-solid-rope-chain-28in',
    description: '14k yellow gold, solid twisted diamond-cut rope chain. 28 in, 12 mm, 310.9 g.',
    karat: 14,
    category: 'Necklaces',
    weightGrams: 310.9,
    priceCents: 0,
    imageUrl: '',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: 'Hollow Cuban Link 10k Yellow Gold Chain',
    slug: 'seller-10k-hollow-cuban-chain',
    description: 'Hollow Cuban link chain in 10k yellow gold.',
    karat: 10,
    category: 'Necklaces',
    weightGrams: 0,
    priceCents: 510000,
    imageUrl: '',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: '14k Solid Curb Cuban Link Chain Necklace',
    slug: 'seller-14k-solid-curb-cuban-chain-20in',
    description: '14k yellow gold, solid curb Cuban link chain. 20 in, 9 mm, 42.4 g.',
    karat: 14,
    category: 'Necklaces',
    weightGrams: 42.4,
    priceCents: 840000,
    imageUrl: '',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: '14k Two-Tone Cuban Link Chain',
    slug: 'seller-14k-two-tone-cuban-chain',
    description: '14k two-tone Cuban link chain.',
    karat: 14,
    category: 'Necklaces',
    weightGrams: 0,
    priceCents: 300000,
    imageUrl: '',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: '14k Solid Miami Cuban Link Bracelet',
    slug: 'seller-14k-solid-miami-cuban-bracelet-8in',
    description: '14k solid Miami Cuban link bracelet. 6 mm, 8 in.',
    karat: 14,
    category: 'Bracelets',
    weightGrams: 0,
    priceCents: 458611,
    imageUrl: '',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: '999.9 Fine Gold Bar',
    slug: 'seller-9999-fine-gold-bar-1000g',
    description: '999.9 fine gold bar. 1,000 g.',
    karat: 24,
    category: 'Other',
    weightGrams: 1000,
    priceCents: 0,
    imageUrl: '/api/product-images/gold-bar.png',
    stock: 0,
    featured: 0,
    active: 0
  }
];

const goldBarProducts = [
  {
    name: '500 g 999.9 Fine Gold Bar',
    slug: '500-g-999-9-fine-gold-bar-mwxiaxux',
    description: 'Sealed 500 g fine-gold bar stamped 999.9 (99.99% pure, 24K). Price is an estimated gold spot value, not a verified retail quote; confirm the current market price before purchase.',
    karat: 24,
    category: 'Other',
    weightGrams: 500,
    priceCents: 5736426,
    imageUrl: '/api/product-images/gold-bar-500g.jpg',
    stock: 1,
    featured: 0,
    active: 1
  },
  {
    name: '999.9 Fine Gold Bar Assortment (Weights To Confirm)',
    slug: '999-9-fine-gold-bar-assortment-weights-to-confirm-mwxib8ih',
    description: 'Photo shows ten individually packaged bars marked fine gold 999.9. Individual bar weights are not legible in the supplied image. Hidden draft: verify each weight and inventory before listing for sale.',
    karat: 24,
    category: 'Other',
    weightGrams: 0,
    priceCents: 0,
    imageUrl: '/api/product-images/gold-bars-assortment.jpg',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: 'GBK 999.9 Fine Gold Bar Set — 22.5 g',
    slug: 'gbk-999-9-fine-gold-bar-set-22-5-g-mwxib9ts',
    description: 'Four fine-gold bars: three stamped 3.75 g and one stamped 11.25 g, 22.5 g total. Stamped 999.9 (99.99% pure, 24K). Price is an estimated gold spot value, not a verified retail quote; confirm the current market price before purchase.',
    karat: 24,
    category: 'Other',
    weightGrams: 22.5,
    priceCents: 258139,
    imageUrl: '/api/product-images/gbk-gold-bar-set-22-5g.jpg',
    stock: 1,
    featured: 0,
    active: 1
  },
  {
    name: 'Royal Mint Britannia Gold Bar — 10 g',
    slug: 'royal-mint-britannia-gold-bar-10-g-mwxibap1',
    description: 'Royal Mint Britannia 10 g bar. The photo shows two bars, but the fineness stamp is not visible. Hidden draft: verify purity and current price before listing; stock and price are not yet set.',
    karat: 24,
    category: 'Other',
    weightGrams: 10,
    priceCents: 0,
    imageUrl: '/api/product-images/royal-mint-britannia-10g.jpg',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: 'Hyrank Fine Gold Bar — 995, 1 kg',
    slug: 'hyrank-fine-gold-bar-995-1-kg-mwxibc16',
    description: 'Hyrank 1 kg fine-gold bar stamped 995 (99.5% purity, approximately 23.88K). The catalog purity selector rounds this bullion fineness to 24K; exact fineness is stated here. Price is an estimated spot value, not a verified retail quote; confirm the current market price before purchase.',
    karat: 24,
    category: 'Other',
    weightGrams: 1000,
    priceCents: 11416630,
    imageUrl: '/api/product-images/hyrank-gold-bar-1kg.jpg',
    stock: 1,
    featured: 0,
    active: 1
  },
  {
    name: 'Suisse Fine Gold Bar — 999.9, 1 kg',
    slug: 'suisse-fine-gold-bar-999-9-1-kg-mwxibd18',
    description: 'Suisse 1 kg fine-gold bar stamped 999.9 (99.99% pure, 24K). Price is an estimated gold spot value, not a verified retail quote; confirm the current market price before purchase.',
    karat: 24,
    category: 'Other',
    weightGrams: 1000,
    priceCents: 11472853,
    imageUrl: '/api/product-images/suisse-gold-bar-1kg.jpg',
    stock: 1,
    featured: 0,
    active: 1
  },
  {
    name: '999.9 Fine Gold Bar — 1 kg',
    slug: 'generic-999-9-fine-gold-bar-1-kg',
    description: 'Photo shows two bars marked 999.9 fine gold, net weight 1,000 g each. Verify authenticity, current price, and available stock before offering for sale.',
    karat: 24,
    category: 'Other',
    weightGrams: 1000,
    priceCents: 0,
    imageUrl: '/api/product-images/generic-9999-gold-bar-1kg.jpg',
    stock: 0,
    featured: 0,
    active: 0
  }
];

export function seedProducts() {
  const insert = db.prepare(`
    INSERT INTO products
      (name, slug, description, karat, category, weight_grams, price_cents, image_url, stock, featured, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
    for (const p of products) {
      insert.run(
        p.name, p.slug, p.description, p.karat, p.category, p.weightGrams,
        p.priceCents, p.imageUrl, p.stock, p.featured, 1
      );
    }
  }

  const replaceLegacyImage = db.prepare('UPDATE products SET image_url = ? WHERE slug = ?');
  for (const p of products) {
    replaceLegacyImage.run(p.imageUrl, p.slug);
  }

  const liveProducts = db.prepare(`
    SELECT id, name, category FROM products
    WHERE active = 1
      AND (image_url IS NULL OR trim(image_url) = '' OR image_url LIKE 'https://images.unsplash.com/%')
  `).all();
  const fillImage = db.prepare(`
    UPDATE products SET image_url = ?
    WHERE id = ? AND (image_url IS NULL OR trim(image_url) = '' OR image_url LIKE 'https://images.unsplash.com/%')
  `);
  for (const product of liveProducts) {
    const label = `${product.name} ${product.category}`.toLowerCase();
    const image = /earring|hoop/.test(label)
      ? '/products/everyday-gold-hoops.svg'
      : /bracelet|bangle/.test(label)
        ? '/products/classic-rope-bracelet.svg'
        : /chain|necklace|cuban|pendant/.test(label)
          ? (/pendant/.test(label) ? '/products/petite-diamond-pendant.svg' : '/products/fine-paperclip-chain.svg')
          : /ring|band/.test(label)
            ? '/products/horizon-wedding-band.svg'
            : '/products/sculpted-signet-ring.svg';
    fillImage.run(image, product.id);
  }

  const insertSellerProduct = db.prepare(`
    INSERT OR IGNORE INTO products
      (name, slug, description, karat, category, weight_grams, price_cents, image_url, stock, featured, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of sellerProducts) {
    insertSellerProduct.run(
      p.name, p.slug, p.description, p.karat, p.category, p.weightGrams,
      p.priceCents, p.imageUrl, p.stock, p.featured, p.active
    );
  }
  const updateGoldBarImage = db.prepare('UPDATE products SET image_url = ? WHERE slug = ?');
  for (const p of goldBarProducts) {
    insertSellerProduct.run(
      p.name, p.slug, p.description, p.karat, p.category, p.weightGrams,
      p.priceCents, p.imageUrl, p.stock, p.featured, p.active
    );
    updateGoldBarImage.run(p.imageUrl, p.slug);
  }
}
