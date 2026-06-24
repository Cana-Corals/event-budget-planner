import { useState } from 'react';
import { useEvent, fmt, sumItems } from '../store';

export default function BudgetSection({ storeKey, title, icon, subtitle, fields, columns }) {
  const { data, addItem, removeItem } = useEvent();
  const items = data[storeKey];

  const emptyForm = Object.fromEntries(fields.map(f => [f.key, '']));
  const [form, setForm] = useState(emptyForm);

  function handleChange(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleAdd(e) {
    e.preventDefault();
    const nameField = fields.find(f => f.type === 'text');
    if (!form[nameField.key].trim()) return;
    addItem(storeKey, { ...form });
    setForm(emptyForm);
  }

  const total = sumItems(items);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">{icon} {title}</div>
        <div className="page-subtitle">{subtitle}</div>
      </div>

      <div className="section-layout">
        {/* Form */}
        <div className="card" style={{ position: 'sticky', top: 80 }}>
          <div className="card-title">+ Add Item</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {fields.map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      placeholder={f.placeholder || ''}
                      value={form[f.key]}
                      onChange={e => handleChange(f.key, e.target.value)}
                      style={{ minHeight: 60 }}
                    />
                  ) : f.type === 'select' ? (
                    <select
                      value={form[f.key]}
                      onChange={e => handleChange(f.key, e.target.value)}
                    >
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder || ''}
                      value={form[f.key]}
                      min={f.min}
                      step={f.step}
                      onChange={e => handleChange(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
                Add Item
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="card">
          <div className="card-title">{title} Items</div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="ei">{icon}</div>
              <p>No {title.toLowerCase()} items yet.<br />Add your first one on the left.</p>
            </div>
          ) : (
            <table className="items-table">
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  <th>Total Cost</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    {columns.map(c => (
                      <td key={c.key}>
                        {c.render ? c.render(item) : (
                          <span className="item-name">{item[c.key]}</span>
                        )}
                      </td>
                    ))}
                    <td className="cost-cell">
                      {fmt((Number(item.qty) || Number(item.count) || 1) * (Number(item.unitCost) || 0))}
                    </td>
                    <td>
                      <button className="btn-danger" onClick={() => removeItem(storeKey, item.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {items.length > 1 && (
                <tfoot>
                  <tr className="total-row">
                    <td colSpan={columns.length}>Total</td>
                    <td className="cost-cell" style={{ color: 'var(--accent-light)' }}>{fmt(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}

          {items.length > 0 && (
            <div style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(139,92,246,0.07)',
              borderRadius: 8,
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-light)' }}>
                {fmt(total)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
