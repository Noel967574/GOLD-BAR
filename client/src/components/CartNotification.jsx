import { Link } from 'react-router-dom';
import { useCart } from '../cart-store.jsx';

export default function CartNotification() {
  const { notification, dismissNotification } = useCart();

  if (!notification) return null;

  return (
    <aside className="cart-notification">
      <div className="cart-notification-message" role="status" aria-live="polite">
        <span className="cart-notification-icon" aria-hidden="true">✓</span>
        <span className="cart-notification-copy">
          <strong>Added to your bag</strong>
          <span>{notification.productName}</span>
        </span>
      </div>
      <Link className="cart-notification-link" to="/checkout" onClick={dismissNotification}>View bag</Link>
      <button
        className="cart-notification-dismiss"
        type="button"
        aria-label="Dismiss add-to-bag notification"
        onClick={dismissNotification}
      >
        ×
      </button>
    </aside>
  );
}
