import { useEffect, useState } from 'react';
import { api } from '../api';

export default function OrdersPanel({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then(o => { setOrders(o); setLoading(false); }).catch(() => setLoading(false));
  }, []);

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
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>📦 Your Orders</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No orders yet</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Shop something and come back!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...orders].reverse().map(order => (
                <div key={order.id} style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  {/* Order header */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>Order #{order.id}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: '#dcfce7', color: '#16a34a',
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 700,
                      }}>
                        ✓ {order.status}
                      </span>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                        Delivery: {order.estimatedDelivery}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '12px 16px' }}>
                    {order.items.map(item => (
                      <div key={item.productId} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 0',
                        borderBottom: '1px solid #f1f5f9',
                      }}>
                        <img src={item.image} alt={item.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Qty: {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 700 }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--navy)' }}>₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
