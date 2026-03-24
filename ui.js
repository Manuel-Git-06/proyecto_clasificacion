import { APP_CONFIG } from './app_config.js';

export function getDomRefs() {
    return {
        app: document.getElementById('app'),
        videoElement: document.getElementById('input_video'),
        handCanvas: document.getElementById('hand_canvas'),
        handCtx: document.getElementById('hand_canvas').getContext('2d'),
        gameCanvas: document.getElementById('game_canvas'),
        gameCtx: document.getElementById('game_canvas').getContext('2d'),
        scoreLeft: document.getElementById('score_left'),
        scoreRight: document.getElementById('score_right'),
        stageNameElement: document.getElementById('stage_name'),
        stageHintElement: document.getElementById('stage_hint'),
        playerLaneLeft: document.querySelector('.player-lane.left'),
        playerLaneRight: document.querySelector('.player-lane.right'),
        basketsLeft: document.getElementById('baskets_left'),
        basketsRight: document.getElementById('baskets_right'),
        statusOverlay: document.getElementById('status_overlay'),
        statusLoader: document.getElementById('status_loader'),
        statusTitle: document.getElementById('status_title'),
        statusMessage: document.getElementById('status_message'),
        cameraSelector: document.getElementById('camera_selector'),
        cameraSelect: document.getElementById('camera_select'),
        startButton: document.getElementById('start_button'),
        retryButton: document.getElementById('retry_button'),
        winnerOverlay: document.getElementById('winner_overlay'),
        winnerTitle: document.getElementById('winner_title'),
        winnerMessage: document.getElementById('winner_message'),
        replayButton: document.getElementById('replay_button'),
        changeTopicButton: document.getElementById('change_topic_button')
    };
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildPlayerBaskets(domRefs, topic) {
    const zones = {};

    ['player-left', 'player-right'].forEach((playerId) => {
        const container = playerId === 'player-left' ? domRefs.basketsLeft : domRefs.basketsRight;
        container.replaceChildren();
        const categories = topic.playerBaskets[playerId];
        zones[playerId] = [];

        categories.forEach((categoryId) => {
            const category = topic.categories[categoryId];
            const zone = document.createElement('div');
            const label = document.createElement('span');
            const counter = document.createElement('span');
            const basketInner = document.createElement('div');

            zone.className = 'basket';
            zone.dataset.category = category.id;
            zone.dataset.player = playerId;
            zone.style.background = `linear-gradient(180deg, ${hexToRgba(category.color, 0.08)} 0%, ${hexToRgba(category.color, 0.35)} 100%)`;
            zone.style.borderColor = hexToRgba(category.color, 0.35);

            label.className = 'basket-label';
            label.textContent = category.label;

            counter.className = 'basket-counter';
            counter.textContent = `0 / ${APP_CONFIG.winTarget}`;

            basketInner.className = 'basket-items';

            if (category.hint) {
                const hint = document.createElement('span');
                hint.className = 'basket-hint';
                hint.textContent = category.hint;
                zone.append(basketInner, label, hint, counter);
            } else {
                zone.append(basketInner, label, counter);
            }
            container.appendChild(zone);

            zones[playerId].push({ id: category.id, element: zone, counterEl: counter, innerEl: basketInner });
        });
    });

    return zones;
}

export function setTopicHeader(domRefs, topic) {
    domRefs.stageNameElement.textContent = topic.title;
    domRefs.stageHintElement.textContent = topic.hint;
}

export function updateBasketCounter(zone, count) {
    zone.counterEl.textContent = `${count} / ${APP_CONFIG.winTarget}`;
    zone.element.classList.toggle('basket-full', count >= APP_CONFIG.winTarget);
}

export function addItemToBasketVisual(zone, itemData) {
    const dot = document.createElement('span');
    dot.className = 'basket-dot';
    dot.textContent = itemData.icon;
    zone.innerEl.appendChild(dot);
}

export function setOverlay(domRefs, {
    visible,
    title,
    message,
    showLoader = true,
    canRetry = false,
    showCameraSelector = false,
    canStart = false
}) {
    domRefs.statusOverlay.classList.toggle('visible', visible);
    domRefs.statusTitle.textContent = title;
    domRefs.statusMessage.textContent = message;
    domRefs.statusLoader.classList.toggle('hidden', !showLoader);
    domRefs.cameraSelector.hidden = !showCameraSelector;
    domRefs.startButton.hidden = !canStart;
    domRefs.retryButton.hidden = !canRetry;
}

export function showWinner(domRefs, playerId, topic) {
    const name = playerId === 'player-left' ? 'Estudiante A' : 'Estudiante B';
    domRefs.winnerTitle.textContent = `¡${name} gana!`;
    domRefs.winnerMessage.textContent = topic.winMessage;
    domRefs.winnerOverlay.classList.add('visible');
}

export function hideWinner(domRefs) {
    domRefs.winnerOverlay.classList.remove('visible');
}

export function updateLaneHighlights(domRefs, activeHands) {
    domRefs.playerLaneLeft.classList.toggle('active', Boolean(activeHands['player-left']));
    domRefs.playerLaneRight.classList.toggle('active', Boolean(activeHands['player-right']));
}

export function updatePlayerScore(domRefs, playerId, totalCorrect, totalNeeded) {
    const el = playerId === 'player-left' ? domRefs.scoreLeft : domRefs.scoreRight;
    el.textContent = `${totalCorrect} / ${totalNeeded}`;
}

export function flashZone(zoneElement, isError = false) {
    zoneElement.classList.add('zone-flash');
    if (isError) {
        zoneElement.classList.add('zone-error');
    }

    window.setTimeout(() => {
        zoneElement.classList.remove('zone-flash');
        zoneElement.classList.remove('zone-error');
    }, 300);
}

export function flashZoneCorrect(zoneElement) {
    zoneElement.classList.add('zone-flash', 'zone-correct');
    window.setTimeout(() => {
        zoneElement.classList.remove('zone-flash', 'zone-correct');
    }, 600);
}

export function showToast(domRefs, title, message, isError = false) {
    let layer = domRefs.app.querySelector('.toast-layer');
    if (!layer) {
        layer = document.createElement('div');
        layer.className = 'toast-layer';
        domRefs.app.appendChild(layer);
    }

    const toast = document.createElement('div');
    const heading = document.createElement('h2');
    const body = document.createElement('p');

    toast.className = `toast${isError ? ' error' : ''}`;
    heading.textContent = title;
    body.textContent = message;
    toast.append(heading, body);
    layer.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add('fade-out');
        window.setTimeout(() => toast.remove(), 650);
    }, 2200);
}
