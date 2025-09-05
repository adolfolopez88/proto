import { GenericCardData } from '../components/generic-card/generic-card.component';

export const MOCK_PRODUCTS: GenericCardData[] = [
    // AI Agents - Main Products
    {
        id: 1,
        title: 'GPT-4 Assistant Pro',
        subtitle: 'OpenAI',
        description: 'Agente de IA conversacional avanzado con capacidades de razonamiento complejo, análisis de código y generación creativa.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
        price: 199.99,
        badge: {
            text: 'Premium',
            type: 'success'
        },
        meta: {
            rating: 4.9,
            date: new Date('2024-01-15'),
            capabilities: ['Texto', 'Código', 'Análisis', 'Creatividad'],
            apiCalls: '1M/mes',
            responseTime: '~2s'
        },
        tags: ['GPT-4', 'Conversacional', 'Programación', 'Análisis'],
        category: 'AI Conversacional',
        brand: 'OpenAI',
        inStock: true,
        aiType: 'conversational'
    },
    {
        id: 2,
        title: 'Claude 3.5 Sonnet',
        subtitle: 'Anthropic',
        description: 'Agente de IA especializado en razonamiento complejo, escritura técnica y asistencia de programación con alta precisión.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
        price: 249.99,
        badge: {
            text: 'Más Popular',
            type: 'primary'
        },
        meta: {
            rating: 4.8,
            date: new Date('2024-02-01'),
            capabilities: ['Razonamiento', 'Código', 'Escritura', 'Análisis'],
            apiCalls: '500K/mes',
            responseTime: '~1.5s'
        },
        tags: ['Claude', 'Razonamiento', 'Técnico', 'Precisión'],
        category: 'AI Conversacional',
        brand: 'Anthropic',
        inStock: true,
        aiType: 'conversational'
    },
    {
        id: 3,
        title: 'DALL-E 3 Creator',
        subtitle: 'OpenAI',
        description: 'Generador de imágenes por IA con capacidades artísticas avanzadas, desde conceptos abstractos hasta ilustraciones realistas.',
        image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
        price: 129.99,
        badge: {
            text: 'Creativo',
            type: 'warning'
        },
        meta: {
            rating: 4.7,
            date: new Date('2024-01-20'),
            capabilities: ['Imágenes', 'Arte', 'Conceptos', 'Estilos'],
            apiCalls: '10K imágenes/mes',
            responseTime: '~15s'
        },
        tags: ['DALL-E', 'Imágenes', 'Arte', 'Creativo'],
        category: 'AI Generativo',
        brand: 'OpenAI',
        inStock: true,
        aiType: 'image-generation'
    },
    {
        id: 4,
        title: 'Midjourney Pro',
        subtitle: 'Midjourney',
        description: 'Plataforma de generación de imágenes con IA especializada en arte conceptual, ilustraciones y diseños únicos.',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
        price: 99.99,
        badge: {
            text: 'Artístico',
            type: 'info'
        },
        meta: {
            rating: 4.6,
            date: new Date('2024-01-25'),
            capabilities: ['Arte', 'Conceptual', 'Estilos', 'Comercial'],
            apiCalls: '5K imágenes/mes',
            responseTime: '~20s'
        },
        tags: ['Midjourney', 'Arte', 'Conceptual', 'Comercial'],
        category: 'AI Generativo',
        brand: 'Midjourney',
        inStock: true,
        aiType: 'image-generation'
    },
    {
        id: 5,
        title: 'GitHub Copilot Enterprise',
        subtitle: 'Microsoft',
        description: 'Asistente de programación con IA que genera código, documenta funciones y ayuda en desarrollo de software.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
        price: 299.99,
        badge: {
            text: 'Desarrollo',
            type: 'accent'
        },
        meta: {
            rating: 4.5,
            date: new Date('2024-02-10'),
            capabilities: ['Código', 'Documentación', 'Tests', 'Refactoring'],
            apiCalls: 'Ilimitado',
            responseTime: '~1s'
        },
        tags: ['Copilot', 'Programación', 'GitHub', 'Desarrollo'],
        category: 'AI Código',
        brand: 'Microsoft',
        inStock: true,
        aiType: 'code-assistant'
    },
    {
        id: 6,
        title: 'Whisper Transcription AI',
        subtitle: 'OpenAI',
        description: 'Sistema de reconocimiento de voz y transcripción multiidioma con alta precisión y velocidad.',
        image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
        price: 79.99,
        badge: {
            text: 'Audio',
            type: 'secondary'
        },
        meta: {
            rating: 4.4,
            date: new Date('2024-01-30'),
            capabilities: ['Transcripción', 'Traducción', 'Multiidioma', 'Audio'],
            apiCalls: '100 horas/mes',
            responseTime: '~5s/min'
        },
        tags: ['Whisper', 'Audio', 'Transcripción', 'Multiidioma'],
        category: 'AI Audio',
        brand: 'OpenAI',
        inStock: true,
        aiType: 'audio-processing'
    },
    {
        id: 7,
        title: 'LangChain Orchestrator',
        subtitle: 'LangChain',
        description: 'Framework para crear aplicaciones complejas con múltiples agentes de IA trabajando en conjunto.',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
        price: 399.99,
        badge: {
            text: 'Enterprise',
            type: 'primary'
        },
        meta: {
            rating: 4.3,
            date: new Date('2024-02-05'),
            capabilities: ['Orchestración', 'Multi-Agent', 'Workflows', 'Integración'],
            apiCalls: '50K chains/mes',
            responseTime: '~3s'
        },
        tags: ['LangChain', 'Multi-Agent', 'Orchestración', 'Workflow'],
        category: 'AI Orchestración',
        brand: 'LangChain',
        inStock: true,
        aiType: 'orchestration'
    },
    {
        id: 8,
        title: 'Claude Data Analyst',
        subtitle: 'Anthropic',
        description: 'Especialista en análisis de datos, visualizaciones y insights empresariales con capacidades estadísticas avanzadas.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        price: 179.99,
        badge: {
            text: 'Analítica',
            type: 'success'
        },
        meta: {
            rating: 4.7,
            date: new Date('2024-02-15'),
            capabilities: ['Análisis', 'Visualización', 'Estadística', 'Insights'],
            apiCalls: '1M consultas/mes',
            responseTime: '~4s'
        },
        tags: ['Análisis', 'Datos', 'Estadística', 'Visualización'],
        category: 'AI Analítica',
        brand: 'Anthropic',
        inStock: true,
        aiType: 'data-analysis'
    }
    /*,
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
    }*/
];

export const PRODUCT_CATEGORIES = [
    'All',
    'AI Conversacional',
    'AI Generativo', 
    'AI Código',
    'AI Audio',
    'AI Orchestración',
    'AI Analítica',
    'Electronics',
    'Audio',
    'Tablets',
    'Gaming',
    'Photography',
    'Automotive',
    'Home Appliances'
];