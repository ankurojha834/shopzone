import { useState, useEffect, useCallback, useRef } from 'react';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import CartPanel from './components/CartPanel';
import OrdersPanel from './components/OrdersPanel';
import SuccessModal from './components/SuccessModal';
import AuthPanel from './components/AuthPanel';
import { api } from './api';

function ShopApp() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // AI Search state
  const [aiMode, setAiMode] = useState(false);
  const [aiResults, setAiResults] = useState(null); // null = normal, array = AI results
  const [aiSearching, setAiSearching] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  // Panels & Modal
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const { user, login, logout } = useAuth();

  // Wishlist
  const [wishlist, setWishlist] = useState(new Set());

  const searchTimer = useRef(null);

  // Load categories once
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Load products when filters change
  const loadProducts = useCallback(async () => {
    if (aiResults !== null) return; // AI mode — don't overwrite
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort = sortBy;
      const { products: data, total } = await api.getProducts(params);
      setProducts(data);
      setTotalCount(total);
    } catch (e) {
      console.error('Load products error:', e);
    }
    setLoading(false);
  }, [activeCategory, searchQuery, sortBy, aiResults]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSearch = useCallback((q) => {
    if (aiResults !== null) clearAISearch();
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchQuery(q), 300);
  }, [aiResults]);

  const handleAISearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setAiSearching(true);
    setAiQuery(query);
    try {
      const data = await api.smartSearch(query);
      setAiResults(data.products);
      setTotalCount(data.total);
    } catch (e) {
      console.error('AI search error:', e);
    }
    setAiSearching(false);
  }, []);

  const clearAISearch = useCallback(() => {
    setAiResults(null);
    setAiQuery('');
    loadProducts();
  }, [loadProducts]);

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const displayedProducts = aiResults !== null ? aiResults : products;

  return (
    <div>
      {/* Navbar */}
      <Navbar
        onSearch={handleSearch}
        onAISearch={handleAISearch}
        onOpenCart={() => setShowCart(true)}
        onOpenOrders={() => setShowOrders(true)}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={logout}
        aiMode={aiMode}
        setAiMode={(v) => { setAiMode(v); if (!v && aiResults) clearAISearch(); }}
        user={user}
      />

      {/* Category bar */}
      <CategoryBar
        categories={categories}
        active={activeCategory}
        onSelect={(cat) => { setActiveCategory(cat); if (aiResults) clearAISearch(); }}
      />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a5f 50%, #0d4a6b 100%)',
        padding: '48px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 70% 50%, rgba(245,158,11,.12) 0%, transparent 60%)',
        }} />
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(26px, 5vw, 48px)',
          color: '#fff', marginBottom: 12, position: 'relative',
        }}>
          Everything You Need, <em style={{ color: 'var(--orange)', fontStyle: 'normal' }}>Delivered Fast</em>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, position: 'relative' }}>
          Shop smarter with AI-powered search. Try asking in Hindi or Hinglish!
        </p>
      </div>

      {/* AI results banner */}
      {aiResults !== null && (
        <div style={{
          background: 'var(--purple-light)',
          border: '1px solid #c4b5fd',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13, color: 'var(--purple)', fontWeight: 600,
        }}>
          ✨ Showing AI results for "{aiQuery}" — {aiResults.length} matches found
          <button
            onClick={clearAISearch}
            style={{
              marginLeft: 'auto', background: 'none',
              border: '1px solid #c4b5fd', color: 'var(--purple)',
              padding: '4px 10px', borderRadius: 6,
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            ✕ Clear AI Search
          </button>
        </div>
      )}

      {/* Toolbar */}
      {aiResults === null && (
        <div style={{
          padding: '20px 24px 0',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--muted)', fontSize: 14 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              border: '1.5px solid var(--border)', background: 'var(--card)',
              padding: '8px 14px', borderRadius: 8, fontSize: 14,
              cursor: 'pointer', outline: 'none', color: 'var(--text)',
            }}
          >
            <option value="">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 14 }}>
            {totalCount} products
          </span>
        </div>
      )}

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 20,
        padding: '20px 24px 60px',
      }}>
        {loading || aiSearching ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <div className="skeleton" style={{ aspectRatio: '1' }} />
              <div style={{ padding: 16, background: '#fff', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px' }}>
                <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 36 }} />
              </div>
            </div>
          ))
        ) : displayedProducts.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No products found</p>
            <p style={{ marginTop: 8 }}>Try a different search or category</p>
          </div>
        ) : (
          displayedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isAIMatch={aiResults !== null}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />
          ))
        )}
      </div>

      {/* Panels */}
      {showCart && (
        <CartPanel
          onClose={() => setShowCart(false)}
          onOrderPlaced={(order) => { setSuccessOrder(order); }}
        />
      )}
      {showOrders && <OrdersPanel onClose={() => setShowOrders(false)} />}
      {showAuth && (
        <AuthPanel
          onClose={() => setShowAuth(false)}
          onAuthSuccess={login}
        />
      )}
      {successOrder && (
        <SuccessModal
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ShopApp />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
