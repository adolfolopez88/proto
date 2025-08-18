import { GenericCardData } from '../components/generic-card/generic-card.component';

export const MOCK_POSTCARDS: GenericCardData[] = [
    {
        id: 1,
        title: 'Santorini Sunset',
        subtitle: 'Greece',
        description: 'Breathtaking sunset view over the Aegean Sea with iconic white buildings and blue domes.',
        image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
        badge: {
            text: 'Popular',
            type: 'success'
        },
        meta: {
            author: 'Maria Kostas',
            date: new Date('2024-01-15'),
            rating: 4.9
        },
        tags: ['Sunset', 'Architecture', 'Mediterranean', 'Islands'],
        location: 'Santorini, Greece',
        photographer: 'Maria Kostas',
        year: 2024
    },
    {
        id: 2,
        title: 'Tokyo Neon Nights',
        subtitle: 'Japan',
        description: 'Vibrant neon lights illuminate the bustling streets of Shibuya district at night.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
        badge: {
            text: 'New',
            type: 'info'
        },
        meta: {
            author: 'Yuki Tanaka',
            date: new Date('2024-02-01'),
            rating: 4.8
        },
        tags: ['Cityscape', 'Neon', 'Night Photography', 'Urban'],
        location: 'Tokyo, Japan',
        photographer: 'Yuki Tanaka',
        year: 2024
    },
    {
        id: 3,
        title: 'Machu Picchu Clouds',
        subtitle: 'Peru',
        description: 'Ancient Incan ruins emerging from morning clouds high in the Andes Mountains.',
        image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop',
        badge: {
            text: 'World Heritage',
            type: 'primary'
        },
        meta: {
            author: 'Carlos Mendoza',
            date: new Date('2024-01-20'),
            rating: 5.0
        },
        tags: ['Ancient', 'Mountains', 'UNESCO', 'Historical'],
        location: 'Cusco, Peru',
        photographer: 'Carlos Mendoza',
        year: 2024
    },
    {
        id: 4,
        title: 'Northern Lights',
        subtitle: 'Iceland',
        description: 'Spectacular aurora borealis dancing across the star-filled sky over a frozen landscape.',
        image: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=400&h=300&fit=crop',
        badge: {
            text: 'Rare',
            type: 'warning'
        },
        meta: {
            author: 'Erik Hansen',
            date: new Date('2023-12-25'),
            rating: 4.9
        },
        tags: ['Aurora', 'Night Sky', 'Winter', 'Natural Phenomenon'],
        location: 'Reykjavik, Iceland',
        photographer: 'Erik Hansen',
        year: 2024
    },
    {
        id: 5,
        title: 'Bali Rice Terraces',
        subtitle: 'Indonesia',
        description: 'Emerald green rice terraces cascading down volcanic slopes in the morning mist.',
        image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
        meta: {
            author: 'Putu Sari',
            date: new Date('2024-01-10'),
            rating: 4.7
        },
        tags: ['Agriculture', 'Landscape', 'Tropical', 'Terraces'],
        location: 'Jatiluwih, Bali',
        photographer: 'Putu Sari',
        year: 2024
    },
    {
        id: 6,
        title: 'Sahara Dunes',
        subtitle: 'Morocco',
        description: 'Golden sand dunes stretch endlessly under the scorching desert sun.',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
        badge: {
            text: 'Adventure',
            type: 'error'
        },
        meta: {
            author: 'Hassan Alami',
            date: new Date('2024-01-08'),
            rating: 4.6
        },
        tags: ['Desert', 'Sand Dunes', 'Adventure', 'Landscape'],
        location: 'Merzouga, Morocco',
        photographer: 'Hassan Alami',
        year: 2024
    },
    {
        id: 7,
        title: 'Venice Canals',
        subtitle: 'Italy',
        description: 'Romantic gondola ride through historic canals lined with Renaissance architecture.',
        image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400&h=300&fit=crop',
        meta: {
            author: 'Giuseppe Rossi',
            date: new Date('2023-11-15'),
            rating: 4.8
        },
        tags: ['Canals', 'Architecture', 'Romance', 'Historic'],
        location: 'Venice, Italy',
        photographer: 'Giuseppe Rossi',
        year: 2024
    },
    {
        id: 8,
        title: 'Great Wall Sunrise',
        subtitle: 'China',
        description: 'First light of dawn illuminating the ancient Great Wall winding across mountain ridges.',
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
        badge: {
            text: 'Historic',
            type: 'primary'
        },
        meta: {
            author: 'Li Wei',
            date: new Date('2024-02-05'),
            rating: 4.9
        },
        tags: ['Historical', 'Sunrise', 'Architecture', 'Mountains'],
        location: 'Beijing, China',
        photographer: 'Li Wei',
        year: 2024
    },
    {
        id: 9,
        title: 'Norwegian Fjords',
        subtitle: 'Norway',
        description: 'Dramatic cliffs plunge into deep blue fjord waters surrounded by snow-capped peaks.',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
        meta: {
            author: 'Ingrid Larsen',
            date: new Date('2024-01-12'),
            rating: 4.8
        },
        tags: ['Fjords', 'Cliffs', 'Water', 'Dramatic'],
        location: 'Geirangerfjord, Norway',
        photographer: 'Ingrid Larsen',
        year: 2024
    },
    {
        id: 10,
        title: 'Amazon Rainforest',
        subtitle: 'Brazil',
        description: 'Dense canopy of the world\'s largest tropical rainforest teeming with wildlife.',
        image: 'https://images.unsplash.com/photo-1440613905118-99b921706b5c?w=400&h=300&fit=crop',
        badge: {
            text: 'Wildlife',
            type: 'success'
        },
        meta: {
            author: 'Ana Silva',
            date: new Date('2024-01-18'),
            rating: 4.7
        },
        tags: ['Rainforest', 'Wildlife', 'Nature', 'Conservation'],
        location: 'Amazonas, Brazil',
        photographer: 'Ana Silva',
        year: 2024
    },
    {
        id: 11,
        title: 'Scottish Highlands',
        subtitle: 'Scotland',
        description: 'Misty mountains and ancient castles dot the rugged landscape of the Scottish Highlands.',
        image: 'https://images.unsplash.com/photo-1552832499-3be83d60f4c4?w=400&h=300&fit=crop',
        meta: {
            author: 'Duncan MacLeod',
            date: new Date('2023-12-30'),
            rating: 4.6
        },
        tags: ['Mountains', 'Castles', 'Mist', 'Celtic'],
        location: 'Highlands, Scotland',
        photographer: 'Duncan MacLeod',
        year: 2024
    },
    {
        id: 12,
        title: 'Maldives Paradise',
        subtitle: 'Maldives',
        description: 'Crystal clear turquoise waters and pristine white sand beaches in tropical paradise.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        badge: {
            text: 'Paradise',
            type: 'info'
        },
        meta: {
            author: 'Ahmed Rashid',
            date: new Date('2024-02-08'),
            rating: 4.9
        },
        tags: ['Beach', 'Paradise', 'Crystal Water', 'Tropical'],
        location: 'Malé, Maldives',
        photographer: 'Ahmed Rashid',
        year: 2024
    }
];

export const POSTCARD_CATEGORIES = [
    'All',
    'Landscape',
    'Cityscape',
    'Historical',
    'Nature',
    'Beach',
    'Mountains',
    'Desert',
    'Architecture'
];