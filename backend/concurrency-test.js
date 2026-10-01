const BASE = process.env.BASE || 'http://localhost:3000';

async function call(path, options = {}) {
  const res = await fetch(BASE + path, {
    method: options.method || 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      'X-Member-Id': options.member || ('concurrency-' + Math.random().toString(36).slice(2, 8)),
      ...(options.idem ? { 'Idempotency-Key': options.idem } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {}

  return { status: res.status, json };
}

(async () => {
  const menu = await call('/api/menu');

  if (menu.status !== 200 || !menu.json?.dishes?.length) {
    throw new Error('Could not read menu');
  }

  const dish = menu.json.dishes.find((d) => d.orderable);

  if (!dish) {
    throw new Error('No orderable dish found');
  }

  const originalStock = dish.stock;

  console.log(`Testing "${dish.name}" (id ${dish.id})`);
  console.log(`Original stock: ${originalStock}`);

  try {
    // Set exactly one item in stock.
    const set = await call(`/api/menu/${dish.id}/stock`, {
      method: 'PATCH',
      body: { stock: 1 },
    });

    if (set.status !== 200) {
      throw new Error(`Could not set stock to 1: HTTP ${set.status}`);
    }

    console.log('Stock set to 1.');

    // Start both requests without waiting for either to finish.
    const [studentA, studentB] = await Promise.all([
      call('/api/orders', {
        method: 'POST',
        body: { items: [{ dishId: dish.id, qty: 1 }] },
      }),
      call('/api/orders', {
        method: 'POST',
        body: { items: [{ dishId: dish.id, qty: 1 }] },
      }),
    ]);

    console.log(`Student A: HTTP ${studentA.status}`);
    console.log(`Student B: HTTP ${studentB.status}`);

    const successes = [studentA, studentB].filter(
      (result) => result.status === 201
    ).length;

    console.log(`Successful orders: ${successes}`);

    if (successes > 1) {
      console.error('FAIL: both students received the last item.');
      process.exitCode = 1;
    } else if (successes === 1) {
      console.log('PASS: only one student received the last item.');
    } else {
      console.log('PASS: neither request incorrectly consumed the item.');
    }
  } finally {
    // Always restore the original stock.
    const restore = await call(`/api/menu/${dish.id}/stock`, {
      method: 'PATCH',
      body: { stock: originalStock },
    });

    if (restore.status !== 200) {
      console.error(`WARNING: could not restore stock (HTTP ${restore.status})`);
      process.exitCode = 1;
    } else {
      console.log(`Stock restored to ${originalStock}.`);
    }
  }
})();