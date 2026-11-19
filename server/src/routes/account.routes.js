import { Router } from 'express';
import { db } from '../db.js';
import { requireUser } from '../auth.js';
import { submitLimit, toCents } from '../util.js';

const router = Router();
router.use(requireUser);

const REFERRAL_BONUS_PCT = Number(process.env.REFERRAL_BONUS_PCT || 5);

function totals(userId) {
  // Approved rows of the ledger type, plus manual adjustments filed under that
  // category (e.g. 'returns' adjustments count toward Returns earned).
  const sum = (type, category = null) =>
    db
      .prepare(
        `SELECT COALESCE(SUM(amount_cents), 0) AS n FROM transactions
         WHERE user_id = ? AND status = 'approved'
           AND (type = ? OR (type = 'adjustment' AND category = ?))`
      )
      .get(userId, type, category).n;

  const pendingWithdrawal = db
    .prepare("SELECT COALESCE(SUM(amount_cents), 0) AS n FROM transactions WHERE user_id = ? AND type = 'withdrawal' AND status = 'pending'")
    .get(userId).n;

  const row = db.prepare('SELECT balance_cents FROM users WHERE id = ?').get(userId);
  return {
    balanceCents: row.balance_cents,
    availableCents: row.balance_cents - pendingWithdrawal,
    pendingWithdrawalCents: pendingWithdrawal,
    totalDepositCents: sum('deposit', 'deposit'),
    totalWithdrawalCents: sum('withdrawal', 'withdrawal'),
    totalProfitCents: sum('profit', 'returns'),
    bonusCents: sum('bonus', 'bonus'),
    referralBonusCents: sum('referral_bonus', 'referral')
  };
}

/** Credit returns for investments whose term has elapsed. */
function settleMatured(userId) {
  const due = db
    .prepare("SELECT * FROM investments WHERE user_id = ? AND status = 'active' AND matures_at <= datetime('now')")
    .all(userId);
  for (const inv of due) {
    const plan = db.prepare('SELECT roi_pct FROM plans WHERE id = ?').get(inv.plan_id);
    const profit = Math.round((inv.principal_cents * (plan?.roi_pct ?? 0)) / 100);
    db.prepare("UPDATE investments SET status = 'settled', payout_cents = ? WHERE id = ?").run(
      inv.principal_cents + profit,
      inv.id
    );
    db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(
      inv.principal_cents + profit,
      userId
    );
    db.prepare('INSERT INTO transactions (user_id, type, amount_cents, status, note) VALUES (?, ?, ?, ?, ?)').run(
      userId,
      'profit',
      profit,
      'approved',
      `Return on ${inv.plan_id}`
    );
  }
  return due.length;
}

router.get('/summary', (req, res) => {
  settleMatured(req.user.id);
  const summaryTotals = totals(req.user.id);
  const active = db
    .prepare(
      `SELECT i.id, i.principal_cents, i.matures_at, i.started_at, p.name AS plan_name, p.roi_pct, p.term_days
       FROM investments i JOIN plans p ON p.id = i.plan_id
       WHERE i.user_id = ? AND i.status = 'active' ORDER BY i.matures_at`
    )
    .all(req.user.id);

  const recent = db
    .prepare('SELECT id, type, amount_cents, status, method, note, created_at FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 5')
    .all(req.user.id);

  res.json({
    user: { id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role, kycStatus: req.user.kycStatus },
    totals: summaryTotals,
    activePlans: active,
    recentTransactions: recent
  });
});

router.get('/transactions', (req, res) => {
  settleMatured(req.user.id);
  const type = ['deposit', 'withdrawal', 'investment', 'profit', 'bonus', 'referral_bonus', 'adjustment'].includes(req.query.type)
    ? req.query.type
    : null;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = type
    ? db.prepare('SELECT * FROM transactions WHERE user_id = ? AND type = ? ORDER BY id DESC LIMIT ?').all(req.user.id, type, limit)
    : db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT ?').all(req.user.id, limit);
  res.json(rows);
});

router.post('/deposit', submitLimit, (req, res) => {
  const cents = toCents(req.body.amount);
  if (!cents || cents < 1000) return res.status(400).json({ error: 'Enter a deposit amount of at least $10.' });
  const method = String(req.body.method || '').trim();
  if (!method) return res.status(400).json({ error: 'Choose a payment method.' });

  db.prepare("INSERT INTO transactions (user_id, type, amount_cents, status, method) VALUES (?, 'deposit', ?, 'pending', ?)").run(
    req.user.id,
    cents,
    method
  );
  res.status(201).json({ ok: true, message: 'Deposit request submitted for review.' });
});

router.post('/withdraw', submitLimit, (req, res) => {
  const cents = toCents(req.body.amount);
  const { availableCents } = totals(req.user.id);
  if (!cents || cents < 1000) return res.status(400).json({ error: 'Enter a withdrawal amount of at least $10.' });
  if (cents > availableCents)
    return res.status(400).json({ error: 'That exceeds your available balance.' });

  db.prepare(
    "INSERT INTO transactions (user_id, type, amount_cents, status, method, reference) VALUES (?, 'withdrawal', ?, 'pending', ?, ?)"
  ).run(req.user.id, cents, String(req.body.method || '').trim(), String(req.body.reference || '').trim());
  res.status(201).json({ ok: true, message: 'Withdrawal request submitted for review.' });
});

router.post('/invest', submitLimit, (req, res) => {
  const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND active = 1').get(Number(req.body.planId));
  if (!plan) return res.status(404).json({ error: 'That plan is not available.' });
  const cents = toCents(req.body.amount);
  if (!cents) return res.status(400).json({ error: 'Enter an investment amount.' });
  if (cents < plan.min_cents) return res.status(400).json({ error: `${plan.name} starts at a larger amount.` });
  if (plan.max_cents && cents > plan.max_cents) return res.status(400).json({ error: 'That exceeds this plan maximum.' });

  const { availableCents } = totals(req.user.id);
  if (cents > availableCents) return res.status(400).json({ error: 'Your available balance does not cover that amount.' });

  const maturesAt = new Date(Date.now() + plan.term_days * 86400_000).toISOString().slice(0, 19).replace('T', ' ');
  db.prepare('UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?').run(cents, req.user.id);
  const info = db
    .prepare('INSERT INTO investments (user_id, plan_id, principal_cents, matures_at) VALUES (?, ?, ?, ?)')
    .run(req.user.id, plan.id, cents, maturesAt);
  db.prepare(
    "INSERT INTO transactions (user_id, type, amount_cents, status, note) VALUES (?, 'investment', ?, 'approved', ?)"
  ).run(req.user.id, cents, plan.name);

  res.status(201).json({ ok: true, investmentId: info.lastInsertRowid, maturesAt });
});

router.get('/referral', (req, res) => {
  const base = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;
  const count = db.prepare('SELECT COUNT(*) AS n FROM users WHERE referred_by = ?').get(req.user.referralCode).n;
  res.json({
    code: req.user.referralCode,
    link: `${base}/register?ref=${req.user.referralCode}`,
    referredCount: count,
    earnedCents: db
      .prepare(
        `SELECT COALESCE(SUM(amount_cents), 0) AS n FROM transactions
         WHERE user_id = ? AND status = 'approved'
           AND (type = 'referral_bonus' OR (type = 'adjustment' AND category = 'referral'))`
      )
      .get(req.user.id).n,
    bonusPct: REFERRAL_BONUS_PCT
  });
});

export { REFERRAL_BONUS_PCT };
export default router;
