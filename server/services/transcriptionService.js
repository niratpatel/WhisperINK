// server/services/transcriptionService.js
const axios = require('axios');
require('dotenv').config();

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const ASSEMBLYAI_API_URL = 'https://api.assemblyai.com/v2';

if (!ASSEMBLYAI_API_KEY) {
    console.warn("AssemblyAI API Key not found in .env. Transcription will fail.");
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Uploads audio buffer directly to AssemblyAI and then requests transcription.
 * @param {Buffer} audioBuffer - The raw audio data buffer from multer.
 * @returns {Promise<string>} - The transcribed text.
 * @throws {Error} - If upload or transcription fails.
 */
const transcribeAudioDirectUpload = async (audioBuffer) => {
    if (!ASSEMBLYAI_API_KEY) {
        throw new Error("AssemblyAI API Key is missing.");
    }
    if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error("Audio buffer is required for direct upload transcription.");
    }

    console.log(`Starting direct upload to AssemblyAI...`);

    try {
        // 1. Upload the raw audio data to AssemblyAI's /upload endpoint
        const uploadResponse = await axios.post(`${ASSEMBLYAI_API_URL}/upload`, audioBuffer, {
            headers: {
                'authorization': ASSEMBLYAI_API_KEY,
                // Content-Type might be inferred, or set explicitly if needed
                // 'Content-Type': 'application/octet-stream'
            },
             maxContentLength: Infinity, // Handle large file sizes
             maxBodyLength: Infinity
        });

        const uploadUrl = uploadResponse.data.upload_url;
        if (!uploadUrl) {
            throw new Error("AssemblyAI did not return an upload_url after upload.");
        }
        console.log(`Direct upload successful. AssemblyAI Temp URL: ${uploadUrl}`);

        // 2. Submit the AssemblyAI upload_url for transcription
        const submitResponse = await axios.post(`${ASSEMBLYAI_API_URL}/transcript`, {
            audio_url: uploadUrl, // Use the URL provided by AssemblyAI
        }, {
            headers: {
                'authorization': ASSEMBLYAI_API_KEY,
                'content-type': 'application/json',
            }
        });

        const transcriptId = submitResponse.data.id;
        console.log(`Transcription job submitted using AssemblyAI URL. ID: ${transcriptId}`);

        // 3. Poll for the transcription result
        const maxAttempts = 20; // Adjust timeout as needed (20 * 5s = 100s)
        const pollInterval = 5000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`Polling attempt ${attempt}/${maxAttempts} for transcript ID: ${transcriptId}`);
            await delay(pollInterval);

            const pollResponse = await axios.get(`${ASSEMBLYAI_API_URL}/transcript/${transcriptId}`, {
                headers: { 'authorization': ASSEMBLYAI_API_KEY }
            });

            const status = pollResponse.data.status;
            console.log(`Current status: ${status}`);

            if (status === 'completed') {
                console.log('Transcription completed successfully.');
                return pollResponse.data.text || ''; // Return text or empty string
            } else if (status === 'failed' || status === 'error') {
                console.error('Transcription failed:', pollResponse.data.error);
                throw new Error(`Transcription failed: ${pollResponse.data.error || 'Unknown reason'}`);
            }
            // Continue polling if 'queued' or 'processing'
        }

        console.error(`Transcription timed out after ${maxAttempts} attempts for ID: ${transcriptId}`);
        throw new Error('Transcription process timed out.');

    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Unknown transcription error';
        console.error('Error during direct upload transcription process:', errorMessage);
         if (error.response?.data?.error) {
            throw new Error(`AssemblyAI Error: ${error.response.data.error}`);
        }
        throw new Error(`Failed to transcribe audio via direct upload: ${errorMessage}`);
    }
};

// Export the direct upload function as the primary way to transcribe
module.exports = { transcribeAudio: transcribeAudioDirectUpload };