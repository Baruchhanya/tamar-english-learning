import { useState } from 'react';
import WordInput from './components/WordInput';
import GameSelector from './components/GameSelector';
import Flashcard from './components/games/Flashcard';
import MultipleChoice from './components/games/MultipleChoice';
import MemoryMatch from './components/games/MemoryMatch';
import SpellingBee from './components/games/SpellingBee';

const SCREENS = {
  INPUT: 'input',
  SELECT: 'select',
  FLASHCARD: 'flashcard',
  MULTICHOICE: 'multichoice',
  MEMORY: 'memory',
  SPELLING: 'spelling',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.INPUT);
  const [words, setWords] = useState([]);

  const handleWordsReady = (w) => {
    setWords(w);
    setScreen(SCREENS.SELECT);
  };

  const handleSelectGame = (gameId) => {
    const map = {
      flashcard: SCREENS.FLASHCARD,
      multichoice: SCREENS.MULTICHOICE,
      memory: SCREENS.MEMORY,
      spelling: SCREENS.SPELLING,
    };
    setScreen(map[gameId] || SCREENS.SELECT);
  };

  const goToSelect = () => setScreen(SCREENS.SELECT);
  const goToInput = () => setScreen(SCREENS.INPUT);

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '3px solid rgba(168,85,247,0.2)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 20px rgba(168,85,247,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 32, animation: 'float 3s ease-in-out infinite' }}>🌟</span>
          <div>
            <div style={{
              fontFamily: 'Fredoka, cursive',
              fontSize: 22,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ff6b9d, #a855f7, #4ecdc4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}>
              תמר לומדת אנגלית
            </div>
            <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, opacity: 0.7 }}>
              לחצי על כל מילה כדי לשמוע אותה 🔊
            </div>
          </div>
        </div>

        {screen !== SCREENS.INPUT && (
          <button
            onClick={goToInput}
            style={{
              background: 'linear-gradient(135deg, #ffd6e7, #c7f2ff)',
              border: '2px solid #f0abca',
              borderRadius: 50, padding: '8px 18px',
              color: '#7c3aed', fontSize: 14, fontWeight: 800,
              boxShadow: '0 2px 10px rgba(168,85,247,0.2)',
            }}
          >
            📷 מילים חדשות
          </button>
        )}
      </header>

      <main style={{ paddingBottom: 48 }}>
        {screen === SCREENS.INPUT && (
          <WordInput onWordsReady={handleWordsReady} />
        )}
        {screen === SCREENS.SELECT && (
          <GameSelector words={words} onSelectGame={handleSelectGame} onBack={goToInput} />
        )}
        {screen === SCREENS.FLASHCARD && (
          <Flashcard words={words} onBack={goToSelect} />
        )}
        {screen === SCREENS.MULTICHOICE && (
          <MultipleChoice words={words} onBack={goToSelect} />
        )}
        {screen === SCREENS.MEMORY && (
          <MemoryMatch words={words} onBack={goToSelect} />
        )}
        {screen === SCREENS.SPELLING && (
          <SpellingBee words={words} onBack={goToSelect} />
        )}
      </main>
    </div>
  );
}
