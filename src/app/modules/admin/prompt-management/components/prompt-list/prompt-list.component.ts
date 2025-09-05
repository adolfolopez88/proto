import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormControl } from '@angular/forms';

import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Prompt, PromptFilter } from 'app/core/models/prompt.model';
import { PromptService } from 'app/core/services/firebase/prompt.service';

@Component({
    selector: 'app-prompt-list',
    templateUrl: './prompt-list.component.html',
    styleUrls: ['./prompt-list.component.scss']
})
export class PromptListComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    displayedColumns: string[] = [
        'title', 
        'category', 
        'language', 
        'rating', 
        'usageCount', 
        'isPublic', 
        'isActive',
        'updatedAt', 
        'actions'
    ];
    
    dataSource = new MatTableDataSource<Prompt>();
    prompts: Prompt[] = [];
    loading = false;
    
    // Filtros
    searchControl = new FormControl('');
    categoryFilter = new FormControl('all');
    languageFilter = new FormControl('all');
    statusFilter = new FormControl('all');
    authorFilter = new FormControl('all');

    // Opciones para filtros
    categories: any[] = [];
    languages: string[] = ['Español', 'English', 'Français', 'Deutsch', 'Italiano', 'Português'];
    statusOptions = [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' },
        { value: 'public', label: 'Públicos' },
        { value: 'private', label: 'Privados' }
    ];

    viewMode: 'table' | 'grid' = 'table';
    private _unsubscribeAll = new Subject<void>();

    constructor(
        private promptService: PromptService,
        private router: Router,
        private snackBar: MatSnackBar,
        private confirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadPrompts();
        this.loadCategories();
        this.setupFilters();
        this.setInitialViewMode();
    }

    private setInitialViewMode(): void {
        // Default to grid view on mobile devices
        if (window.innerWidth < 768) {
            this.viewMode = 'grid';
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    loadPrompts(): void {
        this.loading = true;
        
        this.promptService.getAllPrompts()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (prompts) => {
                    this.prompts = prompts;
                    this.applyFilters();
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading prompts:', error);
                    this.snackBar.open('Error al cargar los prompts', 'Cerrar', { duration: 3000 });
                    this.loading = false;
                }
            });
    }

    loadCategories(): void {
        this.promptService.getCategories()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(categories => {
                this.categories = [
                    { id: 'all', name: 'Todas las categorías' },
                    ...categories
                ];
            });
    }

    setupFilters(): void {
        // Búsqueda por texto
        this.searchControl.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => this.applyFilters());

        // Otros filtros
        this.categoryFilter.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this.applyFilters());

        this.languageFilter.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this.applyFilters());

        this.statusFilter.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this.applyFilters());

        this.authorFilter.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => this.applyFilters());
    }

    applyFilters(): void {
        let filteredPrompts = [...this.prompts];
        
        // Filtro de búsqueda
        const searchTerm = this.searchControl.value?.toLowerCase() || '';
        if (searchTerm) {
            filteredPrompts = filteredPrompts.filter(prompt =>
                prompt.title.toLowerCase().includes(searchTerm) ||
                prompt.description?.toLowerCase().includes(searchTerm) ||
                prompt.content.toLowerCase().includes(searchTerm) ||
                prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Filtro de categoría
        const categoryValue = this.categoryFilter.value;
        if (categoryValue && categoryValue !== 'all') {
            filteredPrompts = filteredPrompts.filter(prompt => 
                prompt.category?.id === categoryValue
            );
        }

        // Filtro de idioma
        const languageValue = this.languageFilter.value;
        if (languageValue && languageValue !== 'all') {
            filteredPrompts = filteredPrompts.filter(prompt => 
                prompt.language === languageValue
            );
        }

        // Filtro de estado
        const statusValue = this.statusFilter.value;
        if (statusValue && statusValue !== 'all') {
            switch (statusValue) {
                case 'active':
                    filteredPrompts = filteredPrompts.filter(prompt => prompt.isActive);
                    break;
                case 'inactive':
                    filteredPrompts = filteredPrompts.filter(prompt => !prompt.isActive);
                    break;
                case 'public':
                    filteredPrompts = filteredPrompts.filter(prompt => prompt.isPublic);
                    break;
                case 'private':
                    filteredPrompts = filteredPrompts.filter(prompt => !prompt.isPublic);
                    break;
            }
        }

        this.dataSource.data = filteredPrompts;
        
        // Configurar paginación y ordenamiento
        setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
    }

    clearFilters(): void {
        this.searchControl.setValue('');
        this.categoryFilter.setValue('all');
        this.languageFilter.setValue('all');
        this.statusFilter.setValue('all');
        this.authorFilter.setValue('all');
    }

    createPrompt(): void {
        this.router.navigate(['/admin/prompt-management/create']);
    }

    editPrompt(prompt: Prompt): void {
        this.router.navigate(['/admin/prompt-management/edit', prompt.id]);
    }

    viewPrompt(prompt: Prompt): void {
        this.router.navigate(['/admin/prompt-management/detail', prompt.id]);
    }

    clonePrompt(prompt: Prompt): void {
        this.promptService.clonePrompt(prompt.id!, `${prompt.title} (Copia)`)
            .subscribe({
                next: () => {
                    this.snackBar.open('Prompt clonado exitosamente', 'Cerrar', { duration: 3000 });
                    this.loadPrompts();
                },
                error: (error) => {
                    console.error('Error cloning prompt:', error);
                    this.snackBar.open('Error al clonar el prompt', 'Cerrar', { duration: 3000 });
                }
            });
    }

    togglePromptStatus(prompt: Prompt): void {
        this.promptService.updatePrompt(prompt.id!, { isActive: !prompt.isActive })
            .subscribe({
                next: () => {
                    const status = !prompt.isActive ? 'activado' : 'desactivado';
                    this.snackBar.open(`Prompt ${status} exitosamente`, 'Cerrar', { duration: 3000 });
                    this.loadPrompts();
                },
                error: (error) => {
                    console.error('Error updating prompt status:', error);
                    this.snackBar.open('Error al actualizar el estado del prompt', 'Cerrar', { duration: 3000 });
                }
            });
    }

    deletePrompt(prompt: Prompt): void {
        const confirmationConfig = {
            title: 'Eliminar Prompt',
            message: `¿Estás seguro de que quieres eliminar el prompt "${prompt.title}"? Esta acción no se puede deshacer.`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warning' as const
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Eliminar',
                    color: 'warn' as const
                },
                cancel: {
                    show: true,
                    label: 'Cancelar'
                }
            },
            dismissible: true
        };

        const dialogRef = this.confirmationService.open(confirmationConfig);

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this.promptService.deletePrompt(prompt.id!)
                    .subscribe({
                        next: () => {
                            this.snackBar.open('Prompt eliminado exitosamente', 'Cerrar', { duration: 3000 });
                            this.loadPrompts();
                        },
                        error: (error) => {
                            console.error('Error deleting prompt:', error);
                            this.snackBar.open('Error al eliminar el prompt', 'Cerrar', { duration: 3000 });
                        }
                    });
            }
        });
    }

    getRatingStars(rating: number): string[] {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push('star');
        }
        
        if (hasHalfStar) {
            stars.push('star_half');
        }
        
        while (stars.length < 5) {
            stars.push('star_border');
        }
        
        return stars;
    }

    getStatusColor(prompt: Prompt): string {
        if (!prompt.isActive) return 'warn';
        if (prompt.isPublic) return 'accent';
        return 'primary';
    }

    getStatusText(prompt: Prompt): string {
        if (!prompt.isActive) return 'Inactivo';
        if (prompt.isPublic) return 'Público';
        return 'Privado';
    }

    setViewMode(mode: 'table' | 'grid'): void {
        this.viewMode = mode;
    }
}