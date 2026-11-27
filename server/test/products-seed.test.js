import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

const dataDir = mkdtempSync(path.join(tmpdir(), 'gold-product-seed-'));
process.env.DATA_DIR = dataDir;

const { db } = await import('../src/db.js');
const { seedProducts } = await import('../src/products.seed.js');

after(() => {
  db.close();
  rmSync(dataDir, { recursive: true, force: true });
});

test('seeding migrates known old image paths without overwriting admin edits', () => {
  seedProducts();
  const imageDrafts = db.prepare(`
    SELECT slug, image_url, active FROM products
    WHERE slug IN (?, ?, ?) ORDER BY slug
  `).all(
    'gold-link-bracelet-details-to-confirm',
    'gold-rope-chain-necklace-details-to-confirm',
    'heraeus-fine-gold-bar-9999-1kg'
  );
  assert.deepEqual(imageDrafts.map((product) => [product.slug, product.image_url, product.active]), [
    ['gold-link-bracelet-details-to-confirm', '/api/product-images/gold-link-bracelet.jpg', 0],
    ['gold-rope-chain-necklace-details-to-confirm', '/api/product-images/gold-rope-chain-necklace.jpg', 0],
    ['heraeus-fine-gold-bar-9999-1kg', '/api/product-images/heraeus-gold-bar-1kg.jpg', 0]
  ]);

  const slug = 'hyrank-fine-gold-bar-995-1-kg-mwxibc16';
  const setImage = db.prepare('UPDATE products SET image_url = ? WHERE slug = ?');
  setImage.run('/api/product-images/hyrank-gold-bar-1kg.png', slug);
  seedProducts();
  assert.equal(
    db.prepare('SELECT image_url FROM products WHERE slug = ?').get(slug).image_url,
    '/api/product-images/hyrank-gold-bar-1kg.jpg'
  );

  setImage.run('/api/product-images/admin-selected.jpg', slug);
  seedProducts();
  assert.equal(
    db.prepare('SELECT image_url FROM products WHERE slug = ?').get(slug).image_url,
    '/api/product-images/admin-selected.jpg'
  );
});
