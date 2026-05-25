export default function CategoryBar({ categories, active, onSelect }) {
  return (
    <div style={{
      background: 'var(--navy2)',
      padding: '0 24px',
      display: 'flex',
      gap: 4,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          style={{
            background: 'transparent',
            border: 'none',
            color: active === cat ? 'var(--orange)' : 'rgba(255,255,255,.75)',
            padding: '12px 18px',
            fontSize: 14,
            fontWeight: active === cat ? 700 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            borderBottom: `3px solid ${active === cat ? 'var(--orange)' : 'transparent'}`,
            transition: 'all .2s',
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
