import React from 'react';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export default function DictationHistory({ history, onSelectHistory, onBack }) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px 48px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'Fredoka, cursive',
          fontSize: 36,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #f59e0b, #eab308)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 6,
        }}>
          הכתבות קודמות 📚
        </h1>
        <p style={{ color: '#71717a', fontSize: 16, fontWeight: 600 }}>
          בחרי הכתבה מהעבר כדי לחזור ולתרגל אותה
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#a1a1aa', fontWeight: 600 }}>
            אין הכתבות קודמות עדיין. נסי לצלם דף מילים חדש!
          </div>
        ) : (
          history.map(item => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item)}
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                borderRadius: 22,
                padding: '20px 16px',
                border: '3px solid #fde047',
                textAlign: 'right',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(234,179,8,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309', marginBottom: 4 }}>
                  {formatDate(item.savedAt)}
                </div>
                <div style={{ fontSize: 14, color: '#d97706', fontWeight: 600 }}>
                  {item.words.length} מילים: {item.words.slice(0, 3).map(w => w.english).join(', ')}{item.words.length > 3 ? '...' : ''}
                </div>
              </div>
              <div style={{ fontSize: 24 }}>🚀</div>
            </button>
          ))
        )}
      </div>

      <button
        onClick={onBack}
        style={{
          width: '100%', marginTop: 24, padding: '14px',
          background: '#f1f5f9',
          border: '2px solid #cbd5e1',
          borderRadius: 18, color: '#475569',
          fontSize: 16, fontWeight: 800,
        }}
      >
        חזרה
      </button>
    </div>
  );
}
