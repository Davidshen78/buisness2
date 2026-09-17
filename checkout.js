// api/checkout.js
// ------------------------------------------------------------------
// PRELIMINARY STUB for the checkout flow.
// No real payment provider is connected yet — this only logs the
// order attempt and returns a fixed "not available yet" response.
//
// Request/response contract (kept stable for later):
//   POST /api/checkout
//   body: { productId: string, lang?: string, email?: string }
//   200 : { ok, orderId, checkoutUrl, message, product }
//
// To connect a real provider later (Stripe / WayForPay / LiqPay),
// replace ONLY the body of createCheckoutSession() below with a real
// call that returns a redirect URL. The frontend already checks
// `data.checkoutUrl` and will redirect there automatically — no
// frontend changes will be needed at that point.
// ------------------------------------------------------------------

const PRODUCTS = {
  sales:     { name: "AI Sales Machine",     price: 2900, currency: "EUR" },
  hr:        { name: "AI HR Machine",        price: 2900, currency: "EUR" },
  finance:   { name: "AI Finance Machine",   price: 2900, currency: "EUR" },
  marketing: { name: "AI Marketing Machine", price: 2900, currency: "EUR" },
  pm:        { name: "AI PM Machine",        price: 2900, currency: "EUR" },
  strategy:  { name: "AI Strategy Machine",  price: 4900, currency: "EUR" },
};

const MESSAGES = {
  uk: "Оплата ще не підключена. Ми повідомимо, коли вона стане доступною.",
  en: "Payment isn't connected yet. We'll let you know when it's available.",
  es: "El pago aún no está conectado. Te avisaremos cuando esté disponible.",
  de: "Die Zahlung ist noch nicht angebunden. Wir informieren dich, sobald sie verfügbar ist.",
};

// TODO(payment): swap this for a real integration once a provider is chosen.
// Example (Stripe):
//   const session = await stripe.checkout.sessions.create({
//     mode: "payment",
//     line_items: [{ price_data: { currency: product.currency.toLowerCase(),
//       product_data: { name: product.name }, unit_amount: product.price }, quantity: 1 }],
//     success_url: "...", cancel_url: "...",
//   });
//   return session.url;
async function createCheckoutSession(product, email, orderId) {
  return null; // no real checkout URL yet — frontend falls back to the "coming soon" toast
}

function genOrderId() {
  return "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  let body = req.body;
  if (!body || typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch (e) { body = {}; }
  }

  const { productId, lang, email } = body || {};
  const product = PRODUCTS[productId];

  if (!product) {
    res.status(400).json({ ok: false, error: "unknown_product" });
    return;
  }

  const safeLang = MESSAGES[lang] ? lang : "uk";
  const orderId = genOrderId();

  // Keep a record of interest even before payment exists, so no lead is lost.
  console.log("[checkout:stub]", JSON.stringify({ orderId, productId, email: email || null, lang: safeLang, ts: new Date().toISOString() }));

  const checkoutUrl = await createCheckoutSession(product, email, orderId);

  res.status(200).json({
    ok: true,
    orderId,
    checkoutUrl,                 // null for now
    message: MESSAGES[safeLang],
    product: { id: productId, name: product.name, price: product.price, currency: product.currency },
  });
};
