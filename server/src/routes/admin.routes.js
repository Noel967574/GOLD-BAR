import { Router } from 'express';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { dataDir, db, getContent, setContent } from '../db.js';
import { requireAdmin } from '../auth.js';
import { REFERRAL_BONUS_PCT } from './account.routes.js';
import { toCents } from '../util.js';
import { bitcoinPayment } from '../payment.config.js';

const router = Router();
router.use(requireAdmin);

const TX_COLUMNS =
  't.id, t.user_id, t.type, t.amount_cents, t.status, t.method, t.reference, t.note, t.admin_note, t.created_at, t.reviewed_at, u.email, u.name';

const shapeProduct = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  karat: p.karat,
  category: p.category,
  weightGrams: p.weight_grams,
  priceCents: p.price_cents,
  imageUrl: p.image_url,
  stock: p.stock,
  featured: Boolean(p.featured),
  active: Boolean(p.active)
});

function validateProduct(body) {
  const name = String(body.name || '').trim().slice(0, 100);
  const description = String(body.description || '').trim().slice(0, 1000);
  const category = String(body.category || '').trim().slice(0, 40);
  const karat = Number(body.karat);
  const active = body.active !== false;
  const weightInput = String(body.weightGrams ?? '').trim();
  const weightGrams = weightInput ? Number(weightInput) : 0;
  const priceInput = String(body.price ?? '').trim();
  const parsedPriceCents = priceInput ? toCents(priceInput) : 0;
  const priceCents = parsedPriceCents ?? 0;
  const stock = Number(body.stock);
  const imageUrl = String(body.imageUrl || '').trim().slice(0, 1000);
  if (!name || !category) return { error: 'Product name and category are required.' };
  if (![9, 10, 14, 18, 22, 24].includes(karat)) return { error: 'Choose a supported gold carat.' };
  if (!Number.isFinite(weightGrams) || weightGrams < 0 || weightGrams > 10000 || (active && weightGrams === 0))
    return { error: 'Enter a valid weight greater than zero before making the product available.' };
  if ((priceInput && parsedPriceCents === null) || !Number.isSafeInteger(priceCents) || priceCents > 100_000_000 || (active && priceCents === 0))
    return { error: 'Enter a valid price up to $1,000,000 before making the product available.' };
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return { error: 'Stock must be a whole number from 0 to 100,000.' };
  if (imageUrl && !/^https:\/\//i.test(imageUrl) && !/^\/api\/product-images\/[A-Za-z0-9._-]+$/.test(imageUrl))
    return { error: 'Product images must use a secure HTTPS URL or an uploaded image.' };
  return {
    value: {
      name, description, category, karat, weightGrams, priceCents, stock, imageUrl,
      featured: body.featured ? 1 : 0,
      active: active ? 1 : 0
    }
  };
}

router.post('/product-images', (req, res) => {
  const dataUrl = String(req.body.dataUrl || '');
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) return res.status(400).json({ error: 'Choose a PNG, JPEG or WebP product photo.' });

  const [, mimeType, encoded] = match;
  const image = Buffer.from(encoded, 'base64');
  if (!image.length || image.length > 4 * 1024 * 1024 || image.toString('base64') !== encoded)
    return res.status(400).json({ error: 'Product photos must be smaller than 4 MB.' });

  const validSignature = mimeType === 'image/png'
    ? image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : mimeType === 'image/jpeg'
      ? image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff
      : image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP';
  if (!validSignature) return res.status(400).json({ error: 'The selected file does not match its image type.' });

  const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType.slice('image/'.length);
  const filename = `${randomUUID()}.${extension}`;
  const imageDirectory = path.join(dataDir, 'product-images');
  mkdirSync(imageDirectory, { recursive: true });
  writeFileSync(path.join(imageDirectory, filename), image, { flag: 'wx' });
  res.status(201).json({ imageUrl: `/api/product-images/${filename}` });
});

router.get('/products', (_req, res) => {
  const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
  res.json(rows.map(shapeProduct));
});

router.post('/products', (req, res) => {
  const { error, value } = validateProduct(req.body);
  if (error) return res.status(400).json({ error });
  const baseSlug = value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'gold-item';
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const result = db.prepare(`
    INSERT INTO products
      (name, slug, description, karat, category, weight_grams, price_cents, image_url, stock, featured, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    value.name, slug, value.description, value.karat, value.category,
    value.weightGrams, value.priceCents, value.imageUrl, value.stock, value.featured, value.active
  );
  res.status(201).json(shapeProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)));
});

router.put('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM products WHERE id = ?').get(id)) return res.status(404).json({ error: 'Product not found.' });
  const { error, value } = validateProduct(req.body);
  if (error) return res.status(400).json({ error });
  db.prepare(`
    UPDATE products SET name=?, description=?, karat=?, category=?, weight_grams=?, price_cents=?,
      image_url=?, stock=?, featured=?, active=? WHERE id=?
  `).run(
    value.name, value.description, value.karat, value.category, value.weightGrams,
    value.priceCents, value.imageUrl, value.stock, value.featured, value.active, id
  );
  res.json(shapeProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(id)));
});

router.delete('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ error: 'Product not found.' });
  res.json({ ok: true });
});

router.get('/orders', (_req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.email AS account_email
    FROM orders o JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC LIMIT 500
  `).all();
  res.json(orders.map((order) => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(order.id)
  })));
});

router.post('/orders/:id/confirm-payment', (req, res) => {
  const id = Number(req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.payment_method !== 'bitcoin') return res.status(409).json({ error: 'This order does not use Bitcoin payment.' });
  if (order.payment_status === 'confirmed') return res.status(409).json({ error: 'Payment has already been confirmed.' });
  if (!['pending', 'reported'].includes(order.payment_status)) return res.status(409).json({ error: 'This order is not awaiting Bitcoin payment confirmation.' });
  if (order.status !== 'awaiting_payment') return res.status(409).json({ error: 'Only orders awaiting payment can be confirmed.' });

  const result = db.prepare(`
    UPDATE orders
    SET payment_status = 'confirmed', status = 'processing', updated_at = datetime('now')
    WHERE id = ? AND payment_status IN ('pending', 'reported') AND status = 'awaiting_payment'
  `).run(id);
  if (!result.changes) return res.status(409).json({ error: 'This order is no longer awaiting payment confirmation.' });
  res.json({ ok: true, paymentStatus: 'confirmed', status: 'processing' });
});

router.patch('/orders/:id', (req, res) => {
  const id = Number(req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  const status = req.body.status;
  if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(status))
    return res.status(400).json({ error: 'Choose a valid order status.' });
  const transitions = {
    awaiting_payment: ['cancelled'],
    processing: ['shipped', 'delivered', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };
  if (status !== order.status && !transitions[order.status]?.includes(status))
    return res.status(409).json({ error: `An order cannot move from ${order.status} to ${status}.` });
  if (status === 'cancelled' && order.payment_method === 'bitcoin' && order.payment_status === 'confirmed')
    return res.status(409).json({ error: 'This Bitcoin order is paid. Arrange a refund before cancelling it.' });
  if (status === 'processing' && order.payment_method === 'bitcoin' && order.payment_status !== 'confirmed')
    return res.status(409).json({ error: `Confirm the Bitcoin payment to ${bitcoinPayment.address} before processing this order.` });

  db.exec('BEGIN IMMEDIATE');
  try {
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
      const restore = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
      for (const item of items) {
        if (item.product_id) restore.run(item.quantity, item.product_id);
      }
    }
    db.prepare(`
      UPDATE orders
      SET status = ?, payment_status = CASE WHEN ? = 'cancelled' AND payment_status IN ('pending', 'reported') THEN 'cancelled' ELSE payment_status END,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, status, id);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  res.json({ ok: true, status });
});

function pendingQuery(where = '', params = []) {
  return db
    .prepare(
      `SELECT ${TX_COLUMNS} FROM transactions t JOIN users u ON u.id = t.user_id ${where}
       ORDER BY t.id DESC LIMIT 300`
    )
    .all(...params);
}

router.get('/transactions', (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : null;
  res.json(status ? pendingQuery('WHERE t.status = ?', [status]) : pendingQuery());
});

router.post('/transactions/:id/review', (req, res) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(Number(req.params.id));
  if (!tx) return res.status(404).json({ error: 'Transaction not found.' });
  if (tx.status !== 'pending') return res.status(409).json({ error: 'That request has already been reviewed.' });

  const decision = req.body.decision;
  if (!['approved', 'rejected'].includes(decision))
    return res.status(400).json({ error: 'Choose to approve or reject.' });
  const note = String(req.body.note || '').trim().slice(0, 500);

  if (decision === 'approved') {
    if (tx.type === 'deposit') {
      db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(tx.amount_cents, tx.user_id);
      awardReferralBonus(tx.user_id, tx.amount_cents);
    } else if (tx.type === 'withdrawal') {
      const user = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(tx.user_id);
      if (tx.amount_cents > user.balance_cents)
        return res.status(409).json({ error: 'Balance is now too low to pay out this withdrawal.' });
      db.prepare('UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?').run(tx.amount_cents, tx.user_id);
    } else {
      return res.status(400).json({ error: 'Only deposit and withdrawal requests need review.' });
    }
  }

  db.prepare("UPDATE transactions SET status = ?, admin_note = ?, reviewed_at = datetime('now') WHERE id = ?").run(
    decision,
    note,
    tx.id
  );
  res.json({ ok: true });
});

/** First funded deposit pays a one-off percentage bonus to the referring account. */
function awardReferralBonus(userId, depositCents) {
  const user = db.prepare('SELECT referred_by FROM users WHERE id = ?').get(userId);
  if (!user?.referred_by) return;

  const alreadyRewarded = db
    .prepare("SELECT COUNT(*) AS n FROM transactions WHERE user_id = ? AND type = 'referral_bonus'")
    .get(userId).n;
  if (alreadyRewarded) return;

  const referrer = db.prepare('SELECT id FROM users WHERE referral_code = ?').get(user.referred_by);
  if (!referrer) return;

  const bonus = Math.round((depositCents * REFERRAL_BONUS_PCT) / 100);
  if (bonus <= 0) return;
  db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(bonus, referrer.id);
  db.prepare("INSERT INTO transactions (user_id, type, amount_cents, status, note) VALUES (?, 'referral_bonus', ?, 'approved', ?)").run(
    referrer.id,
    bonus,
    'Referral reward'
  );
}

router.get('/users', (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.balance_cents, u.referral_code, u.referred_by, u.kyc_status, u.created_at,
        (SELECT COALESCE(SUM(amount_cents),0) FROM transactions WHERE user_id = u.id AND status = 'approved'
          AND (type = 'deposit' OR (type = 'adjustment' AND category = 'deposit'))) AS deposited,
        (SELECT COUNT(*) FROM investments WHERE user_id = u.id AND status = 'active') AS active_plans,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count
       FROM users u WHERE u.role = 'user' ORDER BY u.id DESC LIMIT 300`
    )
    .all();
  res.json(rows);
});

const MAX_ADJUSTMENT_CENTS = 100_000_000; // $1,000,000 per single adjustment

/**
 * Every manual entry is ledger type 'adjustment' with a category saying which
 * summary figure it also counts toward, so the client's totals and their
 * transaction history always agree.
 */
const ADJUSTMENT_CATEGORIES = {
  balance: { note: 'Balance adjustment' },
  returns: { note: 'Returns adjustment' },
  bonus: { note: 'Bonus adjustment' },
  referral: { note: 'Referral reward adjustment' },
  deposit: { note: 'Deposit adjustment' },
  withdrawal: { note: 'Withdrawal adjustment' }
};

/**
 * Manual credit or debit. Every adjustment writes a ledger row, so the change shows up
 * in the client's own history with the reason attached.
 */
router.post('/users/:id/adjust', (req, res) => {
  const id = Number(req.params.id);
  const user = db.prepare('SELECT id, balance_cents FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Account not found.' });
  if (id === req.user.id && req.body.direction === 'debit')
    return res.status(400).json({ error: 'You cannot debit your own administrator account.' });

  const category = ADJUSTMENT_CATEGORIES[req.body.category] ? req.body.category : 'balance';
  const magnitude = toCents(req.body.amount);
  if (!magnitude) return res.status(400).json({ error: 'Enter an amount greater than zero.' });
  if (magnitude > MAX_ADJUSTMENT_CENTS) return res.status(400).json({ error: 'That adjustment is too large.' });

  const direction = req.body.direction === 'debit' ? 'debit' : 'credit';
  const delta = direction === 'debit' ? -magnitude : magnitude;
  if (user.balance_cents + delta < 0)
    return res.status(400).json({ error: 'That would take the balance below zero.' });

  const reason = String(req.body.reason || '').trim().slice(0, 300);
  if (reason.length < 3) return res.status(400).json({ error: 'Record a reason for this adjustment.' });

  const mapped = ADJUSTMENT_CATEGORIES[category];
  db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(delta, id);
  db.prepare(
    `INSERT INTO transactions (user_id, type, amount_cents, status, method, note, admin_note, category, reviewed_at)
     VALUES (?, 'adjustment', ?, 'approved', 'Manual entry', ?, ?, ?, datetime('now'))`
  ).run(id, delta, mapped.note, reason, category);

  res.json({ ok: true, category, balanceCents: user.balance_cents + delta });
});

router.patch('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!target) return res.status(404).json({ error: 'Account not found.' });
  if (req.body.role) {
    if (!['user', 'admin'].includes(req.body.role)) return res.status(400).json({ error: 'Unknown role.' });
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(req.body.role, id);
  }
  if (req.body.kycStatus) {
    if (!['unverified', 'pending', 'verified', 'rejected'].includes(req.body.kycStatus))
      return res.status(400).json({ error: 'Unknown verification state.' });
    db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run(req.body.kycStatus, id);
  }
  res.json({ ok: true });
});

/* ---- plans ---- */

const shapePlan = (row) => ({
  id: row.id,
  name: row.name,
  minAmount: row.min_cents / 100,
  maxAmount: row.max_cents / 100,
  roiPct: row.roi_pct,
  termDays: row.term_days,
  payout: row.payout,
  description: row.description,
  active: Boolean(row.active),
  sort: row.sort
});

router.get('/plans', (_req, res) => res.json(db.prepare('SELECT * FROM plans ORDER BY sort, id').all().map(shapePlan)));

function validatePlan(body) {
  const name = String(body.name || '').trim().slice(0, 60);
  if (!name) return { error: 'Give the plan a name.' };
  const min = toCents(body.minAmount ?? 0) ?? 0;
  const max = body.maxAmount ? toCents(body.maxAmount) ?? 0 : 0;
  const roi = Number(body.roiPct);
  const term = Number(body.termDays);
  if (!Number.isFinite(roi) || roi < 0 || roi > 1000) return { error: 'Return must be between 0 and 1000 percent.' };
  if (!Number.isInteger(term) || term < 1 || term > 3650) return { error: 'Term must be between 1 and 3650 days.' };
  if (max && max < min) return { error: 'Maximum cannot be below the minimum.' };
  return {
    value: {
      name,
      min_cents: min,
      max_cents: max,
      roi_pct: roi,
      term_days: term,
      payout: ['at_maturity', 'weekly', 'monthly'].includes(body.payout) ? body.payout : 'at_maturity',
      description: String(body.description || '').trim().slice(0, 500),
      active: body.active === false ? 0 : 1,
      sort: Number(body.sort) || 0
    }
  };
}

router.post('/plans', (req, res) => {
  const { error, value } = validatePlan(req.body);
  if (error) return res.status(400).json({ error });
  const info = db
    .prepare(
      'INSERT INTO plans (name, min_cents, max_cents, roi_pct, term_days, payout, description, active, sort) VALUES (?,?,?,?,?,?,?,?,?)'
    )
    .run(value.name, value.min_cents, value.max_cents, value.roi_pct, value.term_days, value.payout, value.description, value.active, value.sort);
  res.status(201).json(shapePlan(db.prepare('SELECT * FROM plans WHERE id = ?').get(info.lastInsertRowid)));
});

router.put('/plans/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM plans WHERE id = ?').get(id)) return res.status(404).json({ error: 'Plan not found.' });
  const { error, value } = validatePlan(req.body);
  if (error) return res.status(400).json({ error });
  db.prepare(
    'UPDATE plans SET name=?, min_cents=?, max_cents=?, roi_pct=?, term_days=?, payout=?, description=?, active=?, sort=? WHERE id=?'
  ).run(value.name, value.min_cents, value.max_cents, value.roi_pct, value.term_days, value.payout, value.description, value.active, value.sort, id);
  res.json(shapePlan(db.prepare('SELECT * FROM plans WHERE id = ?').get(id)));
});

router.delete('/plans/:id', (req, res) => {
  const id = Number(req.params.id);
  const inUse = db.prepare("SELECT COUNT(*) AS n FROM investments WHERE plan_id = ? AND status = 'active'").get(id).n;
  if (inUse) return res.status(409).json({ error: 'This plan has active investments — deactivate it instead.' });
  db.prepare('UPDATE plans SET active = 0 WHERE id = ?').run(id);
  res.json({ ok: true, deactivated: true });
});

/* ---- content + submissions reuse ---- */

router.put('/content/:key', (req, res) => {
  if (!getContent(req.params.key)) return res.status(404).json({ error: 'Unknown section' });
  setContent(req.params.key, req.body);
  res.json(getContent(req.params.key));
});

router.get('/submissions', (req, res) => {
  const kind = ['contact', 'newsletter'].includes(req.query.kind) ? req.query.kind : null;
  const rows = kind
    ? db.prepare('SELECT * FROM submissions WHERE kind = ? ORDER BY id DESC LIMIT 200').all(kind)
    : db.prepare('SELECT * FROM submissions ORDER BY id DESC LIMIT 200').all();
  res.json(rows.map((r) => ({ ...r, payload: JSON.parse(r.payload) })));
});

export default router;
