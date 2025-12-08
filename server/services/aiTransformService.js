// server/services/aiTransformService.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Gemini API Key not found in .env. AI transformation will fail.");
}

let genAI;
let model;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Free tier with better quality
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  });
}

// Helper for retrying async calls with exponential backoff
const retryWithBackoff = async (fn, retries = 3, delay = 500) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isNetworkError = error.message.includes('fetch failed') || error.code === 'ECONNRESET';
      if (i === retries - 1 || !isNetworkError) throw error;

      console.warn(`Retry ${i + 1} due to network error: ${error.message}`);
      await new Promise(res => setTimeout(res, delay * (i + 1)));
    }
  }
};

const transformToCinematic = async (transcription, bookTitle = '', bookAuthor = '', mood = '') => {
  if (!model) {
    throw new Error("Gemini AI model not initialized. Check API Key.");
  }
  if (!transcription || transcription.trim() === '') {
    console.warn("Received empty transcription, returning default message.");
    return "No thoughts were recorded or transcribed for this entry.";
  }

  let prompt = `You are a thoughtful editor who helps people capture their spoken thoughts in written form.

Your task is to take a raw transcript of someone's spoken words and clean it up into a polished, readable journal entry.

CRITICAL RULES:
1. ONLY use content that appears in the transcription. Do NOT invent, add, or imagine any details, events, thoughts, or feelings that are not explicitly stated.
2. If the transcription is brief or fragmented, keep your output brief. Do not expand or elaborate beyond what was said.
3. Keep the speaker's authentic voice and word choices. Refine grammar and flow, but preserve their unique way of expressing themselves.
4. Remove filler words (um, uh, like, you know) and false starts, but keep the core message intact.
5. If something is unclear in the transcription, leave it out rather than guessing what they meant.

Style Guidelines:
- Write in first person (I, me, my) as if the speaker is writing
- Use natural, conversational language - not overly poetic or dramatic
- Organize scattered thoughts into a coherent flow
- Keep it honest and grounded - this is their real experience

The goal is to help them see their own thoughts clearly reflected back, not to create fiction or embellishment.

`;

  if (bookTitle) {
    prompt += `\n\nNote: The speaker may reference a book titled "${bookTitle}"`;
    if (bookAuthor) {
      prompt += ` by ${bookAuthor}`;
    }
    prompt += `. Only include book references if they actually appear in the transcription.`;
  }

  // Add mood context if provided
  if (mood) {
    const moodContexts = {
      contemplative: "The speaker tagged this as 'contemplative' - maintain any reflective tone present.",
      inspired: "The speaker tagged this as 'inspired' - preserve any enthusiasm they expressed.",
      confused: "The speaker tagged this as 'confused' - it's okay if the entry reflects uncertainty.",
      seeking: "The speaker tagged this as 'seeking' - honor any questions or searching in their words."
    };

    if (moodContexts[mood]) {
      prompt += `\n\n${moodContexts[mood]}`;
    }
  }

  prompt += `\n\nRaw Transcription:\n---\n${transcription}\n---\n\nPolished Journal Entry (stay faithful to what was said):`;

  console.log("Sending prompt to Gemini...");

  try {
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const response = await result.response;

    if (!response || !response.candidates || response.candidates.length === 0 || response.candidates[0].finishReason !== 'STOP') {
      console.error("Gemini response blocked or incomplete:", JSON.stringify(response, null, 2));
      const blockReason = response?.candidates?.[0]?.finishReason;
      const safetyRatings = response?.promptFeedback?.safetyRatings;
      let errorMsg = 'AI generation failed.';
      if (blockReason) errorMsg += ` Reason: ${blockReason}.`;
      if (safetyRatings) errorMsg += ` Safety Concerns: ${JSON.stringify(safetyRatings)}`;
      throw new Error(errorMsg);
    }

    const text = response.text();
    console.log("Gemini transformation successful.");
    return text.trim();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(`Failed to generate cinematic entry: ${error.message}`);
  }
};

async function generateGeminiContentForInsights(promptForGemini, entriesForContext) {
  if (!model) { // 'model' should be defined from your existing Gemini setup
    console.error("Gemini AI model is not initialized in aiTransformService.js. Check API Key and setup.");
    throw new Error("AI model not initialized.");
  }
  try {
    const fullPrompt = `${promptForGemini}\n\nJournal Entries for Context (last 7 days):\n${entriesForContext}`;

    // console.log("Sending to Gemini (Mood Arc Prompt Snippet):", fullPrompt.substring(0, 300) + "..."); 

    // Using the retryWithBackoff from your existing code
    const result = await retryWithBackoff(() => model.generateContent(fullPrompt));
    const response = await result.response;

    if (!response || !response.candidates || response.candidates.length === 0 || response.candidates[0].finishReason !== 'STOP') {
      console.error("Gemini response blocked or incomplete for insights:", JSON.stringify(response, null, 2));
      const blockReason = response?.candidates?.[0]?.finishReason;
      let errorMsg = 'AI insight generation failed.';
      if (blockReason) errorMsg += ` Reason: ${blockReason}.`;
      throw new Error(errorMsg);
    }

    const text = response.text();
    // console.log("Received from Gemini (Mood Arc Response Snippet):", text.substring(0, 300) + "...");
    return text;
  } catch (error) {
    console.error('Error calling Gemini API for insights:', error.message);
    throw new Error('Failed to generate AI insight via Gemini.');
  }
}

async function getWeeklyMoodArcAndDominantEmotion(entries) {
  // Prepare the text from entries. We include date and the main content.
  // Your entries might have 'cinematicEntry' or 'transcribedText'. We'll try to use what's available.
  const entriesText = entries.map(e =>
    `Date: ${new Date(e.createdAt).toLocaleDateString()}, Entry: ${e.cinematicEntry || e.transcribedText || 'No textual content.'}`
  ).join('\n---\n');

  const prompt = "Based on the following journal entries from the past 7 days, describe the user's overall weekly mood arc (e.g., 'started low, gradually improved', 'consistent with peaks of joy', 'fluctuating with stress points'). Also, identify the single most dominant emotion (e.g., Joy, Sadness, Contemplation, Excitement, Anxiety) experienced throughout the week and briefly explain why. Format your response as a JSON object with two keys: 'moodArcDescription' (a string describing the arc) and 'dominantEmotion' (a string for the emotion name). Example: {\"moodArcDescription\": \"The week showed a steady rise in positive sentiment, culminating in a joyful weekend.\", \"dominantEmotion\": \"Joy\"}.";

  const geminiResponse = await generateGeminiContentForInsights(prompt, entriesText);

  try {
    // Gemini should return a JSON string, so we parse it into an object.
    let cleanedResponse = geminiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.substring(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.substring(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();
    return JSON.parse(cleanedResponse);
  } catch (e) {
    console.error("Failed to parse Gemini JSON response for mood arc:", e, "\nRaw Gemini Response was:", geminiResponse);
    // If Gemini doesn't return perfect JSON, we provide a default / error state.
    return {
      moodArcDescription: "Insights are brewing! We couldn't quite capture the mood arc this time. Try again shortly.",
      dominantEmotion: "Mysterious"
    };
  }
};


module.exports = { transformToCinematic, getWeeklyMoodArcAndDominantEmotion };


