import { useState } from 'react';
import { speak } from '../utils/tts';

const GAMES = [
  {
    id: 'flashcard',
    icon: '🃏',
    name: 'כרטיסיות',
    description: 'לחצי על הכרטיס כדי לגלות ולשמוע',
    color: '#ff6b9d',
    bg: 'linear-gradient(135deg, #fff0f6, #ffe4f0)',
    border: '#ffadd2',
  },
  {
    id: 'multichoice',
    icon: '🎯',
    name: 'בחירה נכונה',
    description: 'בחרי את התשובה הנכונה מ-4 אפשרויות',
    color: '#0d9488',
    bg: 'linear-gradient(135deg, #f0fffe, #ccfbf1)',
    border: '#5eead4',
  },
  {
    id: 'memory',
    icon: '🧩',
    name: 'זיכרון',
    description: 'מצאי את הזוגות – מילה ותרגום',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #faf5ff, #ede9fe)',
    border: '#c4b5fd',
  },
  {
    id: 'spelling',
    icon: '✏️',
    name: 'איות',
    description: 'שמעי מילה וכתבי אותה נכון',
    color: '#ea580c',
    bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    border: '#fdba74',
  },
];

export default function GameSelector({ words, onSelectGame, onBack }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.8)', borderRadius: 50, padding: '8px 18px',
            color: '#7c3aed', fontSize: 14, fontWeight: 800,
            border: '2px solid rgba(168,85,247,0.2)',
          }}
        >
          ← חזרה
        </button>
        <div>
          <h2 style={{
            fontFamily: 'Fredoka, cursive', fontSize: 28, fontWeight: 700,
            background: 'linear-gradient(135deg, #ff6b9d, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            איזה משחק? 🎮
          </h2>
          <p style={{ color: '#7c6fa0', fontSize: 14, fontWeight: 600 }}>
            {words.length} מילים מוכנות לפעולה ✨
          </p>
        </div>
      </div>

      {/* Word chips preview — click each to hear */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24,
        background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 16,
        border: '2px solid rgba(168,85,247,0.15)',
        boxShadow: '0 2px 12px rgba(168,85,247,0.08)',
      }}>
        {words.map((w, i) => (
          <button
            key={i}
            onClick={() => speak(w.english)}
            title="לחצי לשמוע"
            style={{
              background: 'linear-gradient(135deg, #fff0f6, #f5f3ff)',
              borderRadius: 50, padding: '6px 14px',
              fontSize: 13, fontWeight: 700, color: '#5b21b6',
              border: '2px solid #e9d5ff', lineHeight: 1.5,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span>🔊</span>
            <span dir="ltr" style={{ color: '#db2777', fontWeight: 800 }}>{w.english}</span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ color: '#5b21b6' }}>{w.hebrew}</span>
          </button>
        ))}
      </div>

      {/* Game cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            onMouseEnter={() => setHovered(game.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: hovered === game.id
                ? `linear-gradient(135deg, ${game.color}, ${game.color}dd)`
                : game.bg,
              borderRadius: 24,
              padding: '24px 20px',
              border: `3px solid ${hovered === game.id ? game.color : game.border}`,
              textAlign: 'right',
              transform: hovered === game.id ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
              transition: 'all 0.22s cubic-bezier(.175,.885,.32,1.275)',
              boxShadow: hovered === game.id
                ? `0 12px 32px ${game.color}55`
                : '0 4px 16px rgba(168,85,247,0.1)',
            }}
          >
            <div style={{ fontSize: 46, marginBottom: 8 }}>{game.icon}</div>
            <div style={{
              fontFamily: 'Fredoka, cursive', fontSize: 22, fontWeight: 700,
              color: hovered === game.id ? '#fff' : game.color,
              marginBottom: 6,
            }}>
              {game.name}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600, lineHeight: 1.4,
              color: hovered === game.id ? 'rgba(255,255,255,0.88)' : '#7c6fa0',
            }}>
              {game.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
