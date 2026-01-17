import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Character } from 'app/core/models/character.model';

export interface CharacterCardAction {
    id: string;
    character: Character;
    type: 'view' | 'edit' | 'delete' | 'rate' | 'favorite';
}

@Component({
    selector: 'app-character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterCardComponent {
    @Input() character!: Character;
    @Input() showActions = true;
    @Input() showStats = true;
    @Input() compact = false;
    @Input() favoriteCharacters: Set<string> = new Set();

    @Output() cardClick = new EventEmitter<Character>();
    @Output() actionClick = new EventEmitter<CharacterCardAction>();

    /**
     * Handle card click
     */
    onCardClick(event: Event): void {
        // Prevent event if clicking on action buttons
        const target = event.target as HTMLElement;
        if (target.closest('.character-actions, .stats-section')) {
            return;
        }

        this.cardClick.emit(this.character);
    }

    /**
     * Handle action clicks
     */
    onViewDetails(event: Event): void {
        event.stopPropagation();
        this.actionClick.emit({
            id: 'view',
            character: this.character,
            type: 'view'
        });
    }

    onEditCharacter(event: Event): void {
        event.stopPropagation();
        this.actionClick.emit({
            id: 'edit',
            character: this.character,
            type: 'edit'
        });
    }

    onDeleteCharacter(event: Event): void {
        event.stopPropagation();
        this.actionClick.emit({
            id: 'delete',
            character: this.character,
            type: 'delete'
        });
    }

    onToggleFavorite(event: Event): void {
        event.stopPropagation();
        this.actionClick.emit({
            id: 'favorite',
            character: this.character,
            type: 'favorite'
        });
    }

    onRateCharacter(event: Event, rating: number): void {
        event.stopPropagation();
        this.actionClick.emit({
            id: `rate_${rating}`,
            character: this.character,
            type: 'rate'
        });
    }

    /**
     * Get character type icon
     */
    getTypeIcon(): string {
        switch (this.character.tipo) {
            case 'persona':
                return 'person';
            case 'objeto':
                return 'category';
            case 'criatura':
                return 'pets';
            case 'entidad':
                return 'psychology';
            default:
                return 'help';
        }
    }

    /**
     * Get character type label
     */
    getTypeLabel(): string {
        switch (this.character.tipo) {
            case 'persona':
                return 'Persona';
            case 'objeto':
                return 'Objeto';
            case 'criatura':
                return 'Criatura';
            case 'entidad':
                return 'Entidad';
            default:
                return 'Desconocido';
        }
    }

    /**
     * Get context icon
     */
    getContextIcon(): string {
        switch (this.character.configuracion.contexto_activo) {
            case 'fantasy':
                return 'castle';
            case 'modern':
                return 'location_city';
            case 'sci-fi':
                return 'rocket_launch';
            case 'historical':
                return 'account_balance';
            default:
                return 'world';
        }
    }

    /**
     * Get context label
     */
    getContextLabel(): string {
        switch (this.character.configuracion.contexto_activo) {
            case 'fantasy':
                return 'Fantasía';
            case 'modern':
                return 'Moderno';
            case 'sci-fi':
                return 'Ciencia Ficción';
            case 'historical':
                return 'Histórico';
            default:
                return 'Otro';
        }
    }

    /**
     * Get avatar image URL
     */
    getAvatarUrl(): string {
        if (this.character.imagenes.avatar_principal?.url && this.character.imagenes.avatar_principal.activa) {
            return this.character.imagenes.avatar_principal.url;
        }

        // Fallback to first gallery image
        const firstImage = this.character.imagenes.galeria.find(img => img.activa);
        if (firstImage) {
            return firstImage.url;
        }

        // Default placeholder based on type
        return this.getDefaultAvatarUrl();
    }

    /**
     * Get default avatar URL based on character type
     */
    getDefaultAvatarUrl(): string {
        switch (this.character.tipo) {
            case 'persona':
                return 'assets/images/avatars/default-person.svg';
            case 'objeto':
                return 'assets/images/avatars/default-object.svg';
            case 'criatura':
                return 'assets/images/avatars/default-creature.svg';
            case 'entidad':
                return 'assets/images/avatars/default-entity.svg';
            default:
                return 'assets/images/avatars/default.svg';
        }
    }

    /**
     * Get character age for persona type
     */
    getCharacterAge(): number | null {
        return this.character.atributos_persona?.edad || null;
    }

    /**
     * Get character occupation for persona type
     */
    getCharacterOccupation(): string {
        return this.character.atributos_persona?.ocupacion || '';
    }

    /**
     * Get object category for object type
     */
    getObjectCategory(): string {
        return this.character.atributos_objeto?.categoria || '';
    }

    /**
     * Get truncated description
     */
    getTruncatedDescription(maxLength: number = 120): string {
        if (this.character.descripcion.length <= maxLength) {
            return this.character.descripcion;
        }
        return this.character.descripcion.substring(0, maxLength).trim() + '...';
    }

    /**
     * Get rating stars array for display
     */
    getRatingStars(): number[] {
        const rating = this.character.metadatos.valoracion_promedio;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars: number[] = [];

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

    /**
     * Check if character is favorite
     */
    isFavorite(): boolean {
        return this.favoriteCharacters.has(this.character.id || '');
    }

    /**
     * Get dominant stat for quick display
     */
    getDominantStat(): { name: string; value: number; icon: string } {
        const stats = this.character.estadisticas.atributos_numericos;
        let maxStat = { name: '', value: 0, icon: '' };

        Object.entries(stats).forEach(([key, value]) => {
            if (value > maxStat.value) {
                maxStat = {
                    name: this.getStatLabel(key),
                    value,
                    icon: this.getStatIcon(key)
                };
            }
        });

        return maxStat;
    }

    private getStatLabel(stat: string): string {
        const labels: { [key: string]: string } = {
            fuerza: 'Fuerza',
            destreza: 'Destreza',
            inteligencia: 'Inteligencia',
            carisma: 'Carisma',
            resistencia: 'Resistencia',
            percepcion: 'Percepción'
        };
        return labels[stat] || stat;
    }

    private getStatIcon(stat: string): string {
        const icons: { [key: string]: string } = {
            fuerza: 'fitness_center',
            destreza: 'speed',
            inteligencia: 'psychology',
            carisma: 'favorite',
            resistencia: 'shield',
            percepcion: 'visibility'
        };
        return icons[stat] || 'help';
    }

    /**
     * Format last updated date
     */
    getFormattedLastUpdate(): string {
        if (!this.character.fecha_actualizacion) return '';

        const now = new Date();
        const updateDate = new Date(this.character.fecha_actualizacion);
        const diffInHours = Math.abs(now.getTime() - updateDate.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Hace unos minutos';
        } else if (diffInHours < 24) {
            return `Hace ${Math.floor(diffInHours)} horas`;
        } else if (diffInHours < 168) { // 7 days
            return `Hace ${Math.floor(diffInHours / 24)} días`;
        } else {
            return updateDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }

    /**
     * Track by function for stars
     */
    trackByStar(index: number, _star: number): number {
        return index;
    }
}