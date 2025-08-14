import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';

export interface TableColumn {
    key: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'actions';
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    format?: string;
    actions?: TableAction[];
}

export interface TableAction {
    key: string;
    label: string;
    icon: string;
    color?: 'primary' | 'accent' | 'warn';
    disabled?: (row: any) => boolean;
    visible?: (row: any) => boolean;
}

export interface TableConfig {
    columns: TableColumn[];
    selectable?: boolean;
    multiSelect?: boolean;
    pagination?: {
        enabled: boolean;
        pageSizeOptions: number[];
        pageSize: number;
    };
    sorting?: boolean;
    filtering?: boolean;
    exportable?: boolean;
    density?: 'comfortable' | 'compact' | 'standard';
}

@Component({
    selector: 'app-generic-table',
    templateUrl: './generic-table.component.html',
    styleUrls: ['./generic-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent<T = any> implements OnInit {
    @Input() data: T[] = [];
    @Input() config!: TableConfig;
    @Input() loading = false;
    @Input() totalCount = 0;

    @Output() rowClick = new EventEmitter<T>();
    @Output() selectionChange = new EventEmitter<T[]>();
    @Output() actionClick = new EventEmitter<{action: string, row: T}>();
    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() sortChange = new EventEmitter<Sort>();
    @Output() filterChange = new EventEmitter<{[key: string]: any}>();

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<T>([]);
    selection = new SelectionModel<T>(true, []);
    displayedColumns: string[] = [];
    filters: {[key: string]: any} = {};
    
    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();

    ngOnInit(): void {
        this.initializeTable();
        this.updateDataSource();
    }

    ngOnChanges(): void {
        this.updateDataSource();
        this.loadingSubject.next(this.loading);
    }

    private initializeTable(): void {
        this.displayedColumns = this.buildDisplayedColumns();
        
        if (this.config.pagination?.enabled) {
            this.dataSource.paginator = this.paginator;
        }
        
        if (this.config.sorting) {
            this.dataSource.sort = this.sort;
        }

        // Configure selection
        this.selection = new SelectionModel<T>(
            this.config.multiSelect || false, 
            []
        );

        // Listen to selection changes
        this.selection.changed.subscribe(() => {
            this.selectionChange.emit(this.selection.selected);
        });
    }

    private buildDisplayedColumns(): string[] {
        const columns: string[] = [];
        
        if (this.config.selectable) {
            columns.push('select');
        }
        
        columns.push(...this.config.columns.map(col => col.key));
        
        return columns;
    }

    private updateDataSource(): void {
        this.dataSource.data = this.data;
        this.dataSource.filterPredicate = this.createFilterPredicate();
    }

    private createFilterPredicate() {
        return (data: T, filter: string): boolean => {
            const filterObject = JSON.parse(filter);
            
            for (const key in filterObject) {
                if (filterObject[key]) {
                    const columnConfig = this.config.columns.find(col => col.key === key);
                    if (!columnConfig?.filterable) continue;

                    const value = this.getNestedProperty(data, key);
                    const filterValue = filterObject[key].toString().toLowerCase();
                    
                    if (!value || !value.toString().toLowerCase().includes(filterValue)) {
                        return false;
                    }
                }
            }
            return true;
        };
    }

    // Table actions
    onRowClick(row: T): void {
        this.rowClick.emit(row);
    }

    onActionClick(action: string, row: T): void {
        this.actionClick.emit({ action, row });
    }

    onPageChange(event: PageEvent): void {
        this.pageChange.emit(event);
    }

    onSortChange(sort: Sort): void {
        this.sortChange.emit(sort);
    }

    // Selection methods
    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle(): void {
        this.isAllSelected() 
            ? this.selection.clear() 
            : this.dataSource.data.forEach(row => this.selection.select(row));
    }

    toggleRow(row: T): void {
        this.selection.toggle(row);
    }

    isSelected(row: T): boolean {
        return this.selection.isSelected(row);
    }

    // Filtering
    applyFilter(column: string, value: any): void {
        this.filters[column] = value;
        this.dataSource.filter = JSON.stringify(this.filters);
        this.filterChange.emit(this.filters);
        
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    clearFilters(): void {
        this.filters = {};
        this.dataSource.filter = '';
        this.filterChange.emit(this.filters);
    }

    // Utility methods
    getNestedProperty(obj: any, path: string): any {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }

    formatCellValue(row: T, column: TableColumn): string {
        const value = this.getNestedProperty(row, column.key);
        
        if (value === null || value === undefined) {
            return '';
        }

        switch (column.type) {
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'currency':
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(value);
            case 'number':
                return Number(value).toLocaleString();
            case 'boolean':
                return value ? 'Yes' : 'No';
            default:
                return value.toString();
        }
    }

    // Export functionality
    exportData(format: 'csv' | 'excel' | 'pdf' = 'csv'): void {
        // This would integrate with a service to export data
        console.log(`Exporting data as ${format}`, this.dataSource.data);
    }

    // Action visibility and state
    isActionVisible(action: TableAction, row: T): boolean {
        return action.visible ? action.visible(row) : true;
    }

    isActionDisabled(action: TableAction, row: T): boolean {
        return action.disabled ? action.disabled(row) : false;
    }

    getActionColor(action: TableAction): string {
        return action.color || 'primary';
    }
}