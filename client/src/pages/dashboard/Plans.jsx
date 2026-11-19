import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [amounts, setAmounts] = useState({});
  const [note, setNote] = useState({});

  async function load() {
    const [p, s] = await Promise.all([api.plans(), api.summary()]);
    setPlans(p);
    setSummary(s);
  }

  useEffect(() => {
    load().catch((e) => setNote({ _: e.message }));
  }, []);

  async function buy(plan) {
    setNote({ ...note, [plan.id]: '' });
    try {
      await api.invest({ planId: plan.id, amount: amounts[plan.id] });
      setNote({ [plan.id]: 'Investment opened.' });
      await load();
    } catch (e) {
      setNote({ ...note, [plan.id]: e.message });
    }
  }

  if (!summary) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Investment plans</h1>
      <p className="muted">
        Available to invest: <strong>{money(summary.totals.availableCents)}</strong>
      </p>
      <div className="grid cols-3">
        {plans.map((plan) => (
          <article className={`plan ${plan.payout !== 'at_maturity' ? 'featured' : ''}`} key={plan.id}>
            <h3>{plan.name}</h3>
            <p className="muted">{plan.description}</p>
            <dl className="spec">
              <div>
                <dt>Return</dt>
                <dd>{plan.roiPct}%</dd>
              </div>
              <div>
                <dt>Term</dt>
                <dd>{plan.termDays} days</dd>
              </div>
              <div>
                <dt>Minimum</dt>
                <dd>{money(plan.minAmount * 100)}</dd>
              </div>
              <div>
                <dt>Payout</dt>
                <dd>{plan.payout === 'at_maturity' ? 'At maturity' : plan.payout}</dd>
              </div>
            </dl>
            <label className="field">
              Amount to invest
              <input
                type="number"
                min={plan.minAmount}
                step="0.01"
                value={amounts[plan.id] || ''}
                onChange={(e) => setAmounts({ ...amounts, [plan.id]: e.target.value })}
                placeholder={`${plan.minAmount}–${plan.maxAmount || '∞'}`}
              />
            </label>
            <button className="btn solid" onClick={() => buy(plan)}>
              Invest
            </button>
            {note[plan.id] && <p className="form-note success">{note[plan.id]}</p>}
          </article>
        ))}
      </div>
    </>
  );
}
