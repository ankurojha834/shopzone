const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Groq Config ─────
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

// ─── In-memory Data ───────────
let cart = [];
let orders = [];
let nextOrderId = 1001;

const products = [
  { id: 1, name: "Apple AirPods Pro (2nd Gen)", price: 24900, rating: 4.8, reviews: 18432, category: "Electronics", image: "https://images.unsplash.com/photo-1588423771073-b8903fead85b?w=400&q=80", badge: "Best Seller", stock: 50 },
  { id: 2, name: "Samsung 55\" 4K QLED Smart TV", price: 54999, rating: 4.6, reviews: 9821, category: "Electronics", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&q=80", badge: "Deal", stock: 12 },
  { id: 3, name: "Nike Air Max 270 Sneakers", price: 8995, rating: 4.5, reviews: 6234, category: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", badge: null, stock: 80 },
  { id: 4, name: "Instant Pot Duo 7-in-1 Pressure Cooker", price: 7499, rating: 4.7, reviews: 24100, category: "Kitchen", image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80", badge: "Best Seller", stock: 34 },
  { id: 5, name: "The Midnight Library – Matt Haig", price: 499, rating: 4.9, reviews: 31222, category: "Books", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", badge: null, stock: 200 },
  { id: 6, name: "Dyson V15 Detect Vacuum Cleaner", price: 52900, rating: 4.7, reviews: 4411, category: "Home", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", badge: "Premium", stock: 8 },
  { id: 7, name: "Logitech MX Master 3 Mouse", price: 8495, rating: 4.8, reviews: 12099, category: "Electronics", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80", badge: null, stock: 45 },
  { id: 8, name: "LEGO Star Wars Millennium Falcon", price: 12999, rating: 4.9, reviews: 8871, category: "Toys", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80", badge: "Limited", stock: 5 },
  { id: 9, name: "Kindle Paperwhite 11th Gen", price: 13999, rating: 4.6, reviews: 15344, category: "Electronics", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80", badge: null, stock: 60 },
  { id: 10, name: "Yoga Mat Premium Non-Slip", price: 1299, rating: 4.4, reviews: 3902, category: "Sports", image: "https://images.unsplash.com/photo-1601925228078-be1cc7c2df98?w=400&q=80", badge: null, stock: 120 },
  { id: 11, name: "Nespresso Vertuo Next Coffee Machine", price: 15999, rating: 4.5, reviews: 7654, category: "Kitchen", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", badge: "Deal", stock: 20 },
  { id: 12, name: "Sony WH-1000XM5 Headphones", price: 29990, rating: 4.8, reviews: 21003, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", badge: "Best Seller", stock: 30 },
];

const categories = ["All", "Electronics", "Fashion", "Kitchen", "Books", "Home", "Toys", "Sports"];

// ─── Groq Helper ───────────────────────────────────────────────────
async function askGroq(systemPrompt, userMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Groq API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Auth (in-memory) ─────────────────────────────────────────────
let users = [];
let nextUserId = 1;

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });

  const user = { id: nextUserId++, name, email, createdAt: new Date().toISOString() };
  users.push({ ...user, password }); // store password separately (plain text — demo only)
  res.status(201).json({ user });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const found = users.find(u => u.email === email && u.password === password);
  if (!found)
    return res.status(401).json({ error: 'Invalid email or password' });

  const { password: _pw, ...user } = found;
  res.json({ user });
});


app.get('/api/smart-search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'Query required' });
  }

  try {
    const productList = products.map(p =>
      `ID:${p.id} | ${p.name} | ₹${p.price} | Rating:${p.rating} | Category:${p.category} | Stock:${p.stock}`
    ).join('\n');

    const systemPrompt = `You are a smart product search engine for an Indian e-commerce store.
Given a list of products and a user's search query (which may be in English, Hindi, or Hinglish),
return ONLY a JSON array of product IDs that best match the query.
Consider: product name, category, price range mentioned, use case described.
Return format: [1, 5, 9] — just the array, no explanation, no markdown.
If nothing matches, return: []`;

    const userMessage = `Products:\n${productList}\n\nUser query: "${q}"`;
    const aiResponse = await askGroq(systemPrompt, userMessage);
    const cleanResponse = aiResponse.trim().replace(/```json|```/g, '').trim();
    let matchedIds = [];

    try {
      matchedIds = JSON.parse(cleanResponse);
      if (!Array.isArray(matchedIds)) matchedIds = [];
    } catch {
      matchedIds = [];
    }

    const matchedProducts = products.filter(p => matchedIds.includes(p.id));
    res.json({ query: q, total: matchedProducts.length, products: matchedProducts, ai_powered: true });

  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ error: 'AI search failed', details: error.message });
  }
});

// ─── Products ─────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let result = [...products];
  if (category && category !== 'All') result = result.filter(p => p.category === category);
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  res.json({ products: result, total: result.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.get('/api/categories', (req, res) => res.json(categories));

// ─── Cart ─────────────────────────────────────────────────────────
const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
const cartCount = () => cart.reduce((s, i) => s + i.quantity, 0);

app.get('/api/cart', (req, res) => {
  res.json({ items: cart, total: cartTotal(), count: cartCount() });
});

app.post('/api/cart', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, name: product.name, price: product.price, image: product.image, quantity });
  }
  res.json({ items: cart, total: cartTotal(), count: cartCount() });
});

app.put('/api/cart/:productId', (req, res) => {
  const id = parseInt(req.params.productId);
  const { quantity } = req.body;
  const item = cart.find(i => i.productId === id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  item.quantity = Math.max(1, quantity);
  res.json({ items: cart, total: cartTotal(), count: cartCount() });
});

app.delete('/api/cart/:productId', (req, res) => {
  const id = parseInt(req.params.productId);
  cart = cart.filter(i => i.productId !== id);
  res.json({ items: cart, total: cartTotal(), count: cartCount() });
});

// ─── Orders ───────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  const order = {
    id: nextOrderId++,
    items: [...cart],
    total: cartTotal(),
    status: 'Confirmed',
    date: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
  };
  orders.push(order);
  cart = [];
  res.json(order);
});

app.get('/api/orders', (req, res) => res.json(orders));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 ShopZone API running on http://localhost:${PORT}`));
