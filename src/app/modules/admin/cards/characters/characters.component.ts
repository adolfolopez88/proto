import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Character, CharacterType, CharacterContext } from 'app/core/models/character.model';
import { CharacterFirestoreService } from './services/character-firestore.service';
import { CharacterCardAction } from './character-card/character-card.component';

@Component({
    selector: 'app-characters',
    templateUrl: './characters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharactersComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private searchSubject = new Subject<string>();

    // Data
    allCharacters: Character[] = [];
    filteredCharacters: Character[] = [];
    favorites: Set<string> = new Set();
    isLoading: boolean = false;
    
    // Filter options
    characterTypes: CharacterType[] = ['persona', 'objeto', 'criatura', 'entidad'];
    characterContexts: CharacterContext[] = ['fantasy', 'modern', 'sci-fi', 'historical'];
    
    // Filters
    searchTerm: string = '';
    selectedTypes: CharacterType[] = [];
    selectedContexts: CharacterContext[] = [];
    selectedStatus: string = 'all';
    minRating: number = 0;
    maxRating: number = 5;
    sortBy: string = 'nombre';
    sortOrder: 'asc' | 'desc' = 'asc';
    
    // Computed
    get totalCharacters(): number {
        return this.allCharacters.length;
    }

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        private _router: Router,
        private _characterService: CharacterFirestoreService
    ) {}

    ngOnInit(): void {
        // Initialize search debounce
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {
            this.applyFilters();
            this._changeDetectorRef.markForCheck();
        });

        this.loadCharacters();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    loadCharacters(): void {
        this.isLoading = true;
        this._changeDetectorRef.markForCheck();

        this._characterService.getAllCharacters()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (characters) => {
                    this.allCharacters = characters;
                    this.applyFilters();
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    console.error('Error loading characters:', error);
                    this._snackBar.open('Error loading characters', 'Close', { duration: 3000 });
                    this.isLoading = false;
                    this._changeDetectorRef.markForCheck();
                }
            });
    }

    applyFilters(): void {
        let filtered = [...this.allCharacters];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(character => 
                character.nombre.toLowerCase().includes(term) ||
                character.descripcion.toLowerCase().includes(term) ||
                character.atributos_persona?.habilidades?.some(h => h.toLowerCase().includes(term)) ||
                character.atributos_persona?.personalidad?.some(p => p.toLowerCase().includes(term)) ||
                character.capacidades_interpretacion.personalidad_base.motivaciones?.some(m => m.toLowerCase().includes(term))
            );
        }

        // Apply type filter
        if (this.selectedTypes.length > 0) {
            filtered = filtered.filter(character => 
                this.selectedTypes.includes(character.tipo)
            );
        }

        // Apply context filter
        if (this.selectedContexts.length > 0) {
            filtered = filtered.filter(character => 
                this.selectedContexts.includes(character.configuracion.contexto_activo)
            );
        }

        // Apply status filter
        if (this.selectedStatus !== 'all') {
            const isActive = this.selectedStatus === 'active';
            filtered = filtered.filter(character => character.activo === isActive);
        }

        // Apply rating filter
        filtered = filtered.filter(character => {
            const rating = character.metadatos.valoracion_promedio;
            return rating >= this.minRating && rating <= this.maxRating;
        });

        // Apply sorting
        filtered.sort((a, b) => {
            let result = 0;
            switch (this.sortBy) {
                case 'nombre':
                    result = a.nombre.localeCompare(b.nombre);
                    break;
                case 'tipo':
                    result = a.tipo.localeCompare(b.tipo);
                    break;
                case 'rating':
                    result = a.metadatos.valoracion_promedio - b.metadatos.valoracion_promedio;
                    break;
                case 'fecha_creacion':
                    result = new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime();
                    break;
                default:
                    return 0;
            }
            return this.sortOrder === 'desc' ? -result : result;
        });

        this.filteredCharacters = filtered;
    }

    onSearchChange(): void {
        this.searchSubject.next(this.searchTerm);
    }

    onFilterChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    onSortChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    onTypeSelectionChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    onContextSelectionChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    resetFilters(): void {
        this.searchTerm = '';
        this.selectedTypes = [];
        this.selectedContexts = [];
        this.selectedStatus = 'all';
        this.minRating = 0;
        this.maxRating = 5;
        this.sortBy = 'nombre';
        this.sortOrder = 'asc';
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    hasActiveFilters(): boolean {
        return this.searchTerm.trim() !== '' ||
               this.selectedTypes.length > 0 ||
               this.selectedContexts.length > 0 ||
               this.selectedStatus !== 'all' ||
               this.minRating > 0 ||
               this.maxRating < 5 ||
               this.sortBy !== 'nombre' ||
               this.sortOrder !== 'asc';
    }

    onCharacterClick(character: Character): void {
        this._router.navigate(['/characters/detail', character.id]);
    }

    onCharacterAction(action: CharacterCardAction): void {
        const { character, type } = action;
        
        switch (type) {
            case 'view':
                this._router.navigate(['/characters/detail', character.id]);
                break;
            case 'edit':
                this._router.navigate(['/characters/edit', character.id]);
                break;
            case 'delete':
                this.deleteCharacter(character);
                break;
            case 'favorite':
                this.toggleFavorite(character);
                break;
            case 'rate':
                this._snackBar.open(`Rating feature coming soon for ${character.nombre}`, 'Close', { duration: 2000 });
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    toggleFavorite(character: Character): void {
        if (this.favorites.has(character.id!)) {
            this.favorites.delete(character.id!);
            this._snackBar.open(`Removed ${character.nombre} from favorites`, 'Close', { duration: 2000 });
        } else {
            this.favorites.add(character.id!);
            this._snackBar.open(`Added ${character.nombre} to favorites`, 'Close', { duration: 2000 });
        }
        this._changeDetectorRef.markForCheck();
    }

    deleteCharacter(character: Character): void {
        if (confirm(`Are you sure you want to delete ${character.nombre}?`)) {
            this._characterService.deleteCharacter(character.id!)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe({
                    next: () => {
                        this._snackBar.open(`${character.nombre} deleted successfully`, 'Close', { duration: 2000 });
                        this.loadCharacters(); // Reload the list
                    },
                    error: (error) => {
                        console.error('Error deleting character:', error);
                        this._snackBar.open('Error deleting character', 'Close', { duration: 3000 });
                    }
                });
        }
    }

    isFavorite(character: Character): boolean {
        return this.favorites.has(character.id || '');
    }

    createNewCharacter(): void {
        this._router.navigate(['/characters/create']);
    }

    getTypeLabel(type: CharacterType): string {
        const labels = {
            'persona': 'Persona',
            'objeto': 'Objeto',
            'criatura': 'Criatura',
            'entidad': 'Entidad'
        };
        return labels[type] || type;
    }

    getContextLabel(context: CharacterContext): string {
        const labels = {
            'fantasy': 'Fantasía',
            'modern': 'Moderno',
            'sci-fi': 'Ciencia Ficción',
            'historical': 'Histórico'
        };
        return labels[context] || context;
    }

    trackByCharacter(index: number, character: Character): string {
        return character.id || index.toString();
    }

    // Template helper methods
    shouldShowFiltersMessage(): boolean {
        return this.hasActiveFilters();
    }

    shouldShowCreateMessage(): boolean {
        return !this.hasActiveFilters() && this.totalCharacters === 0;
    }

    shouldShowResetButton(): boolean {
        return this.hasActiveFilters();
    }

    shouldShowCreateButton(): boolean {
        return !this.hasActiveFilters() && this.totalCharacters === 0;
    }

    // Chip removal methods
    removeSearchFilter(): void {
        this.searchTerm = '';
        this.onSearchChange();
    }

    removeTypeFilter(type: CharacterType): void {
        this.selectedTypes = this.selectedTypes.filter(t => t !== type);
        this.onTypeSelectionChange();
    }

    removeContextFilter(context: CharacterContext): void {
        this.selectedContexts = this.selectedContexts.filter(c => c !== context);
        this.onContextSelectionChange();
    }

    removeStatusFilter(): void {
        this.selectedStatus = 'all';
        this.onFilterChange();
    }

    removeRatingFilter(): void {
        this.minRating = 0;
        this.onFilterChange();
    }
}