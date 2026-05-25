import { useState } from 'react';
import { useCart } from '../context/CartContext';

const styles = {
  nav: {
    background: 'var(--navy)',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    height: 64,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,.3)',
  },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    color: 'var(--orange)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoSub: {
    color: '#fff',
    fontSize: 13,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 300,
  },
  searchWrap: {
    flex: 1,
    display: 'flex',
    maxWidth: 640,
    borderRadius: 8,
    overflow: 'hidden',
    border: '2px solid transparent',
    transition: 'border-color .2s',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    padding: '0 16px',
    fontSize: 15,
    outline: 'none',
    background: '#fff',
    height: 40,
  },
  searchBtn: {
    background: 'var(--orange)',
    border: 'none',
    padding: '0 18px',
    fontSize: 18,
    cursor: 'pointer',
    transition: 'background .2s',
    height: 40,
  },
  aiToggle: {
    background: 'var(--purple)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'opacity .2s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 40,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  navBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,.25)',
    color: '#fff',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    transition: 'all .2s',
    height: 40,
  },
  cartBtn: {
    background: 'var(--orange)',
    border: '1px solid var(--orange)',
    color: 'var(--navy)',
    fontWeight: 700,
    position: 'relative',
  },
  badge: {
    background: 'var(--red)',
    color: '#fff',
    borderRadius: '50%',
    width: 20,
    height: 20,
    fontSize: 11,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default function Navbar({ onSearch, onAISearch, onOpenCart, onOpenOrders, onOpenAuth, onLogout, aiMode, setAiMode, user }) {
  const { cartData } = useCart();
  const [query, setQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    await onAISearch(aiQuery);
    setAiLoading(false);
  };

  const exampleQueries = [
    'headphones under 30000',
    'gym joote comfortable',
    'kitchen ke liye',
    'gift for reader',
  ];

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => { onSearch(''); setAiMode(false); }}>
        🛍 ShopZone <span style={styles.logoSub}>India</span>
      </div>

      {/* Search */}
      {!aiMode ? (
        <form onSubmit={handleSearch} style={styles.searchWrap}>
          <input
            style={styles.searchInput}
            placeholder="Search products..."
            value={query}
            onChange={e => { setQuery(e.target.value); onSearch(e.target.value); }}
          />
          <button type="submit" style={styles.searchBtn}>🔍</button>
        </form>
      ) : (
        <form onSubmit={handleAISearch} style={{ ...styles.searchWrap, border: '2px solid var(--purple)' }}>
          <input
            style={{ ...styles.searchInput, background: '#f5f3ff' }}
            placeholder="Ask anything… 'best headphones under ₹30k'"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" style={{ ...styles.searchBtn, background: 'var(--purple)' }} disabled={aiLoading}>
            {aiLoading ? '⏳' : '✨'}
          </button>
        </form>
      )}

      {/* AI Toggle */}
      <button
        style={{ ...styles.aiToggle, opacity: aiMode ? 1 : 0.75 }}
        onClick={() => setAiMode(!aiMode)}
        title="Toggle AI Search"
      >
        {aiMode ? '✨ AI ON' : '✨ AI'}
      </button>

      {/* Nav Actions */}
      <div style={styles.actions}>
        <button style={styles.navBtn} onClick={onOpenOrders}>
          📦 Orders
        </button>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: 'var(--orange)', color: 'var(--navy)',
              borderRadius: '50%', width: 34, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name.split(' ')[0]}
            </span>
            <button
              onClick={onLogout}
              style={{ ...styles.navBtn, padding: '8px 10px', fontSize: 12 }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button style={styles.navBtn} onClick={onOpenAuth}>
            👤 Login
          </button>
        )}
        <button style={{ ...styles.navBtn, ...styles.cartBtn }} onClick={onOpenCart}>
          🛒 Cart
          <span style={styles.badge}>{cartData.count}</span>
        </button>
      </div>

      {/* AI Example chips row */}
      {aiMode && (
        <div style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          background: 'rgba(124,58,237,.95)',
          backdropFilter: 'blur(8px)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          zIndex: 99,
        }}>
          <span style={{ color: '#ddd6fe', fontSize: 13, fontWeight: 600 }}>✨ Try:</span>
          {exampleQueries.map(q => (
            <button
              key={q}
              onClick={() => { setAiQuery(q); onAISearch(q); }}
              style={{
                background: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(167,139,250,.4)',
                color: '#ddd6fe',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
