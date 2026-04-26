import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { translateWord, translateBatch } from '../utils/gemini';
import { BUILTIN_SETS } from '../data/builtinWords';

export default function WordInput({ onWordsReady, apiKey, onOpenApiModal }) {
  const [words, setWords] = useState([{ english: '', hebrew: '', phonetic: '' }]);
  const [translating, setTranslating] = useState({}); // idx → true/false
  const [ocrLoading, setOcrLoading] = useState(false);
  const [tab, setTab] = useState('builtin');
  const [error, setError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const fileRef = useRef();

  const updateWord = (idx, field, value) => {
    const updated = [...words];
    updated[idx] = { ...updated[idx], [field]: value };
    setWords(updated);
  };

  const addRow = () => setWords([...words, { english: '', hebrew: '', phonetic: '' }]);

  const removeRow = (idx) => {
    if (words.length === 1) return;
    setWords(words.filter((_, i) => i !== idx));
  };

  // Auto-translate when English field loses focus and Hebrew is empty
  const handleEnglishBlur = async (idx) => {
    const word = words[idx];
    if (!word.english.trim()) return;
    if (word.hebrew.trim()) return; // already has translation
    if (!apiKey) return; // no key yet

    setTranslating(t => ({ ...t, [idx]: true }));
    try {
      const result = await translateWord(word.english.trim(), apiKey);
      setWords(prev => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          hebrew: result.hebrew,
          phonetic: result.phonetic,
        };
        return updated;
      });
    } catch (e) {
      console.error('Translation error:', e);
    }
    setTranslating(t => ({ ...t, [idx]: false }));
  };

  // Translate ALL words that are missing Hebrew at once
  const handleTranslateAll = async () => {
    const needsTranslation = words
      .map((w, i) => ({ ...w, idx: i }))
      .filter(w => w.english.trim() && !w.hebrew.trim());

    if (!needsTranslation.length) return;
    if (!apiKey) { onOpenApiModal(); return; }

    setBulkLoading(true);
    try {
      const results = await translateBatch(needsTranslation.map(w => w.english.trim()), apiKey);
      setWords(prev => {
        const updated = [...prev];
        results.forEach(r => {
          const match = needsTranslation.find(w => w.english.trim().toLowerCase() === r.english.toLowerCase());
          if (match !== undefined) {
            updated[match.idx] = {
              ...updated[match.idx],
              hebrew: r.hebrew,
              phonetic: r.phonetic,
            };
          }
        });
        return updated;
      });
    } catch (e) {
      setError(`שגיאה בתרגום: ${e.message}`);
    }
    setBulkLoading(false);
  };

  const handleStart = () => {
    const valid = words.filter(w => w.english.trim() && w.hebrew.trim());
    if (valid.length < 2) {
      setError('צריך לפחות 2 מילים עם תרגום כדי לשחק!');
      return;
    }
    setError('');
    onWordsReady(valid.map(w => ({
      english: w.english.trim().toLowerCase(),
      hebrew: w.hebrew.trim(),
      phonetic: w.phonetic.trim(),
    })));
  };

  const handleLoadSample = () => {
    const set = BUILTIN_SETS[0];
    setWords(set.words.map(w => ({ ...w })));
  };

  const handleSelectBuiltinSet = (set) => {
    setSelectedSet(set);
  };

  const handlePlayBuiltinSet = (set) => {
    onWordsReady(set.words.map(w => ({ ...w })));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOcrLoading(true);
    try {
      const worker = await createWorker(['eng', 'heb']);
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const extracted = lines.map(line => ({ english: line, hebrew: '', phonetic: '' })).slice(0, 20);
      if (extracted.length > 0) {
        setWords(extracted);
        setTab('manual');
      }
    } catch {
      setError('לא הצלחתי לקרוא את התמונה. נסי להקליד ידנית.');
    }
    setOcrLoading(false);
  };

  const missingTranslations = words.filter(w => w.english.trim() && !w.hebrew.trim()).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>📚</div>
        <h1 style={{
          fontFamily: 'Fredoka One, cursive',
          fontSize: 36, color: '#ff6b6b', marginBottom: 8
        }}>
          בואי נלמד מילים!
        </h1>
        <p style={{ color: '#64748b', fontSize: 17 }}>
          הכניסי את המילים שלך ונתחיל לשחק
        </p>
      </div>

      {/* Gemini banner if no key */}
      {!apiKey && (
        <button
          onClick={onOpenApiModal}
          style={{
            width: '100%', marginBottom: 16, padding: '14px 20px',
            background: '#faf5ff', border: '2px dashed #c084fc',
            borderRadius: 16, color: '#7c3aed', fontSize: 15, fontWeight: 700,
            textAlign: 'center', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8
          }}
        >
          <span style={{ fontSize: 20 }}>✨</span>
          חברי Gemini AI לתרגום אוטומטי + הגייה בניקוד
          <span style={{ fontSize: 20 }}>←</span>
        </button>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'builtin', label: '🎮 משחק מוכן' },
          { id: 'manual', label: '✏️ המילים שלי' },
          { id: 'image', label: '📷 תמונה' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '12px', borderRadius: 14,
              background: tab === t.id ? '#ff6b6b' : '#fff',
              color: tab === t.id ? '#fff' : '#64748b',
              fontSize: 15, fontWeight: 700,
              border: tab === t.id ? 'none' : '2px solid #e2e8f0',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'builtin' && !selectedSet && (
        <div>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
            בחרי נושא ושחקי עם מילים לכיתה ג׳ — בלי להכניס כלום!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {BUILTIN_SETS.map(set => (
              <button
                key={set.id}
                onClick={() => handleSelectBuiltinSet(set)}
                style={{
                  background: set.bg,
                  border: `3px solid ${set.color}`,
                  borderRadius: 20, padding: '20px 16px',
                  textAlign: 'right', cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: 36, marginBottom: 6 }}>{set.icon}</div>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: set.color, marginBottom: 4 }}>
                  {set.name}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {set.words.length} מילים
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'builtin' && selectedSet && (
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => setSelectedSet(null)}
              style={{
                background: '#f1f5f9', borderRadius: 50, padding: '6px 14px',
                color: '#475569', fontSize: 14, fontWeight: 700
              }}
            >
              ← חזרה
            </button>
            <span style={{ fontSize: 28 }}>{selectedSet.icon}</span>
            <span style={{
              fontFamily: 'Fredoka One, cursive', fontSize: 22,
              color: selectedSet.color
            }}>
              {selectedSet.name}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {selectedSet.words.map((w, i) => (
              <div key={i} style={{
                background: selectedSet.bg, border: `2px solid ${selectedSet.color}`,
                borderRadius: 12, padding: '8px 14px', fontSize: 14
              }}>
                <span dir="ltr" style={{ fontWeight: 800, color: selectedSet.color }}>{w.english}</span>
                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                <span style={{ fontWeight: 600 }}>{w.hebrew}</span>
                {w.phonetic && (
                  <>
                    <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                    <span style={{ color: '#a855f7', fontSize: 12 }}>{w.phonetic}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handlePlayBuiltinSet(selectedSet)}
            style={{
              width: '100%', padding: '18px',
              background: selectedSet.color,
              color: '#fff', borderRadius: 20, fontSize: 22,
              fontWeight: 800, fontFamily: 'Fredoka One, cursive',
            }}
          >
            🚀 בואי נשחק!
          </button>
        </div>
      )}

      {tab === 'image' && (
        <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
          <p style={{ marginBottom: 16, color: '#64748b', fontSize: 15 }}>
            צלמי את רשימת המילים מבית הספר ואני אנסה לקרוא אותן!
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileRef.current.click()}
            disabled={ocrLoading}
            style={{
              background: '#4ecdc4', color: '#fff', borderRadius: 50,
              padding: '14px 36px', fontSize: 17, fontWeight: 800,
              opacity: ocrLoading ? 0.7 : 1,
            }}
          >
            {ocrLoading ? '⏳ קורא תמונה...' : '📤 העלי תמונה'}
          </button>
          {!ocrLoading && words.some(w => w.english) && (
            <p style={{ marginTop: 10, color: '#22c55e', fontWeight: 700 }}>
              ✓ המילים הועברו! כעת עבור לטאב הקלדה
            </p>
          )}
        </div>
      )}

      {tab === 'manual' && (
        <div className="card" style={{ marginBottom: 16 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28 }} />
            <div style={{ flex: 1.2, fontWeight: 800, color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              🇬🇧 מילה באנגלית
            </div>
            <div style={{ flex: 1, fontWeight: 800, color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              🇮🇱 תרגום
            </div>
            <div style={{ flex: 1, fontWeight: 800, color: '#a855f7', fontSize: 13, textAlign: 'center' }}>
              🔤 הגייה בניקוד
            </div>
            <div style={{ width: 32 }} />
          </div>

          {words.map((word, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#ff6b6b', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, flexShrink: 0
              }}>
                {idx + 1}
              </div>

              {/* English */}
              <input
                value={word.english}
                onChange={e => updateWord(idx, 'english', e.target.value)}
                onBlur={() => handleEnglishBlur(idx)}
                placeholder="e.g. apple"
                dir="ltr"
                style={{
                  flex: 1.2, padding: '10px 12px', borderRadius: 12,
                  border: '2px solid #e2e8f0', fontSize: 15,
                  outline: 'none', fontFamily: 'Nunito, sans-serif',
                  textAlign: 'left'
                }}
                onFocus={e => e.target.style.borderColor = '#ff6b6b'}
              />

              {/* Hebrew translation */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={word.hebrew}
                  onChange={e => updateWord(idx, 'hebrew', e.target.value)}
                  placeholder={translating[idx] ? '...' : 'תרגום'}
                  dir="rtl"
                  disabled={translating[idx]}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 12,
                    border: `2px solid ${translating[idx] ? '#a855f7' : '#e2e8f0'}`,
                    fontSize: 15, outline: 'none',
                    fontFamily: 'Nunito, sans-serif',
                    background: translating[idx] ? '#faf5ff' : '#fff',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#4ecdc4'}
                  onBlur={e => { if (!translating[idx]) e.target.style.borderColor = '#e2e8f0'; }}
                />
                {translating[idx] && (
                  <div style={{
                    position: 'absolute', left: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 16, animation: 'spin 1s linear infinite'
                  }}>
                    ⏳
                  </div>
                )}
              </div>

              {/* Phonetic */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={word.phonetic}
                  onChange={e => updateWord(idx, 'phonetic', e.target.value)}
                  placeholder={translating[idx] ? '...' : 'הגייה'}
                  dir="rtl"
                  disabled={translating[idx]}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 12,
                    border: `2px solid ${translating[idx] ? '#a855f7' : '#e2e8f0'}`,
                    fontSize: 15, outline: 'none',
                    fontFamily: 'Nunito, sans-serif',
                    background: translating[idx] ? '#faf5ff' : '#fff',
                    color: '#7c3aed',
                    boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => { if (!translating[idx]) e.target.style.borderColor = '#e2e8f0'; }}
                />
              </div>

              <button
                onClick={() => removeRow(idx)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#fee2e2', color: '#ef4444',
                  fontSize: 16, fontWeight: 800, flexShrink: 0
                }}
              >
                ×
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button
              onClick={addRow}
              style={{
                flex: 1, padding: '10px', borderRadius: 12,
                background: '#f1f5f9', color: '#475569',
                fontSize: 15, fontWeight: 700,
                border: '2px dashed #cbd5e1', minWidth: 120
              }}
            >
              + הוסיפי מילה
            </button>

            {apiKey && missingTranslations > 0 && (
              <button
                onClick={handleTranslateAll}
                disabled={bulkLoading}
                style={{
                  padding: '10px 16px', borderRadius: 12,
                  background: bulkLoading ? '#e2e8f0' : '#a855f7',
                  color: bulkLoading ? '#94a3b8' : '#fff',
                  fontSize: 14, fontWeight: 700,
                  border: 'none', minWidth: 160
                }}
              >
                {bulkLoading ? '⏳ מתרגם...' : `✨ תרגמי הכל (${missingTranslations})`}
              </button>
            )}

            <button
              onClick={handleLoadSample}
              style={{
                padding: '10px 16px', borderRadius: 12,
                background: '#fef3c7', color: '#92400e',
                fontSize: 14, fontWeight: 700,
                border: '2px solid #fde68a'
              }}
            >
              דוגמה
            </button>
          </div>
        </div>
      )}

      {tab !== 'builtin' && (
        <>
          {error && (
            <div style={{
              background: '#fee2e2', color: '#dc2626', borderRadius: 12,
              padding: '12px 16px', marginBottom: 16, fontWeight: 700, textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            style={{
              width: '100%', padding: '18px',
              background: '#ff6b6b',
              color: '#fff', borderRadius: 20, fontSize: 22,
              fontWeight: 800, fontFamily: 'Fredoka One, cursive',
              letterSpacing: 1,
            }}
          >
            🚀 בואי נשחק!
          </button>
        </>
      )}
    </div>
  );
}
