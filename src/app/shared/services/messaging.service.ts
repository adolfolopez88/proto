import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MessageData {
    title: string;
    body: string;
    type: 'info' | 'warning' | 'success' | 'error';
    userId?: string;
    timestamp?: Date;
}

export interface MessageRequest {
    title: string;
    body: string;
    type: 'info' | 'warning' | 'success' | 'error';
    recipients: string[];
    scheduledAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class MessagingService {
    private _messages = new BehaviorSubject<MessageData[]>([]);
    private _messagingToken = new BehaviorSubject<string | null>(null);

    constructor() {
        this.initializeMessaging();
    }

    get messages$(): Observable<MessageData[]> {
        return this._messages.asObservable();
    }

    get messagingToken$(): Observable<string | null> {
        return this._messagingToken.asObservable();
    }

    private async initializeMessaging(): Promise<void> {
        try {
            // Simulate Firebase Messaging initialization
            console.log('Firebase Messaging initialized');
            
            // Simulate token generation
            const token = this.generateMockToken();
            this._messagingToken.next(token);

            // Listen for foreground messages
            this.listenForMessages();
        } catch (error) {
            console.error('Error initializing messaging:', error);
        }
    }

    private generateMockToken(): string {
        return 'mock-fcm-token-' + Math.random().toString(36).substring(2, 15);
    }

    private listenForMessages(): void {
        // Simulate receiving messages
        console.log('Listening for messages...');
    }

    async requestPermission(): Promise<boolean> {
        try {
            // Simulate permission request
            const permission = await new Promise<boolean>((resolve) => {
                setTimeout(() => resolve(true), 1000);
            });

            if (permission) {
                console.log('Notification permission granted');
                return true;
            } else {
                console.log('Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    }

    async sendMessage(messageRequest: MessageRequest): Promise<boolean> {
        try {
            // Simulate sending message via Firebase Cloud Messaging
            console.log('Sending message:', messageRequest);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Add to local messages for demo purposes
            const newMessage: MessageData = {
                title: messageRequest.title,
                body: messageRequest.body,
                type: messageRequest.type,
                timestamp: new Date()
            };

            const currentMessages = this._messages.value;
            this._messages.next([...currentMessages, newMessage]);

            console.log('Message sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }

    async sendMessageToUser(userId: string, message: MessageData): Promise<boolean> {
        try {
            const messageRequest: MessageRequest = {
                title: message.title,
                body: message.body,
                type: message.type,
                recipients: [userId]
            };

            return await this.sendMessage(messageRequest);
        } catch (error) {
            console.error('Error sending message to user:', error);
            return false;
        }
    }

    async sendBroadcastMessage(message: MessageData): Promise<boolean> {
        try {
            const messageRequest: MessageRequest = {
                title: message.title,
                body: message.body,
                type: message.type,
                recipients: ['all'] // Special recipient for broadcast
            };

            return await this.sendMessage(messageRequest);
        } catch (error) {
            console.error('Error sending broadcast message:', error);
            return false;
        }
    }

    getMessageHistory(): Observable<MessageData[]> {
        return this.messages$;
    }

    clearMessages(): void {
        this._messages.next([]);
    }

    // Simulate different message types
    async sendWelcomeMessage(userId: string): Promise<boolean> {
        const message: MessageData = {
            title: 'Welcome!',
            body: 'Welcome to our application. We\'re excited to have you!',
            type: 'success',
            userId
        };

        return await this.sendMessageToUser(userId, message);
    }

    async sendNotificationMessage(userId: string, title: string, body: string): Promise<boolean> {
        const message: MessageData = {
            title,
            body,
            type: 'info',
            userId
        };

        return await this.sendMessageToUser(userId, message);
    }

    async sendWarningMessage(userId: string, title: string, body: string): Promise<boolean> {
        const message: MessageData = {
            title,
            body,
            type: 'warning',
            userId
        };

        return await this.sendMessageToUser(userId, message);
    }

    async sendErrorMessage(userId: string, title: string, body: string): Promise<boolean> {
        const message: MessageData = {
            title,
            body,
            type: 'error',
            userId
        };

        return await this.sendMessageToUser(userId, message);
    }
}