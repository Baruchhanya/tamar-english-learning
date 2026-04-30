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
    <div style={{ minHeight: '100vh', background: '#fef9f0' }}>
      <header style={{
        background: '#fff',
        borderBottom: '3px solid #ffe4e6',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>⭐</span>
          <span style={{
            fontFamily: 'Fredoka One, cursive',
            fontSize: 22,
            color: '#ff6b6b',
          }}>
            תמר לומדת אנגלית
          </span>
        </div>

        {screen !== SCREENS.INPUT && (
          <button
            onClick={goToInput}
            style={{
              background: '#fff5f5', border: '2px solid #fecaca',
              borderRadius: 50, padding: '8px 16px',
              color: '#ef4444', fontSize: 14, fontWeight: 700,
            }}
          >
            מילים חדשות
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
