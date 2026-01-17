import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, finalize, catchError } from 'rxjs/operators';
import { Character, CharacterFilter, CharacterSearchResult } from 'app/core/models/character.model';

@Injectable({
    providedIn: 'root'
})
export class CharacterFirestoreService {
    private charactersCollection: AngularFirestoreCollection<Character>;
    private readonly COLLECTION_NAME = 'characters';

    constructor(
        private firestore: AngularFirestore,
        private storage: AngularFireStorage
    ) {
        this.charactersCollection = this.firestore.collection<Character>(this.COLLECTION_NAME);
    }

    /**
     * Create a new character
     */
    async createCharacter(character: Omit<Character, 'id'>): Promise<string> {
        try {
            const now = new Date();
            const characterData = {
                ...character,
                fecha_creacion: now,
                fecha_actualizacion: now,
                metadatos: {
                    ...character.metadatos,
                    version: '1.0',
                    popularidad: 0,
                    usos_totales: 0,
                    valoracion_promedio: 0.0
                }
            };

            const docRef = await this.charactersCollection.add(characterData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating character:', error);
            throw new Error('Failed to create character');
        }
    }

    /**
     * Get character by ID
     */
    getCharacter(id: string): Observable<Character | null> {
        return this.charactersCollection.doc(id).valueChanges().pipe(
            map(character => character ? { ...character, id } : null),
            catchError(error => {
                console.error('Error fetching character:', error);
                throw new Error('Failed to fetch character');
            })
        );
    }

    /**
     * Update character
     */
    async updateCharacter(id: string, updates: Partial<Character>): Promise<void> {
        try {
            const updateData = {
                ...updates,
                fecha_actualizacion: new Date()
            };
            
            await this.charactersCollection.doc(id).update(updateData);
        } catch (error) {
            console.error('Error updating character:', error);
            throw new Error('Failed to update character');
        }
    }

    /**
     * Get all characters
     */
    getAllCharacters(): Observable<Character[]> {
        return this.charactersCollection.valueChanges({ idField: 'id' });
    }

    /**
     * Delete character
     */
    deleteCharacter(id: string): Observable<void> {
        return new Observable(observer => {
            this.performDelete(id).then(() => {
                observer.next();
                observer.complete();
            }).catch(error => {
                observer.error(error);
            });
        });
    }

    private async performDelete(id: string): Promise<void> {
        try {
            // First, delete associated images
            const character = await this.getCharacter(id).toPromise();
            if (character?.imagenes.galeria) {
                for (const imagen of character.imagenes.galeria) {
                    await this.deleteImage(imagen.url);
                }
            }
            if (character?.imagenes.avatar_principal) {
                await this.deleteImage(character.imagenes.avatar_principal.url);
            }

            // Then delete the document
            await this.charactersCollection.doc(id).delete();
        } catch (error) {
            console.error('Error deleting character:', error);
            throw new Error('Failed to delete character');
        }
    }

    /**
     * Get characters with pagination and filters
     */
    getCharacters(filter: CharacterFilter = {}, page: number = 1, limit: number = 12): Observable<CharacterSearchResult> {
        let query = this.charactersCollection;

        // For now, we'll apply simple filtering client-side
        return query.valueChanges({ idField: 'id' }).pipe(
            map(characters => {
                let filtered = characters || [];

                // Apply filters
                if (filter.tipo) {
                    filtered = filtered.filter(c => c.tipo === filter.tipo);
                }
                if (filter.activo !== undefined) {
                    filtered = filtered.filter(c => c.activo === filter.activo);
                }
                if (filter.usuario_id) {
                    filtered = filtered.filter(c => c.usuario_id === filter.usuario_id);
                }

                // Apply pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedCharacters = filtered.slice(startIndex, endIndex);

                return {
                    characters: paginatedCharacters,
                    total: filtered.length,
                    page,
                    limit,
                    hasMore: endIndex < filtered.length
                };
            }),
            catchError(error => {
                console.error('Error fetching characters:', error);
                throw new Error('Failed to fetch characters');
            })
        );
    }

    /**
     * Search characters by text
     */
    searchCharacters(searchText: string, filter: CharacterFilter = {}): Observable<Character[]> {
        const normalizedSearch = searchText.toLowerCase().trim();
        
        return this.charactersCollection.valueChanges({ idField: 'id' }).pipe(
            map(characters => {
                if (!normalizedSearch) {
                    return this.applyFilters(characters, filter);
                }

                const filtered = characters.filter(character => 
                    character.nombre.toLowerCase().includes(normalizedSearch) ||
                    character.descripcion.toLowerCase().includes(normalizedSearch) ||
                    character.tipo.toLowerCase().includes(normalizedSearch) ||
                    character.metadatos.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))
                );

                return this.applyFilters(filtered, filter);
            }),
            catchError(error => {
                console.error('Error searching characters:', error);
                throw new Error('Failed to search characters');
            })
        );
    }

    /**
     * Get characters by user ID
     */
    getUserCharacters(userId: string): Observable<Character[]> {
        return this.firestore
            .collection<Character>(this.COLLECTION_NAME, ref => ref.where('usuario_id', '==', userId))
            .valueChanges({ idField: 'id' })
            .pipe(
                catchError(error => {
                    console.error('Error fetching user characters:', error);
                    throw new Error('Failed to fetch user characters');
                })
            );
    }

    /**
     * Upload image to Firebase Storage
     */
    uploadImage(file: File, characterId: string, imageType: string): Observable<string> {
        const filePath = `characters/${characterId}/${imageType}_${Date.now()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        return task.snapshotChanges().pipe(
            finalize(() => fileRef.getDownloadURL()),
            switchMap(() => fileRef.getDownloadURL())
        );
    }

    /**
     * Delete image from Firebase Storage
     */
    async deleteImage(imageUrl: string): Promise<void> {
        try {
            const imageRef = this.storage.storage.refFromURL(imageUrl);
            await imageRef.delete();
        } catch (error) {
            console.warn('Error deleting image:', error);
            // Don't throw error if image doesn't exist
        }
    }

    /**
     * Increment character usage count
     */
    async incrementUsage(characterId: string): Promise<void> {
        try {
            const character = await this.getCharacter(characterId).toPromise();
            if (character) {
                await this.updateCharacter(characterId, {
                    metadatos: {
                        ...character.metadatos,
                        usos_totales: character.metadatos.usos_totales + 1
                    }
                });
            }
        } catch (error) {
            console.error('Error incrementing usage:', error);
        }
    }

    /**
     * Rate character
     */
    async rateCharacter(characterId: string, rating: number): Promise<void> {
        try {
            const character = await this.getCharacter(characterId).toPromise();
            if (character) {
                const currentTotal = character.metadatos.valoracion_promedio * character.metadatos.popularidad;
                const newPopularity = character.metadatos.popularidad + 1;
                const newAverage = (currentTotal + rating) / newPopularity;

                await this.updateCharacter(characterId, {
                    metadatos: {
                        ...character.metadatos,
                        popularidad: newPopularity,
                        valoracion_promedio: Math.round(newAverage * 10) / 10
                    }
                });
            }
        } catch (error) {
            console.error('Error rating character:', error);
            throw new Error('Failed to rate character');
        }
    }

    // Private helper methods


    private applyFilters(characters: Character[], filter: CharacterFilter): Character[] {
        return characters.filter(character => {
            if (filter.tipo && character.tipo !== filter.tipo) return false;
            if (filter.activo !== undefined && character.activo !== filter.activo) return false;
            if (filter.usuario_id && character.usuario_id !== filter.usuario_id) return false;
            if (filter.contexto && character.configuracion.contexto_activo !== filter.contexto) return false;
            
            if (filter.nivel_min && character.estadisticas.nivel < filter.nivel_min) return false;
            if (filter.nivel_max && character.estadisticas.nivel > filter.nivel_max) return false;

            if (filter.tags && filter.tags.length > 0) {
                const hasMatchingTag = filter.tags.some(tag => 
                    character.metadatos.tags.includes(tag)
                );
                if (!hasMatchingTag) return false;
            }

            return true;
        });
    }
}