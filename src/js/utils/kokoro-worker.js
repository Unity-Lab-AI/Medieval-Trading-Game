// ═══════════════════════════════════════════════════════════════
// KOKORO TTS WEB WORKER - Runs neural TTS off the main thread
// ═══════════════════════════════════════════════════════════════
// This worker handles the heavy WASM/ONNX computation so the game
// stays responsive while generating speech.
// ═══════════════════════════════════════════════════════════════

let tts = null;
let isInitialized = false;
let isInitializing = false;

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

// Handle messages from main thread
self.onmessage = async function(e) {
    const { type, id, data } = e.data;

    switch (type) {
        case 'init':
            await handleInit(id, data);
            break;
        case 'generate':
            await handleGenerate(id, data);
            break;
        case 'checkStatus':
            self.postMessage({
                type: 'status',
                id,
                data: { initialized: isInitialized, initializing: isInitializing }
            });
            break;
        default:
            self.postMessage({
                type: 'error',
                id,
                error: `Unknown message type: ${type}`
            });
    }
};

async function handleInit(id, data) {
    if (isInitialized) {
        self.postMessage({ type: 'initComplete', id, data: { success: true, cached: true } });
        return;
    }

    if (isInitializing) {
        self.postMessage({ type: 'error', id, error: 'Already initializing' });
        return;
    }

    isInitializing = true;

    try {
        // Import kokoro-js
        self.postMessage({ type: 'progress', id, data: { message: 'Loading Kokoro library...', progress: 0.1 } });

        const module = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/+esm');
        const KokoroTTS = module.KokoroTTS;

        // Load model
        self.postMessage({ type: 'progress', id, data: { message: 'Loading Kokoro model...', progress: 0.2 } });

        tts = await KokoroTTS.from_pretrained(MODEL_ID, {
            dtype: 'q8',
            device: 'wasm',
            progress_callback: (progress) => {
                if (progress.status === 'progress') {
                    const pct = progress.progress || 0;
                    self.postMessage({
                        type: 'progress',
                        id,
                        data: { message: `Loading model... ${Math.round(pct)}%`, progress: 0.2 + (pct / 100) * 0.7 }
                    });
                }
            }
        });

        isInitialized = true;
        isInitializing = false;

        self.postMessage({ type: 'initComplete', id, data: { success: true } });

    } catch (error) {
        isInitializing = false;
        self.postMessage({ type: 'error', id, error: error.message });
    }
}

async function handleGenerate(id, data) {
    if (!isInitialized || !tts) {
        self.postMessage({ type: 'error', id, error: 'TTS not initialized' });
        return;
    }

    const { text, voice, speed } = data;

    try {
        self.postMessage({ type: 'generating', id });

        const audio = await tts.generate(text, {
            voice: voice || 'am_michael',
            speed: speed || 1.0
        });

        // Transfer the audio data back to main thread
        if (audio && audio.audio) {
            // Convert Float32Array to transferable ArrayBuffer
            const audioBuffer = audio.audio.buffer.slice(0);

            self.postMessage(
                {
                    type: 'audioReady',
                    id,
                    data: {
                        audio: audioBuffer,
                        sampleRate: audio.sampling_rate
                    }
                },
                [audioBuffer] // Transfer ownership for performance
            );
        } else {
            self.postMessage({ type: 'error', id, error: 'No audio generated' });
        }

    } catch (error) {
        self.postMessage({ type: 'error', id, error: error.message });
    }
}
