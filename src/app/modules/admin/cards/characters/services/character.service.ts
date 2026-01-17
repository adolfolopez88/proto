import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Character, CharacterFilter, CharacterSearchResult, CHARACTER_TYPES } from 'app/core/models/character.model';
import { CharacterFirestoreService } from './character-firestore.service';

@Injectable({
    providedIn: 'root'
})
export class CharacterService {
    private _characters = new BehaviorSubject<Character[]>([]);
    private _loading = new BehaviorSubject<boolean>(false);
    private _filter = new BehaviorSubject<CharacterFilter>({});
    private _searchTerm = new BehaviorSubject<string>('');
    private _currentPage = new BehaviorSubject<number>(1);
    private _totalItems = new BehaviorSubject<number>(0);

    // Public observables
    public readonly characters$ = this._characters.asObservable();
    public readonly loading$ = this._loading.asObservable();
    public readonly filter$ = this._filter.asObservable();
    public readonly searchTerm$ = this._searchTerm.asObservable();
    public readonly currentPage$ = this._currentPage.asObservable();
    public readonly totalItems$ = this._totalItems.asObservable();

    // Configuration
    public readonly itemsPerPage = 12;

    constructor(private firestoreService: CharacterFirestoreService) {}

    /**
     * Load characters with current filters and pagination
     */
    loadCharacters(page: number = 1): Observable<CharacterSearchResult> {
        this._loading.next(true);
        this._currentPage.next(page);

        const currentFilter = this._filter.value;
        const searchTerm = this._searchTerm.value;

        let observable: Observable<CharacterSearchResult>;

        if (searchTerm.trim()) {
            // If there's a search term, use search method
            observable = this.firestoreService.searchCharacters(searchTerm, currentFilter).pipe(
                map(characters => ({
                    characters,
                    total: characters.length,
                    page,
                    limit: this.itemsPerPage,
                    hasMore: false
                }))
            );
        } else {
            // Otherwise, use pagination method
            observable = this.firestoreService.getCharacters(currentFilter, page, this.itemsPerPage);
        }

        return observable.pipe(
            tap(result => {
                this._characters.next(result.characters);
                this._totalItems.next(result.total);
                this._loading.next(false);
            })
        );
    }

    /**
     * Set search term and reload
     */
    search(term: string): Observable<CharacterSearchResult> {
        this._searchTerm.next(term);
        return this.loadCharacters(1);
    }

    /**
     * Set filter and reload
     */
    setFilter(filter: CharacterFilter): Observable<CharacterSearchResult> {
        this._filter.next({ ...this._filter.value, ...filter });
        return this.loadCharacters(1);
    }

    /**
     * Clear all filters
     */
    clearFilters(): Observable<CharacterSearchResult> {
        this._filter.next({});
        this._searchTerm.next('');
        return this.loadCharacters(1);
    }

    /**
     * Get character by ID
     */
    getCharacter(id: string): Observable<Character | null> {
        return this.firestoreService.getCharacter(id).pipe(
            tap(character => {
                if (character) {
                    // Increment usage count when character is viewed
                    this.firestoreService.incrementUsage(id).catch(console.error);
                }
            })
        );
    }

    /**
     * Create new character
     */
    async createCharacter(character: Omit<Character, 'id'>): Promise<string> {
        this._loading.next(true);
        try {
            const characterData = this.prepareCharacterForSave(character);
            const id = await this.firestoreService.createCharacter(characterData);
            
            // Refresh the list
            this.loadCharacters(this._currentPage.value).subscribe();
            
            return id;
        } finally {
            this._loading.next(false);
        }
    }

    /**
     * Update character
     */
    async updateCharacter(id: string, updates: Partial<Character>): Promise<void> {
        this._loading.next(true);
        try {
            const updateData = this.prepareCharacterForSave(updates);
            await this.firestoreService.updateCharacter(id, updateData);
            
            // Refresh the list
            this.loadCharacters(this._currentPage.value).subscribe();
        } finally {
            this._loading.next(false);
        }
    }

    /**
     * Delete character
     */
    async deleteCharacter(id: string): Promise<void> {
        this._loading.next(true);
        try {
            await this.firestoreService.deleteCharacter(id);
            
            // Refresh the list
            this.loadCharacters(this._currentPage.value).subscribe();
        } finally {
            this._loading.next(false);
        }
    }

    /**
     * Upload image for character
     */
    uploadCharacterImage(file: File, characterId: string, imageType: string): Observable<string> {
        return this.firestoreService.uploadImage(file, characterId, imageType);
    }

    /**
     * Rate a character
     */
    async rateCharacter(characterId: string, rating: number): Promise<void> {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        
        await this.firestoreService.rateCharacter(characterId, rating);
    }

    /**
     * Get characters by current user
     */
    getUserCharacters(userId: string): Observable<Character[]> {
        return this.firestoreService.getUserCharacters(userId);
    }

    /**
     * Get popular characters (high rating or usage)
     */
    getPopularCharacters(limit: number = 6): Observable<Character[]> {
        return this.firestoreService.getCharacters({}, 1, limit).pipe(
            map(result => result.characters.sort((a, b) => {
                // Sort by combination of rating and usage
                const scoreA = (a.metadatos.valoracion_promedio * 2) + (a.metadatos.usos_totales * 0.1);
                const scoreB = (b.metadatos.valoracion_promedio * 2) + (b.metadatos.usos_totales * 0.1);
                return scoreB - scoreA;
            }))
        );
    }

    /**
     * Get recent characters
     */
    getRecentCharacters(limit: number = 6): Observable<Character[]> {
        return this.firestoreService.getCharacters({}, 1, limit).pipe(
            map(result => result.characters)
        );
    }

    /**
     * Validate character data
     */
    validateCharacter(character: Partial<Character>): string[] {
        const errors: string[] = [];

        if (!character.nombre?.trim()) {
            errors.push('El nombre es requerido');
        }

        if (!character.tipo || !CHARACTER_TYPES.includes(character.tipo as any)) {
            errors.push('El tipo de personaje es requerido');
        }

        if (!character.descripcion?.trim()) {
            errors.push('La descripción es requerida');
        }

        // Validate specific attributes based on type
        if (character.tipo === 'persona' && character.atributos_persona) {
            const persona = character.atributos_persona;
            if (!persona.edad || persona.edad < 0) {
                errors.push('La edad debe ser un número válido');
            }
            if (!persona.genero) {
                errors.push('El género es requerido para personas');
            }
        }

        if (character.tipo === 'objeto' && character.atributos_objeto) {
            const objeto = character.atributos_objeto;
            if (!objeto.categoria) {
                errors.push('La categoría es requerida para objetos');
            }
            if (!objeto.material?.trim()) {
                errors.push('El material es requerido para objetos');
            }
        }

        // Validate stats
        if (character.estadisticas) {
            const stats = character.estadisticas.atributos_numericos;
            Object.values(stats).forEach(value => {
                if (value < 1 || value > 20) {
                    errors.push('Los atributos deben estar entre 1 y 20');
                }
            });
        }

        return errors;
    }

    /**
     * Create default character structure
     */
    createDefaultCharacter(tipo: Character['tipo'] = 'persona'): Partial<Character> {
        const baseCharacter: Partial<Character> = {
            nombre: '',
            tipo,
            descripcion: '',
            usuario_id: null,
            activo: true,
            capacidades_interpretacion: {
                personalidad_base: {
                    temperamento: 'calmado',
                    forma_hablar: 'casual',
                    motivaciones: [],
                    miedos: [],
                    deseos: []
                },
                comportamientos: {
                    en_combate: '',
                    en_dialogo: '',
                    en_exploracion: '',
                    reacciones_emocionales: {
                        alegría: '',
                        tristeza: '',
                        ira: '',
                        miedo: ''
                    }
                },
                frases_caracteristicas: [],
                gestos_distintivos: []
            },
            estadisticas: {
                nivel: 1,
                experiencia: 0,
                atributos_numericos: {
                    fuerza: 10,
                    destreza: 10,
                    inteligencia: 10,
                    carisma: 10,
                    resistencia: 10,
                    percepcion: 10
                }
            },
            inventario: [],
            configuracion: {
                visible_para_otros: true,
                permite_interaccion: true,
                nivel_detalle_respuestas: 'medio',
                idioma_preferido: 'es',
                contexto_activo: 'fantasy'
            },
            imagenes: {
                avatar_principal: {
                    url: '',
                    alt_text: '',
                    tipo: 'avatar',
                    dimension: '256x256',
                    formato: 'jpg',
                    tamaño_bytes: 0,
                    fecha_subida: new Date(),
                    activa: false
                },
                galeria: [],
                configuracion_imagenes: {
                    permitir_subida_usuario: true,
                    formatos_permitidos: ['jpg', 'jpeg', 'png', 'webp'],
                    tamaño_maximo_mb: 5,
                    dimension_minima: '256x256',
                    dimension_maxima: '2048x2048',
                    moderacion_automatica: false,
                    marca_agua: false,
                    compresion_automatica: true,
                    generar_miniaturas: true,
                    miniaturas_tamaños: ['64x64', '128x128', '256x256']
                }
            },
            metadatos: {
                version: '1.0',
                tags: [],
                popularidad: 0,
                usos_totales: 0,
                valoracion_promedio: 0.0
            }
        };

        // Add type-specific attributes
        if (tipo === 'persona') {
            baseCharacter.atributos_persona = {
                edad: 25,
                genero: 'masculino',
                ocupacion: '',
                personalidad: [],
                habilidades: [],
                apariencia: {
                    altura: '',
                    color_cabello: '',
                    color_ojos: '',
                    complexion: ''
                },
                trasfondo: '',
                relaciones: []
            };
        }

        if (tipo === 'objeto') {
            baseCharacter.atributos_objeto = {
                categoria: 'herramienta',
                material: '',
                tamaño: 'mediano',
                peso: '',
                color_principal: '',
                estado: 'nuevo',
                funcionalidad: [],
                origen: '',
                valor_estimado: 0,
                propiedades_especiales: []
            };
        }

        return baseCharacter;
    }

    // Private methods

    private prepareCharacterForSave(character: Partial<Character>): any {
        // Convert arrays to proper format and handle dates
        const prepared = { ...character };
        
        // Ensure dates are Firestore Timestamp compatible
        if (prepared.fecha_creacion instanceof Date) {
            // Keep as Date for Firestore
        }
        if (prepared.fecha_actualizacion instanceof Date) {
            // Keep as Date for Firestore
        }

        return prepared;
    }
}