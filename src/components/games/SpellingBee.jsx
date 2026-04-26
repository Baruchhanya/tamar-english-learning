import { useState, useEffect, useRef } from 'react';
import { speak, speakSlow } from '../../utils/tts';
import { shuffle } from '../../utils/shuffle';
import EnglishWord from '../EnglishWord';

export default function SpellingBee({ words, onBack }) {
  const [queue, setQueue] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // null | 'correct' | 'wrong'
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [hint, setHint] = useState(false);
  const inputRef = useRef();

  const current = queue[idx];

  useEffect(() => {
    setInput('');
    setResult(null);
    setHint(false);
    setTimeout(() => {
      speak(current.english);
      inputRef.current?.focus();
    }, 400);
  }, [idx, current]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const correct = input.trim().toLowerCase() === current.english.toLowerCase();
    setResult(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 1);
      speak(current.english);
    }
  };

  const handleNext = () => {
    if (idx < queue.length - 1) setIdx(i => i + 1);
    else setCompleted(true);
  };

  const restart = () => {
    setQueue(shuffle(words));
    setIdx(0);
    setInput('');
    setResult(null);
    setScore(0);
    setCompleted(false);
    setHint(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && result === null) handleSubmit();
    if (e.key === 'Enter' && result !== null) handleNext();
  };

  const getHintWord = () =>
    current.english.split('').map((ch, i) => i % 2 === 0 ? ch : '_').join(' ');

  if (completed) {
    const pct = Math.round((score / queue.length) * 100);
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>
          {pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '💪'}
        </div>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 32, color: '#f97316', marginBottom: 8 }}>
          {pct === 100 ? 'מושלמת!' : 'כל הכבוד!'}
        </h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#1e293b', marginBottom: 20, fontFamily: 'Fredoka One, cursive' }}>
          {score}/{queue.length}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={restart} style={{
            background: '#f97316', color: '#fff', borderRadius: 50,
            padding: '14px 28px', fontSize: 16, fontWeight: 800
          }}>🔄 שוב</button>
          <button onClick={onBack} style={{
            background: '#f1f5f9', borderRadius: 50, padding: '14px 28px',
            color: '#475569', fontSize: 16, fontWeight: 700
          }}>← משחקים</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: '#f1f5f9', borderRadius: 50, padding: '8px 16px',
          color: '#475569', fontSize: 14, fontWeight: 700
        }}>← משחקים</button>
        <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: '#64748b' }}>
          ⭐ {score} | {idx + 1}/{queue.length}
        </div>
      </div>

      {/* Progress */}
      <div style={{ background: '#e2e8f0', borderRadius: 50, height: 8, marginBottom: 28 }}>
        <div style={{
          background: '#f97316', borderRadius: 50, height: 8,
          width: `${(idx / queue.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question card */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: '28px 24px',
        textAlign: 'center', marginBottom: 20,
        boxShadow: '0 6px 24px rgba(249,115,22,0.12)',
        border: '3px solid #fed7aa'
      }}>
        <div style={{ fontSize: 16, color: '#94a3b8', fontWeight: 700, marginBottom: 14 }}>
          שמעי ואיית את המילה:
        </div>

        {/* Hebrew meaning */}
        <div style={{ fontSize: 30, fontWeight: 800, color: '#1e293b', marginBottom: 18 }}>
          {current.hebrew}
        </div>

        {/* Sound buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => speak(current.english)}
            style={{
              background: '#f97316', color: '#fff', borderRadius: 50,
              padding: '12px 24px', fontSize: 16, fontWeight: 800
            }}
          >
            🔊 שמעי
          </button>
          <button
            onClick={() => speakSlow(current.english)}
            style={{
              background: '#fff7ed', color: '#c2410c', border: '2px solid #fed7aa',
              borderRadius: 50, padding: '12px 20px', fontSize: 15, fontWeight: 700
            }}
          >
            🐢 לאט
          </button>
          <button
            onClick={() => setHint(!hint)}
            style={{
              background: hint ? '#fef3c7' : '#fff',
              color: '#92400e', border: '2px solid #fde68a',
              borderRadius: 50, padding: '12px 20px', fontSize: 15, fontWeight: 700
            }}
          >
            💡 רמז
          </button>
        </div>

        {/* Hint: letter pattern + phonetic */}
        {hint && (
          <div style={{ marginTop: 16, padding: '12px', background: '#fffbeb', borderRadius: 12 }}>
            <div style={{
              fontSize: 20, fontWeight: 800, color: '#92400e',
              letterSpacing: 6, direction: 'ltr', fontFamily: 'monospace',
              marginBottom: 8
            }}>
              {getHintWord()}
            </div>
            {current.phonetic && (
              <div style={{ fontSize: 18, color: '#a855f7', fontWeight: 700, direction: 'rtl', letterSpacing: 1 }}>
                נשמע כמו: ({current.phonetic})
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ marginBottom: 14 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="כתבי את המילה כאן..."
          disabled={result !== null}
          dir="ltr"
          style={{
            width: '100%', padding: '18px 20px', borderRadius: 18,
            border: result === 'correct'
              ? '3px solid #22c55e'
              : result === 'wrong'
                ? '3px solid #ef4444'
                : '3px solid #e2e8f0',
            fontSize: 26, fontWeight: 800, textAlign: 'center',
            background: result === 'correct' ? '#dcfce7' : result === 'wrong' ? '#fee2e2' : '#fff',
            outline: 'none', fontFamily: 'Nunito, sans-serif',
            letterSpacing: 3, transition: 'all 0.2s',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Feedback — always show English + phonetic */}
      {result && (
        <div style={{ textAlign: 'center', marginBottom: 14, padding: '14px', background: '#f8fafc', borderRadius: 16 }}>
          <div style={{
            fontSize: 20, fontWeight: 800, marginBottom: 10,
            color: result === 'correct' ? '#22c55e' : '#ef4444'
          }}>
            {result === 'correct' ? '✓ מצוין! כתבת נכון! 🎉' : '✗ לא בדיוק — הנכון:'}
          </div>
          <EnglishWord word={current} size="large" showTranslation />
        </div>
      )}

      {/* Action button */}
      {result === null ? (
        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '16px',
            background: '#f97316', color: '#fff',
            borderRadius: 18, fontSize: 20, fontWeight: 800
          }}
        >
          בדיקה ✓
        </button>
      ) : (
        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '16px',
            background: result === 'correct' ? '#22c55e' : '#64748b',
            color: '#fff', borderRadius: 18, fontSize: 20, fontWeight: 800
          }}
        >
          {idx === queue.length - 1 ? '🏁 סיום!' : 'הבאה →'}
        </button>
      )}

      {/* Letter keyboard helper */}
      {result === null && (
        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 8, fontWeight: 600 }}>
            לחצי על אותיות כדי להוסיף:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => (
              <button
                key={letter}
                onClick={() => setInput(i => i + letter)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#f8fafc', border: '2px solid #e2e8f0',
                  color: '#475569', fontSize: 14, fontWeight: 700,
                  direction: 'ltr'
                }}
              >
                {letter}
              </button>
            ))}
            <button
              onClick={() => setInput(i => i.slice(0, -1))}
              style={{
                padding: '0 12px', height: 36, borderRadius: 10,
                background: '#fee2e2', border: '2px solid #fecaca',
                color: '#dc2626', fontSize: 14, fontWeight: 700
              }}
            >
              ⌫
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
