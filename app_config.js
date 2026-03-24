export const APP_CONFIG = Object.freeze({
    basketHeight: 180,
    initialSpawnCount: 3,
    maxHands: 2,
    pinchStartDistance: 0.065,
    pinchReleaseDistance: 0.10,
    grabDistancePx: 60,
    handSmoothing: 0.42,
    dragSmoothing: 0.38,
    launchVelocityScale: 8,
    maxItems: 10,
    spawnPerCorrect: 2,
    winTarget: 3,
    collisionRestitution: 0.45,
    startupTimeoutMs: 9000,
    handScriptUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    handAssetBaseUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'
});

export const PLAYER_IDS = Object.freeze(['player-left', 'player-right']);

export const HAND_COLORS = Object.freeze({
    'player-left': '#edc35a',
    'player-right': '#aed581'
});

export const HAND_CONNECTIONS = Object.freeze([
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
]);
