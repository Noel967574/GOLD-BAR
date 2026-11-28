import { db } from './db.js';

const sellerProducts = [
  {
    name: 'Gold Link Bracelet (Details to Confirm)',
    slug: 'gold-link-bracelet-details-to-confirm',
    description: 'Photo shows a gold link bracelet. Confirm purity, weight, current price, and available stock before listing.',
    karat: 18,
    category: 'Bracelets',
    weightGrams: 0,
    priceCents: 0,
    imageUrl: '/api/product-images/gold-link-bracelet.jpg',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: 'Gold Rope Chain Necklace (Details to Confirm)',
    slug: 'gold-rope-chain-necklace-details-to-confirm',
    description: 'Photo shows a gold rope chain necklace. Confirm purity, weight, current price, and available stock before listing.',
    karat: 18,
    category: 'Necklaces',
    weightGrams: 0,
    priceCents: 0,
    imageUrl: '/api/product-images/gold-rope-chain-necklace.jpg',
    stock: 0,
    featured: 0,
    active: 0
  },
  {
    name: '14k Yellow Gold Solid Twisted Diamond-Cut Rope Chain Necklace 28 in',
    slug: 'seller-14k-solid-rope-chain-28in',
    description: '14k yellow gold solid twisted diamond-cut rope chain, 28 in, 12 mm, 310.9 g, based on the details supplied. The photo appears to show this style; verify the exact match, hallmark, weight, and dimensions. Price is an estimate.',
    karat: 14,
    category: 'Necklaces',
    weightGrams: 310.9,
    priceCents: 2264300,
    imageUrl: '/api/product-images/gold-rope-chain-white.jpg',
    stock: 1,
    featured: 1,
    active: 1
  },
  {
    name: '14k Gold Twisted Rope Chain Necklace - Black Display',
    slug: 'seller-14k-rope-chain-black-display',
    description: 'Gold twisted-rope style necklace shown on a black display. The photo does not confirm purity, weight, or dimensions. 14k, 60 g, and the price are listing estimates; verify all details before purchase.',
    karat: 14,
    category: 'Necklaces',
    weightGrams: 60,
    priceCents: 780000,
    imageUrl: '/api/product-images/gold-rope-chain-black.jpg',
    stock: 1,
    featured: 1,
    active: 1
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
    name: '14k Solid Curb Cuban Link Chain Necklace 20 in - 9 mm',
    slug: 'seller-14k-solid-curb-cuban-chain-20in',
    description: '14k yellow gold solid curb Cuban link chain, 20 in, 9 mm, 42.4 g, based on the details supplied. The photo appears to show this style; verify the exact match, hallmark, weight, and dimensions before purchase.',
    karat: 14,
    category: 'Necklaces',
    weightGrams: 42.4,
    priceCents: 840000,
    imageUrl: '/api/product-images/gold-cuban-link-necklace.jpg',
    stock: 1,
    featured: 1,
    active: 1
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
    name: '14k Solid Miami Cuban Link Bracelet 6 mm - 8 in',
    slug: 'seller-14k-solid-miami-cuban-bracelet-8in',
    description: '14k solid Miami Cuban link bracelet, 6 mm, 8 in, based on the details supplied. The photo appears to show this style. Approx. 25 g is a weight estimate; verify hallmark, weight, and dimensions. Price is based on the supplied amount.',
    karat: 14,
    category: 'Bracelets',
    weightGrams: 25,
    priceCents: 458611,
    imageUrl: '/api/product-images/gold-link-bracelet.jpg',
    stock: 1,
    featured: 1,
    active: 1
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
    featured: 1,
    active: 1
  },
  {
    name: 'Annam 999.9 Fine Gold Bar Assortment - Approx. 50 g',
    slug: '999-9-fine-gold-bar-assortment-weights-to-confirm-mwxib8ih',
    description: 'Annam-branded assortment of ten individually carded fine-gold bars as pictured. Some cards appear marked 999.9; individual weights are not legible enough to confirm. Approx. 50 g total is an estimate only. Verify each bar weight, fineness, and authenticity. Price and one-set availability are estimates.',
    karat: 24,
    category: 'Other',
    weightGrams: 50,
    priceCents: 650000,
    imageUrl: '/api/product-images/gold-bars-assortment.jpg',
    stock: 1,
    featured: 1,
    active: 1
  },
  {
    name: 'GBK 999.9 Fine Gold Bar Set - 22.5 g',
    slug: 'gbk-999-9-fine-gold-bar-set-22-5-g-mwxib9ts',
    description: 'Four fine-gold bars: three stamped 3.75 g and one stamped 11.25 g, 22.5 g total. Stamped 999.9 (99.99% pure, 24K). Price is an estimated gold spot value, not a verified retail quote; confirm the current market price before purchase.',
    karat: 24,
    category: 'Other',
    weightGrams: 22.5,
    priceCents: 258139,
    imageUrl: '/api/product-images/gbk-gold-bar-set-22-5g.jpg',
    stock: 1,
    featured: 1,
    active: 1
  },
  {
    name: 'Royal Mint Britannia Gold Bar - 10 g',
    slug: 'royal-mint-britannia-gold-bar-10-g-mwxibap1',
    description: 'Royal Mint Britannia 10 g gold bar in its presentation card. The photo shows two bars; listed price and stock are estimates, and the fineness stamp is not visible. Verify purity, authenticity, stock, and current price before purchase.',
    karat: 24,
    category: 'Other',
    weightGrams: 10,
    priceCents: 260000,
    imageUrl: '/api/product-images/royal-mint-britannia-10g.jpg',
    stock: 2,
    featured: 1,
    active: 1
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
    featured: 1,
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
    featured: 1,
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
  },
  {
    name: 'Heraeus 999.9 Fine Gold Bar — 1 kg',
    slug: 'heraeus-fine-gold-bar-9999-1kg',
    description: 'Heraeus fine gold bar stamped 999.9 (99.99% pure, 24K), net weight 1,000 g. Verify authenticity, current price, and available stock before listing.',
    karat: 24,
    category: 'Other',
    weightGrams: 1000,
    priceCents: 0,
    imageUrl: '/api/product-images/heraeus-gold-bar-1kg.jpg',
    stock: 0,
    featured: 0,
    active: 0
  }
];

export function seedProducts() {
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
  const updateLegacyGoldBarImage = db.prepare('UPDATE products SET image_url = ? WHERE slug = ? AND image_url = ?');
  const legacyGoldBarImages = [
    ['gbk-999-9-fine-gold-bar-set-22-5-g-mwxib9ts', '/api/product-images/gbk-gold-bar-set-22-5g.png', '/api/product-images/gbk-gold-bar-set-22-5g.jpg'],
    ['royal-mint-britannia-gold-bar-10-g-mwxibap1', '/api/product-images/royal-mint-britannia-10g.png', '/api/product-images/royal-mint-britannia-10g.jpg'],
    ['hyrank-fine-gold-bar-995-1-kg-mwxibc16', '/api/product-images/hyrank-gold-bar-1kg.png', '/api/product-images/hyrank-gold-bar-1kg.jpg']
  ];
  for (const [slug, legacyImageUrl, imageUrl] of legacyGoldBarImages) {
    updateLegacyGoldBarImage.run(imageUrl, slug, legacyImageUrl);
  }

  for (const p of goldBarProducts) {
    insertSellerProduct.run(
      p.name, p.slug, p.description, p.karat, p.category, p.weightGrams,
      p.priceCents, p.imageUrl, p.stock, p.featured, p.active
    );
  }

  db.exec('CREATE TABLE IF NOT EXISTS product_seed_migrations (name TEXT PRIMARY KEY)');
  db.exec('BEGIN IMMEDIATE');
  try {
    const migration = db.prepare('INSERT OR IGNORE INTO product_seed_migrations (name) VALUES (?)')
      .run('replace-featured-samples-with-gold-bars-v1');
    if (migration.changes) {
      db.prepare('DELETE FROM products WHERE slug IN (?, ?, ?)')
        .run('sculpted-signet-ring', 'everyday-gold-hoops', 'fine-paperclip-chain');

      const updateGoldBar = db.prepare(`
        UPDATE products
        SET name=?, description=?, karat=?, category=?, weight_grams=?, price_cents=?,
            image_url=?, stock=?, featured=?, active=?
        WHERE slug=?
      `);
      const featuredGoldBarSlugs = new Set([
        '500-g-999-9-fine-gold-bar-mwxiaxux',
        '999-9-fine-gold-bar-assortment-weights-to-confirm-mwxib8ih',
        'gbk-999-9-fine-gold-bar-set-22-5-g-mwxib9ts',
        'royal-mint-britannia-gold-bar-10-g-mwxibap1',
        'hyrank-fine-gold-bar-995-1-kg-mwxibc16',
        'suisse-fine-gold-bar-999-9-1-kg-mwxibd18'
      ]);
      for (const p of goldBarProducts) {
        if (!featuredGoldBarSlugs.has(p.slug)) continue;
        updateGoldBar.run(
          p.name, p.description, p.karat, p.category, p.weightGrams,
          p.priceCents, p.imageUrl, p.stock, p.featured, p.active, p.slug
        );
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const migration = db.prepare('INSERT OR IGNORE INTO product_seed_migrations (name) VALUES (?)')
      .run('remove-remaining-sample-products-v1');
    if (migration.changes) {
      db.prepare('DELETE FROM products WHERE slug IN (?, ?, ?)')
        .run('classic-rope-bracelet', 'petite-diamond-pendant', 'horizon-wedding-band');
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const migration = db.prepare('INSERT OR IGNORE INTO product_seed_migrations (name) VALUES (?)')
      .run('add-submitted-gold-jewelry-v1');
    if (migration.changes) {
      const updateProduct = db.prepare(`
        UPDATE products
        SET name=?, description=?, karat=?, category=?, weight_grams=?, price_cents=?,
            image_url=?, stock=?, featured=?, active=?
        WHERE slug=?
      `);
      const updatedSlugs = new Set([
        'seller-14k-solid-rope-chain-28in',
        'seller-14k-solid-curb-cuban-chain-20in',
        'seller-14k-solid-miami-cuban-bracelet-8in'
      ]);
      for (const p of sellerProducts) {
        if (!updatedSlugs.has(p.slug)) continue;
        updateProduct.run(
          p.name, p.description, p.karat, p.category, p.weightGrams,
          p.priceCents, p.imageUrl, p.stock, p.featured, p.active, p.slug
        );
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
