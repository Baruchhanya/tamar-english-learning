import { useState, useRef, useEffect, useCallback } from 'react';
import { translateWord, translateBatch, extractWordsFromImage } from '../utils/gemini';
import { BUILTIN_SETS } from '../data/builtinWords';

export default function WordInput({ onWordsReady, onImageWordsReady, history = [], onSelectHistory }) {
  const [words, setWords] = useState([{ english: '', hebrew: '', phonetic: '' }]);
  const [translating, setTranslating] = useState({});
  const [tab, setTab] = useState('image');
  const [error, setError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [imageWords, setImageWords] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [pasteHint, setPasteHint] = useState(false); // flashes when paste detected
  const fileRef = useRef();

  // Shared logic: process any image File/Blob
  const processImageFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageWords([]);
    setError('');
    setImagePreview(URL.createObjectURL(file));
    setOcrLoading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const extracted = await extractWordsFromImage(base64, file.type);
      setImageWords(
        extracted
          .map(w => ({
            english: w.english?.trim().toLowerCase() || '',
            hebrew: w.hebrew?.trim() || '',
            phonetic: w.phonetic?.trim() || '',
          }))
          .filter(w => w.english && w.hebrew)
      );
    } catch (err) {
      setError(`שגיאה בקריאת התמונה: ${err.message}`);
    }
    setOcrLoading(false);
  }, []);

  // Global paste listener — active only when the image tab is open and not already loading
  useEffect(() => {
    if (tab !== 'image') return;
    const onPaste = (e) => {
      if (ocrLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          setPasteHint(true);
          setTimeout(() => setPasteHint(false), 1000);
          processImageFile(item.getAsFile());
          return;
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [tab, ocrLoading, processImageFile]);

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

  const handleEnglishBlur = async (idx) => {
    const word = words[idx];
    if (!word.english.trim() || word.hebrew.trim()) return;
    setTranslating(t => ({ ...t, [idx]: true }));
    try {
      const result = await translateWord(word.english.trim());
      setWords(prev => {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], hebrew: result.hebrew, phonetic: result.phonetic };
        return updated;
      });
    } catch (e) {
      console.error('Translation error:', e);
    }
    setTranslating(t => ({ ...t, [idx]: false }));
  };

  const handleTranslateAll = async () => {
    const needsTranslation = words
      .map((w, i) => ({ ...w, idx: i }))
      .filter(w => w.english.trim() && !w.hebrew.trim());
    if (!needsTranslation.length) return;

    setBulkLoading(true);
    try {
      const results = await translateBatch(needsTranslation.map(w => w.english.trim()));
      setWords(prev => {
        const updated = [...prev];
        results.forEach(r => {
          const match = needsTranslation.find(w => w.english.trim().toLowerCase() === r.english.toLowerCase());
          if (match !== undefined) {
            updated[match.idx] = { ...updated[match.idx], hebrew: r.hebrew, phonetic: r.phonetic };
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) processImageFile(file);
    e.target.value = '';
  };

  const handlePlayImageWords = () => {
    if (imageWords.length < 2) { setError('לא נמצאו מספיק מילים בתמונה'); return; }
    // Use dedicated image callback so App can save as weekly game
    if (onImageWordsReady) onImageWordsReady(imageWords);
    else onWordsReady(imageWords);
  };

  const missingTranslations = words.filter(w => w.english.trim() && !w.hebrew.trim()).length;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 72, marginBottom: 8, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🦄</div>
        <h1 style={{
          fontFamily: 'Fredoka, cursive',
          fontSize: 40,
          fontWeight: 700,
          marginBottom: 8,
          background: 'linear-gradient(135deg, #ff6b9d, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          שלום תמר! 🌈
        </h1>
        <p style={{ color: '#7c6fa0', fontSize: 17, fontWeight: 600 }}>
          צלמי את המילים מבית הספר ונשחק! 🎉
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'image',   label: '📷 תמונה' },
          { id: 'manual',  label: '✏️ הקלדה' },
          { id: 'builtin', label: '🎮 משחקים' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '13px 8px', borderRadius: 50,
              background: tab === t.id
                ? 'linear-gradient(135deg, #ff6b9d, #a855f7)'
                : 'rgba(255,255,255,0.8)',
              color: tab === t.id ? '#fff' : '#7c6fa0',
              fontSize: 14, fontWeight: 800,
              border: tab === t.id ? 'none' : '2px solid rgba(168,85,247,0.2)',
              boxShadow: tab === t.id ? '0 4px 14px rgba(255,107,157,0.4)' : 'none',
              transform: tab === t.id ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── IMAGE TAB ── */}
      {tab === 'image' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* Loading */}
          {ocrLoading && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              {imagePreview && (
                <img src={imagePreview} alt="תמונה"
                  style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 16, marginBottom: 20, objectFit: 'contain', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                />
              )}
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#7c3aed', marginBottom: 6 }}>Gemini קורא את המילים...</p>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>רק כמה שניות</p>
            </div>
          )}

          {/* Initial upload */}
          {!ocrLoading && imageWords.length === 0 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 72, marginBottom: 8 }}>📷</div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                צלמי את דף המילים מבית הספר!
              </p>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>
                Gemini יקרא את המילים, יתרגם ויפתח את המשחק 🪄
              </p>

              {/* Two action buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                <button
                  onClick={() => fileRef.current.click()}
                  style={{
                    background: 'linear-gradient(135deg, #4ecdc4, #a855f7)',
                    color: '#fff', borderRadius: 50,
                    padding: '16px 36px', fontSize: 18, fontWeight: 800,
                    boxShadow: '0 4px 20px rgba(168,85,247,0.35)',
                  }}
                >
                  📤 העלי קובץ
                </button>

                <button
                  onClick={async () => {
                    try {
                      const items = await navigator.clipboard.read();
                      for (const item of items) {
                        const imgType = item.types.find(t => t.startsWith('image/'));
                        if (imgType) {
                          const blob = await item.getType(imgType);
                          processImageFile(new File([blob], 'paste.png', { type: imgType }));
                          return;
                        }
                      }
                      setError('לא נמצאה תמונה בלוח. העתיקי תמונה ונסי שוב, או השתמשי ב-Ctrl+V / Cmd+V.');
                    } catch {
                      setError('הדביקי תמונה עם Ctrl+V / Cmd+V — הדפדפן לא אפשר גישה ישירה ללוח.');
                    }
                  }}
                  style={{
                    background: pasteHint
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'linear-gradient(135deg, #f97316, #ec4899)',
                    color: '#fff', borderRadius: 50,
                    padding: '16px 36px', fontSize: 18, fontWeight: 800,
                    boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                    transition: 'background 0.3s',
                  }}
                >
                  📋 הדביקי צילום מסך
                </button>
              </div>

              {/* Paste drop-zone hint */}
              <div
                style={{
                  border: `2px dashed ${pasteHint ? '#22c55e' : '#c4b5fd'}`,
                  borderRadius: 16, padding: '14px 20px',
                  color: pasteHint ? '#16a34a' : '#7c3aed',
                  fontSize: 14, fontWeight: 600,
                  background: pasteHint ? '#f0fdf4' : '#faf5ff',
                  transition: 'all 0.3s',
                  maxWidth: 380, margin: '0 auto',
                }}
              >
                {pasteHint
                  ? '✅ תמונה זוהתה מהלוח!'
                  : '💡 אפשר גם פשוט ללחוץ Ctrl+V / Cmd+V בכל מקום בדף'}
              </div>
            </div>
          )}

          {/* Words found */}
          {!ocrLoading && imageWords.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <span style={{ fontWeight: 800, fontSize: 17, color: '#16a34a' }}>
                  מצאתי {imageWords.length} מילים!
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {imageWords.map((w, i) => (
                  <div key={i} style={{
                    background: '#f0fdf4', border: '2px solid #86efac',
                    borderRadius: 12, padding: '8px 14px', fontSize: 14,
                    display: 'flex', gap: 8, alignItems: 'center',
                  }}>
                    <span dir="ltr" style={{ fontWeight: 800, color: '#15803d' }}>{w.english}</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ fontWeight: 600 }}>{w.hebrew}</span>
                    {w.phonetic && <>
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      <span style={{ color: '#a855f7', fontSize: 12 }}>{w.phonetic}</span>
                    </>}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setImageWords([]); setImagePreview(null); fileRef.current.click(); }}
                  style={{
                    flex: 1, minWidth: 120, padding: '12px',
                    background: '#f1f5f9', color: '#475569',
                    borderRadius: 14, fontSize: 15, fontWeight: 700,
                    border: '2px dashed #cbd5e1',
                  }}
                >
                  📷 תמונה חדשה
                </button>
                <button
                  onClick={handlePlayImageWords}
                  style={{
                    flex: 2, minWidth: 160, padding: '16px',
                    background: 'linear-gradient(135deg, #ff6b6b, #a855f7)',
                    color: '#fff', borderRadius: 20, fontSize: 20,
                    fontWeight: 800, fontFamily: 'Fredoka One, cursive',
                    boxShadow: '0 4px 20px rgba(255,107,107,0.35)',
                  }}
                >
                  🚀 בואי נשחק!
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 16, background: '#fee2e2', color: '#dc2626',
              borderRadius: 12, padding: '12px 16px', fontWeight: 700,
              textAlign: 'center', fontSize: 14,
            }}>
              {error}
              <button
                onClick={() => { setError(''); setImageWords([]); setImagePreview(null); }}
                style={{ marginRight: 10, textDecoration: 'underline', background: 'none', color: '#dc2626', fontWeight: 700 }}
              >
                נסי שוב
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL TAB ── */}
      {tab === 'manual' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28 }} />
            <div style={{ flex: 1.2, fontWeight: 800, color: '#64748b', fontSize: 13, textAlign: 'center' }}>🇬🇧 מילה באנגלית</div>
            <div style={{ flex: 1,   fontWeight: 800, color: '#64748b', fontSize: 13, textAlign: 'center' }}>🇮🇱 תרגום</div>
            <div style={{ flex: 1,   fontWeight: 800, color: '#a855f7', fontSize: 13, textAlign: 'center' }}>🔤 הגייה</div>
            <div style={{ width: 32 }} />
          </div>

          {words.map((word, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#ff6b6b', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}>
                {idx + 1}
              </div>

              <input
                value={word.english}
                onChange={e => updateWord(idx, 'english', e.target.value)}
                onBlur={() => handleEnglishBlur(idx)}
                placeholder="e.g. apple"
                dir="ltr"
                style={{
                  flex: 1.2, padding: '10px 12px', borderRadius: 12,
                  border: '2px solid #e2e8f0', fontSize: 15, outline: 'none',
                  fontFamily: 'Nunito, sans-serif', textAlign: 'left',
                }}
                onFocus={e => e.target.style.borderColor = '#ff6b6b'}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; handleEnglishBlur(idx); }}
              />

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
                    background: translating[idx] ? '#faf5ff' : '#fff',
                    boxSizing: 'border-box',
                  }}
                />
                {translating[idx] && (
                  <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>⏳</div>
                )}
              </div>

              <input
                value={word.phonetic}
                onChange={e => updateWord(idx, 'phonetic', e.target.value)}
                placeholder={translating[idx] ? '...' : 'הגייה'}
                dir="rtl"
                disabled={translating[idx]}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 12,
                  border: `2px solid ${translating[idx] ? '#a855f7' : '#e2e8f0'}`,
                  fontSize: 15, outline: 'none', color: '#7c3aed',
                  background: translating[idx] ? '#faf5ff' : '#fff',
                }}
              />

              <button
                onClick={() => removeRow(idx)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#fee2e2', color: '#ef4444',
                  fontSize: 16, fontWeight: 800, flexShrink: 0,
                }}
              >×</button>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button
              onClick={addRow}
              style={{
                flex: 1, padding: '10px', borderRadius: 12,
                background: '#f1f5f9', color: '#475569', fontSize: 15, fontWeight: 700,
                border: '2px dashed #cbd5e1', minWidth: 120,
              }}
            >+ הוסיפי מילה</button>

            {missingTranslations > 0 && (
              <button
                onClick={handleTranslateAll}
                disabled={bulkLoading}
                style={{
                  padding: '10px 16px', borderRadius: 12,
                  background: bulkLoading ? '#e2e8f0' : '#a855f7',
                  color: bulkLoading ? '#94a3b8' : '#fff',
                  fontSize: 14, fontWeight: 700, border: 'none', minWidth: 160,
                }}
              >
                {bulkLoading ? '⏳ מתרגם...' : `✨ תרגמי הכל (${missingTranslations})`}
              </button>
            )}
          </div>

          {error && (
            <div style={{ marginTop: 12, background: '#fee2e2', color: '#dc2626', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            style={{
              width: '100%', marginTop: 16, padding: '18px',
              background: '#ff6b6b', color: '#fff', borderRadius: 20,
              fontSize: 22, fontWeight: 800, fontFamily: 'Fredoka One, cursive',
            }}
          >
            🚀 בואי נשחק!
          </button>
        </div>
      )}

      {/* ── BUILTIN TAB ── */}
      {tab === 'builtin' && !selectedSet && (
        <div>
          <p style={{ color: '#64748b', fontSize: 15, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
            בחרי נושא ושחקי עם מילים לכיתה ג׳ — בלי להכניס כלום!
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {BUILTIN_SETS.map(set => (
              <button
                key={set.id}
                onClick={() => setSelectedSet(set)}
                style={{
                  background: set.bg, border: `3px solid ${set.color}`,
                  borderRadius: 20, padding: '20px 16px',
                  textAlign: 'right', cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: 36, marginBottom: 6 }}>{set.icon}</div>
                <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: set.color, marginBottom: 4 }}>{set.name}</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{set.words.length} מילים</div>
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
              style={{ background: '#f1f5f9', borderRadius: 50, padding: '6px 14px', color: '#475569', fontSize: 14, fontWeight: 700 }}
            >← חזרה</button>
            <span style={{ fontSize: 28 }}>{selectedSet.icon}</span>
            <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 22, color: selectedSet.color }}>{selectedSet.name}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {selectedSet.words.map((w, i) => (
              <div key={i} style={{
                background: selectedSet.bg, border: `2px solid ${selectedSet.color}`,
                borderRadius: 12, padding: '8px 14px', fontSize: 14,
              }}>
                <span dir="ltr" style={{ fontWeight: 800, color: selectedSet.color }}>{w.english}</span>
                <span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                <span style={{ fontWeight: 600 }}>{w.hebrew}</span>
                {w.phonetic && (
                  <><span style={{ margin: '0 6px', color: '#cbd5e1' }}>|</span>
                  <span style={{ color: '#a855f7', fontSize: 12 }}>{w.phonetic}</span></>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onWordsReady(selectedSet.words.map(w => ({ ...w })))}
            style={{
              width: '100%', padding: '18px',
              background: selectedSet.color, color: '#fff',
              borderRadius: 20, fontSize: 22, fontWeight: 800,
              fontFamily: 'Fredoka One, cursive',
            }}
          >🚀 בואי נשחק!</button>
        </div>
      )}

      {/* ── LAST DICTATION SECTION ── */}
      {history.length > 0 && tab === 'image' && !ocrLoading && imageWords.length === 0 && (
        <div style={{
          marginTop: 24,
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          borderRadius: 22,
          padding: '20px 16px',
          border: '3px solid #fde047',
          textAlign: 'right',
          boxShadow: '0 4px 14px rgba(234,179,8,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 24 }}>🕒</span>
            <h2 style={{ fontFamily: 'Fredoka, cursive', fontSize: 22, fontWeight: 700, color: '#b45309', margin: 0 }}>
              ההכתבה האחרונה שלך
            </h2>
          </div>
          
          <p style={{ color: '#d97706', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
            מילים: {history[0].words.map(w => w.english).join(', ')}
          </p>

          <button
            onClick={() => onSelectHistory && onSelectHistory(history[0])}
            style={{
              width: '100%', padding: '14px',
              background: '#f59e0b', color: '#fff',
              borderRadius: 16, fontSize: 18, fontWeight: 800,
              fontFamily: 'Fredoka One, cursive',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
            }}
          >
            🚀 שחקי שוב בהכתבה האחרונה!
          </button>
        </div>
      )}
    </div>
  );
}
