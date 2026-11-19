import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth-store.jsx';
import { Section } from '../components/Section.jsx';
import Seo from '../components/Seo.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [form, setForm] = useState({ name: '', email: '', password: '', referral: params.get('ref') || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section className="page narrow">
      <Seo title="Create account" noindex />
      <h1 className="page-title">Create account</h1>
      <form className="form" onSubmit={submit}>
        <label>
          Name
          <input value={form.name} onChange={set('name')} autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            minLength="8"
            required
          />
        </label>
        <label>
          Referral code
          <input value={form.referral} onChange={set('referral')} placeholder="Optional" />
        </label>
        <button className="btn solid lg" type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
        {error && <p className="form-note error">{error}</p>}
      </form>
      <div className="auth-links">
        <Link to="/login">Already have an account?</Link>
      </div>
    </Section>
  );
}
