import { inject, Injectable } from '@angular/core';
import { Observable, map, combineLatest, of, from } from 'rxjs';
import { 
    Prompt, 
    CreatePromptRequest, 
    UpdatePromptRequest, 
    PromptFilter, 
    PromptSearchResult,
    PromptCategory,
    PromptUsage
} from '../../models/prompt.model';
import { FirebaseSimpleService } from './firebase-simple.service';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class PromptService {
    private readonly COLLECTION_NAME = 'prompts';
    private readonly CATEGORIES_COLLECTION = 'prompt-categories';
    private readonly USAGE_COLLECTION = 'prompt-usage';

    constructor(
        private firebaseService: FirebaseSimpleService,
        private authService: AuthService
    ) {}

    /**
     * Crear un nuevo prompt
     */
    createPrompt(promptData: CreatePromptRequest): Observable<string> {
        const currentUser = this.authService.currentUser;
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }

        const prompt = {
            ...promptData,
            authorId: currentUser.id!,
            author: currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
            usageCount: 0,
            rating: 0,
            totalRatings: 0,
            version: '1.0.0'
        };

        return from(this.firebaseService.createDocument(this.COLLECTION_NAME, prompt));
    }

    /**
     * Obtener prompt por ID
     */
    getPromptById(id: string): Observable<Prompt | null> {
        return from(this.firebaseService.getDocument(this.COLLECTION_NAME, id));
    }

    /**
     * Actualizar prompt
     */
    updatePrompt(id: string, promptData: UpdatePromptRequest): Observable<void> {
        return from(this.firebaseService.updateDocument(this.COLLECTION_NAME, id, promptData));
    }

    /**
     * Eliminar prompt
     */
    deletePrompt(id: string): Observable<void> {
        return from(this.firebaseService.deleteDocument(this.COLLECTION_NAME, id));
    }

    /**
     * Listar todos los prompts
     */
    getAllPrompts(): Observable<Prompt[]> {
        return from(this.firebaseService.getDocuments(this.COLLECTION_NAME))
            .pipe(
                map(prompts => prompts.sort((a, b) => {
                    const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt);
                    const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt);
                    return dateB.getTime() - dateA.getTime();
                }))
            );
    }

    /**
     * Obtener prompts del usuario actual
     */
    getUserPrompts(): Observable<Prompt[]> {
        const currentUser = this.authService.currentUser;
        if (!currentUser) {
            return of([]);
        }

        return from(this.firebaseService.getDocuments(
            this.COLLECTION_NAME,
            [{ field: 'authorId', operator: '==', value: currentUser.id }]
        ));
    }

    /**
     * Obtener prompts públicos
     */
    getPublicPrompts(): Observable<Prompt[]> {
        return from(this.firebaseService.getDocuments(
            this.COLLECTION_NAME,
            [
                { field: 'isPublic', operator: '==', value: true },
                { field: 'isActive', operator: '==', value: true }
            ]
        ));
    }

    /**
     * Buscar prompts con filtros
     */
    searchPrompts(filter: PromptFilter, limit?: number): Observable<PromptSearchResult> {
        let conditions: any[] = [];

        // Filtros básicos
        if (filter.category) {
            conditions.push({ field: 'category.id', operator: '==', value: filter.category });
        }

        if (filter.author) {
            conditions.push({ field: 'authorId', operator: '==', value: filter.author });
        }

        if (filter.language) {
            conditions.push({ field: 'language', operator: '==', value: filter.language });
        }

        if (filter.isPublic !== undefined) {
            conditions.push({ field: 'isPublic', operator: '==', value: filter.isPublic });
        }

        if (filter.isActive !== undefined) {
            conditions.push({ field: 'isActive', operator: '==', value: filter.isActive });
        }

        if (filter.complexity) {
            conditions.push({ field: 'metadata.complexity', operator: '==', value: filter.complexity });
        }

        return from(this.firebaseService.getDocuments(this.COLLECTION_NAME, conditions))
            .pipe(
                map((prompts: Prompt[]) => {
                    // Filtro de texto en cliente (Firestore no soporta búsqueda full-text)
                    let filteredPrompts = prompts;
                    
                    if (filter.searchTerm) {
                        const searchTerm = filter.searchTerm.toLowerCase();
                        filteredPrompts = prompts.filter(prompt => 
                            prompt.title.toLowerCase().includes(searchTerm) ||
                            prompt.description?.toLowerCase().includes(searchTerm) ||
                            prompt.content.toLowerCase().includes(searchTerm) ||
                            prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                        );
                    }

                    if (filter.tags && filter.tags.length > 0) {
                        filteredPrompts = filteredPrompts.filter(prompt =>
                            filter.tags!.some(tag => prompt.tags.includes(tag))
                        );
                    }

                    // Aplicar límite si se especifica
                    if (limit && filteredPrompts.length > limit) {
                        filteredPrompts = filteredPrompts.slice(0, limit);
                    }

                    // Calcular facetas
                    const facets = this.calculateFacets(filteredPrompts);

                    return {
                        prompts: filteredPrompts,
                        total: filteredPrompts.length,
                        facets
                    };
                })
            );
    }

    /**
     * Registrar uso de prompt
     */
    recordPromptUsage(promptId: string, variables?: { [key: string]: any }): Observable<string> {
        const currentUser = this.authService.currentUser;
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }

        const usage = {
            promptId,
            userId: currentUser.id!,
            usedAt: new Date(),
            variables
        };

        // Incrementar contador de uso
        this.incrementUsageCount(promptId).subscribe();

        return from(this.firebaseService.createDocument(this.USAGE_COLLECTION, usage));
    }

    /**
     * Calificar prompt
     */
    ratePrompt(promptId: string, rating: number, comment?: string): Observable<void> {
        return this.getPromptById(promptId).pipe(
            map(prompt => {
                if (!prompt) {
                    throw new Error('Prompt no encontrado');
                }

                const newTotalRatings = prompt.totalRatings + 1;
                const newRating = ((prompt.rating * prompt.totalRatings) + rating) / newTotalRatings;

                return this.updatePrompt(promptId, {
                    rating: Number(newRating.toFixed(2)),
                    totalRatings: newTotalRatings
                });
            })
        ).pipe(
            map(() => void 0)
        );
    }

    /**
     * Clonar prompt
     */
    clonePrompt(promptId: string, newTitle?: string): Observable<string> {
        const currentUser = this.authService.currentUser;
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }

        return this.getPromptById(promptId).pipe(
            map(prompt => {
                if (!prompt) {
                    throw new Error('Prompt no encontrado');
                }

                const clonedPrompt: CreatePromptRequest = {
                    title: newTitle || `${prompt.title} (Copia)`,
                    content: prompt.content,
                    description: prompt.description,
                    category: prompt.category,
                    tags: [...prompt.tags],
                    author: currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
                    authorId: currentUser.id!,
                    isPublic: false,
                    isActive: true,
                    language: prompt.language,
                    version: '1.0.0',
                    variables: prompt.variables ? [...prompt.variables] : undefined,
                    examples: prompt.examples ? [...prompt.examples] : undefined,
                    metadata: prompt.metadata ? { ...prompt.metadata } : undefined
                };

                return this.createPrompt(clonedPrompt);
            })
        ).pipe(
            map(result => {
                if (result instanceof Observable) {
                    return result;
                }
                return of(result);
            })
        )[0];
    }

    // Gestión de categorías
    /**
     * Crear categoría
     */
    createCategory(category: Omit<PromptCategory, 'id'>): Observable<string> {
        return from(this.firebaseService.createDocument(this.CATEGORIES_COLLECTION, category));
    }

    /**
     * Obtener todas las categorías
     */
    getCategories(): Observable<PromptCategory[]> {
        return from(this.firebaseService.getDocuments(this.CATEGORIES_COLLECTION));
    }

    /**
     * Actualizar categoría
     */
    updateCategory(id: string, category: Partial<PromptCategory>): Observable<void> {
        return from(this.firebaseService.updateDocument(this.CATEGORIES_COLLECTION, id, category));
    }

    /**
     * Eliminar categoría
     */
    deleteCategory(id: string): Observable<void> {
        return from(this.firebaseService.deleteDocument(this.CATEGORIES_COLLECTION, id));
    }

    // Métodos privados
    private incrementUsageCount(promptId: string): Observable<void> {
        return this.getPromptById(promptId).pipe(
            map(prompt => {
                if (prompt) {
                    return this.updatePrompt(promptId, {
                        usageCount: prompt.usageCount + 1,
                        lastUsedAt: new Date()
                    });
                }
                return of(void 0);
            })
        ).pipe(
            map(() => void 0)
        );
    }

    private calculateFacets(prompts: Prompt[]) {
        const facets = {
            categories: {} as { [key: string]: number },
            tags: {} as { [key: string]: number },
            languages: {} as { [key: string]: number },
            complexities: {} as { [key: string]: number }
        };

        prompts.forEach(prompt => {
            // Categorías
            if (prompt.category) {
                facets.categories[prompt.category.name] = 
                    (facets.categories[prompt.category.name] || 0) + 1;
            }

            // Tags
            prompt.tags.forEach(tag => {
                facets.tags[tag] = (facets.tags[tag] || 0) + 1;
            });

            // Idiomas
            facets.languages[prompt.language] = 
                (facets.languages[prompt.language] || 0) + 1;

            // Complejidad
            if (prompt.metadata?.complexity) {
                facets.complexities[prompt.metadata.complexity] = 
                    (facets.complexities[prompt.metadata.complexity] || 0) + 1;
            }
        });

        return facets;
    }
}