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
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1603561596112-db6f0bb9d8d8?auto=format&fit=crop&w=1000&q=85',
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

export function seedProducts() {
  const insert = db.prepare(`
    INSERT INTO products
      (name, slug, description, karat, category, weight_grams, price_cents, image_url, stock, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  if (db.prepare('SELECT COUNT(*) AS n FROM products').get().n === 0) {
    for (const p of products) {
      insert.run(
        p.name, p.slug, p.description, p.karat, p.category, p.weightGrams,
        p.priceCents, p.imageUrl, p.stock, p.featured
      );
    }
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
}
