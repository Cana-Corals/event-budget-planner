import { useState, useRef } from 'react';
import { useEvent, fmt, uid } from '../store.jsx';

/* ── Grid config ── */
const COLS = 16;
const ROWS = 10;
const CELL = 54;

/* ── Item catalog ── */
export const CATALOG = {
  // DJ Setup
  'dj-booth':  { name: 'DJ Booth',         icon: '🎧', cost: 2500, w: 3, h: 2, cat: 'DJ Setup',   base: '#5b21b6', light: '#7c3aed', dark: '#3b0764' },
  'cdj-set':   { name: 'CDJ 2000s (pair)', icon: '💿', cost: 800,  w: 2, h: 1, cat: 'DJ Setup',   base: '#6d28d9', light: '#8b5cf6', dark: '#4c1d95' },
  'mixer':     { name: 'Mixer',            icon: '🎚️', cost: 400,  w: 1, h: 1, cat: 'DJ Setup',   base: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
  'bar-setup': { name: 'Bar Setup',        icon: '🍸', cost: 1800, w: 4, h: 1, cat: 'DJ Setup',   base: '#4c1d95', light: '#6d28d9', dark: '#2e1065' },
  // Sound
  'sub':       { name: 'Subwoofer',        icon: '🔊', cost: 350,  w: 1, h: 1, cat: 'Sound',      base: '#1e3a8a', light: '#2563eb', dark: '#172554' },
  'array':     { name: 'Line Array',       icon: '📢', cost: 1200, w: 1, h: 2, cat: 'Sound',      base: '#1d4ed8', light: '#3b82f6', dark: '#1e3a8a' },
  'monitor':   { name: 'Monitor',          icon: '🔉', cost: 200,  w: 1, h: 1, cat: 'Sound',      base: '#2563eb', light: '#60a5fa', dark: '#1d4ed8' },
  'gen':       { name: 'Generator',        icon: '⚙️', cost: 600,  w: 2, h: 1, cat: 'Sound',      base: '#374151', light: '#6b7280', dark: '#1f2937' },
  // Lighting
  'moving':    { name: 'Moving Head',      icon: '💡', cost: 250,  w: 1, h: 1, cat: 'Lighting',   base: '#92400e', light: '#d97706', dark: '#78350f' },
  'uplight':   { name: 'LED Uplight',      icon: '🔆', cost: 150,  w: 1, h: 1, cat: 'Lighting',   base: '#b45309', light: '#f59e0b', dark: '#92400e' },
  'led-wall':  { name: 'LED Wall (2×2m)',  icon: '📺', cost: 1800, w: 3, h: 2, cat: 'Lighting',   base: '#78350f', light: '#b45309', dark: '#451a03' },
  'spot':      { name: 'Spotlight',        icon: '🔦', cost: 200,  w: 1, h: 1, cat: 'Lighting',   base: '#d97706', light: '#fbbf24', dark: '#b45309' },
  'strobe':    { name: 'Strobe',           icon: '⚡', cost: 180,  w: 1, h: 1, cat: 'Lighting',   base: '#a16207', light: '#ca8a04', dark: '#713f12' },
  'laser':     { name: 'Laser Rig',        icon: '🔴', cost: 900,  w: 2, h: 1, cat: 'Lighting',   base: '#991b1b', light: '#dc2626', dark: '#7f1d1d' },
  // Structure
  'truss-h':   { name: 'Truss H (4m)',     icon: '━',  cost: 320,  w: 4, h: 1, cat: 'Structure',  base: '#374151', light: '#6b7280', dark: '#1f2937' },
  'truss-v':   { name: 'Truss V (4m)',     icon: '┃',  cost: 320,  w: 1, h: 4, cat: 'Structure',  base: '#4b5563', light: '#9ca3af', dark: '#374151' },
  'barrier':   { name: 'Crowd Barrier',    icon: '🚧', cost: 80,   w: 3, h: 1, cat: 'Structure',  base: '#9a3412', light: '#ea580c', dark: '#7c2d12' },
  'stage-riser':{ name: 'Stage Riser',    icon: '⬛', cost: 400,  w: 3, h: 2, cat: 'Structure',  base: '#1f2937', light: '#374151', dark: '#111827' },
  // Decor
  'draping':   { name: 'Draping Panel',    icon: '🪟', cost: 120,  w: 1, h: 2, cat: 'Decor',      base: '#9d174d', light: '#db2777', dark: '#831843' },
  'flowers':   { name: 'Flower Arch',      icon: '🌸', cost: 500,  w: 2, h: 2, cat: 'Decor',      base: '#be185d', light: '#ec4899', dark: '#9d174d' },
  'neon':      { name: 'Neon Sign',        icon: '✨', cost: 400,  w: 2, h: 1, cat: 'Decor',      base: '#7e22ce', light: '#a855f7', dark: '#581c87' },
  'table':     { name: 'Event Table',      icon: '🪵', cost: 150,  w: 2, h: 1, cat: 'Decor',      base: '#92400e', light: '#d97706', dark: '#78350f' },
  'couch':     { name: 'VIP Couch',        icon: '🛋️', cost: 500,  w: 2, h: 1, cat: 'Decor',      base: '#065f46', light: '#059669', dark: '#064e3b' },
  'photo-wall':{ name: 'Photo Wall',       icon: '📸', cost: 700,  w: 3, h: 2, cat: 'Decor',      base: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
};

const CATS = ['DJ Setup', 'Sound', 'Lighting', 'Structure', 'Decor'];

const CAT_ACCENT = {
  'DJ Setup':  '#8b5cf6',
  'Sound':     '#3b82f6',
  'Lighting':  '#f59e0b',
  'Structure': '#6b7280',
  'Decor':     '#ec4899',
};

/* ── Helpers ── */
function canPlace(design, key, x, y, excludeId = null) {
  const { w, h } = CATALOG[key];
  if (x < 0 || y < 0 || x + w > COLS || y + h > ROWS) return false;
  for (const item of design) {
    if (item.id === excludeId) continue;
    const iw = CATALOG[item.key].w;
    const ih = CATALOG[item.key].h;
    if (x < item.x + iw && x + w > item.x && y < item.y + ih && y + h > item.y) return false;
  }
  return true;
}

function designTotal(design) {
  return design.reduce((s, i) => s + CATALOG[i.key].cost, 0);
}

/* ── Component ── */
export default function Create() {
  const { data, update } = useEvent();
  const design = data.stageDesign || [];

  const [dragging, setDragging] = useState(null);
  // { key, fromCatalog, id, grabCol, grabRow }

  const [dropPreview, setDropPreview] = useState(null);
  // { x, y, valid }

  const [openCats, setOpenCats] = useState(new Set(CATS));
  const stageRef = useRef(null);

  function setDesign(d) { update('stageDesign', d); }

  function getCell(e) {
    const rect = stageRef.current.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / CELL),
      y: Math.floor((e.clientY - rect.top) / CELL),
    };
  }

  function onCatalogDragStart(e, key) {
    setDragging({ key, fromCatalog: true, grabCol: 0, grabRow: 0 });
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', key);
  }

  function onStageDragStart(e, item) {
    const rect = e.currentTarget.getBoundingClientRect();
    const grabCol = Math.floor((e.clientX - rect.left) / CELL);
    const grabRow = Math.floor((e.clientY - rect.top) / CELL);
    setDragging({ key: item.key, fromCatalog: false, id: item.id, grabCol, grabRow });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.key);
  }

  function onStageDragOver(e) {
    e.preventDefault();
    if (!dragging || !stageRef.current) return;
    const { x, y } = getCell(e);
    const px = x - dragging.grabCol;
    const py = y - dragging.grabRow;
    const valid = canPlace(design, dragging.key, px, py, dragging.id);
    setDropPreview({ x: px, y: py, valid });
    e.dataTransfer.dropEffect = valid ? 'copy' : 'none';
  }

  function onStageDrop(e) {
    e.preventDefault();
    if (!dragging || !dropPreview) return;
    const { x, y, valid } = dropPreview;
    if (!valid) { setDragging(null); setDropPreview(null); return; }

    if (dragging.fromCatalog) {
      setDesign([...design, { id: uid(), key: dragging.key, x, y }]);
    } else {
      setDesign(design.map(i => i.id === dragging.id ? { ...i, x, y } : i));
    }
    setDragging(null);
    setDropPreview(null);
  }

  function onStageDragLeave(e) {
    if (!stageRef.current?.contains(e.relatedTarget)) {
      setDropPreview(null);
    }
  }

  function onDragEnd() {
    setDragging(null);
    setDropPreview(null);
  }

  function removeItem(id) {
    setDesign(design.filter(i => i.id !== id));
  }

  function clearAll() {
    if (design.length === 0) return;
    setDesign([]);
  }

  function toggleCat(cat) {
    setOpenCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  const total = designTotal(design);

  // Count by cat
  const countByCat = {};
  for (const item of design) {
    const c = CATALOG[item.key].cat;
    countByCat[c] = (countByCat[c] || 0) + 1;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Page header */}
      <div style={{ padding: '18px 24px 0', maxWidth: 1600, width: '100%', margin: '0 auto', alignSelf: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
        <div className="page-title">🎪 Stage Designer</div>
        <div className="page-subtitle">Drag items onto the stage — budget updates as you build your setup</div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden', maxWidth: 1600, width: '100%', margin: '14px auto 0', padding: '0 24px 24px', boxSizing: 'border-box' }}>

        {/* ── Left: Catalog ── */}
        <div style={{
          width: 230,
          flexShrink: 0,
          overflowY: 'auto',
          paddingRight: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>
            Item Catalog
          </div>
          {CATS.map(cat => (
            <div key={cat}>
              <button
                onClick={() => toggleCat(cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: CAT_ACCENT[cat],
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <span style={{ marginLeft: 'auto', order: 2, color: 'var(--text-muted)', fontSize: 10 }}>
                  {openCats.has(cat) ? '▲' : '▼'}
                </span>
                <span style={{ order: 1, flex: 1, textAlign: 'left' }}>
                  {cat}
                  {countByCat[cat] ? (
                    <span style={{ marginLeft: 6, background: CAT_ACCENT[cat] + '33', color: CAT_ACCENT[cat], borderRadius: 10, padding: '1px 6px', fontWeight: 600 }}>
                      {countByCat[cat]}
                    </span>
                  ) : null}
                </span>
              </button>

              {openCats.has(cat) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4, marginTop: 4 }}>
                  {Object.entries(CATALOG)
                    .filter(([, v]) => v.cat === cat)
                    .map(([key, item]) => (
                      <CatalogItem
                        key={key}
                        itemKey={key}
                        item={item}
                        onDragStart={onCatalogDragStart}
                        onDragEnd={onDragEnd}
                      />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Center: Stage Canvas ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
          <StageCanvas
            stageRef={stageRef}
            design={design}
            dropPreview={dropPreview}
            dragging={dragging}
            onDragOver={onStageDragOver}
            onDrop={onStageDrop}
            onDragLeave={onStageDragLeave}
            onItemDragStart={onStageDragStart}
            onItemDragEnd={onDragEnd}
            onRemove={removeItem}
          />

          {/* Budget bar under canvas */}
          <div style={{
            marginTop: 14,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: COLS * CELL,
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stage Design Cost</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent-light)', fontVariantNumeric: 'tabular-nums' }}>{fmt(total)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{design.length} item{design.length !== 1 ? 's' : ''} placed</span>
              {design.length > 0 && (
                <button className="btn-danger" onClick={clearAll}>Clear All</button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Item list ── */}
        <div style={{
          width: 220,
          flexShrink: 0,
          paddingLeft: 14,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>
            Placed Items
          </div>

          {design.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎭</div>
              Drag items from the catalog onto the stage
            </div>
          ) : (
            CATS.map(cat => {
              const catItems = design.filter(i => CATALOG[i.key].cat === cat);
              if (!catItems.length) return null;
              return (
                <div key={cat}>
                  <div style={{ fontSize: 10, color: CAT_ACCENT[cat], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 0 4px' }}>
                    {cat}
                  </div>
                  {catItems.map(item => {
                    const meta = CATALOG[item.key];
                    return (
                      <div key={item.id} style={{
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '7px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}>
                        <span style={{ fontSize: 16 }}>{meta.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--yellow)' }}>{fmt(meta.cost)}</div>
                        </div>
                        <button
                          className="btn-danger"
                          style={{ padding: '3px 7px', fontSize: 11, flexShrink: 0 }}
                          onClick={() => removeItem(item.id)}
                        >✕</button>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}

          {design.length > 0 && (
            <div style={{
              marginTop: 8,
              padding: '10px 12px',
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 8,
              textAlign: 'right',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-light)' }}>{fmt(total)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Catalog item card ── */
function CatalogItem({ itemKey, item, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, itemKey)}
      onDragEnd={onDragEnd}
      style={{
        background: item.base + '22',
        border: `1px solid ${item.base}55`,
        borderRadius: 8,
        padding: '8px 10px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
        transition: 'background 0.15s, transform 0.1s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = item.base + '44'}
      onMouseLeave={e => e.currentTarget.style.background = item.base + '22'}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--yellow)' }}>{fmt(item.cost)}</div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{item.w}×{item.h}</div>
    </div>
  );
}

/* ── Stage canvas ── */
function StageCanvas({ stageRef, design, dropPreview, dragging, onDragOver, onDrop, onDragLeave, onItemDragStart, onItemDragEnd, onRemove }) {
  const [hoveredId, setHoveredId] = useState(null);
  const W = COLS * CELL;
  const H = ROWS * CELL;

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {/* Stage label — back */}
      <div style={{
        width: W,
        background: 'linear-gradient(135deg, #1a0533, #0d0d1a)',
        border: '1px solid #3b1d6e',
        borderBottom: 'none',
        borderRadius: '10px 10px 0 0',
        padding: '7px 0',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 700,
        color: '#7c3aed',
        letterSpacing: '4px',
        textTransform: 'uppercase',
      }}>
        ◈ BACK OF STAGE ◈
      </div>

      {/* Stage floor — interactive grid */}
      <div
        ref={stageRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragLeave}
        style={{
          position: 'relative',
          width: W,
          height: H,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 53px, #1e1e2e 53px, #1e1e2e 54px), repeating-linear-gradient(90deg, transparent, transparent 53px, #1e1e2e 53px, #1e1e2e 54px), #141420',
          boxSizing: 'border-box',
          overflow: 'hidden',
          cursor: dragging ? 'crosshair' : 'default',
        }}
      >
        {/* Corner markers */}
        {[[0,0],[W-20,0],[0,H-20],[W-20,H-20]].map(([x,y], i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 20, height: 20, borderLeft: i % 2 === 0 ? '2px solid #7c3aed44' : 'none', borderRight: i % 2 === 1 ? '2px solid #7c3aed44' : 'none', borderTop: i < 2 ? '2px solid #7c3aed44' : 'none', borderBottom: i >= 2 ? '2px solid #7c3aed44' : 'none' }} />
        ))}

        {/* Drop preview ghost */}
        {dropPreview && dragging && (() => {
          const meta = CATALOG[dragging.key];
          const { x, y, valid } = dropPreview;
          if (x < 0 || y < 0 || x + meta.w > COLS || y + meta.h > ROWS) return null;
          return (
            <div style={{
              position: 'absolute',
              left: x * CELL,
              top: y * CELL,
              width: meta.w * CELL,
              height: meta.h * CELL,
              background: valid ? meta.base + '55' : '#ef444455',
              border: `2px dashed ${valid ? meta.light : '#ef4444'}`,
              borderRadius: 6,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              zIndex: 50,
            }}>
              {meta.icon}
            </div>
          );
        })()}

        {/* Placed items */}
        {design.map(item => {
          const meta = CATALOG[item.key];
          const isHovered = hoveredId === item.id;
          return (
            <div
              key={item.id}
              draggable
              onDragStart={e => onItemDragStart(e, item)}
              onDragEnd={onItemDragEnd}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'absolute',
                left: item.x * CELL + 2,
                top: item.y * CELL + 2,
                width: meta.w * CELL - 4,
                height: meta.h * CELL - 4,
                background: `linear-gradient(135deg, ${meta.base}, ${meta.dark})`,
                borderTop: `3px solid ${meta.light}`,
                borderLeft: `2px solid ${meta.light}88`,
                borderRight: `2px solid ${meta.dark}`,
                borderBottom: `3px solid ${meta.dark}`,
                borderRadius: 6,
                boxShadow: `3px 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 ${meta.light}44`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                zIndex: isHovered ? 20 : 10,
                transition: 'box-shadow 0.15s',
                overflow: 'hidden',
                userSelect: 'none',
                ...(isHovered ? { boxShadow: `4px 4px 16px rgba(0,0,0,0.7), 0 0 0 2px ${meta.light}` } : {}),
              }}
            >
              <span style={{ fontSize: meta.w >= 2 ? 22 : 16, lineHeight: 1 }}>{meta.icon}</span>
              {(meta.w >= 2 || meta.h >= 2) && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 3, textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>
                  {meta.name}
                </span>
              )}
              {meta.w >= 2 && meta.h >= 2 && (
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  {fmt(meta.cost)}
                </span>
              )}
              {isHovered && (
                <button
                  onClick={e => { e.stopPropagation(); onRemove(item.id); }}
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    background: 'rgba(239,68,68,0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    width: 18,
                    height: 18,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    zIndex: 30,
                    fontWeight: 700,
                  }}
                >✕</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage front edge */}
      <div style={{
        width: W,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          height: 14,
          background: 'linear-gradient(180deg, #3d2000, #5c3000)',
          borderLeft: '1px solid #7c4500',
          borderRight: '1px solid #7c4500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b88' }} />
          ))}
        </div>
        <div style={{
          height: 22,
          background: 'linear-gradient(180deg, #5c3000, #3d2000)',
          borderLeft: '1px solid #7c4500',
          borderRight: '1px solid #7c4500',
          borderBottom: '1px solid #7c4500',
          borderRadius: '0 0 10px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: '#f59e0b99',
          letterSpacing: '6px',
          textTransform: 'uppercase',
        }}>
          FRONT OF STAGE — AUDIENCE
        </div>
      </div>
    </div>
  );
}
