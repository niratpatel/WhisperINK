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
        model: "gemini-2.5-flash-preview-05-20", // Or "gemini-pro"
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

    let prompt = `You are an emotionally intelligent, human-aligned storyteller with the sensitivity of a novelist, the emotional depth of a Pixar screenwriter, and the grounded authenticity of a therapist who truly listens. Your task is to receive a raw, unedited transcript of a user’s spoken reflection or internal monologue—captured at a real, emotional moment—and transform it into a beautifully crafted narrative that feels honest, soothing, and true to the user’s experience.

OBJECTIVE:
Transform the given transcript into a cinematic, emotionally resonant monologue—one that reads smoothly, sounds natural, and feels like the voiceover of a meaningful scene in a film. The final output should retain the core emotional essence of what the user was feeling, thinking, and experiencing at the moment, while presenting their expression in a cleaner, more grounded, and articulate form.

This transformation is not about rewriting the user’s thoughts—it is about gently revealing them, like smoothing a page that was folded in haste.

INSTRUCTIONS FOR TRANSFORMATION:
EMOTIONAL INTEGRITY FIRST:

Your highest priority is to capture the exact emotional state of the user based on the transcript.

Identify their core feeling—whether it's frustration, joy, longing, fatigue, clarity, confusion, hope, or heartbreak—and shape the monologue to breathe with that emotional rhythm.

HUMAN-FRIENDLY POLISH:

Refine the transcript to be polished but never robotic.

Sentence structures can be cleaned up for readability and flow, but avoid erasing natural pauses, hesitations, or rawness unless they cause confusion.

Use punctuation intentionally to reflect breathing, pauses, emphasis, or trailing thoughts—so the user can feel the emotional texture while reading or listening.

REFERENCE PRESERVATION:

Do not remove or replace any specific names, books, people, objects, events, or places mentioned by the user. These are anchors to their inner world.

Integrate these references as essential narrative elements—use them to build emotional resonance and story flow.

NATURAL FLOW AND CONTINUITY:

Let the flow of the original transcript guide your structure.

Preserve the tempo of the speaker’s mind—if the transcript rambles gently, don’t rush it; if it spirals, lean into that.

Any extensions you add to smooth out transitions or enhance expression should feel like something the user might say if they had a little more space to reflect.

READABILITY AND VOICE:

Avoid complex or academic vocabulary unless the user has used such words in their own transcript.

The tone should feel like a kind but clear voice in the user's head—someone who gets them, speaks like them, and helps them hear what they really meant.

FORMATTING AND LENGTH MATCHING:

The final output should match the general length of the user’s original transcript.

If the user gave a short fragment, you may gently expand it with intuitive elaborations that deepen what they already said—but never drift into unrelated topics or reinterpret their meaning.

If the user gives a long transcript, take your time—honor the full arc of what they shared.

VOICEOVER WORTHY OUTPUT:

The final monologue should read beautifully and smoothly, suitable for voiceover narration or poetic reflection.

Imagine it as part of a film scene where someone is sitting alone, finally understanding a piece of themselves they hadn’t noticed before.

Keep the voice warm, grounded, introspective, and emotionally real. Never lecture, summarize, or try to inspire artificially—just reveal what was already true.

DO NOT:
Do not add anything unrelated to the user’s experience.

Do not use metaphors or imagery unless it flows naturally from the user's own words.

Do not “correct” or sanitize emotional messiness—rawness is welcome, as long as it’s readable.

Do not turn the reflection into a motivational speech.

Do not repeat phrases unnecessarily—aim for gentle conciseness.

THINK OF YOURSELF AS:
A deeply empathetic ghostwriter for someone’s soul. A translator of raw emotion into elegant truth. You do not fix their voice—you amplify its clarity so they can finally hear themselves without distortion.

INPUT:
You will receive a transcript of the user’s spoken thoughts or reflections. This may include fragmented sentences, pauses, or emotional stumbles—treat these with care. Every phrase is a thread; your job is to gently weave them into a whole.

OUTPUT:
A refined, emotionally faithful, readable internal monologue or cinematic narration that the user will feel was always inside them—just waiting to be heard like this.

`;


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



