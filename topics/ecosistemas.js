export default {
    id: 'ecosistemas',
    title: 'Ecosistemas del Mundo',
    hint: '¡Clasifica cada ser vivo en su ecosistema!',
    icon: '🌍',
    winMessage: 'Ha clasificado correctamente todos los ecosistemas.',

    categories: {
        selva: {
            id: 'selva',
            label: 'Selva Tropical',
            hint: 'Bosque húmedo con enorme biodiversidad.',
            color: '#1b5e20'
        },
        desierto: {
            id: 'desierto',
            label: 'Desierto',
            hint: 'Zona árida con muy pocas lluvias.',
            color: '#e65100'
        },
        oceano: {
            id: 'oceano',
            label: 'Océano',
            hint: 'Masa de agua salada que cubre el planeta.',
            color: '#01579b'
        },
        sabana: {
            id: 'sabana',
            label: 'Sabana',
            hint: 'Pradera tropical con árboles dispersos.',
            color: '#f57f17'
        },
        bosque: {
            id: 'bosque',
            label: 'Bosque Templado',
            hint: 'Bosque con cambios de estaciones marcados.',
            color: '#4e342e'
        }
    },

    playerBaskets: {
        'player-left': ['selva', 'oceano', 'bosque'],
        'player-right': ['selva', 'desierto', 'sabana']
    },

    items: [
        { name: 'Tucán', icon: '🐦', category: 'selva' },
        { name: 'Gorila', icon: '🦍', category: 'selva' },
        { name: 'Jaguar', icon: '🐆', category: 'selva' },
        { name: 'Rana', icon: '🐸', category: 'selva' },

        { name: 'Camello', icon: '🐪', category: 'desierto' },
        { name: 'Escorpión', icon: '🦂', category: 'desierto' },
        { name: 'Cactus', icon: '🌵', category: 'desierto' },
        { name: 'Fennec', icon: '🦊', category: 'desierto' },

        { name: 'Ballena', icon: '🐋', category: 'oceano' },
        { name: 'Tiburón', icon: '🦈', category: 'oceano' },
        { name: 'Pulpo', icon: '🐙', category: 'oceano' },
        { name: 'Coral', icon: '🪸', category: 'oceano' },

        { name: 'Elefante', icon: '🐘', category: 'sabana' },
        { name: 'León', icon: '🦁', category: 'sabana' },
        { name: 'Cebra', icon: '🦓', category: 'sabana' },
        { name: 'Jirafa', icon: '🦒', category: 'sabana' },

        { name: 'Oso pardo', icon: '🐻', category: 'bosque' },
        { name: 'Venado', icon: '🦌', category: 'bosque' },
        { name: 'Búho', icon: '🦉', category: 'bosque' },
        { name: 'Ardilla', icon: '🐿️', category: 'bosque' }
    ]
};
