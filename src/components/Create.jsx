import { useState, useRef } from 'react';
import { useEvent, fmt, uid } from '../store.jsx';

/* ─── Grid ─── */
const CELL = 56;

const VIEWS = {
  stage: { cols: 16, rows: 10, label: 'Stage View', zones: [
    { x: 0, y: 0, w: 16, h: 10, label: 'STAGE', color: 'rgba(109,40,217,0.06)' },
  ]},
  venue: { cols: 22, rows: 18, label: 'Full Venue', zones: [
    { x: 0,  y: 0,  w: 22, h: 7,  label: 'STAGE',       color: 'rgba(109,40,217,0.07)' },
    { x: 0,  y: 7,  w: 16, h: 7,  label: 'DANCE FLOOR', color: 'rgba(30,64,175,0.04)'  },
    { x: 16, y: 7,  w: 6,  h: 5,  label: 'BAR AREA',    color: 'rgba(180,83,9,0.07)'   },
    { x: 0,  y: 14, w: 22, h: 4,  label: 'ENTRANCE / OUTDOOR', color: 'rgba(5,150,105,0.05)' },
  ]},
};

/* ─── SVG item visuals ─── */
function DJBoothSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={5} fill="#1a0d2e"/>
      {/* Left CDJ */}
      <rect x={6} y={6} width={w/3-8} height={h-12} rx={3} fill="#2a1550"/>
      <circle cx={6+(w/3-8)/2} cy={h/2} r={Math.min((h-20)/2,14)} fill="#3d2066" stroke="#5b2d8a" strokeWidth={1.5}/>
      <circle cx={6+(w/3-8)/2} cy={h/2} r={4} fill="#7c3aed" opacity={0.7}/>
      {/* Mixer */}
      <rect x={w/3+2} y={6} width={w/3-4} height={h-12} rx={3} fill="#220f40"/>
      {[0,1,2,3].map(i=><rect key={i} x={w/3+6+i*((w/3-12)/4)} y={10} width={3} height={h-22} rx={1.5} fill="#4a2080" opacity={0.8}/>)}
      {/* Right CDJ */}
      <rect x={2*w/3+2} y={6} width={w/3-8} height={h-12} rx={3} fill="#2a1550"/>
      <circle cx={2*w/3+2+(w/3-8)/2} cy={h/2} r={Math.min((h-20)/2,14)} fill="#3d2066" stroke="#5b2d8a" strokeWidth={1.5}/>
      <circle cx={2*w/3+2+(w/3-8)/2} cy={h/2} r={4} fill="#7c3aed" opacity={0.7}/>
      {/* Glow strip */}
      <rect x={6} y={h-8} width={w-12} height={3} rx={1.5} fill="#8b5cf6" opacity={0.6}/>
    </svg>
  );
}

function SpeakerSVG({ w, h, rings = 3 }) {
  const cx = w/2, cy = h/2, maxR = Math.min(w,h)/2 - 4;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#0f172a"/>
      {[...Array(rings)].map((_,i)=>(
        <circle key={i} cx={cx} cy={cy} r={maxR-i*(maxR/rings)} fill="none" stroke="#1e293b" strokeWidth={2}/>
      ))}
      <circle cx={cx} cy={cy} r={maxR/rings} fill="#1e293b"/>
      <circle cx={cx} cy={cy} r={4} fill="#334155"/>
    </svg>
  );
}

function LineArraySVG({ w, h }) {
  const rows = Math.floor(h / 10);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#0f172a"/>
      {[...Array(rows)].map((_,i)=>(
        <g key={i}>
          <rect x={4} y={4+i*(h-8)/rows} width={w-8} height={(h-8)/rows-2} rx={2} fill="#1e293b"/>
          <ellipse cx={w/2} cy={4+i*(h-8)/rows+(h-8)/rows/2} rx={(w-16)/2} ry={(h-8)/rows/2-2} fill="#0f172a"/>
        </g>
      ))}
    </svg>
  );
}

function MovingHeadSVG({ w, h, color = '#fbbf24' }) {
  const cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 4;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1c1917"/>
      {/* Yoke */}
      <rect x={4} y={cy-3} width={10} height={6} rx={3} fill="#57534e"/>
      <rect x={w-14} y={cy-3} width={10} height={6} rx={3} fill="#57534e"/>
      {/* Head */}
      <circle cx={cx} cy={cy} r={r-2} fill="#292524" stroke="#57534e" strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={r-6} fill={color} opacity={0.85}/>
      <circle cx={cx} cy={cy} r={r-12} fill={color}/>
      <circle cx={cx} cy={cy} r={4} fill="#fff" opacity={0.9}/>
    </svg>
  );
}

function LEDWallSVG({ w, h }) {
  const cols = Math.round(w/14), rows = Math.round(h/14);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#111827"/>
      {[...Array(rows)].map((_,r)=>
        [...Array(cols)].map((_,c)=>{
          const hue = (c+r*2)*30 % 360;
          return <rect key={`${r}-${c}`} x={4+c*(w-8)/cols} y={4+r*(h-8)/rows} width={(w-8)/cols-2} height={(h-8)/rows-2} rx={2} fill={`hsl(${hue},70%,40%)`} opacity={0.8}/>;
        })
      )}
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="none" stroke="#374151" strokeWidth={1}/>
    </svg>
  );
}

function TrussHSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={0} y={h/2-6} width={w} height={12} rx={3} fill="#374151"/>
      <rect x={0} y={h/2-10} width={w} height={4} rx={2} fill="#4b5563"/>
      <rect x={0} y={h/2+6} width={w} height={4} rx={2} fill="#4b5563"/>
      {[...Array(Math.floor(w/18))].map((_,i)=>(
        <line key={i} x1={i*18+9} y1={h/2-10} x2={(i+1)*18-3} y2={h/2+10} stroke="#6b7280" strokeWidth={2}/>
      ))}
      {[...Array(Math.floor(w/18))].map((_,i)=>(
        <line key={`b${i}`} x1={i*18+9} y1={h/2+10} x2={(i+1)*18-3} y2={h/2-10} stroke="#6b7280" strokeWidth={2}/>
      ))}
    </svg>
  );
}

function TrussVSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={w/2-6} y={0} width={12} height={h} rx={3} fill="#374151"/>
      <rect x={w/2-10} y={0} width={4} height={h} rx={2} fill="#4b5563"/>
      <rect x={w/2+6} y={0} width={4} height={h} rx={2} fill="#4b5563"/>
      {[...Array(Math.floor(h/18))].map((_,i)=>(
        <line key={i} x1={w/2-10} y1={i*18+9} x2={w/2+10} y2={(i+1)*18-3} stroke="#6b7280" strokeWidth={2}/>
      ))}
      {[...Array(Math.floor(h/18))].map((_,i)=>(
        <line key={`b${i}`} x1={w/2+10} y1={i*18+9} x2={w/2-10} y2={(i+1)*18-3} stroke="#6b7280" strokeWidth={2}/>
      ))}
    </svg>
  );
}

function PersonSVG({ w, h, skinColor = '#f5d5b0', clothColor = '#4b5563', label = '' }) {
  return (
    <svg width={w} height={h} viewBox="0 0 48 56" style={{ position:'absolute', inset:0 }} preserveAspectRatio="xMidYMid meet">
      {/* Shadow */}
      <ellipse cx={24} cy={52} rx={12} ry={3} fill="rgba(0,0,0,0.3)"/>
      {/* Feet */}
      <ellipse cx={17} cy={47} rx={5} ry={3.5} fill={clothColor} transform="rotate(-15,17,47)"/>
      <ellipse cx={31} cy={47} rx={5} ry={3.5} fill={clothColor} transform="rotate(15,31,47)"/>
      {/* Legs */}
      <rect x={15} y={34} width={7} height={14} rx={3} fill={clothColor}/>
      <rect x={26} y={34} width={7} height={14} rx={3} fill={clothColor}/>
      {/* Body */}
      <rect x={11} y={18} width={26} height={18} rx={6} fill={clothColor}/>
      {/* Arms */}
      <rect x={4}  y={19} width={8}  height={14} rx={4} fill={clothColor} transform="rotate(10,8,26)"/>
      <rect x={36} y={19} width={8}  height={14} rx={4} fill={clothColor} transform="rotate(-10,40,26)"/>
      {/* Neck */}
      <rect x={20} y={14} width={8} height={6} rx={3} fill={skinColor}/>
      {/* Head */}
      <circle cx={24} cy={11} r={9} fill={skinColor}/>
      {/* Face features */}
      <circle cx={21} cy={10} r={1.5} fill="rgba(0,0,0,0.35)"/>
      <circle cx={27} cy={10} r={1.5} fill="rgba(0,0,0,0.35)"/>
      <path d="M21 14 Q24 16 27 14" stroke="rgba(0,0,0,0.3)" strokeWidth={1.2} fill="none"/>
    </svg>
  );
}

function TableRoundSVG({ w, h }) {
  const r = Math.min(w,h)/2 - 6;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <circle cx={w/2} cy={h/2} r={r+4} fill="#4a2a0e" opacity={0.4}/>
      <circle cx={w/2} cy={h/2} r={r} fill="#6b3a15" stroke="#92400e" strokeWidth={2}/>
      <circle cx={w/2} cy={h/2} r={r-6} fill="#7c4520" stroke="#a3522e" strokeWidth={1}/>
      {/* place settings */}
      {[0,60,120,180,240,300].slice(0, Math.floor(r/10)).map((deg,i)=>{
        const a = deg * Math.PI/180;
        const rx = w/2 + (r-10)*Math.cos(a), ry = h/2 + (r-10)*Math.sin(a);
        return <circle key={i} cx={rx} cy={ry} r={3} fill="#d4a96a" opacity={0.7}/>;
      })}
    </svg>
  );
}

function TableLongSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={4} y={h/2-12} width={w-8} height={24} rx={4} fill="#6b3a15" stroke="#92400e" strokeWidth={2}/>
      <rect x={8} y={h/2-8} width={w-16} height={16} rx={2} fill="#7c4520"/>
      {/* chairs top */}
      {[...Array(Math.floor((w-16)/20))].map((_,i)=>(
        <rect key={`t${i}`} x={10+i*20} y={h/2-20} width={14} height={6} rx={3} fill="#374151"/>
      ))}
      {/* chairs bottom */}
      {[...Array(Math.floor((w-16)/20))].map((_,i)=>(
        <rect key={`b${i}`} x={10+i*20} y={h/2+14} width={14} height={6} rx={3} fill="#374151"/>
      ))}
    </svg>
  );
}

function CouchSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      {/* back */}
      <rect x={4} y={4} width={w-8} height={12} rx={4} fill="#1e3a5f"/>
      {/* seat */}
      <rect x={4} y={14} width={w-8} height={h-22} rx={3} fill="#1d4ed8" opacity={0.8}/>
      {/* armrests */}
      <rect x={4} y={12} width={10} height={h-20} rx={3} fill="#1e40af"/>
      <rect x={w-14} y={12} width={10} height={h-20} rx={3} fill="#1e40af"/>
      {/* cushion lines */}
      {[...Array(Math.floor((w-24)/28))].map((_,i)=>(
        <line key={i} x1={16+i*28+27} y1={16} x2={16+i*28+27} y2={h-10} stroke="#3b82f6" strokeWidth={1.5} opacity={0.5}/>
      ))}
      {/* legs */}
      <rect x={8} y={h-6} width={8} height={4} rx={2} fill="#1e3a5f"/>
      <rect x={w-16} y={h-6} width={8} height={4} rx={2} fill="#1e3a5f"/>
    </svg>
  );
}

function BackdropSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1e1b4b"/>
      <rect x={6} y={6} width={w-12} height={h-12} rx={3} fill="#312e81" opacity={0.8}/>
      {/* Logo/brand pattern */}
      {[...Array(4)].map((_,r)=>
        [...Array(3)].map((_,c)=>(
          <rect key={`${r}-${c}`} x={8+c*(w-16)/3} y={8+r*(h-16)/4} width={(w-16)/3-4} height={(h-16)/4-4} rx={2} fill="#4338ca" opacity={0.6}/>
        ))
      )}
      {/* Stars/logos */}
      <circle cx={w/2} cy={h/2} r={10} fill="#6366f1" opacity={0.8}/>
      <text x={w/2} y={h/2+1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={10} fontWeight="bold">★</text>
    </svg>
  );
}

function BarCounterSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      {/* Counter top */}
      <rect x={2} y={4} width={w-4} height={h/2} rx={4} fill="#78350f"/>
      <rect x={4} y={6} width={w-8} height={h/2-4} rx={3} fill="#92400e" opacity={0.9}/>
      {/* Front panel */}
      <rect x={2} y={h/2+2} width={w-4} height={h/2-6} rx={3} fill="#451a03"/>
      {/* Shelf bottles (side view from above) */}
      {[...Array(Math.floor((w-20)/14))].map((_,i)=>(
        <rect key={i} x={10+i*14} y={8} width={8} height={h/2-8} rx={4} fill="#b45309" opacity={0.8}/>
      ))}
      {/* Bar stools on one side */}
      {[...Array(Math.floor((w-20)/24))].map((_,i)=>(
        <circle key={`s${i}`} cx={14+i*24} cy={h-6} r={7} fill="#374151" stroke="#4b5563" strokeWidth={1}/>
      ))}
    </svg>
  );
}

function NeonSignSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#18181b"/>
      <rect x={6} y={6} width={w-12} height={h-12} rx={6} fill="none" stroke="#f0abfc" strokeWidth={3} filter="url(#glow)"/>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text x={w/2} y={h/2+1} textAnchor="middle" dominantBaseline="middle" fill="#f0abfc" fontSize={Math.min(14,w/5)} fontWeight="bold" fontFamily="monospace">NEON</text>
    </svg>
  );
}

function FlowerArchSVG({ w, h }) {
  const cx = w/2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      {/* Arch frame */}
      <path d={`M8 ${h-4} Q8 8 ${cx} 8 Q${w-8} 8 ${w-8} ${h-4}`} fill="none" stroke="#15803d" strokeWidth={8} opacity={0.6}/>
      {/* Flowers */}
      {[
        [cx,10],[cx-18,20],[cx+18,20],
        [cx-30,36],[cx+30,36],
        [cx-22,54],[cx+22,54],
        [12,h-16],[w-12,h-16],
      ].map(([x,y],i)=>(
        <g key={i}>
          <circle cx={x} cy={y} r={7} fill={['#f472b6','#fb7185','#f9a8d4','#e879f9','#a78bfa'][i%5]} opacity={0.9}/>
          <circle cx={x} cy={y} r={3} fill="#fef3c7"/>
        </g>
      ))}
    </svg>
  );
}

function TentSVG({ w, h }) {
  const cx = w/2, cy = h/2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      {/* Tent footprint from above */}
      <rect x={4} y={4} width={w-8} height={h-8} rx={4} fill="#d97706" opacity={0.15} stroke="#d97706" strokeWidth={2} strokeDasharray="6,3"/>
      {/* Center pole */}
      <circle cx={cx} cy={cy} r={5} fill="#92400e"/>
      {/* Guy wires to corners */}
      {[[8,8],[w-8,8],[8,h-8],[w-8,h-8]].map(([x,y],i)=>(
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#d97706" strokeWidth={1.5} opacity={0.5}/>
      ))}
      {/* Corner stakes */}
      {[[4,4],[w-4,4],[4,h-4],[w-4,h-4]].map(([x,y],i)=>(
        <circle key={`s${i}`} cx={x} cy={y} r={3} fill="#92400e"/>
      ))}
    </svg>
  );
}

function BarrierSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={h/2-5} width={w-4} height={10} rx={3} fill="#dc2626"/>
      {/* Legs/feet */}
      {[...Array(Math.max(2,Math.floor(w/30)))].map((_,i)=>{
        const x = 10 + i * ((w-20) / Math.max(1, Math.floor(w/30)-1));
        return <rect key={i} x={x-4} y={h/2+3} width={8} height={8} rx={2} fill="#7f1d1d"/>;
      })}
      {/* Stripes */}
      {[...Array(Math.floor((w-4)/14))].map((_,i)=>(
        <rect key={`s${i}`} x={4+i*14} y={h/2-5} width={7} height={10} rx={1} fill="#b91c1c" opacity={i%2===0?1:0}/>
      ))}
    </svg>
  );
}

function EntryArchSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      {/* Pillars */}
      <rect x={4} y={4} width={14} height={h-8} rx={4} fill="#4b5563"/>
      <rect x={w-18} y={4} width={14} height={h-8} rx={4} fill="#4b5563"/>
      {/* Arch top */}
      <path d={`M4 ${h*0.4} Q${w/2} 4 ${w-4} ${h*0.4}`} fill="none" stroke="#6b7280" strokeWidth={10} strokeLinecap="round"/>
      {/* Lights */}
      {[0.2,0.4,0.6,0.8].map((t,i)=>{
        const a = Math.PI * (0.15 + t * 0.7);
        const r = w * 0.45;
        const lx = w/2 - r*Math.cos(a), ly = h*0.4 - r*Math.sin(a)*0.7;
        return <circle key={i} cx={lx} cy={ly} r={3} fill="#fbbf24"/>;
      })}
      {/* "WELCOME" strip */}
      <rect x={14} y={h*0.38} width={w-28} height={h*0.24} rx={3} fill="#111827" opacity={0.8}/>
    </svg>
  );
}

function StrobeSVG({ w, h }) {
  const cx = w/2, cy = h/2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1e1b18"/>
      <circle cx={cx} cy={cy} r={Math.min(w,h)/2-5} fill="#fff" opacity={0.9}/>
      <circle cx={cx} cy={cy} r={Math.min(w,h)/2-10} fill="#e2e8f0"/>
      <circle cx={cx} cy={cy} r={5} fill="#cbd5e1"/>
      {/* Flash rays */}
      {[0,45,90,135].map(deg=>{
        const a = deg*Math.PI/180;
        const r = Math.min(w,h)/2-2;
        return <line key={deg} x1={cx+Math.cos(a)*8} y1={cy+Math.sin(a)*8} x2={cx+Math.cos(a)*r} y2={cy+Math.sin(a)*r} stroke="#fbbf24" strokeWidth={1.5} opacity={0.5}/>;
      })}
    </svg>
  );
}

function LaserSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1a0000"/>
      <rect x={6} y={6} width={w-12} height={h-12} rx={3} fill="#2d0000"/>
      {/* Laser beams */}
      {[['#ef4444',w*0.3],['#22c55e',w*0.5],['#3b82f6',w*0.7]].map(([c,x],i)=>(
        <g key={i}>
          <circle cx={x} cy={h/2} r={5} fill={c}/>
          <line x1={x} y1={h/2} x2={x-(i-1)*8} y2={4} stroke={c} strokeWidth={2} opacity={0.7}/>
        </g>
      ))}
    </svg>
  );
}

function UplightSVG({ w, h }) {
  const cx = w/2, cy = h/2;
  const colors = ['#f472b6','#a78bfa','#60a5fa','#34d399','#fbbf24'];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1c1917"/>
      <circle cx={cx} cy={cy} r={Math.min(w,h)/2-5} fill="#292524"/>
      {colors.map((c,i)=>{
        const a = (i/colors.length)*Math.PI*2;
        const r = Math.min(w,h)/2-10;
        return <circle key={i} cx={cx+r*Math.cos(a)} cy={cy+r*Math.sin(a)} r={4} fill={c} opacity={0.8}/>;
      })}
      <circle cx={cx} cy={cy} r={6} fill="#fff" opacity={0.9}/>
    </svg>
  );
}

function SpotlightSVG({ w, h }) {
  const cx = w/2, cy = h/2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1c1917"/>
      <circle cx={cx} cy={cy} r={Math.min(w,h)/2-5} fill="#111" stroke="#57534e" strokeWidth={1}/>
      <circle cx={cx} cy={cy} r={Math.min(w,h)/2-12} fill="#fff" opacity={0.8}/>
      <circle cx={cx} cy={cy} r={Math.min(w,h)/2-18} fill="#fef3c7"/>
      <circle cx={cx} cy={cy} r={4} fill="#fbbf24"/>
    </svg>
  );
}

function FoodTruckSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={6} width={w-4} height={h-10} rx={5} fill="#92400e"/>
      <rect x={6} y={10} width={w-12} height={h-18} rx={3} fill="#78350f"/>
      {/* Window */}
      <rect x={10} y={12} width={w-20} height={h-28} rx={3} fill="#fef3c7" opacity={0.8}/>
      {/* Awning */}
      <rect x={0} y={4} width={w} height={6} rx={2} fill="#dc2626"/>
      {/* Wheels */}
      <circle cx={16} cy={h-3} r={5} fill="#374151"/>
      <circle cx={w-16} cy={h-3} r={5} fill="#374151"/>
    </svg>
  );
}

function PortaLooSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={3} y={3} width={w-6} height={h-6} rx={4} fill="#1d4ed8"/>
      <rect x={6} y={6} width={w-12} height={h-12} rx={3} fill="#1e40af"/>
      {/* Door */}
      <rect x={w/2-8} y={h/2} width={16} height={h/2-8} rx={2} fill="#1d4ed8" stroke="#3b82f6" strokeWidth={1}/>
      {/* Ventilation slats */}
      {[0,1,2].map(i=>(
        <rect key={i} x={8} y={10+i*7} width={w-16} height={4} rx={2} fill="#2563eb" opacity={0.7}/>
      ))}
    </svg>
  );
}

function RopeSVG({ w, h }) {
  const cx = w/2, cy = h/2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      {/* Post */}
      <circle cx={cx} cy={cy} r={9} fill="#92400e" stroke="#d97706" strokeWidth={2}/>
      <circle cx={cx} cy={cy} r={5} fill="#d97706"/>
      {/* Rope extends */}
      <line x1={0} y1={cy} x2={cx-9} y2={cy} stroke="#d97706" strokeWidth={3} strokeDasharray="4,3"/>
      <line x1={cx+9} y1={cy} x2={w} y2={cy} stroke="#d97706" strokeWidth={3} strokeDasharray="4,3"/>
    </svg>
  );
}

function MixerBoardSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#111827"/>
      <rect x={5} y={5} width={w-10} height={h-10} rx={3} fill="#0f172a"/>
      {/* Faders */}
      {[...Array(Math.floor((w-16)/12))].map((_,i)=>(
        <g key={i}>
          <rect x={8+i*12} y={8} width={4} height={h-22} rx={2} fill="#1e293b"/>
          <rect x={7+i*12} y={8+Math.random()*(h-30)} width={6} height={8} rx={2} fill="#475569"/>
        </g>
      ))}
      {/* Knobs row */}
      {[...Array(Math.floor((w-16)/12))].map((_,i)=>(
        <circle key={`k${i}`} cx={10+i*12} cy={h-10} r={4} fill="#334155" stroke="#475569" strokeWidth={1}/>
      ))}
    </svg>
  );
}

function CDJSvg({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#111827"/>
      {/* Platter */}
      <circle cx={w*0.62} cy={h/2} r={Math.min(h,w*0.5)/2-3} fill="#0f172a" stroke="#1e293b" strokeWidth={2}/>
      <circle cx={w*0.62} cy={h/2} r={Math.min(h,w*0.5)/2-10} fill="#1e293b"/>
      <circle cx={w*0.62} cy={h/2} r={6} fill="#334155"/>
      <circle cx={w*0.62} cy={h/2} r={3} fill="#475569"/>
      {/* Controls side */}
      <rect x={5} y={5} width={w*0.35} height={h-10} rx={3} fill="#0f172a"/>
      {[0,1,2].map(i=>(
        <circle key={i} cx={14} cy={10+i*((h-20)/3)} r={5} fill="#1e293b" stroke="#334155"/>
      ))}
    </svg>
  );
}

function StageRiserSVG({ w, h }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position:'absolute', inset:0 }}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#1f2937" stroke="#374151" strokeWidth={2}/>
      <rect x={6} y={6} width={w-12} height={h-12} rx={3} fill="#111827"/>
      {/* Platform edge highlights */}
      <rect x={4} y={4} width={w-8} height={6} rx={2} fill="#374151" opacity={0.8}/>
      <rect x={4} y={4} width={6} height={h-8} rx={2} fill="#374151" opacity={0.5}/>
      <text x={w/2} y={h/2+4} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize={9} fontWeight="bold">RISER</text>
    </svg>
  );
}

/* ─── Catalog ─── */
export const CATALOG = {
  // DJ / AV Equipment
  'dj-booth':   { name:'DJ Booth',          cat:'DJ Equipment', defaultCost:2500, w:3, h:2, Svg:DJBoothSVG,    base:'#4c1d95' },
  'cdj-set':    { name:'CDJ 2000s (pair)',   cat:'DJ Equipment', defaultCost:800,  w:2, h:1, Svg:CDJSvg,        base:'#3b0764' },
  'mixer-dj':   { name:'DJ Mixer',          cat:'DJ Equipment', defaultCost:400,  w:1, h:1, Svg:MixerBoardSVG, base:'#312e81' },
  // Sound
  'sub':        { name:'Subwoofer',         cat:'Sound',        defaultCost:350,  w:1, h:1, Svg:SpeakerSVG,    base:'#1e3a8a' },
  'array':      { name:'Line Array (side)', cat:'Sound',        defaultCost:1200, w:1, h:2, Svg:LineArraySVG,  base:'#1d4ed8' },
  'monitor':    { name:'Stage Monitor',     cat:'Sound',        defaultCost:200,  w:1, h:1, Svg:({w,h})=><SpeakerSVG w={w} h={h} rings={2}/>, base:'#2563eb' },
  'generator':  { name:'Generator',         cat:'Sound',        defaultCost:600,  w:2, h:1, Svg:({w,h})=>(
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{position:'absolute',inset:0}}>
      <rect x={2} y={2} width={w-4} height={h-4} rx={4} fill="#374151"/>
      <rect x={5} y={5} width={w-10} height={h-10} rx={3} fill="#1f2937"/>
      <text x={w/2} y={h/2+4} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize={9} fontWeight="bold">GEN</text>
    </svg>), base:'#374151' },
  // Lighting
  'moving-head':{ name:'Moving Head',       cat:'Lighting',     defaultCost:250,  w:1, h:1, Svg:MovingHeadSVG, base:'#92400e' },
  'uplight':    { name:'LED Uplight',       cat:'Lighting',     defaultCost:150,  w:1, h:1, Svg:UplightSVG,    base:'#b45309' },
  'led-wall':   { name:'LED Wall (2×2m)',   cat:'Lighting',     defaultCost:1800, w:3, h:2, Svg:LEDWallSVG,    base:'#78350f' },
  'spotlight':  { name:'Spotlight/PAR',     cat:'Lighting',     defaultCost:200,  w:1, h:1, Svg:SpotlightSVG,  base:'#d97706' },
  'strobe':     { name:'Strobe Light',      cat:'Lighting',     defaultCost:180,  w:1, h:1, Svg:StrobeSVG,     base:'#a16207' },
  'laser':      { name:'Laser Rig',         cat:'Lighting',     defaultCost:900,  w:2, h:1, Svg:LaserSVG,      base:'#991b1b' },
  'truss-h':    { name:'Truss H (4m)',      cat:'Lighting',     defaultCost:320,  w:4, h:1, Svg:TrussHSVG,     base:'#374151' },
  'truss-v':    { name:'Truss V (4m)',      cat:'Lighting',     defaultCost:320,  w:1, h:4, Svg:TrussVSVG,     base:'#4b5563' },
  // People
  'person-dj':  { name:'DJ / Artist',       cat:'People',       defaultCost:0,    w:1, h:1, isPerson:true, clothColor:'#7c3aed', skinColor:'#f5d5b0', base:'#7c3aed' },
  'person-sec': { name:'Security',          cat:'People',       defaultCost:0,    w:1, h:1, isPerson:true, clothColor:'#1f2937', skinColor:'#f5d5b0', base:'#1f2937' },
  'person-staff':{ name:'Staff',            cat:'People',       defaultCost:0,    w:1, h:1, isPerson:true, clothColor:'#065f46', skinColor:'#f5d5b0', base:'#065f46' },
  'person-host':{ name:'Host / MC',         cat:'People',       defaultCost:0,    w:1, h:1, isPerson:true, clothColor:'#be185d', skinColor:'#f5d5b0', base:'#be185d' },
  'person-bar': { name:'Bartender',         cat:'People',       defaultCost:0,    w:1, h:1, isPerson:true, clothColor:'#78350f', skinColor:'#f5d5b0', base:'#78350f' },
  'person-photo':{ name:'Photographer',     cat:'People',       defaultCost:0,    w:1, h:1, isPerson:true, clothColor:'#374151', skinColor:'#f5d5b0', base:'#374151' },
  // Furniture & Decor
  'table-round':{ name:'Round Table',       cat:'Furniture',    defaultCost:150,  w:2, h:2, Svg:TableRoundSVG, base:'#78350f' },
  'table-long': { name:'Long Table (6ft)',  cat:'Furniture',    defaultCost:120,  w:3, h:1, Svg:TableLongSVG,  base:'#6b3a15' },
  'couch':      { name:'VIP Couch',         cat:'Furniture',    defaultCost:500,  w:3, h:1, Svg:CouchSVG,      base:'#1d4ed8' },
  'bar-counter':{ name:'Bar Counter',       cat:'Furniture',    defaultCost:1800, w:4, h:1, Svg:BarCounterSVG, base:'#92400e' },
  'rope-post':  { name:'Rope & Post',       cat:'Furniture',    defaultCost:80,   w:2, h:1, Svg:RopeSVG,       base:'#b45309' },
  'stage-riser':{ name:'Stage Riser',       cat:'Furniture',    defaultCost:400,  w:3, h:2, Svg:StageRiserSVG, base:'#1f2937' },
  // Decor
  'backdrop':   { name:'Photo Backdrop',    cat:'Decor',        defaultCost:700,  w:3, h:2, Svg:BackdropSVG,   base:'#312e81' },
  'neon-sign':  { name:'Neon Sign',         cat:'Decor',        defaultCost:400,  w:2, h:1, Svg:NeonSignSVG,   base:'#581c87' },
  'flower-arch':{ name:'Flower Arch',       cat:'Decor',        defaultCost:500,  w:2, h:2, Svg:FlowerArchSVG, base:'#9d174d' },
  // Outdoor
  'tent':       { name:'Tent / Canopy',     cat:'Outdoor',      defaultCost:1200, w:4, h:4, Svg:TentSVG,       base:'#d97706' },
  'barrier':    { name:'Crowd Barrier',     cat:'Outdoor',      defaultCost:80,   w:3, h:1, Svg:BarrierSVG,    base:'#dc2626' },
  'entry-arch': { name:'Entry Arch',        cat:'Outdoor',      defaultCost:600,  w:3, h:2, Svg:EntryArchSVG,  base:'#4b5563' },
  'food-truck': { name:'Food Truck',        cat:'Outdoor',      defaultCost:0,    w:3, h:2, Svg:FoodTruckSVG,  base:'#92400e' },
  'porta-loo':  { name:'Portable Restroom', cat:'Outdoor',      defaultCost:250,  w:1, h:1, Svg:PortaLooSVG,   base:'#1d4ed8' },
};

const CATS = ['DJ Equipment','Sound','Lighting','People','Furniture','Decor','Outdoor'];

const CAT_COLOR = {
  'DJ Equipment': '#8b5cf6',
  'Sound':        '#3b82f6',
  'Lighting':     '#f59e0b',
  'People':       '#22c55e',
  'Furniture':    '#d97706',
  'Decor':        '#ec4899',
  'Outdoor':      '#10b981',
};

/* ─── Helpers ─── */
function canPlace(design, key, x, y, cols, rows, excludeId = null) {
  const { w, h } = CATALOG[key];
  if (x < 0 || y < 0 || x + w > cols || y + h > rows) return false;
  for (const item of design) {
    if (item.id === excludeId) continue;
    const iw = CATALOG[item.key].w, ih = CATALOG[item.key].h;
    if (x < item.x + iw && x + w > item.x && y < item.y + ih && y + h > item.y) return false;
  }
  return true;
}

export function designTotal(design) {
  return design.reduce((s, i) => s + (i.customCost !== undefined && i.customCost !== null ? Number(i.customCost) : (CATALOG[i.key]?.defaultCost || 0)), 0);
}

/* ─── Main Component ─── */
export default function Create() {
  const { data, update } = useEvent();
  const design = data.stageDesign || [];

  const [viewKey, setViewKey] = useState('stage');
  const view = VIEWS[viewKey];

  const [dragging, setDragging] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [openCats, setOpenCats] = useState(new Set(CATS));

  const stageRef = useRef(null);
  const dragStartPos = useRef(null);

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
  }

  function onStageDragStart(e, item) {
    const rect = e.currentTarget.getBoundingClientRect();
    const grabCol = Math.floor((e.clientX - rect.left) / CELL);
    const grabRow = Math.floor((e.clientY - rect.top) / CELL);
    setDragging({ key: item.key, fromCatalog: false, id: item.id, grabCol, grabRow });
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.dataTransfer.effectAllowed = 'move';
  }

  function onStageDragOver(e) {
    e.preventDefault();
    if (!dragging || !stageRef.current) return;
    const { x, y } = getCell(e);
    const px = x - (dragging.grabCol || 0);
    const py = y - (dragging.grabRow || 0);
    const valid = canPlace(design, dragging.key, px, py, view.cols, view.rows, dragging.id);
    setDropPreview({ x: px, y: py, valid });
  }

  function onStageDrop(e) {
    e.preventDefault();
    if (!dragging || !dropPreview || !dropPreview.valid) { cleanup(); return; }
    const { x, y } = dropPreview;
    if (dragging.fromCatalog) {
      const meta = CATALOG[dragging.key];
      const newItem = { id: uid(), key: dragging.key, x, y, customName: '', customCost: meta.defaultCost };
      setDesign([...design, newItem]);
      setSelectedId(newItem.id);
    } else {
      setDesign(design.map(i => i.id === dragging.id ? { ...i, x, y } : i));
    }
    cleanup();
  }

  function cleanup() {
    setDragging(null);
    setDropPreview(null);
  }

  function removeItem(id) {
    setDesign(design.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateItem(id, patch) {
    setDesign(design.map(i => i.id === id ? { ...i, ...patch } : i));
  }

  function toggleCat(cat) {
    setOpenCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  }

  const selectedItem = design.find(i => i.id === selectedId);
  const total = designTotal(design);

  const countByCat = {};
  for (const item of design) {
    const c = CATALOG[item.key]?.cat;
    if (c) countByCat[c] = (countByCat[c] || 0) + 1;
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
      {/* Top bar */}
      <div style={{ padding:'14px 24px 0', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
        <div>
          <div className="page-title">🎪 Stage Designer</div>
          <div className="page-subtitle">Drag items onto the canvas · click a placed item to set its cost · drag to reposition</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          {Object.entries(VIEWS).map(([k, v]) => (
            <button key={k} onClick={() => setViewKey(k)} style={{
              background: viewKey === k ? 'var(--accent)' : 'var(--surface-4)',
              color: viewKey === k ? '#fff' : 'var(--text-muted)',
              padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:600,
            }}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', padding:'12px 24px 16px', gap:14 }}>

        {/* ── Catalog ── */}
        <div style={{ width:210, flexShrink:0, overflowY:'auto', display:'flex', flexDirection:'column', gap:4, paddingRight:4 }}>
          <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>Item Catalog</div>
          {CATS.map(cat => (
            <div key={cat}>
              <button onClick={() => toggleCat(cat)} style={{
                background:'none', border:'none', display:'flex', alignItems:'center', width:'100%',
                padding:'5px 6px', borderRadius:6, cursor:'pointer', color:CAT_COLOR[cat],
                fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.5px',
              }}>
                {cat}
                {countByCat[cat] ? <span style={{ marginLeft:6, background:CAT_COLOR[cat]+'30', borderRadius:10, padding:'1px 6px', fontSize:10 }}>{countByCat[cat]}</span> : null}
                <span style={{ marginLeft:'auto', color:'var(--text-muted)', fontSize:9 }}>{openCats.has(cat)?'▲':'▼'}</span>
              </button>
              {openCats.has(cat) && (
                <div style={{ display:'flex', flexDirection:'column', gap:3, paddingLeft:2, marginBottom:4 }}>
                  {Object.entries(CATALOG).filter(([,v]) => v.cat === cat).map(([key, meta]) => (
                    <div
                      key={key}
                      draggable
                      onDragStart={e => onCatalogDragStart(e, key)}
                      onDragEnd={cleanup}
                      style={{
                        background: meta.base + '25',
                        border:`1px solid ${meta.base}50`,
                        borderRadius:7,
                        padding:'7px 8px',
                        cursor:'grab',
                        display:'flex',
                        alignItems:'center',
                        gap:8,
                        userSelect:'none',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = meta.base + '45'}
                      onMouseLeave={e => e.currentTarget.style.background = meta.base + '25'}
                    >
                      {/* Miniature preview */}
                      <div style={{ width:30, height:30, position:'relative', flexShrink:0, borderRadius:4, overflow:'hidden', background: meta.base + '30' }}>
                        {renderItem(key, meta, 30, 30)}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{meta.name}</div>
                        <div style={{ fontSize:10, color:'var(--yellow)' }}>{meta.defaultCost > 0 ? fmt(meta.defaultCost) : 'Set cost'}</div>
                      </div>
                      <div style={{ fontSize:9, color:'var(--text-muted)', flexShrink:0 }}>{meta.w}×{meta.h}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Canvas ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', overflow:'auto' }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            {/* Back label */}
            <div style={{
              width: view.cols*CELL,
              background:'linear-gradient(135deg,#1a0533,#0d0d1a)',
              border:'1px solid #3b1d6e', borderBottom:'none',
              borderRadius:'10px 10px 0 0',
              padding:'7px 0', textAlign:'center',
              fontSize:10, fontWeight:800, color:'#7c3aed',
              letterSpacing:'5px', textTransform:'uppercase',
            }}>◈ BACK OF STAGE ◈</div>

            {/* Stage grid */}
            <div
              ref={stageRef}
              onDragOver={onStageDragOver}
              onDrop={onStageDrop}
              onDragLeave={e => { if (!stageRef.current?.contains(e.relatedTarget)) setDropPreview(null); }}
              onClick={() => setSelectedId(null)}
              style={{
                position:'relative',
                width: view.cols*CELL,
                height: view.rows*CELL,
                backgroundImage: `
                  repeating-linear-gradient(0deg,   transparent, transparent ${CELL-1}px, #1e1e2e ${CELL-1}px, #1e1e2e ${CELL}px),
                  repeating-linear-gradient(90deg,  transparent, transparent ${CELL-1}px, #1e1e2e ${CELL-1}px, #1e1e2e ${CELL}px)
                `,
                backgroundColor:'#13131c',
                cursor: dragging ? 'crosshair' : 'default',
                overflow:'hidden',
              }}
            >
              {/* Zone backgrounds */}
              {view.zones.map((z,i) => (
                <div key={i} style={{
                  position:'absolute',
                  left:z.x*CELL, top:z.y*CELL,
                  width:z.w*CELL, height:z.h*CELL,
                  background:z.color,
                  pointerEvents:'none',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.08)', fontWeight:900, textTransform:'uppercase', letterSpacing:'6px' }}>{z.label}</span>
                </div>
              ))}

              {/* Drop preview */}
              {dropPreview && dragging && (() => {
                const meta = CATALOG[dragging.key];
                const { x, y, valid } = dropPreview;
                if (!meta || x < 0 || y < 0 || x + meta.w > view.cols || y + meta.h > view.rows) return null;
                return (
                  <div style={{
                    position:'absolute',
                    left:x*CELL, top:y*CELL,
                    width:meta.w*CELL, height:meta.h*CELL,
                    border:`2px dashed ${valid?meta.base:'#ef4444'}`,
                    background: valid ? meta.base+'22' : '#ef444422',
                    borderRadius:6,
                    pointerEvents:'none',
                    zIndex:50,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    overflow:'hidden',
                  }}>
                    {valid && <div style={{ opacity:0.5, width:'100%', height:'100%', position:'relative' }}>
                      {renderItem(dragging.key, meta, meta.w*CELL, meta.h*CELL)}
                    </div>}
                  </div>
                );
              })()}

              {/* Placed items */}
              {design.map(item => {
                const meta = CATALOG[item.key];
                if (!meta) return null;
                const isSelected = selectedId === item.id;
                const iw = meta.w * CELL - 4, ih = meta.h * CELL - 4;
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={e => { e.stopPropagation(); onStageDragStart(e, item); }}
                    onDragEnd={cleanup}
                    onClick={e => { e.stopPropagation(); setSelectedId(item.id); }}
                    style={{
                      position:'absolute',
                      left:item.x*CELL+2, top:item.y*CELL+2,
                      width:iw, height:ih,
                      borderRadius:5,
                      overflow:'hidden',
                      cursor:'grab',
                      zIndex: isSelected ? 30 : 10,
                      outline: isSelected ? `2px solid ${meta.base}` : 'none',
                      outlineOffset: isSelected ? 2 : 0,
                      boxShadow: isSelected
                        ? `0 0 0 3px ${meta.base}88, 0 4px 20px rgba(0,0,0,0.6)`
                        : '0 2px 8px rgba(0,0,0,0.4)',
                      transition:'box-shadow 0.15s, outline 0.15s',
                    }}
                  >
                    {renderItem(item.key, meta, iw, ih)}
                    {/* Cost badge */}
                    {(item.customCost > 0 || meta.defaultCost > 0) && (
                      <div style={{
                        position:'absolute', bottom:2, left:2,
                        background:'rgba(0,0,0,0.65)',
                        borderRadius:3, padding:'1px 5px',
                        fontSize:9, fontWeight:700, color:'#fbbf24',
                        pointerEvents:'none',
                      }}>
                        {fmt(item.customCost !== null && item.customCost !== undefined ? item.customCost : meta.defaultCost)}
                      </div>
                    )}
                    {/* Name badge for bigger items */}
                    {(meta.w >= 2 || meta.h >= 2) && (
                      <div style={{
                        position:'absolute', top:2, left:2,
                        background:'rgba(0,0,0,0.55)',
                        borderRadius:3, padding:'1px 5px',
                        fontSize:9, fontWeight:600, color:'rgba(255,255,255,0.85)',
                        pointerEvents:'none',
                        maxWidth:iw-8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      }}>
                        {item.customName || meta.name}
                      </div>
                    )}
                    {/* Remove X */}
                    {isSelected && (
                      <button
                        onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                        style={{
                          position:'absolute', top:2, right:2,
                          background:'#ef4444', color:'#fff',
                          border:'none', borderRadius:4,
                          width:16, height:16, fontSize:9,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          cursor:'pointer', padding:0, zIndex:40,
                        }}
                      >✕</button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Front edge */}
            <div style={{ width:view.cols*CELL }}>
              <div style={{ height:14, background:'linear-gradient(180deg,#3d2000,#5c3000)', borderLeft:'1px solid #7c4500', borderRight:'1px solid #7c4500', display:'flex', alignItems:'center', justifyContent:'center', gap:24 }}>
                {[...Array(10)].map((_,i)=><div key={i} style={{width:4,height:4,borderRadius:'50%',background:'#f59e0b88'}}/>)}
              </div>
              <div style={{ height:22, background:'linear-gradient(180deg,#5c3000,#3d2000)', borderLeft:'1px solid #7c4500', borderRight:'1px solid #7c4500', borderBottom:'1px solid #7c4500', borderRadius:'0 0 10px 10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#f59e0b99', letterSpacing:'5px', textTransform:'uppercase' }}>
                FRONT OF STAGE — AUDIENCE
              </div>
            </div>
          </div>

          {/* Budget bar */}
          <div style={{ marginTop:14, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', width:view.cols*CELL, boxSizing:'border-box' }}>
            <div>
              <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Stage Design Cost</div>
              <div style={{ fontSize:24, fontWeight:800, color:'var(--accent-light)', fontVariantNumeric:'tabular-nums' }}>{fmt(total)}</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{design.length} item{design.length!==1?'s':''}</span>
              {design.length > 0 && <button className="btn-danger" onClick={() => { setDesign([]); setSelectedId(null); }}>Clear All</button>}
            </div>
          </div>
        </div>

        {/* ── Right: edit panel or item list ── */}
        <div style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', gap:8, overflowY:'auto' }}>
          {selectedItem ? (
            <EditPanel
              item={selectedItem}
              meta={CATALOG[selectedItem.key]}
              onUpdate={patch => updateItem(selectedItem.id, patch)}
              onRemove={() => removeItem(selectedItem.id)}
              onClose={() => setSelectedId(null)}
            />
          ) : (
            <PlacedList design={design} onSelect={setSelectedId} onRemove={removeItem} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Render item SVG ─── */
function renderItem(key, meta, w, h) {
  if (meta.isPerson) {
    return <PersonSVG w={w} h={h} clothColor={meta.clothColor} skinColor={meta.skinColor} />;
  }
  if (meta.Svg) {
    return <meta.Svg w={w} h={h} />;
  }
  return (
    <div style={{ width:'100%', height:'100%', background: meta.base, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
      ?
    </div>
  );
}

/* ─── Edit Panel ─── */
function EditPanel({ item, meta, onUpdate, onRemove, onClose }) {
  const effectiveCost = item.customCost !== null && item.customCost !== undefined ? item.customCost : meta.defaultCost;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>Edit Item</div>
        <button className="btn-ghost" style={{ padding:'3px 8px', fontSize:11 }} onClick={onClose}>Done</button>
      </div>

      {/* Preview */}
      <div style={{ background:'var(--surface-3)', border:`1px solid ${meta.base}55`, borderRadius:10, padding:12, display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:48, height:48, position:'relative', flexShrink:0, borderRadius:6, overflow:'hidden', background:meta.base+'25' }}>
          {renderItem(item.key, meta, 48, 48)}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{meta.name}</div>
          <div style={{ fontSize:11, color: CAT_COLOR[meta.cat] || 'var(--text-muted)' }}>{meta.cat}</div>
          <div style={{ fontSize:10, color:'var(--text-muted)' }}>{meta.w}×{meta.h} grid cells</div>
        </div>
      </div>

      {/* Custom name */}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.4px' }}>Custom Label</label>
        <input
          type="text"
          placeholder={meta.name}
          value={item.customName || ''}
          onChange={e => onUpdate({ customName: e.target.value })}
          style={{ fontSize:13 }}
        />
      </div>

      {/* Cost */}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.4px' }}>Cost / Value ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder={String(meta.defaultCost)}
          value={effectiveCost}
          onChange={e => onUpdate({ customCost: e.target.value === '' ? null : Number(e.target.value) })}
          style={{ fontSize:15, fontWeight:700, color:'var(--yellow)' }}
        />
        {meta.defaultCost > 0 && (
          <button className="btn-ghost" style={{ fontSize:11, padding:'4px' }} onClick={() => onUpdate({ customCost: meta.defaultCost })}>
            Reset to default ({fmt(meta.defaultCost)})
          </button>
        )}
      </div>

      {/* Cost display */}
      <div style={{ background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
        <div style={{ fontSize:10, color:'var(--text-muted)' }}>This item cost</div>
        <div style={{ fontSize:22, fontWeight:800, color:'var(--accent-light)' }}>{fmt(effectiveCost)}</div>
      </div>

      <button className="btn-danger" style={{ width:'100%', padding:'8px', marginTop:4 }} onClick={onRemove}>
        Remove from Stage
      </button>
    </div>
  );
}

/* ─── Placed list ─── */
function PlacedList({ design, onSelect, onRemove }) {
  const cats = CATS.filter(c => design.some(i => CATALOG[i.key]?.cat === c));

  return (
    <>
      <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>
        Placed Items
        {design.length > 0 && <span style={{ marginLeft:6, color:'var(--accent-light)' }}>{design.length}</span>}
      </div>

      {design.length === 0 ? (
        <div style={{ color:'var(--text-muted)', fontSize:12, padding:'20px 0', textAlign:'center' }}>
          <div style={{ fontSize:28, marginBottom:8 }}>🎭</div>
          Drag items from the catalog onto the stage
        </div>
      ) : cats.map(cat => {
        const items = design.filter(i => CATALOG[i.key]?.cat === cat);
        return (
          <div key={cat}>
            <div style={{ fontSize:10, color:CAT_COLOR[cat], fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px', padding:'6px 0 3px' }}>{cat}</div>
            {items.map(item => {
              const meta = CATALOG[item.key];
              const cost = item.customCost !== null && item.customCost !== undefined ? item.customCost : meta.defaultCost;
              return (
                <div key={item.id} onClick={() => onSelect(item.id)} style={{
                  background:'var(--surface-3)', border:'1px solid var(--border)', borderRadius:8,
                  padding:'7px 10px', display:'flex', alignItems:'center', gap:8, marginBottom:4, cursor:'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = meta.base}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ width:28, height:28, position:'relative', borderRadius:4, overflow:'hidden', background:meta.base+'25', flexShrink:0 }}>
                    {renderItem(item.key, meta, 28, 28)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.customName || meta.name}
                    </div>
                    <div style={{ fontSize:10, color: cost > 0 ? 'var(--yellow)' : 'var(--text-muted)' }}>
                      {cost > 0 ? fmt(cost) : 'No cost set'}
                    </div>
                  </div>
                  <button className="btn-danger" style={{ padding:'2px 7px', fontSize:10, flexShrink:0 }} onClick={e => { e.stopPropagation(); onRemove(item.id); }}>✕</button>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
