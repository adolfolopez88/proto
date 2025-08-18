import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'app/core/models/user.model';
import { AuthService } from 'app/core/auth/auth.service';
import { MessagingService, MessageData, MessageRequest } from 'app/shared/services/messaging.service';

@Component({
    selector: 'app-messaging',
    templateUrl: './messaging.component.html',
    styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy {
    users: User[] = [];
    selectedUsers: User[] = [];
    messages: MessageData[] = [];
    messageForm: FormGroup;
    isLoading = false;
    showMessageForm = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    messageTypes = [
        { value: 'info', label: 'Information', color: 'primary' },
        { value: 'success', label: 'Success', color: 'accent' },
        { value: 'warning', label: 'Warning', color: 'warn' },
        { value: 'error', label: 'Error', color: 'warn' }
    ];

    displayedColumns: string[] = ['select', 'avatar', 'name', 'email', 'status', 'actions'];

    constructor(
        private _formBuilder: FormBuilder,
        private _authService: AuthService,
        private _messagingService: MessagingService,
        private _matDialog: MatDialog,
        private _snackBar: MatSnackBar
    ) {
        this.messageForm = this._formBuilder.group({
            title: ['', Validators.required],
            body: ['', [Validators.required, Validators.minLength(10)]],
            type: ['info', Validators.required],
            recipients: ['selected'] // 'selected' or 'all'
        });
    }

    ngOnInit(): void {
        this.loadUsers();
        this.loadMessages();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    private loadUsers(): void {
        this.isLoading = true;
        
        // Mock users data for demonstration
        this.users = [
            {
                id: '1',
                firstName: 'Alice Johnson',
                email: 'alice@example.com',
                avatar: 'assets/images/avatars/female-01.jpg',
                status: 'online'
            },
            {
                id: '2',
                firstName: 'Bob Smith',
                email: 'bob@example.com',
                avatar: 'assets/images/avatars/male-01.jpg',
                status: 'offline'
            },
            {
                id: '3',
                firstName: 'Carol Davis',
                email: 'carol@example.com',
                avatar: 'assets/images/avatars/female-02.jpg',
                status: 'online'
            },
            {
                id: '4',
                firstName: 'David Wilson',
                email: 'david@example.com',
                avatar: 'assets/images/avatars/male-02.jpg',
                status: 'away'
            },
            {
                id: '5',
                firstName: 'Emma Brown',
                email: 'emma@example.com',
                avatar: 'assets/images/avatars/female-03.jpg',
                status: 'online'
            }
        ];

        this.isLoading = false;
    }

    private loadMessages(): void {
        this._messagingService.messages$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((messages) => {
                this.messages = messages;
            });
    }

    onUserSelectionChange(user: User): void {
        const index = this.selectedUsers.findIndex(u => u.id === user.id);
        if (index > -1) {
            this.selectedUsers.splice(index, 1);
        } else {
            this.selectedUsers.push(user);
        }
    }

    isUserSelected(user: User): boolean {
        return this.selectedUsers.some(u => u.id === user.id);
    }

    selectAllUsers(): void {
        if (this.selectedUsers.length === this.users.length) {
            this.selectedUsers = [];
        } else {
            this.selectedUsers = [...this.users];
        }
    }

    showComposeMessage(): void {
        this.showMessageForm = true;
        this.messageForm.reset({
            title: '',
            body: '',
            type: 'info',
            recipients: 'selected'
        });
    }

    hideComposeMessage(): void {
        this.showMessageForm = false;
        this.messageForm.reset();
    }

    async sendMessage(): Promise<void> {
        if (this.messageForm.invalid) {
            this._snackBar.open('Please fill all required fields', 'Close', {
                duration: 3000,
                panelClass: 'error-snackbar'
            });
            return;
        }

        const formValue = this.messageForm.value;
        const recipients = formValue.recipients === 'all' ? 
            this.users.map(u => u.id) : 
            this.selectedUsers.map(u => u.id);

        if (recipients.length === 0) {
            this._snackBar.open('Please select at least one recipient', 'Close', {
                duration: 3000,
                panelClass: 'error-snackbar'
            });
            return;
        }

        this.isLoading = true;

        const messageRequest: MessageRequest = {
            title: formValue.title,
            body: formValue.body,
            type: formValue.type,
            recipients
        };

        try {
            const success = await this._messagingService.sendMessage(messageRequest);
            
            if (success) {
                this._snackBar.open(
                    `Message sent successfully to ${recipients.length} recipient(s)`, 
                    'Close', 
                    {
                        duration: 5000,
                        panelClass: 'success-snackbar'
                    }
                );
                this.hideComposeMessage();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            this._snackBar.open('Error sending message', 'Close', {
                duration: 3000,
                panelClass: 'error-snackbar'
            });
        } finally {
            this.isLoading = false;
        }
    }

    async sendQuickMessage(user: User, type: 'welcome' | 'notification' | 'warning'): Promise<void> {
        this.isLoading = true;

        try {
            let success = false;
            
            switch (type) {
                case 'welcome':
                    success = await this._messagingService.sendWelcomeMessage(user.id);
                    break;
                case 'notification':
                    success = await this._messagingService.sendNotificationMessage(
                        user.id,
                        'System Notification',
                        'You have new updates available in your dashboard.'
                    );
                    break;
                case 'warning':
                    success = await this._messagingService.sendWarningMessage(
                        user.id,
                        'Account Warning',
                        'Please update your account information to continue using our services.'
                    );
                    break;
            }

            if (success) {
                this._snackBar.open(`${type.charAt(0).toUpperCase() + type.slice(1)} message sent to ${user.displayName}`, 'Close', {
                    duration: 3000,
                    panelClass: 'success-snackbar'
                });
            }
        } catch (error) {
            this._snackBar.open('Error sending message', 'Close', {
                duration: 3000,
                panelClass: 'error-snackbar'
            });
        } finally {
            this.isLoading = false;
        }
    }

    getUserStatusColor(status: string): string {
        switch (status) {
            case 'online':
                return 'text-green-500';
            case 'away':
                return 'text-yellow-500';
            case 'offline':
                return 'text-gray-500';
            default:
                return 'text-gray-500';
        }
    }

    getMessageTypeColor(type: string): string {
        switch (type) {
            case 'success':
                return 'text-green-600 bg-green-100';
            case 'warning':
                return 'text-yellow-600 bg-yellow-100';
            case 'error':
                return 'text-red-600 bg-red-100';
            case 'info':
            default:
                return 'text-blue-600 bg-blue-100';
        }
    }

    clearMessageHistory(): void {
        this._messagingService.clearMessages();
        this._snackBar.open('Message history cleared', 'Close', {
            duration: 2000
        });
    }
}