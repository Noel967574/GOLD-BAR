import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth-store.jsx';
import Seo from '../components/Seo.jsx';

const links = [
  { to: '/dashboard/orders', label: 'My orders' },
  { to: '/dashboard/settings', label: 'Settings' }
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <Seo title="Account" noindex />
      <div className="dash">
        <aside className="dash-side">
          <div className="account-side-brand"><span className="brand-mark">✦</span><strong>My account</strong></div>
          <p className="dash-hello">Welcome, {user.name || user.email}</p>
          <nav className="dash-nav">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
                {l.label}
              </NavLink>
            ))}
            {user.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                Admin console
              </NavLink>
            )}
          </nav>
          <NavLink className="account-shop-link" to="/shop">← Continue shopping</NavLink>
          <button className="btn outline account-signout" onClick={logout}>Sign out</button>
        </aside>
        <div className="dash-main">
          <Outlet />
        </div>
      </div>
    </>
  );
}
