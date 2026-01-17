import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GenericCardData } from 'app/shared/components/generic-card/generic-card.component';
import { MOCK_PRODUCTS } from 'app/shared/data/mock-products';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit, OnDestroy {
    product: GenericCardData | null = null;
    relatedProducts: GenericCardData[] = [];
    loading = false;
    selectedTab = 0;
    isFavorite = false;
    
    private _unsubscribeAll = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.route.paramMap
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(params => {
                const id = params.get('id');
                if (id) {
                    this.loadProduct(parseInt(id));
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    private loadProduct(id: number): void {
        this.loading = true;
        this.changeDetectorRef.markForCheck();

        // Simulate API call
        setTimeout(() => {
            this.product = MOCK_PRODUCTS.find(p => p.id === id) || null;
            if (this.product) {
                this.loadRelatedProducts();
            }
            this.loading = false;
            this.changeDetectorRef.markForCheck();
        }, 500);
    }

    private loadRelatedProducts(): void {
        if (!this.product) return;
        
        // Get products from the same category, excluding current product
        this.relatedProducts = MOCK_PRODUCTS
            .filter(p => 
                p.id !== this.product!.id && 
                (p as any).category === (this.product as any).category
            )
            .slice(0, 4);
    }

    onFavoriteToggle(): void {
        this.isFavorite = !this.isFavorite;
        const message = this.isFavorite ? 
            `Added ${this.product?.title} to favorites` : 
            `Removed ${this.product?.title} from favorites`;
        
        this.snackBar.open(message, 'Close', { duration: 2000 });
        this.changeDetectorRef.markForCheck();
    }

    onAddToCart(): void {
        this.snackBar.open(`Added ${this.product?.title} to cart`, 'Close', {
            duration: 2000
        });
    }

    onSubscribe(): void {
        this.snackBar.open(`Subscribed to ${this.product?.title}`, 'Close', {
            duration: 2000
        });
    }

    onTryFree(): void {
        this.snackBar.open(`Starting free trial for ${this.product?.title}`, 'Close', {
            duration: 3000
        });
    }

    onShare(): void {
        if (navigator.share) {
            navigator.share({
                title: this.product?.title,
                text: this.product?.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.snackBar.open('Link copied to clipboard', 'Close', {
                duration: 2000
            });
        }
    }

    onRelatedProductClick(product: GenericCardData): void {
        this.router.navigate(['../detail', product.id], { relativeTo: this.route });
    }

    getAiTypeIcon(aiType: string): string {
        switch (aiType) {
            case 'conversational': return 'chat';
            case 'image-generation': return 'image';
            case 'code-assistant': return 'code';
            case 'audio-processing': return 'audiotrack';
            case 'orchestration': return 'hub';
            case 'data-analysis': return 'analytics';
            default: return 'smart_toy';
        }
    }

    getAiTypeDescription(aiType: string): string {
        switch (aiType) {
            case 'conversational': return 'Agente conversacional inteligente';
            case 'image-generation': return 'Generador de imágenes por IA';
            case 'code-assistant': return 'Asistente de programación';
            case 'audio-processing': return 'Procesamiento de audio/voz';
            case 'orchestration': return 'Orchestación de múltiples agentes';
            case 'data-analysis': return 'Análisis avanzado de datos';
            default: return 'Agente de inteligencia artificial';
        }
    }

    getRatingStars(rating: number): number[] {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(1);
        }
        
        if (hasHalfStar) {
            stars.push(0.5);
        }
        
        while (stars.length < 5) {
            stars.push(0);
        }
        
        return stars;
    }

    getPriceWithDiscount(): number {
        if (!this.product?.price) return 0;
        const discount = (this.product as any).discount || 0;
        return this.product.price - (this.product.price * discount / 100);
    }

    hasDiscount(): boolean {
        return Boolean((this.product as any)?.discount);
    }

    getDiscountAmount(): number {
        return (this.product as any)?.discount || 0;
    }

    onBackToProducts(): void {
        this.router.navigate(['/cards/products']);
    }
}