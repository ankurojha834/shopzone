export default function SuccessModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 8 }}>
          Order Confirmed!
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 15 }}>
          Order <strong>#{order.id}</strong> placed successfully. Expected delivery: <strong>{order.estimatedDelivery}</strong>
        </p>
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 10, padding: 16, marginBottom: 24,
          textAlign: 'left',
        }}>
          {order.items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
              <span>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{
            borderTop: '1px solid #bbf7d0', marginTop: 8, paddingTop: 8,
            display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16,
          }}>
            <span>Total</span>
            <span>₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--orange)', color: 'var(--navy)',
            border: 'none', borderRadius: 10,
            padding: '12px 32px', fontSize: 16, fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
