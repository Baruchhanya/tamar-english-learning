import { speak } from '../utils/tts';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
}

const GAMES = [
  { id: 'flashcard',   icon: '🃏', name: 'כרטיסיות',    color: '#ff6b9d', bg: 'linear-gradient(135deg,#fff0f6,#ffe4f0)', border: '#ffadd2' },
  { id: 'multichoice', icon: '🎯', name: 'בחירה נכונה', color: '#0d9488', bg: 'linear-gradient(135deg,#f0fffe,#ccfbf1)', border: '#5eead4' },
  { id: 'memory',      icon: '🧩', name: 'זיכרון',      color: '#7c3aed', bg: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '#c4b5fd' },
  { id: 'spelling',    icon: '✏️', name: 'איות',         color: '#ea580c', bg: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '#fdba74' },
];

export default function WeeklyHome({ words, savedAt, onSelectGame, onNewWords }) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 48px' }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ffd6e7, #c7f2ff, #d4b8fe)',
        borderRadius: 28,
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: 24,
        border: '3px solid rgba(168,85,247,0.2)',
        boxShadow: '0 8px 32px rgba(168,85,247,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative floating emojis */}
        <span style={{ position: 'absolute', top: 12, left: 20, fontSize: 28, opacity: 0.6, animation: 'float 3s ease-in-out infinite' }}>⭐</span>
        <span style={{ position: 'absolute', top: 20, right: 24, fontSize: 22, opacity: 0.5, animation: 'float 3.5s ease-in-out infinite 0.5s' }}>🌈</span>
        <span style={{ position: 'absolute', bottom: 14, left: 40, fontSize: 20, opacity: 0.45, animation: 'float 4s ease-in-out infinite 1s' }}>✨</span>
        <span style={{ position: 'absolute', bottom: 10, right: 50, fontSize: 24, opacity: 0.5, animation: 'float 3.2s ease-in-out infinite 0.3s' }}>💖</span>

        <div style={{ fontSize: 56, marginBottom: 8, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🦄</div>
        <h1 style={{
          fontFamily: 'Fredoka, cursive',
          fontSize: 36,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #db2777, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 6,
        }}>
          המשחק השבועי שלך! 🌟
        </h1>
        <p style={{ color: '#6d28d9', fontSize: 15, fontWeight: 700, opacity: 0.8 }}>
          נשמר בתאריך: {formatDate(savedAt)}
        </p>
      </div>

      {/* Word chips — clickable for TTS */}
      <div style={{
        background: 'rgba(255,255,255,0.75)',
        borderRadius: 22,
        padding: '18px 16px',
        marginBottom: 24,
        border: '2px solid rgba(168,85,247,0.15)',
        boxShadow: '0 4px 20px rgba(168,85,247,0.08)',
      }}>
        <div style={{
          fontSize: 13, fontWeight: 800, color: '#7c6fa0',
          marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>📚</span>
          <span>מילות השבוע — לחצי לשמוע:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {words.map((w, i) => (
            <button
              key={i}
              onClick={() => speak(w.english)}
              style={{
                background: 'linear-gradient(135deg, #fff0f6, #f5f3ff)',
                borderRadius: 50,
                padding: '8px 16px',
                fontSize: 14, fontWeight: 700,
                border: '2px solid #e9d5ff',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 2px 8px rgba(168,85,247,0.1)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(168,85,247,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(168,85,247,0.1)'; }}
            >
              <span style={{ fontSize: 16 }}>🔊</span>
              <span dir="ltr" style={{ color: '#db2777', fontWeight: 800 }}>{w.english}</span>
              <span style={{ color: '#c4b5fd' }}>|</span>
              <span style={{ color: '#5b21b6' }}>{w.hebrew}</span>
              {w.phonetic && (
                <>
                  <span style={{ color: '#c4b5fd' }}>|</span>
                  <span style={{ color: '#a855f7', fontSize: 12 }}>{w.phonetic}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Game picker */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#5b21b6', marginBottom: 12, textAlign: 'center' }}>
          🎮 בחרי משחק:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              style={{
                background: game.bg,
                borderRadius: 22,
                padding: '20px 16px',
                border: `3px solid ${game.border}`,
                textAlign: 'right',
                transition: 'all 0.2s cubic-bezier(.175,.885,.32,1.275)',
                boxShadow: '0 4px 14px rgba(168,85,247,0.1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 10px 28px ${game.color}44`;
                e.currentTarget.style.background = `linear-gradient(135deg, ${game.color}, ${game.color}cc)`;
                e.currentTarget.querySelector('.game-name').style.color = '#fff';
                e.currentTarget.querySelector('.game-desc').style.color = 'rgba(255,255,255,0.85)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(168,85,247,0.1)';
                e.currentTarget.style.background = game.bg;
                e.currentTarget.querySelector('.game-name').style.color = game.color;
                e.currentTarget.querySelector('.game-desc').style.color = '#7c6fa0';
              }}
            >
              <div style={{ fontSize: 38, marginBottom: 6 }}>{game.icon}</div>
              <div className="game-name" style={{ fontFamily: 'Fredoka, cursive', fontSize: 20, fontWeight: 700, color: game.color, marginBottom: 4, transition: 'color 0.2s' }}>
                {game.name}
              </div>
              <div className="game-desc" style={{ fontSize: 12, color: '#7c6fa0', fontWeight: 600, lineHeight: 1.4, transition: 'color 0.2s' }}>
                {game.id === 'flashcard'   && 'לחצי על הכרטיס לשמוע ולגלות'}
                {game.id === 'multichoice' && 'בחרי את התשובה הנכונה מ-4'}
                {game.id === 'memory'      && 'מצאי את הזוגות – מילה ותרגום'}
                {game.id === 'spelling'    && 'שמעי מילה וכתבי אותה נכון'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* New words button */}
      <button
        onClick={onNewWords}
        style={{
          width: '100%', padding: '14px',
          background: 'rgba(255,255,255,0.7)',
          border: '2px dashed rgba(168,85,247,0.35)',
          borderRadius: 18, color: '#7c3aed',
          fontSize: 15, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,213,255,0.5)'; e.currentTarget.style.borderColor = '#a855f7'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)'; }}
      >
        <span style={{ fontSize: 20 }}>📷</span>
        <span>העלי תמונה חדשה לשבוע הבא</span>
      </button>
    </div>
  );
}
