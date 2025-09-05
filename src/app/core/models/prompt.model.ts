import { BaseDocument } from '../services/firebase/firebase-real.service';

export interface Prompt extends BaseDocument {
    title: string;
    content: string;
    description?: string;
    category: PromptCategory;
    tags: string[];
    author: string;
    authorId: string;
    isPublic: boolean;
    isActive: boolean;
    version: string;
    language: string;
    variables?: PromptVariable[];
    examples?: PromptExample[];
    usageCount: number;
    rating: number;
    totalRatings: number;
    lastUsedAt?: any;
    metadata?: {
        complexity: 'basic' | 'intermediate' | 'advanced';
        estimatedTokens?: number;
        purpose: string[];
        targetAudience: string[];
    };
}

export interface PromptCategory {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon: string;
    parentId?: string;
}

export interface PromptVariable {
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'boolean';
    description: string;
    required: boolean;
    defaultValue?: any;
    options?: string[]; // Para tipo select
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
    };
}

export interface PromptExample {
    title: string;
    description: string;
    input: { [key: string]: any };
    expectedOutput?: string;
    notes?: string;
}

export interface CreatePromptRequest extends Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating' | 'totalRatings'> {}

export interface UpdatePromptRequest extends Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>> {}

export interface PromptFilter {
    category?: string;
    tags?: string[];
    author?: string;
    language?: string;
    isPublic?: boolean;
    isActive?: boolean;
    complexity?: string;
    searchTerm?: string;
}

export interface PromptSearchResult {
    prompts: Prompt[];
    total: number;
    facets: {
        categories: { [key: string]: number };
        tags: { [key: string]: number };
        languages: { [key: string]: number };
        complexities: { [key: string]: number };
    };
}

export interface PromptUsage {
    id: string;
    promptId: string;
    userId: string;
    usedAt: any;
    variables?: { [key: string]: any };
    feedback?: {
        rating: number;
        comment?: string;
    };
    executionTime?: number;
}