import { APP_CONFIG } from './app_config.js';

let libraryPromise = null;

export async function ensureHandTrackingLibrary() {
    if (window.Hands) {
        return;
    }

    if (!libraryPromise) {
        libraryPromise = loadScript(APP_CONFIG.handScriptUrl, 8000).then(() => {
            if (!window.Hands) {
                throw new Error('La libreria de seguimiento de manos no se pudo inicializar.');
            }
        });
    }

    return libraryPromise;
}

export class HandTracker {
    constructor({ videoElement, maxHands }) {
        this.videoElement = videoElement;
        this.maxHands = maxHands;
        this.hands = null;
        this.stream = null;
        this.isRunning = false;
        this.frameRequestId = null;
        this.onProcessingError = null;
    }

    async start(onResults, onProcessingError = null, deviceId = null) {
        await ensureHandTrackingLibrary();
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Este navegador no permite acceder a la camara desde la pagina.');
        }

        this.onProcessingError = onProcessingError;

        const videoConstraints = deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } };

        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: videoConstraints
        });

        this.videoElement.srcObject = this.stream;
        await this.videoElement.play();

        this.hands = new window.Hands({
            locateFile: (file) => `${APP_CONFIG.handAssetBaseUrl}${file}`
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.45,
            minTrackingConfidence: 0.40
        });

        this.hands.onResults(onResults);
        this.isRunning = true;
        this.processFrameLoop();
    }

    stop() {
        this.isRunning = false;
        if (this.frameRequestId) {
            cancelAnimationFrame(this.frameRequestId);
            this.frameRequestId = null;
        }

        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }

        this.videoElement.pause();
        this.videoElement.srcObject = null;
        this.hands = null;
    }

    processFrameLoop() {
        if (!this.isRunning || !this.hands) {
            return;
        }

        this.frameRequestId = requestAnimationFrame(async () => {
            try {
                if (this.videoElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    await this.hands.send({ image: this.videoElement });
                }
            } catch (error) {
                console.error(error);
                if (typeof this.onProcessingError === 'function') {
                    this.onProcessingError(error);
                }

                const message = String(error?.message || '');
                if (message.includes('Aborted') || message.includes('CompileError') || message.includes('CSP')) {
                    this.isRunning = false;
                    return;
                }
            } finally {
                if (this.isRunning) {
                    this.processFrameLoop();
                }
            }
        });
    }
}

function loadScript(url, timeoutMs) {
    validateAllowedScriptUrl(url);

    return new Promise((resolve, reject) => {
        if (window.Hands) {
            resolve();
            return;
        }

        const existing = document.querySelector(`script[data-external-script="${url}"]`);
        if (existing?.dataset.loaded === 'true') {
            resolve();
            return;
        }

        const timeoutId = window.setTimeout(() => {
            reject(new Error('No se pudo descargar la libreria de manos a tiempo.'));
        }, timeoutMs);

        const script = existing || document.createElement('script');

        const onLoad = () => {
            clearTimeout(timeoutId);
            script.dataset.loaded = 'true';
            resolve();
        };

        const onError = () => {
            clearTimeout(timeoutId);
            reject(new Error('Fallo la carga de la libreria de manos desde la red.'));
        };

        script.addEventListener('load', onLoad, { once: true });
        script.addEventListener('error', onError, { once: true });

        if (!existing) {
            script.src = url;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.dataset.externalScript = url;
            document.head.appendChild(script);
        }
    });
}

function validateAllowedScriptUrl(url) {
    const parsed = new URL(url);
    if (parsed.origin !== 'https://cdn.jsdelivr.net') {
        throw new Error('Se intento cargar un script desde un origen no permitido.');
    }
}
