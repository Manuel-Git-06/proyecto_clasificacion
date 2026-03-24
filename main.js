import { getActiveTopic, loadTopic, computeAllActiveCategories } from './topic_loader.js';
import { initTopicSelect } from './topic_select.js';
import { APP_CONFIG, HAND_COLORS, HAND_CONNECTIONS, PLAYER_IDS } from './app_config.js';
import { PlantItemEntity, resolveCollisions } from './entities.js';
import { HandTracker } from './hand_tracker.js';
import {
    addItemToBasketVisual,
    buildPlayerBaskets,
    flashZone,
    getDomRefs,
    hideWinner,
    setOverlay,
    setTopicHeader,
    showToast,
    showWinner,
    updateBasketCounter,
    updateLaneHighlights,
    updatePlayerScore
} from './ui.js';

const domRefs = getDomRefs();
const tracker = new HandTracker({
    videoElement: domRefs.videoElement,
    maxHands: APP_CONFIG.maxHands
});

const state = {
    players: {
        'player-left': {},
        'player-right': {}
    },
    zones: {},
    items: [],
    effects: [],
    activeHands: {},
    animationFrameId: 0,
    isRunning: false,
    isStarting: false,
    isGameOver: false,
    firstResultsReceived: false,
    startupTimeoutId: 0,
    lastFrameTime: 0,
    selectedDeviceId: null
};

async function initTopicFlow() {
    const topicOverlay = document.getElementById('topic_select_overlay');
    const topicGrid = document.getElementById('topic_grid');

    const selectedEntry = await new Promise((resolve) => {
        initTopicSelect(topicOverlay, topicGrid, resolve);
    });

    try {
        await loadTopic(selectedEntry.moduleUrl);
    } catch (err) {
        alert(`Error al cargar el tema: ${err.message}`);
        location.reload();
        return;
    }

    initializeApp();
}

function initializeApp() {
    setTopicHeader(domRefs, getActiveTopic());
    resizeCanvases();

    domRefs.retryButton.addEventListener('click', () => {
        void restartApp();
    });
    domRefs.startButton.addEventListener('click', () => {
        state.selectedDeviceId = domRefs.cameraSelect.value || null;
        void startTracking();
    });
    domRefs.replayButton.addEventListener('click', () => {
        hideWinner(domRefs);
        resetGameState();
    });
    domRefs.changeTopicButton.addEventListener('click', () => {
        location.reload();
    });

    window.addEventListener('resize', resizeCanvases);
    resetGameState();
    startGameLoop();
    void enumerateCameras();
}

function resetGameState() {
    clearStartupTimeout();
    state.isGameOver = false;

    const topic = getActiveTopic();

    PLAYER_IDS.forEach((playerId) => {
        const baskets = topic.playerBaskets[playerId];
        const scores = {};
        baskets.forEach((cat) => { scores[cat] = 0; });
        state.players[playerId] = { scores, totalCorrect: 0 };
    });

    state.zones = buildPlayerBaskets(domRefs, topic);
    state.items = [];
    state.effects = [];
    state.activeHands = {};

    PLAYER_IDS.forEach((playerId) => {
        const totalNeeded = topic.playerBaskets[playerId].length * APP_CONFIG.winTarget;
        updatePlayerScore(domRefs, playerId, 0, totalNeeded);
    });

    for (let i = 0; i < APP_CONFIG.initialSpawnCount; i++) {
        spawnItem(true);
    }
}

async function enumerateCameras() {
    setOverlay(domRefs, {
        visible: true,
        title: 'Preparando actividad',
        message: 'Solicitando acceso a la cámara...',
        showLoader: true,
        canRetry: false
    });

    try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        tempStream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === 'videoinput');

        if (cameras.length === 0) {
            setOverlay(domRefs, {
                visible: true,
                title: 'Sin cámara',
                message: 'No se encontraron cámaras en este dispositivo.',
                showLoader: false,
                canRetry: true
            });
            return;
        }

        domRefs.cameraSelect.replaceChildren();
        cameras.forEach((camera, index) => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.textContent = camera.label || `Cámara ${index + 1}`;
            domRefs.cameraSelect.appendChild(option);
        });

        if (cameras.length === 1) {
            state.selectedDeviceId = cameras[0].deviceId;
            void startTracking();
        } else {
            setOverlay(domRefs, {
                visible: true,
                title: 'Selecciona la cámara',
                message: 'Se encontraron varias cámaras. Elige cuál usar para la actividad.',
                showLoader: false,
                canRetry: false,
                showCameraSelector: true,
                canStart: true
            });
        }
    } catch (error) {
        presentStartupError(error);
    }
}

async function restartApp() {
    tracker.stop();
    state.isStarting = false;
    state.firstResultsReceived = false;
    hideWinner(domRefs);
    resetGameState();
    void enumerateCameras();
}

async function startTracking() {
    if (state.isStarting) {
        return;
    }

    state.isStarting = true;
    setOverlay(domRefs, {
        visible: true,
        title: 'Iniciando cámara',
        message: 'Conectando con la cámara seleccionada...',
        showLoader: true,
        canRetry: false
    });

    try {
        await tracker.start(handleTrackingResults, handleTrackingError, state.selectedDeviceId);
        state.isStarting = false;
        setOverlay(domRefs, {
            visible: true,
            title: 'Cámara lista',
            message: 'Iniciando seguimiento de manos...',
            showLoader: true,
            canRetry: false
        });
        armStartupTimeout();
    } catch (error) {
        state.isStarting = false;
        presentStartupError(error);
    }
}

function armStartupTimeout() {
    clearStartupTimeout();
    state.startupTimeoutId = window.setTimeout(() => {
        if (state.firstResultsReceived) {
            return;
        }
        presentStartupError(new Error('La cámara encendió, pero el detector de manos no respondió.'));
    }, APP_CONFIG.startupTimeoutMs);
}

function handleTrackingError(error) {
    if (!state.firstResultsReceived) {
        presentStartupError(error);
    }
}

function clearStartupTimeout() {
    if (state.startupTimeoutId) {
        clearTimeout(state.startupTimeoutId);
        state.startupTimeoutId = 0;
    }
}

function presentStartupError(error) {
    tracker.stop();
    clearStartupTimeout();
    setOverlay(domRefs, {
        visible: true,
        title: 'No se pudo iniciar',
        message: toUserMessage(error),
        showLoader: false,
        canRetry: true
    });
}

function spawnItem(force = false) {
    if (!force && state.items.length >= APP_CONFIG.maxItems) {
        return;
    }

    const topic = getActiveTopic();
    const allActiveCategories = computeAllActiveCategories(topic);
    const validItems = topic.items.filter((item) => allActiveCategories.includes(item.category));

    if (validItems.length === 0) {
        return;
    }

    const padding = 80;
    const x = randomBetween(padding, Math.max(padding, domRefs.gameCanvas.width - padding));
    const y = randomBetween(-180, -80);
    const data = validItems[Math.floor(Math.random() * validItems.length)];
    const item = new PlantItemEntity(x, y, data);

    state.items.push(item);
}

function handleTrackingResults(results) {
    if (!state.firstResultsReceived) {
        state.firstResultsReceived = true;
        clearStartupTimeout();
        setOverlay(domRefs, {
            visible: false,
            title: '',
            message: '',
            showLoader: false,
            canRetry: false
        });
    }

    clearHandCanvas();
    updateHandsState(results);
}

function updateHandsState(results) {
    const incomingHands = {
        'player-left': null,
        'player-right': null
    };

    const landmarksList = results.multiHandLandmarks || [];

    // Build candidate list
    const candidates = landmarksList.slice(0, 2).map((landmarks) => {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const pinchDistance = distance2D(thumbTip, indexTip);
        const pinchX = (thumbTip.x + indexTip.x) * 0.5;
        const pinchY = (thumbTip.y + indexTip.y) * 0.5;
        return {
            landmarks,
            pinchDistance,
            rawX: (1 - pinchX) * domRefs.gameCanvas.width,
            rawY: pinchY * domRefs.gameCanvas.height
        };
    });

    // Match each candidate to the nearest known player using spatial continuity.
    // Falls back to index order when no prior position exists.
    const taken = new Set();
    PLAYER_IDS.forEach((playerId) => {
        const prev = state.activeHands[playerId];
        if (!prev || candidates.length === 0) return;

        let bestIndex = -1;
        let bestDist = Infinity;
        candidates.forEach((c, i) => {
            if (taken.has(i)) return;
            const d = Math.hypot(c.rawX - prev.x, c.rawY - prev.y);
            if (d < bestDist) { bestDist = d; bestIndex = i; }
        });

        if (bestIndex >= 0) {
            incomingHands[playerId] = candidates[bestIndex];
            taken.add(bestIndex);
        }
    });

    // Assign any remaining unmatched candidates to empty slots (new hands)
    candidates.forEach((c, i) => {
        if (taken.has(i)) return;
        const emptySlot = PLAYER_IDS.find((id) => !incomingHands[id]);
        if (emptySlot) incomingHands[emptySlot] = c;
    });

    const updatedHands = {};

    PLAYER_IDS.forEach((playerId) => {
        const candidate = incomingHands[playerId];
        const previous = state.activeHands[playerId];

        if (!candidate) {
            if (previous?.heldItemId) {
                releaseByHand(playerId);
            }
            return;
        }

        const x = previous ? lerp(previous.x, candidate.rawX, APP_CONFIG.handSmoothing) : candidate.rawX;
        const y = previous ? lerp(previous.y, candidate.rawY, APP_CONFIG.handSmoothing) : candidate.rawY;
        const vx = previous ? x - previous.x : 0;
        const vy = previous ? y - previous.y : 0;
        const wasPinching = previous?.pinching ?? false;
        const pinching = wasPinching
            ? candidate.pinchDistance < APP_CONFIG.pinchReleaseDistance
            : candidate.pinchDistance < APP_CONFIG.pinchStartDistance;

        updatedHands[playerId] = {
            id: playerId,
            x,
            y,
            vx,
            vy,
            rawX: candidate.rawX,
            rawY: candidate.rawY,
            landmarks: candidate.landmarks,
            pinchDistance: candidate.pinchDistance,
            pinching,
            wasPinching,
            heldItemId: previous?.heldItemId ?? null
        };
    });

    PLAYER_IDS.forEach((playerId) => {
        const hand = updatedHands[playerId];
        if (!hand) {
            return;
        }

        drawHand(hand);

        if (state.isGameOver) {
            return;
        }

        if (hand.pinching) {
            tryGrab(hand);
        } else if (hand.wasPinching) {
            releaseByHand(playerId);
        }
    });

    state.activeHands = updatedHands;
    updateLaneHighlights(domRefs, updatedHands);
}

function drawHand(hand) {
    const color = HAND_COLORS[hand.id];
    const handCtx = domRefs.handCtx;

    handCtx.strokeStyle = color;
    handCtx.lineWidth = 1.5;
    HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
        const start = hand.landmarks[startIndex];
        const end = hand.landmarks[endIndex];
        handCtx.beginPath();
        handCtx.moveTo((1 - start.x) * domRefs.handCanvas.width, start.y * domRefs.handCanvas.height);
        handCtx.lineTo((1 - end.x) * domRefs.handCanvas.width, end.y * domRefs.handCanvas.height);
        handCtx.stroke();
    });

    hand.landmarks.forEach((landmark) => {
        handCtx.beginPath();
        handCtx.arc((1 - landmark.x) * domRefs.handCanvas.width, landmark.y * domRefs.handCanvas.height, 3, 0, Math.PI * 2);
        handCtx.fillStyle = '#fff8e8';
        handCtx.fill();
    });

    // Pinch indicator at exact pinch point
    handCtx.beginPath();
    handCtx.arc(hand.x, hand.y, hand.pinching ? 16 : 10, 0, Math.PI * 2);
    handCtx.fillStyle = `${color}${hand.pinching ? '66' : '22'}`;
    handCtx.strokeStyle = color;
    handCtx.lineWidth = hand.pinching ? 2 : 1;
    handCtx.fill();
    handCtx.stroke();
}

function tryGrab(hand) {
    const currentlyHeld = state.items.find((item) => item.grabbedById === hand.id);
    if (currentlyHeld) {
        hand.heldItemId = currentlyHeld.id;
        return;
    }

    let closestItem = null;
    let closestDistance = APP_CONFIG.grabDistancePx;

    state.items.forEach((item) => {
        if (item.isGrabbed || item.isProtectedFromGrab) {
            return;
        }

        const d = Math.hypot(item.x - hand.x, item.y - hand.y);
        if (d < closestDistance) {
            closestDistance = d;
            closestItem = item;
        }
    });

    if (!closestItem) {
        return;
    }

    closestItem.isGrabbed = true;
    closestItem.grabbedById = hand.id;
    closestItem.vx = 0;
    closestItem.vy = 0;
    closestItem.rotationVelocity = 0;
    hand.heldItemId = closestItem.id;
}

function releaseByHand(handId) {
    const hand = state.activeHands[handId];
    const item = state.items.find((entry) => entry.grabbedById === handId);
    if (!item) {
        return;
    }

    const zone = getZoneAt(item.x, item.y);
    const topic = getActiveTopic();

    if (zone && zone.id === item.data.category) {
        // Correct classification
        const playerData = state.players[zone.playerId];
        if (playerData.scores[zone.id] < APP_CONFIG.winTarget) {
            playerData.scores[zone.id] += 1;
            playerData.totalCorrect += 1;

            updateBasketCounter(zone, playerData.scores[zone.id]);
            addItemToBasketVisual(zone, item.data);

            const totalNeeded = topic.playerBaskets[zone.playerId].length * APP_CONFIG.winTarget;
            updatePlayerScore(domRefs, zone.playerId, playerData.totalCorrect, totalNeeded);

            flashZone(zone.element, false);
            createEffect(item.x, item.y, '#c8e6b0', `+1 ${item.data.name}`);

            state.items = state.items.filter((entry) => entry.id !== item.id);

            // Spawn more cards
            for (let i = 0; i < APP_CONFIG.spawnPerCorrect; i++) {
                spawnItem(true);
            }

            // Check win condition
            if (playerData.totalCorrect >= totalNeeded) {
                state.isGameOver = true;
                showWinner(domRefs, zone.playerId, topic);
            }
        }
    } else if (zone) {
        // Wrong basket
        flashZone(zone.element, true);
        createEffect(item.x, item.y, '#f5bfbf', `¡No va aquí!`);

        const launchX = (hand?.vx ?? 0) * APP_CONFIG.launchVelocityScale;
        const launchY = (hand?.vy ?? 0) * APP_CONFIG.launchVelocityScale;
        item.release(launchX, launchY);
    } else {
        // Released in free space
        const launchX = (hand?.vx ?? 0) * APP_CONFIG.launchVelocityScale;
        const launchY = (hand?.vy ?? 0) * APP_CONFIG.launchVelocityScale;
        item.release(launchX, launchY);
    }

    if (hand) {
        hand.heldItemId = null;
    }
}

function getZoneAt(x, y) {
    const margin = 30;
    for (const playerId of PLAYER_IDS) {
        const playerZones = state.zones[playerId];
        if (!playerZones) {
            continue;
        }

        for (const zone of playerZones) {
            const rect = zone.element.getBoundingClientRect();
            if (x >= rect.left - margin && x <= rect.right + margin && y >= rect.top - margin && y <= rect.bottom + margin) {
                return { ...zone, playerId };
            }
        }
    }
    return null;
}

function createEffect(x, y, color, text) {
    state.effects.push({ x, y, color, text, alpha: 1 });
}

function updateEffects(deltaSeconds) {
    state.effects = state.effects.filter((e) => e.alpha > 0.03);
    state.effects.forEach((e) => {
        e.y -= 54 * deltaSeconds;
        e.alpha *= Math.pow(0.96, deltaSeconds * 60);
    });
}

function renderEffects() {
    state.effects.forEach((e) => {
        domRefs.gameCtx.save();
        domRefs.gameCtx.globalAlpha = e.alpha;
        domRefs.gameCtx.fillStyle = e.color;
        domRefs.gameCtx.font = '700 16px system-ui, -apple-system, sans-serif';
        domRefs.gameCtx.textAlign = 'center';
        domRefs.gameCtx.fillText(e.text, e.x, e.y);
        domRefs.gameCtx.restore();
    });
}

function startGameLoop() {
    if (state.isRunning) {
        return;
    }

    state.isRunning = true;
    state.lastFrameTime = performance.now();

    const frame = (timestamp) => {
        const deltaMs = Math.min(32, timestamp - state.lastFrameTime || 16.67);
        state.lastFrameTime = timestamp;
        step(deltaMs);
        render();
        state.animationFrameId = requestAnimationFrame(frame);
    };

    state.animationFrameId = requestAnimationFrame(frame);
}

function step(deltaMs) {
    const deltaSeconds = deltaMs / 1000;
    const playBounds = {
        width: domRefs.gameCanvas.width,
        height: domRefs.gameCanvas.height,
        floorY: domRefs.gameCanvas.height - APP_CONFIG.basketHeight - 12
    };

    state.items.forEach((item) => {
        if (item.isGrabbed && item.grabbedById) {
            const hand = state.activeHands[item.grabbedById];
            if (!hand || !hand.pinching) {
                releaseByHand(item.grabbedById);
                return;
            }

            const targetX = hand.x;
            const targetY = hand.y - 20;
            item.x += (targetX - item.x) * APP_CONFIG.dragSmoothing;
            item.y += (targetY - item.y) * APP_CONFIG.dragSmoothing;
            item.rotation *= 0.85;
            item.targetScale = 1.06;
            return;
        }

        item.update(playBounds, deltaSeconds);
    });

    resolveCollisions(state.items, APP_CONFIG.collisionRestitution);
    updateEffects(deltaSeconds);
}

function render() {
    clearGameCanvas();
    drawPlayfield();
    state.items.forEach((item) => item.draw(domRefs.gameCtx));
    renderEffects();
}

function drawPlayfield() {
    const basketTop = domRefs.gameCanvas.height - APP_CONFIG.basketHeight;
    const gameCtx = domRefs.gameCtx;

    // Divider line
    gameCtx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    gameCtx.fillRect(domRefs.gameCanvas.width / 2 - 1, 80, 2, basketTop - 100);

    // Floor area
    gameCtx.fillStyle = 'rgba(60, 40, 20, 0.18)';
    gameCtx.fillRect(0, basketTop, domRefs.gameCanvas.width, APP_CONFIG.basketHeight);
}

function resizeCanvases() {
    if (domRefs.handCanvas.width === window.innerWidth && domRefs.handCanvas.height === window.innerHeight) {
        return;
    }

    domRefs.handCanvas.width = window.innerWidth;
    domRefs.handCanvas.height = window.innerHeight;
    domRefs.gameCanvas.width = window.innerWidth;
    domRefs.gameCanvas.height = window.innerHeight;
}

function clearHandCanvas() {
    domRefs.handCtx.clearRect(0, 0, domRefs.handCanvas.width, domRefs.handCanvas.height);
}

function clearGameCanvas() {
    domRefs.gameCtx.clearRect(0, 0, domRefs.gameCanvas.width, domRefs.gameCanvas.height);
}

function toUserMessage(error) {
    const message = String(error?.message || error || '').trim();
    if (!message) {
        return 'No se pudo iniciar la actividad. Revisa el permiso de cámara y vuelve a intentarlo.';
    }
    if (message.includes('Wasm') || message.includes('wasm') || message.includes('CSP')) {
        return 'El navegador bloqueó el motor interno del detector de manos. Recarga la página.';
    }
    if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
        return 'El navegador no concedió acceso a la cámara. Permite el uso y pulsa Reintentar.';
    }
    if (message.includes('NotFoundError')) {
        return 'No se encontró una cámara disponible en este dispositivo.';
    }
    if (message.includes('NotReadableError')) {
        return 'La cámara está siendo usada por otra aplicación. Ciérrala y vuelve a intentarlo.';
    }
    return message;
}

function distance2D(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

window.addEventListener('load', initTopicFlow);
