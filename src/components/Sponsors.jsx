import { useState } from 'react';
import { useEvent, fmt } from '../store';

const TIERS = ['Presenting', 'Gold', 'Silver', 'Bronze', 'Media'];

const EMPTY = {
  name: '',
  tier: 'Gold',
  value: '',
  logoPlacement: '',
  stagePresence: '',
  socialMedia: '',
  printedMaterials: '',
  brandActivation: '',
  notes: '',
};

export default function Sponsors() {
  const { data, addItem, removeItem } = useEvent();
  const [form, setForm] = useState(EMPTY);

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addItem('sponsors', { ...form });
    setForm(EMPTY);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">🤝 Sponsors</div>
        <div className="page-subtitle">Document how each sponsor's brand will be featured at the event</div>
      </div>

      <div className="section-layout">
        {/* Form */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="card-title">+ Add Sponsor</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label>Sponsor / Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Red Bull"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div className="form-group">
                  <label>Tier</label>
                  <select value={form.tier} onChange={e => set('tier', e.target.value)}>
                    {TIERS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sponsorship Value ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={e => set('value', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Logo Placement</label>
                <input
                  type="text"
                  placeholder="e.g. Main stage banner, photo wall, wristbands"
                  value={form.logoPlacement}
                  onChange={e => set('logoPlacement', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Stage Presence</label>
                <textarea
                  placeholder="e.g. Branded backdrop behind DJ, product displays on side stage"
                  value={form.stagePresence}
                  onChange={e => set('stagePresence', e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>

              <div className="form-group">
                <label>Social Media</label>
                <input
                  type="text"
                  placeholder="e.g. 3 story mentions, 1 dedicated post, tagged in recap"
                  value={form.socialMedia}
                  onChange={e => set('socialMedia', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Printed Materials</label>
                <input
                  type="text"
                  placeholder="e.g. Flyers, tickets, event program"
                  value={form.printedMaterials}
                  onChange={e => set('printedMaterials', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Brand Activation / Booth</label>
                <textarea
                  placeholder="e.g. Sampling booth near entrance, 10x10 branded area"
                  value={form.brandActivation}
                  onChange={e => set('brandActivation', e.target.value)}
                  style={{ minHeight: 60 }}
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  placeholder="Any other sponsor perks or commitments"
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  style={{ minHeight: 50 }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
                Add Sponsor
              </button>
            </div>
          </form>
        </div>

        {/* Cards */}
        <div>
          {data.sponsors.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="ei">🤝</div>
                <p>No sponsors added yet.<br />Fill in the form to document your first sponsor.</p>
              </div>
            </div>
          ) : (
            <div className="sponsor-grid">
              {data.sponsors.map(sp => (
                <SponsorCard key={sp.id} sponsor={sp} onRemove={id => removeItem('sponsors', id)} />
              ))}
            </div>
          )}

          {data.sponsors.length > 0 && (
            <div style={{
              marginTop: 20,
              padding: '14px 18px',
              background: 'rgba(139,92,246,0.07)',
              borderRadius: 10,
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {data.sponsors.length} sponsor{data.sponsors.length !== 1 ? 's' : ''}
              </span>
              <span style={{ color: 'var(--yellow)', fontWeight: 700, fontSize: 18 }}>
                {fmt(data.sponsors.reduce((s, sp) => s + (Number(sp.value) || 0), 0))} total value
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SponsorCard({ sponsor: sp, onRemove }) {
  return (
    <div className="sponsor-card">
      <button className="btn-danger del-btn" onClick={() => onRemove(sp.id)}>✕</button>

      <div>
        <div className={`tier-badge tier-${sp.tier}`}>{tierIcon(sp.tier)} {sp.tier}</div>
      </div>

      <div className="sponsor-name">{sp.name}</div>

      {sp.value > 0 && (
        <div className="sponsor-value-chip">{fmt(sp.value)}</div>
      )}

      {sp.logoPlacement && <SponsorRow label="Logo Placement" text={sp.logoPlacement} />}
      {sp.stagePresence && <SponsorRow label="Stage Presence" text={sp.stagePresence} />}
      {sp.socialMedia && <SponsorRow label="Social Media" text={sp.socialMedia} />}
      {sp.printedMaterials && <SponsorRow label="Printed Materials" text={sp.printedMaterials} />}
      {sp.brandActivation && <SponsorRow label="Brand Activation" text={sp.brandActivation} />}
      {sp.notes && <SponsorRow label="Notes" text={sp.notes} />}
    </div>
  );
}

function SponsorRow({ label, text }) {
  return (
    <div>
      <div className="sponsor-section-label">{label}</div>
      <div className="sponsor-text">{text}</div>
    </div>
  );
}

function tierIcon(tier) {
  return { Presenting: '🏆', Gold: '🥇', Silver: '🥈', Bronze: '🥉', Media: '📡' }[tier] || '🤝';
}
