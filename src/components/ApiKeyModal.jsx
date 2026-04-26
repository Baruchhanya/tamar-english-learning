import { useState } from 'react';

export default function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [key, setKey] = useState(currentKey);
  const [show, setShow] = useState(false);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 24, padding: 32,
          maxWidth: 460, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✨</div>
          <h2 style={{
            fontFamily: 'Fredoka One, cursive', fontSize: 26,
            color: '#1e293b', marginBottom: 8
          }}>
            חיבור ל-Gemini AI
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.5 }}>
            Gemini יתרגם את המילים אוטומטית ויוסיף הגייה בעברית עם ניקוד
          </p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block', fontWeight: 700, color: '#475569',
            fontSize: 14, marginBottom: 8
          }}>
            מפתח API של Gemini:
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIza..."
              dir="ltr"
              style={{
                width: '100%', padding: '12px 48px 12px 16px',
                borderRadius: 14, border: '2px solid #e2e8f0',
                fontSize: 15, fontFamily: 'monospace',
                outline: 'none', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={() => setShow(!show)}
              style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', color: '#94a3b8', fontSize: 18
              }}
            >
              {show ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div style={{
          background: '#faf5ff', borderRadius: 12, padding: 14,
          marginBottom: 20, fontSize: 13, color: '#7c3aed', lineHeight: 1.6
        }}>
          <strong>איך מקבלים מפתח?</strong><br />
          1. נכנסים ל-<a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: '#7c3aed' }}>aistudio.google.com/apikey</a><br />
          2. לוחצים על "Create API Key"<br />
          3. מדביקים כאן את המפתח
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px', borderRadius: 14,
              background: '#f1f5f9', color: '#475569',
              fontSize: 16, fontWeight: 700
            }}
          >
            ביטול
          </button>
          <button
            onClick={() => onSave(key.trim())}
            disabled={!key.trim()}
            style={{
              flex: 2, padding: '14px', borderRadius: 14,
              background: key.trim() ? '#a855f7' : '#e2e8f0',
              color: key.trim() ? '#fff' : '#94a3b8',
              fontSize: 16, fontWeight: 800
            }}
          >
            שמור וחבר ✓
          </button>
        </div>
      </div>
    </div>
  );
}
