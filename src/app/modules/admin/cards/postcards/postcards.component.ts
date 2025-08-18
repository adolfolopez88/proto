import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GenericCardData, CardAction } from 'app/shared/components/generic-card/generic-card.component';
import { MOCK_POSTCARDS, POSTCARD_CATEGORIES } from 'app/shared/data/mock-postcards';

@Component({
    selector: 'app-postcards',
    templateUrl: './postcards.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostcardsComponent implements OnInit {
    // Data
    allPostcards: GenericCardData[] = MOCK_POSTCARDS;
    filteredPostcards: GenericCardData[] = [];
    categories: string[] = POSTCARD_CATEGORIES;
    favorites: Set<string | number> = new Set();
    
    // Filters
    searchTerm: string = '';
    selectedCategory: string = 'All';
    sortBy: string = 'title';
    
    // Computed
    get totalPostcards(): number {
        return this.allPostcards.length;
    }

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.applyFilters();
    }

    applyFilters(): void {
        let filtered = [...this.allPostcards];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(postcard => 
                postcard.title.toLowerCase().includes(term) ||
                postcard.subtitle?.toLowerCase().includes(term) ||
                postcard.description?.toLowerCase().includes(term) ||
                (postcard as any).location?.toLowerCase().includes(term) ||
                postcard.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Apply category filter
        if (this.selectedCategory !== 'All') {
            filtered = filtered.filter(postcard => 
                postcard.tags?.includes(this.selectedCategory)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'location':
                    return ((a as any).location || '').localeCompare((b as any).location || '');
                case 'rating':
                    return (b.meta?.rating || 0) - (a.meta?.rating || 0);
                case 'date':
                    const dateA = new Date(a.meta?.date || 0);
                    const dateB = new Date(b.meta?.date || 0);
                    return dateB.getTime() - dateA.getTime();
                default:
                    return 0;
            }
        });

        this.filteredPostcards = filtered;
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
        this.selectedCategory = 'All';
        this.sortBy = 'title';
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    hasActiveFilters(): boolean {
        return this.searchTerm.trim() !== '' ||
               this.selectedCategory !== 'All' ||
               this.sortBy !== 'title';
    }

    onPostcardClick(postcard: GenericCardData): void {
        this._snackBar.open(`Viewing ${postcard.title}`, 'Close', { duration: 2000 });
    }

    onFavoriteToggle(postcard: GenericCardData): void {
        if (this.favorites.has(postcard.id)) {
            this.favorites.delete(postcard.id);
            this._snackBar.open(`Removed ${postcard.title} from favorites`, 'Close', { duration: 2000 });
        } else {
            this.favorites.add(postcard.id);
            this._snackBar.open(`Added ${postcard.title} to favorites`, 'Close', { duration: 2000 });
        }
        this._changeDetectorRef.markForCheck();
    }

    onPostcardAction(event: {data: GenericCardData, action: CardAction}): void {
        const { data: postcard, action } = event;
        this._snackBar.open(`${action.label}: ${postcard.title}`, 'Close', { duration: 2000 });
    }

    getFavoriteIcon(postcard: GenericCardData): string {
        return this.isFavorite(postcard) ? 'favorite' : 'favorite_border';
    }

    getFavoriteLabel(postcard: GenericCardData): string {
        return this.isFavorite(postcard) ? 'Remove from favorites' : 'Add to favorites';
    }

    isFavorite(postcard: GenericCardData): boolean {
        return this.favorites.has(postcard.id);
    }

    getPostcardActions(): CardAction[] {
        return [
            { id: 'download', label: 'Download', icon: 'download', primary: true },
            { id: 'share', label: 'Share', icon: 'share' }
        ];
    }

    trackByPostcard(index: number, postcard: GenericCardData): string | number {
        return postcard.id;
    }
}