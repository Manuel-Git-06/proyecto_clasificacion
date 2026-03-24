export default {
    id: 'plantas',
    title: 'Propagación de Plantas',
    hint: '¡Clasifica las plantas en la cesta correcta!',
    icon: '🌱',
    winMessage: 'Ha clasificado correctamente todas sus plantas.',

    categories: {
        esquejes: {
            id: 'esquejes',
            label: 'Esquejes',
            hint: 'Tallos o ramas que enraizan al sembrarse.',
            color: '#d35400'
        },
        bulbos: {
            id: 'bulbos',
            label: 'Bulbos',
            hint: 'Estructuras subterráneas con capas de reserva.',
            color: '#b7950b'
        },
        tuberculos: {
            id: 'tuberculos',
            label: 'Tubérculos',
            hint: 'Tallos engrosados que almacenan nutrientes.',
            color: '#6d4c41'
        },
        rizomas: {
            id: 'rizomas',
            label: 'Rizomas',
            hint: 'Tallos horizontales que crecen bajo tierra.',
            color: '#16a085'
        },
        estolones: {
            id: 'estolones',
            label: 'Estolones',
            hint: 'Tallos rastreros que generan nuevas plantas.',
            color: '#558b2f'
        }
    },

    playerBaskets: {
        'player-left': ['esquejes', 'bulbos', 'tuberculos'],
        'player-right': ['esquejes', 'rizomas', 'estolones']
    },

    items: [
        { name: 'Geranio', icon: '🌿', category: 'esquejes' },
        { name: 'Rosa', icon: '🌹', category: 'esquejes' },
        { name: 'Yuca', icon: '🌱', category: 'esquejes' },
        { name: 'Caña de azúcar', icon: '🎋', category: 'esquejes' },

        { name: 'Cebolla', icon: '🧅', category: 'bulbos' },
        { name: 'Ajo', icon: '🧄', category: 'bulbos' },
        { name: 'Tulipán', icon: '🌷', category: 'bulbos' },
        { name: 'Lirio', icon: '🌺', category: 'bulbos' },

        { name: 'Papa', icon: '🥔', category: 'tuberculos' },
        { name: 'Ñame', icon: '🍠', category: 'tuberculos' },
        { name: 'Topinambur', icon: '🌰', category: 'tuberculos' },
        { name: 'Oca', icon: '🥕', category: 'tuberculos' },

        { name: 'Jengibre', icon: '🫚', category: 'rizomas' },
        { name: 'Cúrcuma', icon: '🟠', category: 'rizomas' },
        { name: 'Bambú', icon: '🎍', category: 'rizomas' },
        { name: 'Loto', icon: '🪷', category: 'rizomas' },

        { name: 'Fresa', icon: '🍓', category: 'estolones' },
        { name: 'Menta', icon: '🍃', category: 'estolones' },
        { name: 'Cinta', icon: '🪴', category: 'estolones' },
        { name: 'Gramilla', icon: '🌾', category: 'estolones' }
    ]
};
