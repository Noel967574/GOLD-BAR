import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useContent } from '../content-store.jsx';
import { useAuth } from '../auth-store.jsx';
import { useCart } from '../cart-store.jsx';

export default function Nav() {
  const { content } = useContent();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const { branding } = content;
  const links = [
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'Our story' },
    { href: '/faq', label: 'Help' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">✦</span>
          <span className="brand-name">{branding.siteName || 'Aurelia Gold'}<small>FINE JEWELRY</small></span>
        </Link>

        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span />
          <span />
        </button>

        <div className={`nav-body ${open ? 'is-open' : ''}`}>
          <nav className="nav-links">
            {links.map((l) => (
              <NavLink key={l.href} to={l.href} end={l.href === '/'} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="nav-bag" to="/checkout" aria-label={`Shopping bag, ${count} items`} onClick={() => setOpen(false)}>
              Bag <span>{count}</span>
            </Link>
            {user ? (
              <>
                <Link className="btn nav-account" to={user.role === 'admin' ? '/admin' : '/dashboard/orders'} onClick={() => setOpen(false)}>
                  {user.role === 'admin' ? 'Studio' : 'My account'}
                </Link>
                <button
                  className="btn solid"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="btn ghost" to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link className="btn solid" to="/register" onClick={() => setOpen(false)}>
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
