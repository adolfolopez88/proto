import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-character-detail',
    template: `
        <div class="p-6">
            <div class="mb-6">
                <button mat-button color="primary" (click)="goBack()">
                    <mat-icon class="mr-2">arrow_back</mat-icon>
                    Volver a la lista
                </button>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div class="flex items-center mb-4">
                    <mat-icon class="text-blue-600 dark:text-blue-400 mr-3">construction</mat-icon>
                    <h2 class="text-xl font-semibold text-blue-900 dark:text-blue-100">
                        Vista de Detalle - En Desarrollo
                    </h2>
                </div>
                <p class="text-blue-800 dark:text-blue-200 mb-4">
                    Esta vista mostrará todos los detalles del personaje incluyendo:
                </p>
                <ul class="list-disc pl-5 text-blue-800 dark:text-blue-200 space-y-2">
                    <li>Información completa del personaje</li>
                    <li>Galería de imágenes interactiva</li>
                    <li>Estadísticas y atributos detallados</li>
                    <li>Historial de interacciones</li>
                    <li>Opciones de edición y compartir</li>
                </ul>
                <div class="mt-4 text-sm text-blue-700 dark:text-blue-300">
                    <strong>ID del personaje:</strong> {{ characterId }}
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterDetailComponent implements OnInit {
    characterId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.characterId = this.route.snapshot.paramMap.get('id');
    }

    goBack(): void {
        this.router.navigate(['/cards/characters']);
    }
}