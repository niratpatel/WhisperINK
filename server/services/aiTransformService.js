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

  let prompt = `You are a deeply empathetic and masterful screenwriter with the sensitivity of a novelist and the emotional precision of a Pixar storyteller.
Your task is to take a raw, unedited transcript of a speaker's internal thoughts or spoken reflections and transform it into a cinematic, emotionally resonant internal monologue or dialogue.

Instructions:

Capture the emotional essence. Your goal is not to summarize but to feel what the speaker feels—draw out their longings, doubts, moments of clarity, and emotional truths.

Write in a grounded, human, cinematic style—as if the words are being spoken in a transformative scene of a film, or narrated by a character on the edge of growth, realization, or vulnerability.

Use clean, honest language. Avoid over-dramatic metaphors or poetic fluff unless they arise naturally from the emotion. The power should come from clarity, truth, and subtle imagery—not ornamentation.

Evoke deep connection. The final monologue should feel like a gentle revelation. It should be the kind of thing a listener hears and feels seen by, as if someone finally put into words what they couldn't express.

Do NOT include the speaker's name, date, or journal entry formatting. This is not a diary or a blog. This is a soul-level voiceover, fit for a life-changing film moment or a novel's emotional turning point.

Output only the final monologue—no explanations, no summaries, no notes. Just the dialogue itself, fully formed.

Your goal is to make the listener feel something true. Not impressed—seen.

`;

  if (bookTitle) {
    prompt += `\n\nThe reflections likely pertain to the book "${bookTitle}"`;
    if (bookAuthor) {
      prompt += ` by ${bookAuthor}`;
    }
    prompt += `. Weave in the atmosphere or themes of this book subtly if appropriate and possible based on the transcription content, but don't force it if the transcription doesn't provide clear links.`;
  }

  // Add mood context if provided
  if (mood) {
    const moodContexts = {
      contemplative: "The speaker is in a contemplative mood, reflecting deeply and thoughtfully on their experience. Capture this introspective, philosophical quality in your transformation.",
      inspired: "The speaker is feeling inspired and energized by their thoughts. Infuse the transformation with a sense of possibility, discovery, and creative energy.",
      confused: "The speaker is processing confusion or uncertainty. Acknowledge this state while finding moments of clarity or questions worth exploring within their thoughts.",
      seeking: "The speaker is actively seeking answers or understanding. Frame their thoughts as part of a meaningful search or journey toward insight."
    };

    if (moodContexts[mood]) {
      prompt += `\n\nImportant context about the speaker's current state: ${moodContexts[mood]}`;
    }
  }

  prompt += `\n\nRaw Transcription:\n---\n${transcription}\n---\n\nCinematic Journal Entry:`;

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


