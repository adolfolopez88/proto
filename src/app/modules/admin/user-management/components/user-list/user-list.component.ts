import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { User } from '../../../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnChanges {
  @Input() users: User[] = [];
  @Input() loading = false;

  @Output() userSelect = new EventEmitter<User>();
  @Output() userEdit = new EventEmitter<User>();
  @Output() userDelete = new EventEmitter<User>();
  @Output() toggleStatus = new EventEmitter<User>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'select',
    'avatar',
    'displayName', 
    'email',
    'role',
    'isActive',
    'createdAt',
    'lastLoginAt',
    'actions'
  ];

  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
  
  // Filtros
  filterValue = '';

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Configurar filtro personalizado
    this.dataSource.filterPredicate = (data: User, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.displayName || '').toLowerCase().includes(searchStr) ||
        (data.email || '').toLowerCase().includes(searchStr) ||
        (data.firstName || '').toLowerCase().includes(searchStr) ||
        (data.lastName || '').toLowerCase().includes(searchStr) ||
        (data.role || '').toLowerCase().includes(searchStr)
      );
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && changes['users'].currentValue) {
      this.dataSource.data = this.users;
      this.selection.clear();
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.filterValue = '';
    this.dataSource.filter = '';
  }

  // Selection methods
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  onRowClick(user: User): void {
    this.userSelect.emit(user);
  }

  onEditClick(user: User, event: Event): void {
    event.stopPropagation();
    this.userEdit.emit(user);
  }

  onDeleteClick(user: User, event: Event): void {
    event.stopPropagation();
    this.userDelete.emit(user);
  }

  onToggleStatus(user: User, event: Event): void {
    event.stopPropagation();
    this.toggleStatus.emit(user);
  }

  getDisplayName(user: User): string {
    return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre';
  }

  getAvatarText(user: User): string {
    const displayName = this.getDisplayName(user);
    if (displayName && displayName !== 'Sin nombre') {
      return displayName.charAt(0).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': 'warn',
      'moderator': 'accent',
      'user': 'primary',
      'guest': ''
    };
    return colors[role] || '';
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      'admin': 'Administrador',
      'moderator': 'Moderador',
      'user': 'Usuario',
      'guest': 'Invitado'
    };
    return labels[role] || role;
  }

  formatDate(date: any): string {
    if (!date) return 'Nunca';
    
    let dateObj: Date;
    
    // Handle Firestore timestamp
    if (date && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return 'Fecha inválida';
    }
    
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSelectedUsers(): User[] {
    return this.selection.selected;
  }

  hasSelectedUsers(): boolean {
    return this.selection.hasValue();
  }

  // Bulk operations
  deleteSelectedUsers(): void {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length > 0) {
      // Emit multiple delete events
      selectedUsers.forEach(user => this.userDelete.emit(user));
      this.selection.clear();
    }
  }

  exportSelectedUsers(): void {
    const selectedUsers = this.getSelectedUsers();
    if (selectedUsers.length > 0) {
      const csvContent = this.generateCSV(selectedUsers);
      this.downloadCSV(csvContent, 'usuarios-seleccionados.csv');
    }
  }

  exportAllUsers(): void {
    if (this.users.length > 0) {
      const csvContent = this.generateCSV(this.users);
      this.downloadCSV(csvContent, 'todos-los-usuarios.csv');
    }
  }

  private generateCSV(users: User[]): string {
    const headers = ['Email', 'Nombre', 'Apellido', 'Rol', 'Estado', 'Fecha Creación'];
    const csvRows = [headers.join(',')];

    users.forEach(user => {
      const row = [
        user.email,
        user.firstName || '',
        user.lastName || '',
        user.role,
        user.isActive ? 'Activo' : 'Inactivo',
        this.formatDate(user.createdAt)
      ].map(field => `"${field}"`).join(',');
      
      csvRows.push(row);
    });

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}