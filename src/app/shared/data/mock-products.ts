import { GenericCardData } from '../components/generic-card/generic-card.component';

export const MOCK_PRODUCTS: GenericCardData[] = [
    {
        id: 1,
        title: 'MacBook Pro 16"',
        subtitle: 'Apple',
        description: 'Laptop profesional con chip M2 Pro, 16GB RAM y 512GB SSD. Perfecto para desarrollo y diseño.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
        price: 2499.99,
        badge: {
            text: 'Bestseller',
            type: 'success'
        },
        meta: {
            rating: 4.8,
            date: new Date('2024-01-15')
        },
        tags: ['Laptop', 'Apple', 'Professional', 'M2 Pro'],
        category: 'Electronics',
        brand: 'Apple',
        inStock: true,
        discount: 10
    },
    {
        id: 2,
        title: 'iPhone 15 Pro',
        subtitle: 'Apple',
        description: 'El iPhone más avanzado con cámara de 48MP, chip A17 Pro y diseño de titanio.',
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',
        price: 1199.99,
        badge: {
            text: 'New',
            type: 'info'
        },
        meta: {
            rating: 4.9,
            date: new Date('2024-02-01')
        },
        tags: ['iPhone', 'Smartphone', 'iOS', 'Camera'],
        category: 'Electronics',
        brand: 'Apple',
        inStock: true
    },
    {
        id: 3,
        title: 'Samsung Galaxy S24 Ultra',
        subtitle: 'Samsung',
        description: 'Smartphone Android premium con S Pen, cámara de 200MP y pantalla Dynamic AMOLED 2X.',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop',
        price: 1299.99,
        meta: {
            rating: 4.7,
            date: new Date('2024-01-20')
        },
        tags: ['Samsung', 'Android', 'S Pen', '200MP'],
        category: 'Electronics',
        brand: 'Samsung',
        inStock: false
    },
    {
        id: 4,
        title: 'Sony WH-1000XM5',
        subtitle: 'Sony',
        description: 'Audífonos inalámbricos con cancelación de ruido líder en la industria.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        price: 399.99,
        badge: {
            text: 'Sale',
            type: 'warning'
        },
        meta: {
            rating: 4.6,
            date: new Date('2023-12-10')
        },
        tags: ['Headphones', 'Noise Cancelling', 'Wireless'],
        category: 'Audio',
        brand: 'Sony',
        inStock: true,
        discount: 15
    },
    {
        id: 5,
        title: 'Dell XPS 13',
        subtitle: 'Dell',
        description: 'Ultrabook compacta con pantalla InfinityEdge, procesador Intel Core i7 de 12va generación.',
        image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop',
        price: 1899.99,
        meta: {
            rating: 4.5,
            date: new Date('2024-01-05')
        },
        tags: ['Dell', 'Ultrabook', 'Intel i7', 'Portable'],
        category: 'Electronics',
        brand: 'Dell',
        inStock: true
    },
    {
        id: 6,
        title: 'iPad Pro 12.9"',
        subtitle: 'Apple',
        description: 'Tablet profesional con chip M2, pantalla Liquid Retina XDR y compatibilidad con Apple Pencil.',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
        price: 1099.99,
        badge: {
            text: 'Popular',
            type: 'primary'
        },
        meta: {
            rating: 4.8,
            date: new Date('2024-01-25')
        },
        tags: ['iPad', 'Tablet', 'M2 Chip', 'Apple Pencil'],
        category: 'Tablets',
        brand: 'Apple',
        inStock: true
    },
    {
        id: 7,
        title: 'Nintendo Switch OLED',
        subtitle: 'Nintendo',
        description: 'Consola híbrida con pantalla OLED de 7 pulgadas, audio mejorado y 64GB de almacenamiento.',
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
        price: 349.99,
        meta: {
            rating: 4.7,
            date: new Date('2023-11-15')
        },
        tags: ['Nintendo', 'Gaming', 'OLED', 'Portable'],
        category: 'Gaming',
        brand: 'Nintendo',
        inStock: true
    },
    {
        id: 8,
        title: 'Canon EOS R6 Mark II',
        subtitle: 'Canon',
        description: 'Cámara mirrorless full-frame con sensor de 24.2MP, video 4K y estabilización de imagen.',
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
        price: 2499.99,
        badge: {
            text: 'Pro',
            type: 'error'
        },
        meta: {
            rating: 4.9,
            date: new Date('2024-02-10')
        },
        tags: ['Camera', 'Full Frame', '4K Video', 'Professional'],
        category: 'Photography',
        brand: 'Canon',
        inStock: true
    },
    {
        id: 9,
        title: 'Tesla Model Y',
        subtitle: 'Tesla',
        description: 'SUV eléctrico con autonomía de hasta 540 km, Autopilot y carga superrápida.',
        image: 'https://images.unsplash.com/photo-1549399505-7e1bfaf1d3d2?w=400&h=300&fit=crop',
        price: 54999.99,
        badge: {
            text: 'Electric',
            type: 'success'
        },
        meta: {
            rating: 4.6,
            date: new Date('2024-01-01')
        },
        tags: ['Electric', 'SUV', 'Autopilot', 'Sustainable'],
        category: 'Automotive',
        brand: 'Tesla',
        inStock: false
    },
    {
        id: 10,
        title: 'Dyson V15 Detect',
        subtitle: 'Dyson',
        description: 'Aspiradora inalámbrica con tecnología de detección láser y hasta 60 minutos de autonomía.',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        price: 749.99,
        meta: {
            rating: 4.4,
            date: new Date('2023-12-20')
        },
        tags: ['Vacuum', 'Cordless', 'Laser Detection', 'Home'],
        category: 'Home Appliances',
        brand: 'Dyson',
        inStock: true,
        discount: 8
    }
];

export const PRODUCT_CATEGORIES = [
    'All',
    'Electronics',
    'Audio',
    'Tablets',
    'Gaming',
    'Photography',
    'Automotive',
    'Home Appliances'
];