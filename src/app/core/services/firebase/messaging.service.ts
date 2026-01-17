import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'environments/environment';

export interface NotificationMessage {
    title?: string;
    body?: string;
    icon?: string;
    data?: any;
    timestamp: Date;
    id: string;
    read?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MessagingService {
    private messaging: any = null;
    private currentToken: string | null = null;
    private readonly _messages = new BehaviorSubject<NotificationMessage[]>([]);
    private readonly _newMessage = new BehaviorSubject<NotificationMessage | null>(null);
    private isInitialized = false;

    constructor() {
        // NO inicializar messaging aquí, esperar a que se llame desde el componente
        // o verificar que el DOM esté listo
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            this.initializeMessaging();
        }
    }

    /**
     * Obtener todas las notificaciones
     */
    get messages$(): Observable<NotificationMessage[]> {
        return this._messages.asObservable();
    }

    /**
     * Obtener nueva notificación
     */
    get newMessage$(): Observable<NotificationMessage | null> {
        return this._newMessage.asObservable();
    }

    /**
     * Inicializar Firebase Cloud Messaging
     */
    private async initializeMessaging(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        try {
            // Verificar que estamos en un entorno de navegador
            if (typeof window === 'undefined' || typeof document === 'undefined') {
                console.warn('Firebase Messaging solo disponible en navegador');
                return;
            }

            // Inicializar messaging solo cuando sea seguro
            this.messaging = getMessaging();
            this.isInitialized = true;

            // Registrar service worker si está disponible
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('Service Worker registrado:', registration);
            }

            // Configurar listener para mensajes en primer plano
            this.setupForegroundMessageListener();
        } catch (error) {
            console.error('Error al inicializar FCM:', error);
        }
    }

    /**
     * Solicitar permiso para notificaciones y obtener token
     */
    async requestPermission(): Promise<string | null> {
        try {
            // Asegurar que messaging esté inicializado
            if (!this.isInitialized) {
                await this.initializeMessaging();
            }

            if (!this.messaging) {
                console.error('Firebase Messaging no está disponible');
                return null;
            }

            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('Permiso de notificaciones concedido');

                const token = await getToken(this.messaging, {
                    vapidKey: environment.firebase?.vapidKey || 'YOUR_VAPID_KEY_HERE'
                });

                if (token) {
                    console.log('Token FCM:', token);
                    this.currentToken = token;
                    return token;
                } else {
                    console.log('No se pudo obtener el token de registro');
                    return null;
                }
            } else {
                console.log('Permiso de notificaciones denegado');
                return null;
            }
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            return null;
        }
    }

    /**
     * Obtener token actual
     */
    getCurrentToken(): string | null {
        return this.currentToken;
    }

    /**
     * Configurar listener para mensajes en primer plano
     */
    private setupForegroundMessageListener(): void {
        if (!this.messaging) {
            console.warn('Cannot setup message listener: messaging not initialized');
            return;
        }

        onMessage(this.messaging, (payload: MessagePayload) => {
            console.log('Mensaje recibido en primer plano:', payload);

            const notification: NotificationMessage = {
                id: this.generateId(),
                title: payload.notification?.title,
                body: payload.notification?.body,
                icon: payload.notification?.icon,
                data: payload.data,
                timestamp: new Date(),
                read: false
            };

            // Agregar a la lista de mensajes
            this.addMessage(notification);

            // Emitir nuevo mensaje
            this._newMessage.next(notification);

            // Mostrar notificación del navegador si está en segundo plano
            this.showBrowserNotification(notification);
        });
    }

    /**
     * Agregar mensaje a la lista
     */
    private addMessage(message: NotificationMessage): void {
        const currentMessages = this._messages.value;
        const updatedMessages = [message, ...currentMessages];
        
        // Limitar a últimos 50 mensajes
        if (updatedMessages.length > 50) {
            updatedMessages.splice(50);
        }
        
        this._messages.next(updatedMessages);
    }

    /**
     * Mostrar notificación del navegador
     */
    private showBrowserNotification(message: NotificationMessage): void {
        if (Notification.permission === 'granted' && document.hidden) {
            const notification = new Notification(message.title || 'Nueva notificación', {
                body: message.body,
                icon: message.icon || '/assets/images/logo/logo.svg',
                badge: '/assets/images/logo/logo.svg',
                tag: message.id,
                requireInteraction: false,
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            // Auto cerrar después de 5 segundos
            setTimeout(() => notification.close(), 5000);
        }
    }

    /**
     * Marcar mensaje como leído
     */
    markAsRead(messageId: string): void {
        const currentMessages = this._messages.value;
        const updatedMessages = currentMessages.map(msg => 
            msg.id === messageId ? { ...msg, read: true } : msg
        );
        this._messages.next(updatedMessages);
    }

    /**
     * Eliminar mensaje
     */
    deleteMessage(messageId: string): void {
        const currentMessages = this._messages.value;
        const filteredMessages = currentMessages.filter(msg => msg.id !== messageId);
        this._messages.next(filteredMessages);
    }

    /**
     * Limpiar todos los mensajes
     */
    clearAllMessages(): void {
        this._messages.next([]);
    }

    /**
     * Obtener conteo de mensajes no leídos
     */
    getUnreadCount(): number {
        return this._messages.value.filter(msg => !msg.read).length;
    }

    /**
     * Generar ID único para mensajes
     */
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}