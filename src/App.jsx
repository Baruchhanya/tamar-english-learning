import { useState } from 'react';
import WordInput from './components/WordInput';
import WeeklyHome from './components/WeeklyHome';
import GameSelector from './components/GameSelector';
import DictationHistory from './components/DictationHistory';
import Flashcard from './components/games/Flashcard';
import MultipleChoice from './components/games/MultipleChoice';
import MemoryMatch from './components/games/MemoryMatch';
import SpellingBee from './components/games/SpellingBee';

const STORAGE_KEY = 'tamar_weekly_game';
const HISTORY_STORAGE_KEY = 'tamar_dictation_history';

const SCREENS = {
  WEEKLY:     'weekly',    // home screen — shows saved weekly words
  INPUT:      'input',     // upload / type new words
  SELECT:     'select',    // choose a game (used when coming from manual/builtin)
  HISTORY:    'history',   // dictation history screen
  FLASHCARD:  'flashcard',
  MULTICHOICE:'multichoice',
  MEMORY:     'memory',
  SPELLING:   'spelling',
};

function loadWeekly() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.words) || data.words.length < 2) return null;
    return data;
  } catch { return null; }
}

function saveWeekly(words) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ words, savedAt: new Date().toISOString() }));
  } catch { /* ignore quota errors */ }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      // Migrate from old weekly game if history is empty
      const weekly = loadWeekly();
      if (weekly) {
        const migratedHistory = [{ id: Date.now(), savedAt: weekly.savedAt || new Date().toISOString(), words: weekly.words }];
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(migratedHistory));
        return migratedHistory;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch { return []; }
}

function saveToHistory(words) {
  try {
    const history = loadHistory();
    const newItem = { id: Date.now(), savedAt: new Date().toISOString(), words };
    const newHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  } catch { /* ignore */ }
}

export default function App() {
  const [weekly]  = useState(() => loadWeekly()); // saved weekly game (null if first visit)
  const [words, setWords]   = useState(() => weekly?.words || []);
  const [savedAt, setSavedAt] = useState(() => weekly?.savedAt || null);
  const [screen, setScreen] = useState(() => weekly ? SCREENS.WEEKLY : SCREENS.INPUT);

  const [history, setHistory] = useState(() => loadHistory());

  // Called when words come from IMAGE upload — save as weekly game
  const handleImageWordsReady = (w) => {
    saveWeekly(w);
    saveToHistory(w);
    setWords(w);
    setSavedAt(new Date().toISOString());
    setHistory(loadHistory());
    setScreen(SCREENS.WEEKLY);
  };

  // Called when words come from MANUAL or BUILTIN — don't overwrite weekly
  const handleOtherWordsReady = (w) => {
    setWords(w);
    setScreen(SCREENS.SELECT);
  };

  const handleSelectHistory = (item) => {
    saveWeekly(item.words);
    setWords(item.words);
    setSavedAt(item.savedAt);
    setScreen(SCREENS.WEEKLY);
  };

  const handleSelectGame = (gameId) => {
    const map = {
      flashcard:   SCREENS.FLASHCARD,
      multichoice: SCREENS.MULTICHOICE,
      memory:      SCREENS.MEMORY,
      spelling:    SCREENS.SPELLING,
    };
    setScreen(map[gameId] || SCREENS.WEEKLY);
  };

  const goToWeekly  = () => setScreen(SCREENS.WEEKLY);
  const goToInput   = () => setScreen(SCREENS.INPUT);
  const goToSelect  = () => setScreen(SCREENS.SELECT);
  const goToHistory = () => setScreen(SCREENS.HISTORY);

  const showBack = ![SCREENS.INPUT, SCREENS.WEEKLY, SCREENS.HISTORY].includes(screen);
  const showNewWords = screen !== SCREENS.INPUT && screen !== SCREENS.HISTORY;
  const showHistory = screen !== SCREENS.HISTORY;

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
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: weekly ? 'pointer' : 'default' }}
          onClick={() => weekly && setScreen(SCREENS.WEEKLY)}
        >
          <span style={{ fontSize: 32, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🌟</span>
          <div>
            <div style={{
              fontFamily: 'Fredoka, cursive',
              fontSize: 22, fontWeight: 700,
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

        <div style={{ display: 'flex', gap: 8 }}>
          {showHistory && history.length > 0 && (
            <button
              onClick={goToHistory}
              style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '2px solid #fde047',
                borderRadius: 50, padding: '8px 16px',
                color: '#d97706', fontSize: 13, fontWeight: 800,
                boxShadow: '0 2px 10px rgba(234,179,8,0.2)',
              }}
            >
              📚 היסטוריית הכתבות
            </button>
          )}
          {showBack && (
            <button
              onClick={weekly ? goToWeekly : goToSelect}
              style={{
                background: 'rgba(255,255,255,0.8)', border: '2px solid rgba(168,85,247,0.2)',
                borderRadius: 50, padding: '8px 16px',
                color: '#7c3aed', fontSize: 13, fontWeight: 800,
              }}
            >
              ← חזרה
            </button>
          )}
          {showNewWords && (
            <button
              onClick={goToInput}
              style={{
                background: 'linear-gradient(135deg, #ffd6e7, #c7f2ff)',
                border: '2px solid #f0abca',
                borderRadius: 50, padding: '8px 18px',
                color: '#7c3aed', fontSize: 13, fontWeight: 800,
                boxShadow: '0 2px 10px rgba(168,85,247,0.2)',
              }}
            >
              📷 מילים חדשות
            </button>
          )}
        </div>
      </header>

      <main style={{ paddingBottom: 48 }}>
        {screen === SCREENS.WEEKLY && words.length > 0 && (
          <WeeklyHome
            words={words}
            savedAt={savedAt}
            onSelectGame={handleSelectGame}
            onNewWords={goToInput}
          />
        )}
        {screen === SCREENS.INPUT && (
          <WordInput
            onImageWordsReady={handleImageWordsReady}
            onWordsReady={handleOtherWordsReady}
            history={history}
            onSelectHistory={handleSelectHistory}
          />
        )}
        {screen === SCREENS.HISTORY && (
          <DictationHistory
            history={history}
            onSelectHistory={handleSelectHistory}
            onBack={weekly ? goToWeekly : goToInput}
          />
        )}
        {screen === SCREENS.SELECT && (
          <GameSelector words={words} onSelectGame={handleSelectGame} onBack={goToInput} />
        )}
        {screen === SCREENS.FLASHCARD   && <Flashcard     words={words} onBack={weekly ? goToWeekly : goToSelect} />}
        {screen === SCREENS.MULTICHOICE && <MultipleChoice words={words} onBack={weekly ? goToWeekly : goToSelect} />}
        {screen === SCREENS.MEMORY      && <MemoryMatch    words={words} onBack={weekly ? goToWeekly : goToSelect} />}
        {screen === SCREENS.SPELLING    && <SpellingBee    words={words} onBack={weekly ? goToWeekly : goToSelect} />}
      </main>
    </div>
  );
}
