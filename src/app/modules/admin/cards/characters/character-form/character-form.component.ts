import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-character-form',
    template: `
        <div class="p-6">
            <div class="mb-6">
                <button mat-button color="primary" (click)="goBack()">
                    <mat-icon class="mr-2">arrow_back</mat-icon>
                    Volver a la lista
                </button>
            </div>
            
            <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div class="flex items-center mb-4">
                    <mat-icon class="text-green-600 dark:text-green-400 mr-3">edit_note</mat-icon>
                    <h2 class="text-xl font-semibold text-green-900 dark:text-green-100">
                        {{ isEditMode ? 'Editar' : 'Crear' }} Personaje - En Desarrollo
                    </h2>
                </div>
                <p class="text-green-800 dark:text-green-200 mb-4">
                    Este formulario permitirá {{ isEditMode ? 'editar' : 'crear' }} personajes con:
                </p>
                <ul class="list-disc pl-5 text-green-800 dark:text-green-200 space-y-2">
                    <li>Formulario dinámico según tipo de personaje</li>
                    <li>Validaciones inteligentes</li>
                    <li>Upload de imágenes con preview</li>
                    <li>Editor de atributos numéricos con sliders</li>
                    <li>Configuración avanzada de personalidad</li>
                </ul>
                <div class="mt-4 text-sm text-green-700 dark:text-green-300" *ngIf="isEditMode">
                    <strong>ID del personaje a editar:</strong> {{ characterId }}
                </div>
                <div class="mt-4">
                    <button mat-raised-button color="primary" class="mr-3">
                        <mat-icon class="mr-2">save</mat-icon>
                        {{ isEditMode ? 'Guardar Cambios' : 'Crear Personaje' }}
                    </button>
                    <button mat-button (click)="goBack()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharacterFormComponent implements OnInit {
    characterId: string | null = null;
    isEditMode = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.characterId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.characterId;
    }

    goBack(): void {
        this.router.navigate(['/cards/characters']);
    }
}