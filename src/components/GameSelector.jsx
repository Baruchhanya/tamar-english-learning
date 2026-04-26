import { useState } from 'react';

const GAMES = [
  {
    id: 'flashcard',
    icon: '🃏',
    name: 'כרטיסיות',
    description: 'לחצי על הכרטיס כדי לשמוע ולראות את המילה',
    color: '#ff6b6b',
    bg: '#fff5f5',
  },
  {
    id: 'multichoice',
    icon: '🎯',
    name: 'בחירה נכונה',
    description: 'בחרי את התשובה הנכונה מבין 4 אפשרויות',
    color: '#4ecdc4',
    bg: '#f0fffe',
  },
  {
    id: 'memory',
    icon: '🧩',
    name: 'זיכרון',
    description: 'מצאי את הזוגות - מילה ותרגום',
    color: '#a855f7',
    bg: '#faf5ff',
  },
  {
    id: 'spelling',
    icon: '✏️',
    name: 'איות',
    description: 'שמעי את המילה וכתבי אותה נכון',
    color: '#f97316',
    bg: '#fff7ed',
  },
];

export default function GameSelector({ words, onSelectGame, onBack }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={onBack}
          style={{
            background: '#f1f5f9', borderRadius: 50, padding: '8px 16px',
            color: '#475569', fontSize: 14, fontWeight: 700
          }}
        >
          ← חזרה
        </button>
        <div>
          <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 26, color: '#1e293b' }}>
            בחרי משחק!
          </h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {words.length} מילים טעונות ומוכנות
          </p>
        </div>
      </div>

      {/* Word chips preview */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24,
        background: '#fff', borderRadius: 16, padding: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}>
        {words.map((w, i) => (
          <div key={i} style={{
            background: '#f8fafc', borderRadius: 12, padding: '6px 14px',
            fontSize: 14, fontWeight: 600, color: '#334155',
            border: '2px solid #e2e8f0', lineHeight: 1.4
          }}>
            <span dir="ltr" style={{ color: '#ff6b6b', fontWeight: 800 }}>{w.english}</span>
            <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
            <span>{w.hebrew}</span>
            {w.phonetic && (
              <>
                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                <span style={{ color: '#a855f7', fontSize: 13 }}>{w.phonetic}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            onMouseEnter={() => setHovered(game.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === game.id ? game.color : game.bg,
              borderRadius: 20,
              padding: '24px 20px',
              border: `3px solid ${game.color}`,
              textAlign: 'right',
              transform: hovered === game.id ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 8 }}>{game.icon}</div>
            <div style={{
              fontFamily: 'Fredoka One, cursive',
              fontSize: 22,
              color: hovered === game.id ? '#fff' : game.color,
              marginBottom: 6
            }}>
              {game.name}
            </div>
            <div style={{
              fontSize: 13,
              color: hovered === game.id ? 'rgba(255,255,255,0.85)' : '#64748b',
              fontWeight: 600,
              lineHeight: 1.4
            }}>
              {game.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
