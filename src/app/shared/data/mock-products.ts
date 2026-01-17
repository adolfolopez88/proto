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