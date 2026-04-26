const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Given an English word, returns { hebrew, phonetic } where:
 *   hebrew  – Hebrew translation
 *   phonetic – how the word sounds spelled in Hebrew letters with nikud
 */
export async function translateWord(english, apiKey) {
  const prompt = `You are a Hebrew-English dictionary for children.
Given the English word "${english}", return ONLY valid JSON (no markdown, no code blocks) with exactly these fields:
{
  "hebrew": "<Hebrew translation of the word>",
  "phonetic": "<how to pronounce the English word using Hebrew letters WITH nikud, e.g. for 'apple' → 'אֶ-פֶּל', for 'dog' → 'דּוֹג', for 'beautiful' → 'בְּיוּ-טִי-פוּל'>"
}
Rules:
- phonetic must use Hebrew letters and nikud (vowel marks) to show how the English word sounds
- Use hyphens to separate syllables in phonetic
- Keep it simple and accurate for a child
- Return ONLY the JSON object, nothing else`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('תגובה ריקה מ-Gemini');

  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.hebrew || !parsed.phonetic) throw new Error('פורמט שגוי');
  return parsed;
}

/**
 * Translate a batch of words at once (more efficient)
 */
export async function translateBatch(englishWords, apiKey) {
  const prompt = `You are a Hebrew-English dictionary for children.
Given this list of English words: ${JSON.stringify(englishWords)}

Return ONLY valid JSON array (no markdown) with one object per word:
[
  {
    "english": "<the word>",
    "hebrew": "<Hebrew translation>",
    "phonetic": "<pronunciation in Hebrew letters WITH nikud, hyphens between syllables>"
  }
]
Rules:
- phonetic must use Hebrew letters and nikud to show how the English word sounds
- Example: "apple" → phonetic "אֶ-פֶּל", "dog" → "דּוֹג", "school" → "סְקוּל"
- Return ONLY the JSON array, nothing else`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('תגובה ריקה מ-Gemini');

  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
