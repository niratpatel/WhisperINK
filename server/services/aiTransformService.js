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
        model: "gemini-2.0-flash-lite", // Or "gemini-pro"
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

module.exports = { transformToCinematic };
