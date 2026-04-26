import { useState } from 'react';
import WordInput from './components/WordInput';
import GameSelector from './components/GameSelector';
import Flashcard from './components/games/Flashcard';
import MultipleChoice from './components/games/MultipleChoice';
import MemoryMatch from './components/games/MemoryMatch';
import SpellingBee from './components/games/SpellingBee';
import ApiKeyModal from './components/ApiKeyModal';

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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiModal, setShowApiModal] = useState(false);

  const handleApiKeySave = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiModal(false);
  };

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
      {/* Top bar */}
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
            color: '#ff6b6b'
          }}>
            תמר לומדת אנגלית
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {screen !== SCREENS.INPUT && (
            <button
              onClick={goToInput}
              style={{
                background: '#fff5f5', border: '2px solid #fecaca',
                borderRadius: 50, padding: '8px 16px',
                color: '#ef4444', fontSize: 14, fontWeight: 700
              }}
            >
              מילים חדשות
            </button>
          )}
          <button
            onClick={() => setShowApiModal(true)}
            title="הגדרות Gemini"
            style={{
              background: apiKey ? '#f0fdf4' : '#fef3c7',
              border: `2px solid ${apiKey ? '#86efac' : '#fde68a'}`,
              borderRadius: 50, padding: '8px 14px',
              color: apiKey ? '#15803d' : '#92400e',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <span style={{ fontSize: 16 }}>✨</span>
            {apiKey ? 'Gemini מחובר' : 'חברי Gemini'}
          </button>
        </div>
      </header>

      <main style={{ paddingBottom: 48 }}>
        {screen === SCREENS.INPUT && (
          <WordInput onWordsReady={handleWordsReady} apiKey={apiKey} onOpenApiModal={() => setShowApiModal(true)} />
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

      {showApiModal && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={handleApiKeySave}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  );
}
