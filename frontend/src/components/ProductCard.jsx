import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const badgeColors = {
  'best seller': { bg: 'var(--orange)', color: 'var(--navy)' },
  'deal': { bg: 'var(--red)', color: '#fff' },
  'premium': { bg: 'var(--purple)', color: '#fff' },
  'limited': { bg: '#0f172a', color: '#fff' },
};

export default function ProductCard({ product, isAIMatch = false, wishlist, onToggleWishlist }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
  const badgeKey = product.badge?.toLowerCase();
  const badgeStyle = badgeColors[badgeKey] || { bg: 'var(--orange)', color: 'var(--navy)' };
  const inWishlist = wishlist.has(product.id);
  const lowStock = product.stock <= 10;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product.id);
      showToast(`${product.name.split(' ').slice(0, 3).join(' ')} added!`, 'success');
    } catch {
      showToast('Failed to add to cart', 'error');
    }
    setAdding(false);
  };

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: isAIMatch ? '0 0 0 2px var(--purple), var(--shadow-sm)' : 'var(--shadow-sm)',
      transition: 'transform .25s, box-shadow .25s',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      border: `1.5px solid ${isAIMatch ? '#a78bfa' : 'var(--border)'}`,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isAIMatch ? '0 0 0 2px var(--purple), var(--shadow-lg)' : 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = isAIMatch ? '0 0 0 2px var(--purple), var(--shadow-sm)' : 'var(--shadow-sm)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', background: '#f8fafc', aspectRatio: '1', overflow: 'hidden' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        />
        {product.badge && (
          <span style={{
            position: 'absolute', top: 10, left: 10,
            background: badgeStyle.bg, color: badgeStyle.color,
            fontSize: 11, fontWeight: 700, padding: '3px 10px',
            borderRadius: 30,
          }}>
            {product.badge}
          </span>
        )}
        {isAIMatch && (
          <span style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--purple)', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '3px 8px',
            borderRadius: 20,
          }}>
            ✨ AI Pick
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggleWishlist(product.id); }}
          style={{
            position: 'absolute', bottom: 10, right: 10,
            background: inWishlist ? '#fee2e2' : 'rgba(255,255,255,.9)',
            border: 'none',
            borderRadius: '50%',
            width: 34, height: 34,
            fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>
          {product.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span className="stars" style={{ color: 'var(--orange)', fontSize: 13 }}>{stars}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>

        {lowStock && (
          <p style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>
            ⚠️ Only {product.stock} left!
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            id={`add-${product.id}`}
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              background: adding ? 'var(--green)' : 'var(--navy)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: adding ? 'default' : 'pointer',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {adding ? '✓ Added' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
