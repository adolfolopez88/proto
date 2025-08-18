import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GenericCardData, CardAction } from 'app/shared/components/generic-card/generic-card.component';
import { MOCK_CHARACTERS, CHARACTER_UNIVERSES } from 'app/shared/data/mock-characters';

@Component({
    selector: 'app-characters',
    templateUrl: './characters.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharactersComponent implements OnInit {
    // Data
    allCharacters: GenericCardData[] = MOCK_CHARACTERS;
    filteredCharacters: GenericCardData[] = [];
    universes: string[] = CHARACTER_UNIVERSES;
    favorites: Set<string | number> = new Set();
    
    // Filters
    searchTerm: string = '';
    selectedUniverse: string = 'All';
    selectedAlignment: string = '';
    sortBy: string = 'name';
    
    // Computed
    get totalCharacters(): number {
        return this.allCharacters.length;
    }

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.applyFilters();
    }

    applyFilters(): void {
        let filtered = [...this.allCharacters];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(character => 
                character.title.toLowerCase().includes(term) ||
                character.subtitle?.toLowerCase().includes(term) ||
                character.description?.toLowerCase().includes(term) ||
                (character as any).universe?.toLowerCase().includes(term) ||
                character.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Apply universe filter
        if (this.selectedUniverse !== 'All') {
            filtered = filtered.filter(character => 
                (character as any).universe === this.selectedUniverse
            );
        }

        // Apply alignment filter
        if (this.selectedAlignment) {
            filtered = filtered.filter(character => 
                (character as any).alignment === this.selectedAlignment
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'universe':
                    return ((a as any).universe || '').localeCompare((b as any).universe || '');
                case 'rating':
                    return (b.meta?.rating || 0) - (a.meta?.rating || 0);
                default:
                    return 0;
            }
        });

        this.filteredCharacters = filtered;
    }

    onSearchChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    onFilterChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    onSortChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    resetFilters(): void {
        this.searchTerm = '';
        this.selectedUniverse = 'All';
        this.selectedAlignment = '';
        this.sortBy = 'name';
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    hasActiveFilters(): boolean {
        return this.searchTerm.trim() !== '' ||
               this.selectedUniverse !== 'All' ||
               this.selectedAlignment !== '' ||
               this.sortBy !== 'name';
    }

    onCharacterClick(character: GenericCardData): void {
        this._snackBar.open(`Viewing ${character.title}`, 'Close', { duration: 2000 });
    }

    onFavoriteToggle(character: GenericCardData): void {
        if (this.favorites.has(character.id)) {
            this.favorites.delete(character.id);
            this._snackBar.open(`Removed ${character.title} from favorites`, 'Close', { duration: 2000 });
        } else {
            this.favorites.add(character.id);
            this._snackBar.open(`Added ${character.title} to favorites`, 'Close', { duration: 2000 });
        }
        this._changeDetectorRef.markForCheck();
    }

    onCharacterAction(event: {data: GenericCardData, action: CardAction}): void {
        const { data: character, action } = event;
        this._snackBar.open(`${action.label}: ${character.title}`, 'Close', { duration: 2000 });
    }

    getFavoriteIcon(character: GenericCardData): string {
        return this.isFavorite(character) ? 'favorite' : 'favorite_border';
    }

    getFavoriteLabel(character: GenericCardData): string {
        return this.isFavorite(character) ? 'Remove from favorites' : 'Add to favorites';
    }

    isFavorite(character: GenericCardData): boolean {
        return this.favorites.has(character.id);
    }

    getCharacterActions(character: GenericCardData): CardAction[] {
        return [
            { id: 'profile', label: 'View Profile', icon: 'person', primary: true },
            { id: 'compare', label: 'Compare', icon: 'compare' }
        ];
    }

    trackByCharacter(index: number, character: GenericCardData): string | number {
        return character.id;
    }
}