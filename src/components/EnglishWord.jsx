/**
 * Displays an English word with its phonetic Hebrew pronunciation always underneath.
 * Optionally shows the Hebrew translation too.
 *
 * Usage:
 *   <EnglishWord word={word} size="large" showTranslation />
 */
export default function EnglishWord({
  word,
  size = 'medium',      // 'small' | 'medium' | 'large' | 'xlarge'
  showTranslation = false,
  color = '#ff6b6b',
  dim = false,           // grey out (for wrong answers etc.)
}) {
  const sizes = {
    small:  { english: 15, phonetic: 12, hebrew: 13 },
    medium: { english: 22, phonetic: 15, hebrew: 17 },
    large:  { english: 34, phonetic: 19, hebrew: 20 },
    xlarge: { english: 48, phonetic: 22, hebrew: 22 },
  };
  const s = sizes[size] || sizes.medium;
  const textColor = dim ? '#94a3b8' : color;

  return (
    <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
      {/* English word */}
      <div
        dir="ltr"
        style={{
          direction: 'ltr',
          fontSize: s.english,
          fontWeight: 800,
          color: textColor,
          fontFamily: 'Fredoka One, cursive',
          letterSpacing: 0.5,
        }}
      >
        {word.english}
      </div>

      {/* Phonetic always shown if available */}
      {word.phonetic ? (
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
      ) : null}

      {/* Hebrew translation — optional */}
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
    </div>
  );
}
