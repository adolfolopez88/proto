import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagingService, NotificationMessage } from 'app/core/services/firebase/messaging.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
    messages: NotificationMessage[] = [];
    unreadCount = 0;
    isOpen = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _messagingService: MessagingService
    ) {}

    ngOnInit(): void {
        // Suscribirse a mensajes
        this._messagingService.messages$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((messages) => {
                this.messages = messages;
                this.unreadCount = this._messagingService.getUnreadCount();
            });

        // Suscribirse a nuevos mensajes
        this._messagingService.newMessage$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((newMessage) => {
                if (newMessage) {
                    // Mostrar animación o sonido de nueva notificación
                    this.showNewMessageAnimation();
                }
            });

        // Solicitar permisos de notificación
        this.requestNotificationPermission();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Solicitar permisos de notificación
     */
    async requestNotificationPermission(): Promise<void> {
        const token = await this._messagingService.requestPermission();
        if (token) {
            console.log('Token FCM obtenido:', token);
            // Aquí podrías enviar el token a tu backend para asociarlo con el usuario
        }
    }

    /**
     * Alternar panel de notificaciones
     */
    toggleNotifications(): void {
        this.isOpen = !this.isOpen;
    }

    /**
     * Marcar mensaje como leído
     */
    markAsRead(messageId: string): void {
        this._messagingService.markAsRead(messageId);
    }

    /**
     * Eliminar mensaje
     */
    deleteMessage(messageId: string): void {
        this._messagingService.deleteMessage(messageId);
    }

    /**
     * Limpiar todas las notificaciones
     */
    clearAll(): void {
        this._messagingService.clearAllMessages();
    }

    /**
     * Mostrar animación de nueva notificación
     */
    private showNewMessageAnimation(): void {
        // Agregar clase de animación al elemento
        const notificationBell = document.querySelector('.notification-bell');
        if (notificationBell) {
            notificationBell.classList.add('shake');
            setTimeout(() => {
                notificationBell.classList.remove('shake');
            }, 1000);
        }
    }

    /**
     * Formatear tiempo relativo
     */
    getRelativeTime(timestamp: Date): string {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return 'Ahora';
        } else if (minutes < 60) {
            return `${minutes}m`;
        } else if (hours < 24) {
            return `${hours}h`;
        } else {
            return `${days}d`;
        }
    }

    /**
     * Track by function for ngFor
     */
    trackByFn(index: number, item: NotificationMessage): string {
        return item.id;
    }
}