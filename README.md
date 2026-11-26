# Aurelia Gold

A full-stack storefront for solid-gold jewelry in 9k, 10k, 14k, 18k, 22k and 24k. Customers can browse by collection and gold purity, build a cart, place an order, and track fulfillment. Store staff can manage products, stock, customer orders, and storefront content.

## Run locally

```bash
npm install
npm run dev
```

The storefront runs on port **5180** and the API on **5174**. The Vite development server proxies `/api` requests to the API.

Production:

```bash
npm run build
npm run start
```

## Deploy to Render

The included `render.yaml` configures one Node web service and a 1 GB persistent disk for the SQLite database and uploaded product photos. In Render, create a Blueprint from this repository and branch `main`, review the paid service and disk charges, and provide `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` when prompted. Render generates `APP_SECRET`. Production startup refuses to use the default development admin password. Keep the Render disk attached at `/var/data`; removing it deletes the live database and uploaded photos.

## Store management

Open `/admin` and sign in with the configured admin account. The Store studio provides:

- **Orders:** customer and delivery details, line items, Bitcoin payment status, and fulfillment status. Staff manually verify incoming Bitcoin before confirming payment and processing an order. Cancelling an order returns its items to inventory.
- **Products:** add, edit, or delete jewelry, including purity, category, weight, price, descriptions, photos, stock, homepage feature status, and storefront visibility. Admins can upload PNG, JPEG, or WebP product photos up to 4 MB, or remove a photo. Hidden drafts may be saved before price or weight is known.
- **Customers:** registered customer accounts.
- **Storefront:** edit branding and public page content.
- **Messages:** review contact and newsletter submissions.

Sample products are added automatically on a new database. Their product illustrations are bundled in `client/public/products`, so they work offline. Existing product data and uploaded customer photos are preserved. New orders reserve inventory at checkout; prices and stock are validated by the server.

Default admin: `admin@example.com` / `changeme`. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` before the first run in any shared or production environment.

Set `APP_SECRET` to a long random string in production. Without it, a random secret is generated once and saved in `server/data/.session-secret` so sessions survive restarts.

## Customer experience

- `/` — storefront homepage and featured pieces
- `/shop` — product collection with category and gold-purity filters
- `/checkout` — account checkout with Bitcoin payment instructions
- `/dashboard/orders` — order status and item history
- `/dashboard/settings` — customer profile and password settings

Complimentary shipping applies to orders of $150 or more; otherwise shipping is $12. Bitcoin on the Bitcoin network is the sole checkout method. Customers see the USD total and configured wallet address, then send the BTC equivalent using their wallet's current rate. Payments are not automatically detected or converted: staff must verify incoming Bitcoin themselves and confirm payment in the Store studio before fulfillment. Customers are not asked to provide a transaction hash.

## API overview

- `GET /api/products` — live, in-stock storefront catalog
- `GET /api/payment-info` — Bitcoin network and receiving address
- `GET|POST /api/orders` — current customer's orders and checkout
- `GET|POST /api/admin/products` and `PUT /api/admin/products/:id` — product inventory
- `GET /api/admin/orders`, `POST /api/admin/orders/:id/confirm-payment`, and `PATCH /api/admin/orders/:id` — payment confirmation and order fulfillment
- `GET /api/admin/users` — customer accounts
- `PUT /api/admin/content/:key` — storefront copy and branding

Order prices are calculated from current server-side product records. Checkout checks inventory and writes the order and stock changes in one SQLite transaction. Bitcoin orders remain `awaiting_payment` until an administrator manually confirms payment; only then can fulfillment proceed. Signed cookie sessions and CSRF checks protect account and admin actions.

The SQLite database is at `server/data/site.db`; back it up by copying the file when the server is stopped.
