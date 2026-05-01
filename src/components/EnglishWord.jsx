import { useState } from 'react';
import { speak } from '../utils/tts';

/**
 * Displays an English word with its phonetic pronunciation + optional Hebrew translation.
 * Clicking the word (or the speaker button) reads it aloud via Web Speech API.
 */
export default function EnglishWord({
  word,
  size = 'medium',
  showTranslation = false,
  color = '#ff6b6b',
  dim = false,
}) {
  const [speaking, setSpeaking] = useState(false);

  const sizes = {
    small:  { english: 15, phonetic: 12, hebrew: 13, icon: 14 },
    medium: { english: 22, phonetic: 15, hebrew: 17, icon: 18 },
    large:  { english: 34, phonetic: 19, hebrew: 20, icon: 22 },
    xlarge: { english: 48, phonetic: 22, hebrew: 22, icon: 26 },
  };
  const s = sizes[size] || sizes.medium;
  const textColor = dim ? '#94a3b8' : color;

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!word?.english) return;
    setSpeaking(true);
    speak(word.english, () => setSpeaking(false));
    setTimeout(() => setSpeaking(false), 4000);
  };

  return (
    <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
      {/* Clickable English word row */}
      <div
        onClick={handleSpeak}
        title="לחצי לשמוע 🔊"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          borderRadius: 12,
          padding: '2px 8px',
          transition: 'background 0.15s, transform 0.15s',
          userSelect: 'none',
          background: speaking ? 'rgba(255,107,107,0.12)' : 'transparent',
          transform: speaking ? 'scale(1.06)' : 'scale(1)',
        }}
        onMouseEnter={e => { if (!dim) e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; }}
        onMouseLeave={e => { if (!speaking) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Speaker icon */}
        <span
          style={{
            fontSize: s.icon,
            opacity: dim ? 0.4 : 1,
            animation: speaking ? 'speakerPulse 0.5s ease-in-out infinite alternate' : 'none',
            flexShrink: 0,
          }}
        >
          {speaking ? '🔊' : '🔈'}
        </span>

        {/* Word */}
        <span
          dir="ltr"
          style={{
            direction: 'ltr',
            fontSize: s.english,
            fontWeight: 800,
            color: textColor,
            fontFamily: 'Fredoka, cursive',
            letterSpacing: 0.5,
          }}
        >
          {word.english}
        </span>
      </div>

      {/* Phonetic */}
      {word.phonetic && (
        <div style={{
          fontSize: s.phonetic,
          color: dim ? '#cbd5e1' : '#a855f7',
          fontWeight: 700,
          marginTop: 3,
          direction: 'rtl',
          letterSpacing: 1,
        }}>
          ({word.phonetic})
        </div>
      )}

      {/* Hebrew translation */}
      {showTranslation && word.hebrew && (
        <div style={{
          fontSize: s.hebrew,
          color: dim ? '#cbd5e1' : '#64748b',
          fontWeight: 700,
          marginTop: 6,
          direction: 'rtl',
        }}>
          {word.hebrew}
        </div>
      )}

      <style>{`
        @keyframes speakerPulse {
          from { transform: scale(1); }
          to   { transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
