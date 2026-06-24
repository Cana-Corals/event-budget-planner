import { useEvent, fmt, sumItems } from '../store';

const CATEGORIES = [
  { key: 'stage',       label: 'Stage',        icon: '🎭', color: '#a78bfa' },
  { key: 'staff',       label: 'Staff',         icon: '👥', color: '#60a5fa' },
  { key: 'drinks',      label: 'Drinks',        icon: '🍹', color: '#34d399' },
  { key: 'decorations', label: 'Decorations',   icon: '✨', color: '#f472b6' },
];

export default function Dashboard() {
  const { data } = useEvent();

  const totals = CATEGORIES.map(c => ({
    ...c,
    total: sumItems(data[c.key]),
    count: data[c.key].length,
  }));

  const grandTotal = totals.reduce((s, c) => s + c.total, 0);
  const sponsorValue = data.sponsors.reduce((s, sp) => s + (Number(sp.value) || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Budget Overview</div>
        <div className="page-subtitle">All costs at a glance — updates live as you add items</div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card grand-total">
          <div>
            <div className="stat-label">Total Production Cost</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Stage + Staff + Drinks + Decorations
            </div>
          </div>
          <div className="stat-amount">{fmt(grandTotal)}</div>
        </div>

        {totals.map(c => {
          const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
          return (
            <div className="stat-card" key={c.key}>
              <div className="stat-label">
                <span>{c.icon}</span> {c.label}
              </div>
              <div className="stat-amount">{fmt(c.total)}</div>
              <div className="stat-count">{c.count} item{c.count !== 1 ? 's' : ''}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: c.color }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct.toFixed(1)}% of total</div>
            </div>
          );
        })}
      </div>

      {data.sponsors.length > 0 && (
        <div className="card" style={{ marginTop: 4 }}>
          <div className="card-title">🤝 Sponsors</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {data.sponsors.length} sponsor{data.sponsors.length !== 1 ? 's' : ''} confirmed
            </span>
            {sponsorValue > 0 && (
              <span style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: 16 }}>
                {fmt(sponsorValue)} in sponsorships
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            {data.sponsors.map(sp => (
              <div key={sp.id} style={{
                background: 'var(--surface-3)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)',
              }}>
                {sp.name}
                {sp.value > 0 && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                    {fmt(sp.value)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {grandTotal === 0 && data.sponsors.length === 0 && (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="ei">📋</div>
          <p>Nothing added yet — use the tabs above to start planning your event!</p>
        </div>
      )}
    </div>
  );
}
