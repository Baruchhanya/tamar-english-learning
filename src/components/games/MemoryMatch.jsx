import { useState, useEffect, useCallback } from 'react';
import { speak } from '../../utils/tts';
import { shuffle } from '../../utils/shuffle';
import EnglishWord from '../EnglishWord';

export default function MemoryMatch({ words, onBack }) {
  const [selectedWords] = useState(() => {
    const shuffled = shuffle(words);
    const unique = [];
    const seen = new Set();
    for (const w of shuffled) {
      if (!seen.has(w.hebrew)) {
        seen.add(w.hebrew);
        unique.push(w);
      }
    }
    return unique.slice(0, 6);
  });
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  const initCards = useCallback(() => {
    const pairs = selectedWords.flatMap((w, i) => [
      { id: `en-${i}`, type: 'english', pairId: i, word: w },
      { id: `he-${i}`, type: 'hebrew', pairId: i, word: w },
    ]);
    setCards(shuffle(pairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCompleted(false);
  }, [selectedWords]);

  useEffect(() => { initCards(); }, [initCards]);

  const handleCardClick = (card) => {
    if (flipped.length === 2) return;
    if (flipped.find(c => c.id === card.id)) return;
    if (matched.includes(card.pairId)) return;

    if (card.type === 'english') speak(card.word.english);

    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (a.pairId === b.pairId) {
        speak(a.word.english);
        setTimeout(() => {
          setMatched(m => {
            const next = [...m, a.pairId];
            if (next.length === selectedWords.length) setCompleted(true);
            return next;
          });
          setFlipped([]);
        }, 700);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const isFlipped = (card) => flipped.find(c => c.id === card.id) || matched.includes(card.pairId);
  const isMatched = (card) => matched.includes(card.pairId);

  if (completed) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🧩</div>
        <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 32, color: '#a855f7', marginBottom: 8 }}>
          כל הכבוד! מצאת הכל!
        </h2>
        <div style={{ fontSize: 22, color: '#64748b', fontWeight: 700, marginBottom: 24 }}>
          {moves} מהלכים
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={initCards} style={{
            background: '#a855f7', color: '#fff', borderRadius: 50,
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
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: '#f1f5f9', borderRadius: 50, padding: '8px 16px',
          color: '#475569', fontSize: 14, fontWeight: 700
        }}>← משחקים</button>
        <div>
          <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16 }}>
            {matched.length}/{selectedWords.length} זוגות
          </span>
          <span style={{ color: '#94a3b8', fontSize: 14, marginRight: 12 }}>
            {moves} מהלכים
          </span>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: 16, fontWeight: 600 }}>
        מצאי את הזוגות — מילה עם התרגום שלה!
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {cards.map(card => {
          const flip = isFlipped(card);
          const match = isMatched(card);
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                aspectRatio: '1',
                borderRadius: 16,
                border: match
                  ? '3px solid #22c55e'
                  : flip
                    ? `3px solid ${card.type === 'english' ? '#ff6b6b' : '#4ecdc4'}`
                    : '3px solid #e2e8f0',
                background: match
                  ? '#dcfce7'
                  : flip
                    ? (card.type === 'english' ? '#fff5f5' : '#f0fffe')
                    : '#f8fafc',
                transition: 'all 0.2s ease',
                padding: 6,
                cursor: flip ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {flip ? (
                card.type === 'english' ? (
                  /* English card: word + phonetic below */
                  <div style={{ textAlign: 'center', lineHeight: 1.25, width: '100%' }}>
                    <div dir="ltr" style={{
                      direction: 'ltr', fontWeight: 800,
                      fontSize: card.word.english.length > 8 ? 11 : card.word.english.length > 5 ? 13 : 15,
                      color: match ? '#15803d' : '#ff6b6b',
                      fontFamily: 'Fredoka One, cursive',
                    }}>
                      {card.word.english}
                    </div>
                    {card.word.phonetic && (
                      <div style={{
                        fontSize: 9, color: '#a855f7', fontWeight: 700,
                        marginTop: 2, direction: 'rtl', letterSpacing: 0.5,
                        lineHeight: 1.2,
                        wordBreak: 'break-all',
                      }}>
                        ({card.word.phonetic})
                      </div>
                    )}
                  </div>
                ) : (
                  /* Hebrew card */
                  <div style={{
                    textAlign: 'center', fontWeight: 800,
                    fontSize: card.word.hebrew.length > 6 ? 12 : 15,
                    color: match ? '#15803d' : '#0d9488',
                    direction: 'rtl',
                    lineHeight: 1.2,
                  }}>
                    {card.word.hebrew}
                  </div>
                )
              ) : (
                <span style={{ fontSize: 26 }}>❓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
