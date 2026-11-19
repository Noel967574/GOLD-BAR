import { db } from './db.js';

const sample = [
  { name: 'Starter', min_cents: 10000, max_cents: 99999, roi_pct: 5, term_days: 30, payout: 'at_maturity', description: 'Entry tier for first-time investors.', sort: 1 },
  { name: 'Growth', min_cents: 100000, max_cents: 999999, roi_pct: 12, term_days: 90, payout: 'weekly', description: 'Mid tier with periodic payouts.', sort: 2 },
  { name: 'Private', min_cents: 1000000, max_cents: 0, roi_pct: 22, term_days: 180, payout: 'at_maturity', description: 'Larger commitments, longer term.', sort: 3 }
];

export function seedPlans() {
  if (db.prepare('SELECT COUNT(*) AS n FROM plans').get().n > 0) return;
  const insert = db.prepare(
    'INSERT INTO plans (name, min_cents, max_cents, roi_pct, term_days, payout, description, active, sort) VALUES (?,?,?,?,?,?,?,?,?)'
  );
  for (const p of sample) insert.run(p.name, p.min_cents, p.max_cents, p.roi_pct, p.term_days, p.payout, p.description, 1, p.sort);
}
