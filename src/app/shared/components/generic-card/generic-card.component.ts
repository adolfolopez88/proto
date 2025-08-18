import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

export interface GenericCardData {
    id: string | number;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    price?: number;
    badge?: {
        text: string;
        type: 'success' | 'warning' | 'error' | 'info' | 'primary';
    };
    meta?: {
        author?: string;
        date?: Date | string;
        rating?: number;
        views?: number;
    };
    tags?: string[];
    [key: string]: any;
}

export interface CardAction {
    id: string;
    label: string;
    icon?: string;
    color?: 'primary' | 'accent' | 'warn';
    primary?: boolean;
    disabled?: boolean;
}

export type CardVariant = 'default' | 'compact' | 'featured' | 'minimal';
export type CardTheme = 'light' | 'dark' | 'colored';

@Component({
    selector: 'app-generic-card',
    templateUrl: './generic-card.component.html',
    styleUrls: ['./generic-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericCardComponent {
    @Input() data!: GenericCardData;
    @Input() variant: CardVariant = 'default';
    @Input() theme: CardTheme = 'light';
    @Input() clickable: boolean = true;
    @Input() loading: boolean = false;
    
    // Action Button Configuration
    @Input() showActionButton: boolean = false;
    @Input() actionIcon: string = 'favorite';
    @Input() actionLabel: string = 'Add to favorites';
    @Input() actionColor: 'primary' | 'accent' | 'warn' = 'primary';
    
    // Footer Actions
    @Input() showFooterActions: boolean = false;
    @Input() footerActions: CardAction[] = [];
    
    // Events
    @Output() cardClick = new EventEmitter<GenericCardData>();
    @Output() actionClick = new EventEmitter<GenericCardData>();
    @Output() footerActionClick = new EventEmitter<{data: GenericCardData, action: CardAction}>();

    /**
     * Handle card click event
     */
    onCardClick(): void {
        if (this.clickable && !this.loading) {
            this.cardClick.emit(this.data);
        }
    }

    /**
     * Handle action button click
     */
    onActionClick(event: Event): void {
        event.stopPropagation();
        this.actionClick.emit(this.data);
    }

    /**
     * Handle footer action click
     */
    onFooterActionClick(event: Event, action: CardAction): void {
        event.stopPropagation();
        if (!action.disabled) {
            this.footerActionClick.emit({ data: this.data, action });
        }
    }

    /**
     * Get card CSS classes based on variant and theme
     */
    getCardClasses(): string {
        const classes = ['bg-white', 'dark:bg-gray-800'];
        
        switch (this.variant) {
            case 'compact':
                classes.push('max-w-sm');
                break;
            case 'featured':
                classes.push('ring-2', 'ring-primary-500', 'ring-opacity-20');
                break;
            case 'minimal':
                classes.push('shadow-sm', 'border', 'border-gray-200', 'dark:border-gray-700');
                break;
        }
        
        switch (this.theme) {
            case 'dark':
                classes.push('bg-gray-900', 'text-white');
                break;
            case 'colored':
                classes.push('bg-gradient-to-br', 'from-primary-50', 'to-primary-100', 'dark:from-primary-900', 'dark:to-primary-800');
                break;
        }
        
        if (this.clickable) {
            classes.push('cursor-pointer', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
        }
        
        return classes.join(' ');
    }

    /**
     * Get badge CSS classes based on type
     */
    getBadgeClasses(type: string): string {
        const baseClasses = ['px-3', 'py-1', 'text-xs', 'font-semibold', 'rounded-full'];
        
        switch (type) {
            case 'success':
                return [...baseClasses, 'bg-green-500', 'text-white'].join(' ');
            case 'warning':
                return [...baseClasses, 'bg-yellow-500', 'text-white'].join(' ');
            case 'error':
                return [...baseClasses, 'bg-red-500', 'text-white'].join(' ');
            case 'info':
                return [...baseClasses, 'bg-blue-500', 'text-white'].join(' ');
            case 'primary':
                return [...baseClasses, 'bg-primary-500', 'text-white'].join(' ');
            default:
                return [...baseClasses, 'bg-gray-500', 'text-white'].join(' ');
        }
    }

    /**
     * TrackBy function for tags
     */
    trackByTag(index: number, tag: string): string {
        return tag;
    }

    /**
     * TrackBy function for actions
     */
    trackByAction(index: number, action: CardAction): string {
        return action.id;
    }
}