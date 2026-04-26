import { useState, useEffect } from 'react';
import { speak, speakSlow } from '../../utils/tts';
import { shuffle } from '../../utils/shuffle';
import EnglishWord from '../EnglishWord';

export default function Flashcard({ words, onBack }) {
  const [deck, setDeck] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [completed, setCompleted] = useState(false);

  const current = deck[idx];

  useEffect(() => {
    setFlipped(false);
    setSpeaking(false);
  }, [idx]);

  const handleSpeak = (slow = false) => {
    setSpeaking(true);
    if (slow) speakSlow(current.english);
    else speak(current.english, () => setSpeaking(false));
    setTimeout(() => setSpeaking(false), 3000);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    if (!flipped) handleSpeak();
  };

  const next = () => {
    if (idx < deck.length - 1) setIdx(idx + 1);
    else setCompleted(true);
  };

  const prev = () => { if (idx > 0) setIdx(idx - 1); };

  const restart = () => {
    setDeck(shuffle(words));
    setIdx(0);
    setFlipped(false);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 32, color: '#ff6b6b', marginBottom: 8 }}>
          כל הכבוד!
        </h2>
        <p style={{ color: '#64748b', fontSize: 18, marginBottom: 28 }}>
          עברת על כל {deck.length} המילים!
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={restart} className="btn-primary">🔄 שוב מהתחלה</button>
          <button onClick={onBack} className="btn-secondary">← משחקים</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: '#f1f5f9', borderRadius: 50, padding: '8px 16px',
          color: '#475569', fontSize: 14, fontWeight: 700
        }}>← משחקים</button>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: '#64748b' }}>
          {idx + 1} / {deck.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#e2e8f0', borderRadius: 50, height: 10, marginBottom: 28 }}>
        <div style={{
          background: '#ff6b6b', borderRadius: 50, height: 10,
          width: `${((idx + 1) / deck.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        style={{
          background: flipped ? '#fff5f5' : '#fff',
          borderRadius: 28,
          padding: '48px 32px',
          textAlign: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255,107,107,0.15)',
          border: `3px solid ${flipped ? '#ff6b6b' : '#e2e8f0'}`,
          minHeight: 260,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          marginBottom: 20,
        }}
      >
        {!flipped ? (
          /* FRONT — show Hebrew, ask for English */
          <>
            <div style={{ fontSize: 20, color: '#94a3b8', marginBottom: 14, fontWeight: 700 }}>
              🇮🇱 מה המילה באנגלית?
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
              {current.hebrew}
            </div>
            <div style={{ fontSize: 15, color: '#94a3b8', marginTop: 20, fontWeight: 600 }}>
              לחצי כדי לגלות 👆
            </div>
          </>
        ) : (
          /* BACK — English word + phonetic + Hebrew */
          <>
            <div style={{ fontSize: 18, color: '#94a3b8', marginBottom: 16, fontWeight: 700 }}>
              🇬🇧 באנגלית:
            </div>
            <EnglishWord word={current} size="xlarge" showTranslation />
          </>
        )}
      </div>

      {/* Sound buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => handleSpeak(false)}
          style={{
            flex: 1, padding: '14px', borderRadius: 16,
            background: speaking ? '#ffd93d' : '#fff',
            border: '3px solid #ffd93d',
            color: '#92400e', fontSize: 16, fontWeight: 700,
            transition: 'all 0.2s'
          }}
        >
          {speaking ? '🔊 מדבר...' : '🔊 שמעי'}
        </button>
        <button
          onClick={() => handleSpeak(true)}
          style={{
            flex: 1, padding: '14px', borderRadius: 16,
            background: '#fff', border: '3px solid #4ecdc4',
            color: '#0d9488', fontSize: 16, fontWeight: 700,
          }}
        >
          🐢 לאט לאט
        </button>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={prev}
          disabled={idx === 0}
          style={{
            flex: 1, padding: '14px', borderRadius: 16,
            background: idx === 0 ? '#f1f5f9' : '#fff',
            border: '3px solid #e2e8f0',
            color: idx === 0 ? '#cbd5e1' : '#475569',
            fontSize: 16, fontWeight: 700
          }}
        >
          ← הקודמת
        </button>
        <button
          onClick={next}
          style={{
            flex: 2, padding: '14px', borderRadius: 16,
            background: '#ff6b6b', color: '#fff',
            fontSize: 18, fontWeight: 800,
          }}
        >
          {idx === deck.length - 1 ? '🏁 סיום!' : 'הבאה →'}
        </button>
      </div>
    </div>
  );
}
