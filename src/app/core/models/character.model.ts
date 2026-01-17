export interface Character {
    id?: string;
    nombre: string;
    tipo: 'persona' | 'objeto' | 'criatura' | 'entidad';
    descripcion: string;
    usuario_id: string | null;
    activo: boolean;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    
    atributos_persona?: PersonaAttributes;
    atributos_objeto?: ObjetoAttributes;
    capacidades_interpretacion: InterpretationCapabilities;
    estadisticas: CharacterStats;
    inventario: InventoryItem[];
    configuracion: CharacterConfig;
    imagenes: CharacterImages;
    metadatos: CharacterMetadata;
}

export interface PersonaAttributes {
    edad: number;
    genero: 'masculino' | 'femenino' | 'no_binario' | 'otro';
    ocupacion: string;
    personalidad: string[];
    habilidades: string[];
    apariencia: {
        altura: string;
        color_cabello: string;
        color_ojos: string;
        complexion: string;
    };
    trasfondo: string;
    relaciones: Relationship[];
}

export interface ObjetoAttributes {
    categoria: 'herramienta' | 'vehículo' | 'edificio' | 'arma' | 'mágico' | 'tecnológico';
    material: string;
    tamaño: 'pequeño' | 'mediano' | 'grande' | 'gigante';
    peso: string;
    color_principal: string;
    estado: 'nuevo' | 'usado' | 'dañado' | 'roto' | 'mágico';
    funcionalidad: string[];
    origen: string;
    valor_estimado: number;
    propiedades_especiales: SpecialProperty[];
}

export interface Relationship {
    tipo: 'familia' | 'amigo' | 'colega' | 'pareja';
    nombre: string;
    descripcion: string;
}

export interface SpecialProperty {
    nombre: string;
    descripcion: string;
    nivel: 'alto' | 'medio' | 'bajo';
}

export interface InterpretationCapabilities {
    personalidad_base: {
        temperamento: 'calmado' | 'agresivo' | 'nervioso' | 'alegre';
        forma_hablar: 'formal' | 'casual' | 'técnico' | 'poético';
        motivaciones: string[];
        miedos: string[];
        deseos: string[];
    };
    comportamientos: {
        en_combate: string;
        en_dialogo: string;
        en_exploracion: string;
        reacciones_emocionales: {
            alegría: string;
            tristeza: string;
            ira: string;
            miedo: string;
        };
    };
    frases_caracteristicas: string[];
    gestos_distintivos: string[];
}

export interface CharacterStats {
    nivel: number;
    experiencia: number;
    atributos_numericos: {
        fuerza: number;
        destreza: number;
        inteligencia: number;
        carisma: number;
        resistencia: number;
        percepcion: number;
    };
}

export interface InventoryItem {
    objeto_id: string;
    nombre: string;
    cantidad: number;
    equipado: boolean;
}

export interface CharacterConfig {
    visible_para_otros: boolean;
    permite_interaccion: boolean;
    nivel_detalle_respuestas: 'alto' | 'medio' | 'bajo';
    idioma_preferido: string;
    contexto_activo: 'fantasy' | 'modern' | 'sci-fi' | 'historical';
}

export interface CharacterImages {
    avatar_principal: CharacterImage;
    galeria: CharacterImage[];
    configuracion_imagenes: ImageConfig;
}

export interface CharacterImage {
    id?: string;
    url: string;
    alt_text: string;
    tipo: 'avatar' | 'portrait' | 'full_body' | 'action' | 'concept_art';
    dimension: string;
    formato: 'jpg' | 'png' | 'webp' | 'svg';
    tamaño_bytes: number;
    fecha_subida: Date;
    tags?: string[];
    contexto?: string;
    orden?: number;
    activa: boolean;
    calidad?: 'alta' | 'media' | 'baja';
    generada_por_ia?: boolean;
    autor?: 'usuario' | 'ia' | 'artista_externo';
    licencia?: 'libre' | 'restringida' | 'comercial';
    es_principal?: boolean;
}

export interface ImageConfig {
    permitir_subida_usuario: boolean;
    formatos_permitidos: string[];
    tamaño_maximo_mb: number;
    dimension_minima: string;
    dimension_maxima: string;
    moderacion_automatica: boolean;
    marca_agua: boolean;
    compresion_automatica: boolean;
    generar_miniaturas: boolean;
    miniaturas_tamaños: string[];
}

export interface CharacterMetadata {
    version: string;
    tags: string[];
    popularidad: number;
    usos_totales: number;
    valoracion_promedio: number;
}

// Interfaces para filtros y búsqueda
export interface CharacterFilter {
    tipo?: string;
    activo?: boolean;
    tags?: string[];
    nivel_min?: number;
    nivel_max?: number;
    usuario_id?: string;
    contexto?: string;
}

export interface CharacterSearchResult {
    characters: Character[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// Type definitions
export type CharacterType = 'persona' | 'objeto' | 'criatura' | 'entidad';
export type CharacterContext = 'fantasy' | 'modern' | 'sci-fi' | 'historical';

// Enum helpers
export const CHARACTER_TYPES = ['persona', 'objeto', 'criatura', 'entidad'] as const;
export const CHARACTER_CONTEXTS = ['fantasy', 'modern', 'sci-fi', 'historical'] as const;
export const GENDER_OPTIONS = ['masculino', 'femenino', 'no_binario', 'otro'] as const;
export const OBJECT_CATEGORIES = ['herramienta', 'vehículo', 'edificio', 'arma', 'mágico', 'tecnológico'] as const;
export const SIZE_OPTIONS = ['pequeño', 'mediano', 'grande', 'gigante'] as const;
export const STATE_OPTIONS = ['nuevo', 'usado', 'dañado', 'roto', 'mágico'] as const;
export const TEMPERAMENT_OPTIONS = ['calmado', 'agresivo', 'nervioso', 'alegre'] as const;
export const SPEAKING_STYLE_OPTIONS = ['formal', 'casual', 'técnico', 'poético'] as const;
export const CONTEXT_OPTIONS = ['fantasy', 'modern', 'sci-fi', 'historical'] as const;
export const IMAGE_TYPES = ['avatar', 'portrait', 'full_body', 'action', 'concept_art'] as const;