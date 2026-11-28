import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

async function unusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

function saveCookies(response, cookies) {
  const setCookies = response.headers.getSetCookie?.() || [response.headers.get('set-cookie')].filter(Boolean);
  for (const setCookie of setCookies) {
    const pair = setCookie.split(';', 1)[0];
    const separator = pair.indexOf('=');
    if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
}

async function request(baseUrl, route, { cookies = new Map(), csrfToken, method = 'GET', body } = {}) {
  const headers = {};
  if (cookies.size) headers.cookie = [...cookies].map(([name, value]) => `${name}=${value}`).join('; ');
  if (csrfToken) headers['x-csrf-token'] = csrfToken;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  saveCookies(response, cookies);
  return { response, data: await response.json().catch(() => null) };
}

async function register(baseUrl, email) {
  const cookies = new Map();
  const registration = await request(baseUrl, '/api/auth/register', {
    method: 'POST',
    cookies,
    body: { email, name: 'Test customer', password: 'CustomerPass123' }
  });
  assert.equal(registration.response.status, 201);
  const session = await request(baseUrl, '/api/auth/session', { cookies });
  return { cookies, csrfToken: session.data.csrfToken };
}

test('customers report Bitcoin payments and only admins can confirm them', { timeout: 30000 }, async (t) => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), 'gold-payment-flow-'));
  const port = await unusedPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    PORT: String(port),
    DATA_DIR: dataDir,
    NODE_ENV: 'test',
    APP_SECRET: 'test-session-secret-with-at-least-32-characters',
    ADMIN_EMAIL: 'admin@example.test',
    ADMIN_PASSWORD: 'AdminPass123'
  };
  delete env.SUPABASE_URL;
  delete env.SUPABASE_SERVICE_ROLE_KEY;

  const serverDirectory = fileURLToPath(new URL('../', import.meta.url));
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd: serverDirectory,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
  child.stderr.setEncoding('utf8').on('data', (chunk) => { output += chunk; });
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, 'exit');
      child.kill();
      await exited;
    }
    await rm(dataDir, { recursive: true, force: true });
  });

  let ready = false;
  let connectionError = '';
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch (error) {
      connectionError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, `Server failed to start. ${connectionError} ${output}`);

  const productResult = await request(baseUrl, '/api/products');
  const product = productResult.data[0];
  assert.ok(product);
  const customer = await register(baseUrl, 'buyer@example.test');
  const orderResult = await request(baseUrl, '/api/orders', {
    method: 'POST',
    cookies: customer.cookies,
    csrfToken: customer.csrfToken,
    body: {
      customerName: 'Test customer',
      email: 'buyer@example.test',
      phone: '5550100',
      address: '1 Test Street',
      city: 'Test City',
      postalCode: '10000',
      country: 'US',
      paymentMethod: 'bitcoin',
      items: [{ productId: product.id, quantity: 1 }]
    }
  });
  assert.equal(orderResult.response.status, 201);
  const orderId = orderResult.data.orderId;

  const otherCustomer = await register(baseUrl, 'other@example.test');
  const foreignReport = await request(baseUrl, `/api/orders/${orderId}/report-payment`, {
    method: 'POST',
    cookies: otherCustomer.cookies,
    csrfToken: otherCustomer.csrfToken,
    body: {}
  });
  assert.equal(foreignReport.response.status, 404);

  const report = await request(baseUrl, `/api/orders/${orderId}/report-payment`, {
    method: 'POST',
    cookies: customer.cookies,
    csrfToken: customer.csrfToken,
    body: {}
  });
  assert.equal(report.response.status, 200);
  assert.equal(report.data.paymentStatus, 'reported');

  const unauthorizedConfirmation = await request(baseUrl, `/api/admin/orders/${orderId}/confirm-payment`, {
    method: 'POST',
    cookies: customer.cookies,
    csrfToken: customer.csrfToken,
    body: {}
  });
  assert.equal(unauthorizedConfirmation.response.status, 403);

  const adminCookies = new Map();
  const adminLogin = await request(baseUrl, '/api/auth/login', {
    method: 'POST',
    cookies: adminCookies,
    body: { email: 'admin@example.test', password: 'AdminPass123' }
  });
  assert.equal(adminLogin.response.status, 200);
  const adminSession = await request(baseUrl, '/api/auth/session', { cookies: adminCookies });
  const confirmation = await request(baseUrl, `/api/admin/orders/${orderId}/confirm-payment`, {
    method: 'POST',
    cookies: adminCookies,
    csrfToken: adminSession.data.csrfToken,
    body: {}
  });
  assert.equal(confirmation.response.status, 200);

  const customerOrders = await request(baseUrl, '/api/orders', { cookies: customer.cookies });
  assert.equal(customerOrders.data[0].payment_status, 'confirmed');
  assert.equal(customerOrders.data[0].status, 'processing');

  const secondProduct = productResult.data.find((item) => item.stock > 1);
  assert.ok(secondProduct);
  const secondOrderResult = await request(baseUrl, '/api/orders', {
    method: 'POST',
    cookies: customer.cookies,
    csrfToken: customer.csrfToken,
    body: {
      customerName: 'Test customer',
      email: 'buyer@example.test',
      phone: '5550100',
      address: '1 Test Street',
      city: 'Test City',
      postalCode: '10000',
      country: 'US',
      paymentMethod: 'bitcoin',
      items: [{ productId: secondProduct.id, quantity: 1 }]
    }
  });
  assert.equal(secondOrderResult.response.status, 201);
  const secondOrderId = secondOrderResult.data.orderId;
  const secondReport = await request(baseUrl, `/api/orders/${secondOrderId}/report-payment`, {
    method: 'POST',
    cookies: customer.cookies,
    csrfToken: customer.csrfToken,
    body: {}
  });
  assert.equal(secondReport.data.paymentStatus, 'reported');

  const cancellation = await request(baseUrl, `/api/admin/orders/${secondOrderId}`, {
    method: 'PATCH',
    cookies: adminCookies,
    csrfToken: adminSession.data.csrfToken,
    body: { status: 'cancelled' }
  });
  assert.equal(cancellation.response.status, 200);
  const ordersAfterCancellation = await request(baseUrl, '/api/orders', { cookies: customer.cookies });
  const cancelledOrder = ordersAfterCancellation.data.find((item) => item.id === secondOrderId);
  assert.equal(cancelledOrder.payment_status, 'cancelled');
});
