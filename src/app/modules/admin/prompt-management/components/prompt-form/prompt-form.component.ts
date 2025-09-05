import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { Prompt, CreatePromptRequest, UpdatePromptRequest, PromptCategory } from 'app/core/models/prompt.model';
import { PromptService } from 'app/core/services/firebase/prompt.service';
import { AuthService } from 'app/core/services/firebase/auth.service';

@Component({
    selector: 'app-prompt-form',
    templateUrl: './prompt-form.component.html',
    styleUrls: ['./prompt-form.component.scss']
})
export class PromptFormComponent implements OnInit, OnDestroy {
    promptForm!: FormGroup;
    isEditMode = false;
    promptId: string | null = null;
    loading = false;
    saving = false;

    categories: PromptCategory[] = [];
    languages = ['Español', 'English', 'Français', 'Deutsch', 'Italiano', 'Português'];
    complexities = [
        { value: 'basic', label: 'Básico' },
        { value: 'intermediate', label: 'Intermedio' },
        { value: 'advanced', label: 'Avanzado' }
    ];

    // Para manejo de tags
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    private _unsubscribeAll = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private promptService: PromptService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.createForm();
    }

    ngOnInit(): void {
        this.loadCategories();
        
        // Verificar si es modo edición
        this.promptId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.promptId;

        if (this.isEditMode && this.promptId) {
            this.loadPrompt(this.promptId);
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): void {
        this.promptForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)],
            content: ['', [Validators.required, Validators.maxLength(5000)]],
            category: ['', Validators.required],
            tags: [[]],
            language: ['Español', Validators.required],
            isPublic: [false],
            isActive: [true],
            variables: this.fb.array([]),
            examples: this.fb.array([]),
            metadata: this.fb.group({
                complexity: ['basic'],
                purpose: [[]],
                targetAudience: [[]],
                estimatedTokens: [null]
            })
        });
    }

    loadCategories(): void {
        this.promptService.getCategories()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(categories => {
                this.categories = categories;
            });
    }

    loadPrompt(id: string): void {
        this.loading = true;
        
        this.promptService.getPromptById(id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (prompt) => {
                    if (prompt) {
                        this.populateForm(prompt);
                    }
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading prompt:', error);
                    this.snackBar.open('Error al cargar el prompt', 'Cerrar', { duration: 3000 });
                    this.loading = false;
                }
            });
    }

    populateForm(prompt: Prompt): void {
        this.promptForm.patchValue({
            title: prompt.title,
            description: prompt.description,
            content: prompt.content,
            category: prompt.category?.id,
            tags: prompt.tags || [],
            language: prompt.language,
            isPublic: prompt.isPublic,
            isActive: prompt.isActive,
            metadata: {
                complexity: prompt.metadata?.complexity || 'basic',
                purpose: prompt.metadata?.purpose || [],
                targetAudience: prompt.metadata?.targetAudience || [],
                estimatedTokens: prompt.metadata?.estimatedTokens
            }
        });

        // Cargar variables
        if (prompt.variables) {
            const variablesArray = this.promptForm.get('variables') as FormArray;
            prompt.variables.forEach(variable => {
                variablesArray.push(this.createVariableGroup(variable));
            });
        }

        // Cargar ejemplos
        if (prompt.examples) {
            const examplesArray = this.promptForm.get('examples') as FormArray;
            prompt.examples.forEach(example => {
                examplesArray.push(this.createExampleGroup(example));
            });
        }
    }

    get variablesArray(): FormArray {
        return this.promptForm.get('variables') as FormArray;
    }

    get examplesArray(): FormArray {
        return this.promptForm.get('examples') as FormArray;
    }

    createVariableGroup(variable?: any): FormGroup {
        return this.fb.group({
            name: [variable?.name || '', Validators.required],
            type: [variable?.type || 'text', Validators.required],
            description: [variable?.description || '', Validators.required],
            required: [variable?.required || false],
            defaultValue: [variable?.defaultValue || ''],
            options: [variable?.options || []],
            validation: this.fb.group({
                minLength: [variable?.validation?.minLength],
                maxLength: [variable?.validation?.maxLength],
                pattern: [variable?.validation?.pattern],
                min: [variable?.validation?.min],
                max: [variable?.validation?.max]
            })
        });
    }

    createExampleGroup(example?: any): FormGroup {
        return this.fb.group({
            title: [example?.title || '', Validators.required],
            description: [example?.description || ''],
            input: [example?.input || {}],
            expectedOutput: [example?.expectedOutput || ''],
            notes: [example?.notes || '']
        });
    }

    addVariable(): void {
        this.variablesArray.push(this.createVariableGroup());
    }

    removeVariable(index: number): void {
        this.variablesArray.removeAt(index);
    }

    addExample(): void {
        this.examplesArray.push(this.createExampleGroup());
    }

    removeExample(index: number): void {
        this.examplesArray.removeAt(index);
    }

    onSubmit(): void {
        if (this.promptForm.invalid) {
            this.markFormGroupTouched(this.promptForm);
            return;
        }

        this.saving = true;
        const formValue = this.promptForm.value;

        // Encontrar la categoría completa
        const selectedCategory = this.categories.find(cat => cat.id === formValue.category);

        const promptData = {
            ...formValue,
            category: selectedCategory,
            variables: formValue.variables.length > 0 ? formValue.variables : undefined,
            examples: formValue.examples.length > 0 ? formValue.examples : undefined
        };

        if (this.isEditMode && this.promptId) {
            // Actualizar
            this.promptService.updatePrompt(this.promptId, promptData as UpdatePromptRequest)
                .subscribe({
                    next: () => {
                        this.snackBar.open('Prompt actualizado exitosamente', 'Cerrar', { duration: 3000 });
                        this.router.navigate(['/admin/prompt-management/list']);
                    },
                    error: (error) => {
                        console.error('Error updating prompt:', error);
                        this.snackBar.open('Error al actualizar el prompt', 'Cerrar', { duration: 3000 });
                        this.saving = false;
                    }
                });
        } else {
            // Crear
            this.promptService.createPrompt(promptData as CreatePromptRequest)
                .subscribe({
                    next: () => {
                        this.snackBar.open('Prompt creado exitosamente', 'Cerrar', { duration: 3000 });
                        this.router.navigate(['/admin/prompt-management/list']);
                    },
                    error: (error) => {
                        console.error('Error creating prompt:', error);
                        this.snackBar.open('Error al crear el prompt', 'Cerrar', { duration: 3000 });
                        this.saving = false;
                    }
                });
        }
    }

    cancel(): void {
        this.router.navigate(['/admin/prompt-management/list']);
    }

    addTag(event: any): void {
        const value = (event.value || '').trim();
        if (value) {
            const currentTags = this.promptForm.get('tags')?.value || [];
            if (!currentTags.includes(value)) {
                currentTags.push(value);
                this.promptForm.get('tags')?.setValue(currentTags);
            }
        }
        event.chipInput!.clear();
    }

    removeTag(index: number): void {
        const currentTags = this.promptForm.get('tags')?.value || [];
        currentTags.splice(index, 1);
        this.promptForm.get('tags')?.setValue(currentTags);
    }

    private markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();

            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }
}