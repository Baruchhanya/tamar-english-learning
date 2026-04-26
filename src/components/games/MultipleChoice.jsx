import { useState, useEffect } from 'react';
import { speak } from '../../utils/tts';
import { shuffle, getRandomChoices } from '../../utils/shuffle';
import EnglishWord from '../EnglishWord';

const CHOICE_COLORS = ['#ff6b6b', '#4ecdc4', '#a855f7', '#f97316'];
const CHOICE_LETTERS = ['א', 'ב', 'ג', 'ד'];

export default function MultipleChoice({ words, onBack }) {
  const [queue, setQueue] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [mode, setMode] = useState('he2en'); // 'he2en' | 'en2he'

  const current = queue[idx];

  useEffect(() => {
    if (!current) return;
    const generated = getRandomChoices(words, current, Math.min(4, words.length));
    setChoices(generated);
    setSelected(null);
    if (mode === 'en2he') setTimeout(() => speak(current.english), 300);
  }, [idx, current, mode]);

  const handleAnswer = (choice) => {
    if (selected) return;
    setSelected(choice);
    const correct = choice.english === current.english;
    if (correct) {
      setScore(s => s + 1);
      speak(current.english);
    }
    setTimeout(() => {
      if (idx < queue.length - 1) setIdx(i => i + 1);
      else setCompleted(true);
    }, 1400);
  };

  const restart = () => {
    setQueue(shuffle(words));
    setIdx(0);
    setScore(0);
    setCompleted(false);
    setSelected(null);
  };

  if (completed) {
    const pct = Math.round((score / queue.length) * 100);
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>
          {pct === 100 ? '🏆' : pct >= 70 ? '⭐' : '💪'}
        </div>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 32, color: '#4ecdc4', marginBottom: 8 }}>
          {pct === 100 ? 'מושלם!' : pct >= 70 ? 'כל הכבוד!' : 'ממשיכים להתאמן!'}
        </h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#1e293b', marginBottom: 8, fontFamily: 'Fredoka One, cursive' }}>
          {score}/{queue.length}
        </div>
        <div style={{ background: '#f0fffe', borderRadius: 16, padding: '16px 24px', marginBottom: 24, display: 'inline-block' }}>
          <div style={{ fontSize: 20, color: '#0d9488', fontWeight: 700 }}>{pct}% נכון</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={restart} className="btn-secondary">🔄 שוב</button>
          <button onClick={onBack} style={{
            background: '#f1f5f9', borderRadius: 50, padding: '14px 28px',
            color: '#475569', fontSize: 16, fontWeight: 700
          }}>← משחקים</button>
        </div>
      </div>
    );
  }

  /* ---- helpers ---- */
  const isCorrect = (choice) => choice.english === current.english;
  const getChoiceBg = (choice) => {
    if (!selected) return '#fff';
    if (isCorrect(choice)) return '#dcfce7';
    if (choice === selected) return '#fee2e2';
    return '#f8fafc';
  };
  const getChoiceBorder = (choice) => {
    if (!selected) return '#e2e8f0';
    if (isCorrect(choice)) return '#22c55e';
    if (choice === selected) return '#ef4444';
    return '#e2e8f0';
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: '#f1f5f9', borderRadius: 50, padding: '8px 16px',
          color: '#475569', fontSize: 14, fontWeight: 700
        }}>← משחקים</button>
        <div style={{ background: '#f0fffe', borderRadius: 50, padding: '6px 16px', color: '#0d9488', fontWeight: 800, fontSize: 16 }}>
          ⭐ {score}/{idx + (selected ? 1 : 0)}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { id: 'he2en', label: '🇮🇱 → 🇬🇧' },
          { id: 'en2he', label: '🔊 → 🇮🇱' },
        ].map(m => (
          <button key={m.id}
            onClick={() => { setMode(m.id); restart(); }}
            style={{
              flex: 1, padding: '10px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              background: mode === m.id ? '#4ecdc4' : '#f1f5f9',
              color: mode === m.id ? '#fff' : '#64748b',
            }}
          >{m.label}</button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background: '#e2e8f0', borderRadius: 50, height: 8, marginBottom: 24 }}>
        <div style={{
          background: '#4ecdc4', borderRadius: 50, height: 8,
          width: `${(idx / queue.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Question card */}
      <div style={{
        background: '#fff', borderRadius: 24, padding: '28px',
        textAlign: 'center', marginBottom: 20,
        boxShadow: '0 6px 24px rgba(78,205,196,0.15)',
        border: '3px solid #4ecdc4',
      }}>
        {mode === 'he2en' ? (
          <>
            <div style={{ color: '#64748b', fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              🇮🇱 מה המילה האנגלית של:
            </div>
            <div style={{ fontSize: 42, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              {current.hebrew}
            </div>
          </>
        ) : (
          <>
            <div style={{ color: '#64748b', fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              🔊 שמעי ובחרי את המשמעות:
            </div>
            <button
              onClick={() => speak(current.english)}
              style={{
                background: '#4ecdc4', color: '#fff', borderRadius: 50,
                padding: '14px 36px', fontSize: 18, fontWeight: 800, marginBottom: 8
              }}
            >
              🔊 שמעי שוב
            </button>
            {/* Show the English word + phonetic even in sound mode so kids connect sound → spelling */}
            {selected && (
              <div style={{ marginTop: 10 }}>
                <EnglishWord word={current} size="large" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Choices */}
      {choices.map((choice, i) => (
        <button
          key={choice.english}
          onClick={() => handleAnswer(choice)}
          style={{
            width: '100%',
            padding: mode === 'he2en' ? '14px 18px' : '16px 18px',
            borderRadius: 18,
            border: `3px solid ${getChoiceBorder(choice)}`,
            background: getChoiceBg(choice),
            textAlign: 'right',
            transition: 'all 0.15s',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Letter badge */}
          <span style={{
            width: 30, height: 30, borderRadius: '50%',
            background: CHOICE_COLORS[i], color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, flexShrink: 0
          }}>
            {CHOICE_LETTERS[i]}
          </span>

          {mode === 'he2en' ? (
            /* English choice → always show word + phonetic */
            <div style={{ flex: 1 }}>
              <EnglishWord
                word={choice}
                size="medium"
                dim={!!(selected && !isCorrect(choice) && choice !== selected)}
                color={selected
                  ? isCorrect(choice) ? '#15803d' : choice === selected ? '#dc2626' : '#94a3b8'
                  : '#1e293b'
                }
              />
            </div>
          ) : (
            /* Hebrew choice */
            <span style={{
              fontSize: 20, fontWeight: 700, flex: 1,
              color: selected
                ? isCorrect(choice) ? '#15803d' : choice === selected ? '#dc2626' : '#94a3b8'
                : '#1e293b'
            }}>
              {choice.hebrew}
            </span>
          )}
        </button>
      ))}

      {/* Feedback after answer */}
      {selected && (
        <div style={{ textAlign: 'center', marginTop: 4, padding: '10px 0' }}>
          <div style={{
            fontSize: 20, fontWeight: 800,
            color: selected.english === current.english ? '#22c55e' : '#ef4444'
          }}>
            {selected.english === current.english ? '✓ נכון! 🎉' : '✗ כמעט!'}
          </div>
          {selected.english !== current.english && (
            <div style={{ marginTop: 8 }}>
              <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>הנכון היה:</div>
              <EnglishWord word={current} size="medium" showTranslation />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
