import { TOPIC_REGISTRY } from './topic_registry.js';

export function initTopicSelect(overlayEl, gridEl, onTopicSelected) {
    TOPIC_REGISTRY.forEach((entry) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'topic-card';

        const icon = document.createElement('span');
        icon.className = 'topic-icon';
        icon.textContent = entry.icon;

        const title = document.createElement('strong');
        title.className = 'topic-title';
        title.textContent = entry.title;

        const desc = document.createElement('span');
        desc.className = 'topic-desc';
        desc.textContent = entry.description;

        btn.append(icon, title, desc);

        btn.addEventListener('click', () => {
            overlayEl.classList.remove('visible');
            onTopicSelected(entry);
        });

        gridEl.appendChild(btn);
    });
}
