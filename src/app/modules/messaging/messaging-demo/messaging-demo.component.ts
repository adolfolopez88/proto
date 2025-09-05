import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessagingService, NotificationMessage } from 'app/core/services/firebase/messaging.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-messaging-demo',
    templateUrl: './messaging-demo.component.html',
    styleUrls: ['./messaging-demo.component.scss']
})
export class MessagingDemoComponent implements OnInit, OnDestroy {
    messages: NotificationMessage[] = [];
    currentToken: string | null = null;
    notificationPermission: NotificationPermission = 'default';
    unreadCount = 0;
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _messagingService: MessagingService
    ) {}

    ngOnInit(): void {
        // Obtener estado actual del permiso
        this.notificationPermission = Notification.permission;

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
                    console.log('Nuevo mensaje recibido:', newMessage);
                }
            });

        // Obtener token actual si existe
        this.currentToken = this._messagingService.getCurrentToken();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    /**
     * Solicitar permisos de notificación
     */
    async requestPermission(): Promise<void> {
        const token = await this._messagingService.requestPermission();
        this.currentToken = token;
        this.notificationPermission = Notification.permission;
    }

    /**
     * Copiar token al portapapeles
     */
    async copyTokenToClipboard(): Promise<void> {
        if (this.currentToken) {
            try {
                await navigator.clipboard.writeText(this.currentToken);
                console.log('Token copiado al portapapeles');
            } catch (error) {
                console.error('Error al copiar token:', error);
            }
        }
    }

    /**
     * Simular notificación local (para testing)
     */
    simulateNotification(): void {
        const simulatedMessage: NotificationMessage = {
            id: Date.now().toString(),
            title: 'Notificación de Prueba',
            body: 'Esta es una notificación simulada para probar el sistema',
            timestamp: new Date(),
            data: { test: true },
            read: false
        };

        // Simular que llegó un mensaje
        this._messagingService['addMessage'](simulatedMessage);
        this._messagingService['_newMessage'].next(simulatedMessage);
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
     * Limpiar todos los mensajes
     */
    clearAllMessages(): void {
        this._messagingService.clearAllMessages();
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
            return 'Ahora mismo';
        } else if (minutes < 60) {
            return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        } else if (hours < 24) {
            return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
        } else {
            return `Hace ${days} día${days !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Obtener clase CSS para el estado del permiso
     */
    getPermissionClass(): string {
        switch (this.notificationPermission) {
            case 'granted':
                return 'text-green-600';
            case 'denied':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    }

    /**
     * Obtener texto del estado del permiso
     */
    getPermissionText(): string {
        switch (this.notificationPermission) {
            case 'granted':
                return 'Concedido';
            case 'denied':
                return 'Denegado';
            default:
                return 'No solicitado';
        }
    }

    /**
     * Track by function para ngFor
     */
    trackByMessageId(index: number, message: NotificationMessage): string {
        return message.id;
    }
}