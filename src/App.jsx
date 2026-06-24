import { useState } from 'react';
import { EventProvider, useEvent, fmt, sumItems } from './store.jsx';
import Dashboard from './components/Dashboard';
import BudgetSection from './components/BudgetSection';
import Sponsors from './components/Sponsors';
import Create, { CATALOG as CATALOG_MAP } from './components/Create';
import './App.css';

const STAGE_FIELDS = [
  { key: 'name',     label: 'Item Name',    type: 'text',   placeholder: 'e.g. LED Wall' },
  { key: 'category', label: 'Category',     type: 'select', options: ['Lighting', 'Sound', 'Structure', 'Screen/Visual', 'Furniture', 'Power', 'Other'] },
  { key: 'qty',      label: 'Qty',          type: 'number', placeholder: '1', min: '0', step: '1' },
  { key: 'unitCost', label: 'Unit Cost ($)', type: 'number', placeholder: '0.00', min: '0', step: '0.01' },
  { key: 'notes',    label: 'Notes',        type: 'textarea', placeholder: 'Vendor, spec, details...' },
];

const STAGE_COLUMNS = [
  { key: 'name',     label: 'Item',     render: i => <><div className="item-name">{i.name}</div><div className="item-sub">{i.notes}</div></> },
  { key: 'category', label: 'Category' },
  { key: 'qty',      label: 'Qty',      render: i => <span style={{ color: 'var(--text-muted)' }}>×{i.qty || 1}</span> },
  { key: 'unitCost', label: 'Unit ($)', render: i => <span style={{ color: 'var(--text-muted)' }}>${Number(i.unitCost || 0).toFixed(2)}</span> },
];

const STAFF_FIELDS = [
  { key: 'name',     label: 'Role / Position', type: 'text',   placeholder: 'e.g. Stage Manager' },
  { key: 'count',    label: 'Headcount',        type: 'number', placeholder: '1', min: '0', step: '1' },
  { key: 'unitCost', label: 'Rate Per Person ($)', type: 'number', placeholder: '0.00', min: '0', step: '0.01' },
  { key: 'notes',    label: 'Notes',            type: 'textarea', placeholder: 'Shift hours, agency, contact...' },
];

const STAFF_COLUMNS = [
  { key: 'name',     label: 'Role',     render: i => <><div className="item-name">{i.name}</div><div className="item-sub">{i.notes}</div></> },
  { key: 'count',    label: 'People',   render: i => <span style={{ color: 'var(--text-muted)' }}>×{i.count || i.qty || 1}</span> },
  { key: 'unitCost', label: 'Rate ($)', render: i => <span style={{ color: 'var(--text-muted)' }}>${Number(i.unitCost || 0).toFixed(2)}</span> },
];

const DRINKS_FIELDS = [
  { key: 'name',     label: 'Drink / Item',     type: 'text',   placeholder: 'e.g. Beer Keg' },
  { key: 'category', label: 'Category',          type: 'select', options: ['Beer', 'Spirits', 'Wine', 'Cocktail', 'Non-Alcoholic', 'Water', 'Ice/Misc', 'Other'] },
  { key: 'qty',      label: 'Qty',               type: 'number', placeholder: '1',    min: '0', step: '1' },
  { key: 'unitCost', label: 'Unit Cost ($)',      type: 'number', placeholder: '0.00', min: '0', step: '0.01' },
  { key: 'notes',    label: 'Notes',             type: 'textarea', placeholder: 'Supplier, servings, proof...' },
];

const DRINKS_COLUMNS = [
  { key: 'name',     label: 'Item',     render: i => <><div className="item-name">{i.name}</div><div className="item-sub">{i.notes}</div></> },
  { key: 'category', label: 'Category' },
  { key: 'qty',      label: 'Qty',      render: i => <span style={{ color: 'var(--text-muted)' }}>×{i.qty || 1}</span> },
  { key: 'unitCost', label: 'Unit ($)', render: i => <span style={{ color: 'var(--text-muted)' }}>${Number(i.unitCost || 0).toFixed(2)}</span> },
];

const DECOR_FIELDS = [
  { key: 'name',     label: 'Item',           type: 'text',   placeholder: 'e.g. LED Uplights' },
  { key: 'category', label: 'Category',        type: 'select', options: ['Floral', 'Lighting', 'Draping/Fabric', 'Signage', 'Table Decor', 'Balloon', 'Custom Build', 'Other'] },
  { key: 'qty',      label: 'Qty',             type: 'number', placeholder: '1',    min: '0', step: '1' },
  { key: 'unitCost', label: 'Unit Cost ($)',    type: 'number', placeholder: '0.00', min: '0', step: '0.01' },
  { key: 'notes',    label: 'Notes',           type: 'textarea', placeholder: 'Vendor, dimensions, color...' },
];

const DECOR_COLUMNS = [
  { key: 'name',     label: 'Item',     render: i => <><div className="item-name">{i.name}</div><div className="item-sub">{i.notes}</div></> },
  { key: 'category', label: 'Category' },
  { key: 'qty',      label: 'Qty',      render: i => <span style={{ color: 'var(--text-muted)' }}>×{i.qty || 1}</span> },
  { key: 'unitCost', label: 'Unit ($)', render: i => <span style={{ color: 'var(--text-muted)' }}>${Number(i.unitCost || 0).toFixed(2)}</span> },
];

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',    icon: '📊', countKey: null },
  { id: 'create',      label: 'Create',       icon: '🎪', countKey: 'stageDesign' },
  { id: 'stage',       label: 'Stage Budget', icon: '🎭', countKey: 'stage' },
  { id: 'staff',       label: 'Staff',        icon: '👥', countKey: 'staff' },
  { id: 'drinks',      label: 'Drinks',       icon: '🍹', countKey: 'drinks' },
  { id: 'decorations', label: 'Decorations',  icon: '✨', countKey: 'decorations' },
  { id: 'sponsors',    label: 'Sponsors',     icon: '🤝', countKey: 'sponsors' },
];

function AppInner() {
  const [tab, setTab] = useState('dashboard');
  const { data, update } = useEvent();

  const designCost = (data.stageDesign || []).reduce((s, i) => {
    const meta = CATALOG_MAP[i.key];
    return s + (meta ? meta.cost : 0);
  }, 0);

  const grandTotal =
    sumItems(data.stage) +
    sumItems(data.staff) +
    sumItems(data.drinks) +
    sumItems(data.decorations) +
    designCost;

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="logo-icon">🎪</div>
          <div className="brand-text">
            <h1>EventBudget</h1>
            <span>Production Planner</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            value={data.eventName}
            onChange={e => update('eventName', e.target.value)}
            style={{
              background: 'var(--surface-3)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 14,
              color: 'var(--text)',
              width: 180,
            }}
            placeholder="Event name"
          />
          <div className="header-total">
            <span className="ht-label">Total Budget</span>
            <span className="ht-amount">{fmt(grandTotal)}</span>
          </div>
        </div>
      </header>

      <nav className="nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.countKey && data[t.countKey].length > 0 && (
              <span className="tab-badge">{data[t.countKey].length}</span>
            )}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {tab === 'dashboard' && <Dashboard />}

        {tab === 'create' && <Create />}

        {tab === 'stage' && (
          <BudgetSection
            storeKey="stage"
            title="Stage"
            icon="🎭"
            subtitle="Add all stage production items — lighting, sound, structure, screens, and more"
            fields={STAGE_FIELDS}
            columns={STAGE_COLUMNS}
          />
        )}

        {tab === 'staff' && (
          <BudgetSection
            storeKey="staff"
            title="Staff"
            icon="👥"
            subtitle="Define all roles and headcounts — security, technicians, hosts, and crew"
            fields={STAFF_FIELDS}
            columns={STAFF_COLUMNS}
          />
        )}

        {tab === 'drinks' && (
          <BudgetSection
            storeKey="drinks"
            title="Drinks"
            icon="🍹"
            subtitle="Plan your bar — kegs, bottles, mixers, non-alcoholic options, and supplies"
            fields={DRINKS_FIELDS}
            columns={DRINKS_COLUMNS}
          />
        )}

        {tab === 'decorations' && (
          <BudgetSection
            storeKey="decorations"
            title="Decorations"
            icon="✨"
            subtitle="Track all décor — florals, draping, signage, table pieces, and custom builds"
            fields={DECOR_FIELDS}
            columns={DECOR_COLUMNS}
          />
        )}

        {tab === 'sponsors' && <Sponsors />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <EventProvider>
      <AppInner />
    </EventProvider>
  );
}
