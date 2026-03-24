export default {
    id: 'animales',
    title: 'Reino Animal',
    hint: '¡Clasifica cada animal en su grupo correcto!',
    icon: '🐾',
    winMessage: 'Ha clasificado correctamente todos los animales.',

    categories: {
        mamiferos: {
            id: 'mamiferos',
            label: 'Mamíferos',
            hint: 'Sangre caliente, pelo y amamantan a sus crías.',
            color: '#7b5ea7'
        },
        reptiles: {
            id: 'reptiles',
            label: 'Reptiles',
            hint: 'Sangre fría, escamas y piel seca.',
            color: '#2e7d32'
        },
        aves: {
            id: 'aves',
            label: 'Aves',
            hint: 'Plumas, pico y alas.',
            color: '#0277bd'
        },
        peces: {
            id: 'peces',
            label: 'Peces',
            hint: 'Acuáticos, con aletas y branquias.',
            color: '#00838f'
        },
        insectos: {
            id: 'insectos',
            label: 'Insectos',
            hint: 'Seis patas, tres segmentos y exoesqueleto.',
            color: '#f57f17'
        }
    },

    playerBaskets: {
        'player-left': ['mamiferos', 'reptiles', 'aves'],
        'player-right': ['mamiferos', 'peces', 'insectos']
    },

    items: [
        { name: 'Perro', icon: '🐕', category: 'mamiferos' },
        { name: 'Delfín', icon: '🐬', category: 'mamiferos' },
        { name: 'León', icon: '🦁', category: 'mamiferos' },
        { name: 'Murciélago', icon: '🦇', category: 'mamiferos' },

        { name: 'Cocodrilo', icon: '🐊', category: 'reptiles' },
        { name: 'Iguana', icon: '🦎', category: 'reptiles' },
        { name: 'Serpiente', icon: '🐍', category: 'reptiles' },
        { name: 'Tortuga', icon: '🐢', category: 'reptiles' },

        { name: 'Águila', icon: '🦅', category: 'aves' },
        { name: 'Pingüino', icon: '🐧', category: 'aves' },
        { name: 'Loro', icon: '🦜', category: 'aves' },
        { name: 'Flamenco', icon: '🦩', category: 'aves' },

        { name: 'Salmón', icon: '🐟', category: 'peces' },
        { name: 'Tiburón', icon: '🦈', category: 'peces' },
        { name: 'Pez payaso', icon: '🐠', category: 'peces' },
        { name: 'Pez globo', icon: '🐡', category: 'peces' },

        { name: 'Abeja', icon: '🐝', category: 'insectos' },
        { name: 'Mariposa', icon: '🦋', category: 'insectos' },
        { name: 'Hormiga', icon: '🐜', category: 'insectos' },
        { name: 'Escarabajo', icon: '🪲', category: 'insectos' }
    ]
};
