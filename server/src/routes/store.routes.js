import { Router } from 'express';
import { db } from '../db.js';
import { requireUser } from '../auth.js';
import { submitLimit } from '../util.js';
import { bitcoinPayment } from '../payment.config.js';

const router = Router();
router.use(requireUser);

const shapeOrder = (order) => ({
  ...order,
  items: db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id').all(order.id)
});

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 100').all(req.user.id);
  res.json(rows.map(shapeOrder));
});

router.post('/:id/report-payment', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid order ID.' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  if (order.payment_method !== 'bitcoin') return res.status(409).json({ error: 'This order does not use Bitcoin payment.' });
  if (order.payment_status === 'reported') return res.json({ ok: true, paymentStatus: 'reported' });
  if (order.payment_status !== 'pending' || order.status !== 'awaiting_payment')
    return res.status(409).json({ error: 'This order is not awaiting a payment report.' });

  const result = db.prepare(`
    UPDATE orders
    SET payment_status = 'reported', updated_at = datetime('now')
    WHERE id = ? AND user_id = ? AND payment_status = 'pending' AND status = 'awaiting_payment'
  `).run(id, req.user.id);
  if (!result.changes) return res.status(409).json({ error: 'This order is no longer awaiting a payment report.' });
  res.json({ ok: true, paymentStatus: 'reported' });
});

router.post('/', submitLimit, (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length || items.length > 30) return res.status(400).json({ error: 'Add at least one item to your order.' });

  const fields = ['customerName', 'email', 'phone', 'address', 'city', 'postalCode', 'country'];
  const details = Object.fromEntries(fields.map((key) => [key, String(req.body[key] || '').trim().slice(0, 200)]));
  if (fields.some((key) => !details[key])) return res.status(400).json({ error: 'Complete all shipping details to place your order.' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(details.email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  if (req.body.paymentMethod !== 'bitcoin') return res.status(400).json({ error: 'Bitcoin is the only available payment method.' });

  const quantities = new Map();
  for (const item of items) {
    const id = Number(item.productId);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'One or more cart quantities are invalid.' });
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 10)) {
    return res.status(400).json({ error: 'You can order up to 10 of each item.' });
  }

  const products = [];
  for (const [id, quantity] of quantities) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(id);
    if (!product) return res.status(404).json({ error: 'A product in your cart is no longer available.' });
    if (product.stock < quantity) return res.status(409).json({ error: `${product.name} has only ${product.stock} left in stock.` });
    products.push({ ...product, quantity });
  }

  const subtotalCents = products.reduce((sum, p) => sum + p.price_cents * p.quantity, 0);
  const shippingCents = subtotalCents >= 15000 ? 0 : 1200;
  const totalCents = subtotalCents + shippingCents;

  db.exec('BEGIN IMMEDIATE');
  try {
    const order = db.prepare(`
      INSERT INTO orders
        (user_id, status, payment_status, payment_method, subtotal_cents, shipping_cents, total_cents, customer_name, email, phone, address, city, postal_code, country)
      VALUES (?, 'awaiting_payment', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, 'bitcoin', subtotalCents, shippingCents, totalCents,
      details.customerName, details.email, details.phone, details.address,
      details.city, details.postalCode, details.country
    );
    const addItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, karat, quantity, unit_cents, weight_grams)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
    for (const product of products) {
      addItem.run(
        order.lastInsertRowid, product.id, product.name, product.karat,
        product.quantity, product.price_cents, product.weight_grams
      );
      const changed = updateStock.run(product.quantity, product.id, product.quantity);
      if (!changed.changes) throw new Error('Stock changed while placing this order.');
    }
    db.exec('COMMIT');
    res.status(201).json({
      orderId: order.lastInsertRowid,
      totalCents,
      payment: bitcoinPayment
    });
  } catch (error) {
    db.exec('ROLLBACK');
    if (error.message === 'Stock changed while placing this order.') {
      return res.status(409).json({ error: 'Stock changed while placing your order. Please refresh your cart.' });
    }
    throw error;
  }
});

export default router;
