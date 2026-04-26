export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomChoices(words, correctWord, count = 4) {
  const others = words.filter(w => w.english !== correctWord.english);
  const shuffled = shuffle(others).slice(0, count - 1);
  return shuffle([correctWord, ...shuffled]);
}
