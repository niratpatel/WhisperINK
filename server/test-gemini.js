// server/test-gemini.js
// Quick test to verify Gemini API key works

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log("Testing Gemini API...");
    console.log("API Key (first 10 chars):", apiKey?.substring(0, 10) + "...");

    if (!apiKey) {
        console.error("ERROR: No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test with different models to find which one works
    const modelsToTest = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ];

    for (const modelName of modelsToTest) {
        console.log(`\n--- Testing model: ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello in 5 words.");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}: ${response.text()}`);
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}: ${error.message.substring(0, 100)}`);
        }
    }
}

testGemini();
