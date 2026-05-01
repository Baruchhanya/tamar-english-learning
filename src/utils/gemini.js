const WORKER_URL = 'https://tamar-gemini.baruchhanya.workers.dev';

async function callGemini(body) {
  const res = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('תגובה ריקה מ-Gemini');
  return text;
}

/**
 * Given an English word, returns { hebrew, phonetic }.
 */
export async function translateWord(english) {
  const prompt = `You are a Hebrew-English dictionary for children.
Given the English word "${english}", return ONLY valid JSON (no markdown, no code blocks):
{
  "hebrew": "<Hebrew translation>",
  "phonetic": "<pronunciation in Hebrew letters WITH nikud, hyphens between syllables>"
}
Rules: phonetic must use Hebrew letters+nikud. Return ONLY the JSON object.`;

  const text = await callGemini({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 200 },
  });
  const cleaned = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.hebrew || !parsed.phonetic) throw new Error('פורמט שגוי');
  return parsed;
}

/**
 * Translate a batch of English words at once.
 */
export async function translateBatch(englishWords) {
  const prompt = `You are a Hebrew-English dictionary for children.
Given: ${JSON.stringify(englishWords)}
Return ONLY a valid JSON array (no markdown):
[{ "english": "<word>", "hebrew": "<translation>", "phonetic": "<Hebrew nikud pronunciation>" }]`;

  const text = await callGemini({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
  });
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Extract English words from an image and return translations + phonetics.
 */
export async function extractWordsFromImage(imageBase64, mimeType) {
  const prompt = `This is a photo of an English vocabulary list from an Israeli elementary school.
Extract ALL English words visible in this image. For each word provide:
1. The English word (exactly as written)
2. Its Hebrew translation (simple, for a child)
3. How to pronounce it using Hebrew letters WITH nikud, hyphens between syllables (e.g. אֶ-פֶּל for "apple")

Return ONLY a valid JSON array — no markdown, no code blocks, nothing else:
[
  {
    "english": "<English word>",
    "hebrew": "<Hebrew translation>",
    "phonetic": "<pronunciation in Hebrew letters with nikud>"
  }
]
Rules:
- Extract ONLY English words; ignore Hebrew text in the image
- Keep the English word exactly as written
- Phonetic MUST use Hebrew letters with nikud marks
- Return ONLY the JSON array`;

  const text = await callGemini({
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType, data: imageBase64 } },
        { text: prompt },
      ],
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
  });
  
  let cleaned = text.replace(/```json|```/g, '').trim();
  
  // Sometimes Gemini returns text before/after the JSON array.
  // We'll try to extract just the array part.
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1) {
    cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("Gemini returned invalid JSON:", text);
    throw new Error(`התשובה לא בפורמט תקין: ${e.message}`);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('לא נמצאו מילים בתמונה');
  return parsed;
}
