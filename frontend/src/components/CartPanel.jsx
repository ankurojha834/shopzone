import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function CartPanel({ onClose, onOrderPlaced }) {
  const { cartData, updateItem, removeItem, placeOrder } = useCart();
  const { showToast } = useToast();
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (cartData.items.length === 0) return;
    setPlacing(true);
    try {
      const order = await placeOrder();
      onOrderPlaced(order);
      onClose();
    } catch {
      showToast('Order failed. Try again.', 'error');
    }
    setPlacing(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--navy)',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>🛒 Your Cart ({cartData.count})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {cartData.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Your cart is empty</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Add some products to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cartData.items.map(item => (
                <div key={item.productId} style={{
                  display: 'flex', gap: 12, padding: 16,
                  background: '#f8fafc', borderRadius: 12,
                  border: '1px solid var(--border)',
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => updateItem(item.productId, item.quantity - 1)}
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: '#fff', cursor: 'pointer', fontSize: 16,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >−</button>
                      <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.productId, item.quantity + 1)}
                        style={{
                          width: 28, height: 28, borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: '#fff', cursor: 'pointer', fontSize: 16,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        style={{
                          marginLeft: 'auto', background: 'none', border: 'none',
                          color: 'var(--red)', cursor: 'pointer', fontSize: 13,
                          fontWeight: 600, padding: '4px 8px',
                        }}
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartData.items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            background: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 18 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontWeight: 800, color: 'var(--navy)' }}>₹{cartData.total.toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              style={{
                width: '100%',
                background: placing ? 'var(--green)' : 'var(--orange)',
                color: 'var(--navy)',
                border: 'none',
                borderRadius: 10,
                padding: '14px',
                fontSize: 16,
                fontWeight: 800,
                cursor: placing ? 'default' : 'pointer',
                transition: 'background .2s',
              }}
            >
              {placing ? '✓ Placing Order…' : '🎉 Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
