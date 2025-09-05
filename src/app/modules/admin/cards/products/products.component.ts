import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatSliderChange } from '@angular/material/slider';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GenericCardData, CardAction } from 'app/shared/components/generic-card/generic-card.component';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from 'app/shared/data/mock-products';

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsComponent implements OnInit {
    // Data
    allProducts: GenericCardData[] = MOCK_PRODUCTS;
    filteredProducts: GenericCardData[] = [];
    categories: string[] = PRODUCT_CATEGORIES;
    favorites: Set<string | number> = new Set();
    
    // UI State
    viewMode: 'grid' | 'list' = 'grid';
    loading: boolean = false;
    
    // Filters
    searchTerm: string = '';
    selectedCategory: string = 'All';
    priceRange: number = 5000;
    sortBy: string = 'name';
    
    // Computed
    get totalProducts(): number {
        return this.allProducts.length;
    }

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _snackBar: MatSnackBar,
        private _router: Router
    ) {}

    ngOnInit(): void {
        this.loadProducts();
    }

    /**
     * Load and filter products
     */
    loadProducts(): void {
        this.loading = true;
        this._changeDetectorRef.markForCheck();

        // Simulate API call
        setTimeout(() => {
            this.applyFilters();
            this.loading = false;
            this._changeDetectorRef.markForCheck();
        }, 500);
    }

    /**
     * Apply all active filters
     */
    applyFilters(): void {
        let filtered = [...this.allProducts];

        // Apply search filter
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(product => 
                product.title.toLowerCase().includes(term) ||
                product.subtitle?.toLowerCase().includes(term) ||
                product.description?.toLowerCase().includes(term) ||
                product.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Apply category filter
        if (this.selectedCategory !== 'All') {
            filtered = filtered.filter(product => 
                (product as any).category === this.selectedCategory
            );
        }

        // Apply price filter
        filtered = filtered.filter(product => 
            (product.price || 0) <= this.priceRange
        );

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'price':
                    return (a.price || 0) - (b.price || 0);
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

        this.filteredProducts = filtered;
    }

    /**
     * Handle view mode change
     */
    onViewModeChange(event: MatButtonToggleChange): void {
        this.viewMode = event.value;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle search change
     */
    onSearchChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle filter change
     */
    onFilterChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle price range change
     */
    onPriceRangeChange(event: MatSliderChange): void {
        this.priceRange = event.value || 5000;
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle sort change
     */
    onSortChange(): void {
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Reset all filters
     */
    resetFilters(): void {
        this.searchTerm = '';
        this.selectedCategory = 'All';
        this.priceRange = 5000;
        this.sortBy = 'name';
        this.applyFilters();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Check if there are active filters
     */
    hasActiveFilters(): boolean {
        return this.searchTerm.trim() !== '' ||
               this.selectedCategory !== 'All' ||
               this.priceRange < 5000 ||
               this.sortBy !== 'name';
    }

    /**
     * Handle product click - Navigate to detail view
     
    onProductClick(product: GenericCardData): void {
        this._router.navigate(['/admin/cards/products/detail', product.id]);
    }*/

    /**
     * Handle favorite toggle
     */
    onFavoriteToggle(product: GenericCardData): void {
        if (this.favorites.has(product.id)) {
            this.favorites.delete(product.id);
            this._snackBar.open(`Removed ${product.title} from favorites`, 'Close', {
                duration: 2000
            });
        } else {
            this.favorites.add(product.id);
            this._snackBar.open(`Added ${product.title} to favorites`, 'Close', {
                duration: 2000
            });
        }
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle product action
     */
    onProductAction(event: {data: GenericCardData, action: CardAction}): void {
        const { data: product, action } = event;
        
        switch (action.id) {
            case 'detail':
                console.log(product.id);
                this._router.navigateByUrl(`/cards/products/detail/${product.id}`);
                break;
            case 'compare':
                this._snackBar.open(`Added ${product.title} to comparison`, 'Close', {
                    duration: 2000
                });
                break;
            case 'share':
                this._snackBar.open(`Sharing ${product.title}`, 'Close', {
                    duration: 2000
                });
                break;
        }
        
        console.log('Product action:', action.id, product);
    }

    /**
     * Handle add product
     */
    onAddProduct(): void {
        this._snackBar.open('Add product feature coming soon!', 'Close', {
            duration: 2000
        });
    }

    /**
     * Get favorite icon for product
     */
    getFavoriteIcon(product: GenericCardData): string {
        return this.isFavorite(product) ? 'favorite' : 'favorite_border';
    }

    /**
     * Get favorite label for product
     */
    getFavoriteLabel(product: GenericCardData): string {
        return this.isFavorite(product) ? 'Remove from favorites' : 'Add to favorites';
    }

    /**
     * Check if product is favorite
     */
    isFavorite(product: GenericCardData): boolean {
        return this.favorites.has(product.id);
    }

    /**
     * Get product actions
     */
    getProductActions(product: GenericCardData): CardAction[] {
        const actions: CardAction[] = [
            {
                id: 'detail',
                label: 'Detalle',
                icon: 'info',
                color: 'primary',
                primary: true,
                disabled: false
            }
        ];

        if ((product as any).inStock) {
            actions.push({
                id: 'compare',
                label: 'Compare',
                icon: 'compare_arrows'
            });
        }

        actions.push({
            id: 'share',
            label: 'Share',
            icon: 'share'
        });

        return actions;
    }

    /**
     * Track by function for products
     */
    trackByProduct(index: number, product: GenericCardData): string | number {
        return product.id;
    }
}
