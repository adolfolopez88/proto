import { Component, OnInit } from '@angular/core';
import { MessagingService } from 'app/core/services/firebase/messaging.service';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent implements OnInit
{
    /**
     * Constructor
     */
    constructor(
        private _messagingService: MessagingService
    )
    {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Inicializar Firebase Cloud Messaging al cargar la aplicación
        this.initializeMessaging();
    }

    /**
     * Inicializar Firebase Cloud Messaging
     */
    private async initializeMessaging(): Promise<void>
    {
        try {
            // El servicio se inicializa automáticamente al ser inyectado
            console.log('Firebase Cloud Messaging inicializado');
        } catch (error) {
            console.error('Error al inicializar FCM:', error);
        }
    }
}
