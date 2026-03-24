let activeTopic = null;

export async function loadTopic(moduleUrl) {
    const module = await import(moduleUrl);
    const topic = module.default;
    validateTopic(topic);
    activeTopic = topic;
    return topic;
}

export function getActiveTopic() {
    if (!activeTopic) {
        throw new Error('No hay ningún tema cargado. Llama a loadTopic() primero.');
    }
    return activeTopic;
}

export function computeAllActiveCategories(topic) {
    const all = new Set();
    Object.values(topic.playerBaskets).forEach((cats) => cats.forEach((c) => all.add(c)));
    return Array.from(all);
}

function validateTopic(topic) {
    const required = ['id', 'title', 'hint', 'icon', 'winMessage', 'categories', 'playerBaskets', 'items'];
    for (const field of required) {
        if (!topic[field]) {
            throw new Error(`El tema no tiene el campo requerido: "${field}"`);
        }
    }

    for (const item of topic.items) {
        if (!topic.categories[item.category]) {
            throw new Error(`El ítem "${item.name}" tiene categoría desconocida: "${item.category}"`);
        }
    }

    for (const [playerId, cats] of Object.entries(topic.playerBaskets)) {
        for (const cat of cats) {
            if (!topic.categories[cat]) {
                throw new Error(`La cesta de "${playerId}" referencia una categoría desconocida: "${cat}"`);
            }
        }
    }
}
