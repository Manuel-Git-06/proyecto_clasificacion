export default {
    id: 'cuerpo_humano',
    title: 'Sistemas del Cuerpo Humano',
    hint: '¡Clasifica cada órgano en su sistema!',
    icon: '🧬',
    winMessage: 'Ha clasificado correctamente todos los sistemas del cuerpo.',

    categories: {
        digestivo: {
            id: 'digestivo',
            label: 'Digestivo',
            hint: 'Procesa alimentos y absorbe nutrientes.',
            color: '#795548'
        },
        circulatorio: {
            id: 'circulatorio',
            label: 'Circulatorio',
            hint: 'Transporta sangre y nutrientes por el cuerpo.',
            color: '#c62828'
        },
        respiratorio: {
            id: 'respiratorio',
            label: 'Respiratorio',
            hint: 'Introduce oxígeno y expulsa dióxido de carbono.',
            color: '#1565c0'
        },
        oseo: {
            id: 'oseo',
            label: 'Óseo',
            hint: 'Estructura de huesos que sostiene el cuerpo.',
            color: '#78909c'
        },
        nervioso: {
            id: 'nervioso',
            label: 'Nervioso',
            hint: 'Controla y coordina todas las funciones del cuerpo.',
            color: '#6a1b9a'
        }
    },

    playerBaskets: {
        'player-left': ['digestivo', 'circulatorio', 'respiratorio'],
        'player-right': ['digestivo', 'oseo', 'nervioso']
    },

    items: [
        { name: 'Boca', icon: '👄', category: 'digestivo' },
        { name: 'Estómago', icon: '🫙', category: 'digestivo' },
        { name: 'Hígado', icon: '🟤', category: 'digestivo' },
        { name: 'Intestino', icon: '🌀', category: 'digestivo' },

        { name: 'Corazón', icon: '🫀', category: 'circulatorio' },
        { name: 'Arteria', icon: '🔴', category: 'circulatorio' },
        { name: 'Vena', icon: '💙', category: 'circulatorio' },
        { name: 'Glóbulo rojo', icon: '🩸', category: 'circulatorio' },

        { name: 'Pulmones', icon: '🫁', category: 'respiratorio' },
        { name: 'Tráquea', icon: '🔘', category: 'respiratorio' },
        { name: 'Fosas nasales', icon: '👃', category: 'respiratorio' },
        { name: 'Diafragma', icon: '🔵', category: 'respiratorio' },

        { name: 'Cráneo', icon: '💀', category: 'oseo' },
        { name: 'Costillas', icon: '🦴', category: 'oseo' },
        { name: 'Fémur', icon: '🦵', category: 'oseo' },
        { name: 'Columna', icon: '🔗', category: 'oseo' },

        { name: 'Cerebro', icon: '🧠', category: 'nervioso' },
        { name: 'Médula espinal', icon: '⚡', category: 'nervioso' },
        { name: 'Neurona', icon: '🔆', category: 'nervioso' },
        { name: 'Nervio óptico', icon: '👁️', category: 'nervioso' }
    ]
};
