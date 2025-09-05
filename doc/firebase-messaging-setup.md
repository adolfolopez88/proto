# Firebase Cloud Messaging - Configuración y Uso

## Descripción General

Se ha implementado Firebase Cloud Messaging (FCM) en la aplicación Fuse Angular para permitir notificaciones push en tiempo real. Esta implementación incluye:

- Servicio de mensajería centralizado
- Componente de notificaciones reutilizable
- Página de demostración interactiva
- Service Worker para mensajes en segundo plano

## Archivos Creados/Modificados

### Servicios

#### `src/app/core/services/firebase/messaging.service.ts`
Servicio principal que maneja:
- Inicialización de Firebase Messaging
- Solicitud de permisos
- Manejo de tokens FCM
- Recepción de mensajes en primer plano
- Gestión de estado de notificaciones

### Componentes

#### `src/app/shared/components/notifications/notifications.component.ts`
Componente reutilizable que proporciona:
- Icono de campana con badge de notificaciones no leídas
- Panel desplegable con lista de notificaciones
- Funciones para marcar como leído y eliminar

#### `src/app/modules/messaging/messaging-demo/messaging-demo.component.ts`
Página de demostración que incluye:
- Estado de permisos de notificación
- Visualización del token FCM
- Controles de testing
- Lista completa de mensajes recibidos

### Service Workers

#### `public/firebase-messaging-sw.js` y `src/firebase-messaging-sw.js`
Service Worker para manejar:
- Mensajes en segundo plano
- Mostrar notificaciones del navegador
- Acciones de notificación (abrir/cerrar)

### Configuración

#### Modificaciones en `src/environments/environment.ts`
- Agregado `vapidKey` a la configuración de Firebase

#### Modificaciones en `src/app/app.component.ts`
- Inicialización automática del servicio de mensajería

## Configuración Requerida

### 1. VAPID Key
Reemplazar `YOUR_VAPID_KEY_HERE` en `environment.ts` con tu VAPID key real de Firebase Console:

```typescript
firebase: {
    ...firebaseConfig,
    vapidKey: 'tu-vapid-key-real'
}
```

### 2. Obtener VAPID Key
1. Ve a Firebase Console
2. Selecciona tu proyecto
3. Ve a Project Settings > Cloud Messaging
4. En "Web configuration", genera o copia tu VAPID key

### 3. Service Worker
El service worker debe estar en la carpeta `public/` para ser accesible desde la raíz del dominio.

## Uso

### En el Layout
El componente de notificaciones ya está integrado en el layout futuristic:

```html
<app-notifications></app-notifications>
```

### Programáticamente
```typescript
// Inyectar el servicio
constructor(private messagingService: MessagingService) {}

// Solicitar permisos
await this.messagingService.requestPermission();

// Obtener token
const token = this.messagingService.getCurrentToken();

// Suscribirse a nuevos mensajes
this.messagingService.newMessage$.subscribe(message => {
    if (message) {
        console.log('Nuevo mensaje:', message);
    }
});

// Obtener todas las notificaciones
this.messagingService.messages$.subscribe(messages => {
    console.log('Todas las notificaciones:', messages);
});
```

## Testing

### 1. Acceder a la página de demo
Navegar a `/messaging` para acceder a la página de demostración.

### 2. Obtener token FCM
1. Hacer clic en "Solicitar Permisos"
2. Aceptar los permisos del navegador
3. Copiar el token que aparece

### 3. Enviar notificación desde Firebase Console
1. Ve a Firebase Console > Cloud Messaging
2. Crea una nueva campaña
3. Pega el token FCM en "Add target"
4. Configura título y mensaje
5. Envía la notificación

### 4. Notificación simulada
Usar el botón "Simular Notificación" en la página de demo para probar la UI sin necesidad de Firebase Console.

## Funcionalidades Implementadas

### Características Principales
- ✅ Recepción de mensajes en primer plano y segundo plano
- ✅ Notificaciones del navegador nativas
- ✅ Gestión de permisos
- ✅ Token FCM automático
- ✅ UI responsive para notificaciones
- ✅ Marca de leído/no leído
- ✅ Eliminación de notificaciones individuales
- ✅ Limpieza masiva de notificaciones
- ✅ Contador de notificaciones no leídas
- ✅ Tiempo relativo de las notificaciones
- ✅ Persistencia local de mensajes

### Características Adicionales Útiles
- 📱 Soporte para móviles y desktop
- 🔄 Auto-refresh del token
- 💾 Cache local de hasta 50 mensajes
- 🎨 Animaciones suaves
- 🌙 Soporte para modo oscuro
- 🔔 Sonidos y vibraciones (en dispositivos compatibles)
- 📋 Copia de token al portapapeles

## Próximos Pasos

### Mejoras Sugeridas
1. **Sincronización con backend**: Enviar tokens al servidor para asociar con usuarios
2. **Categorización**: Diferentes tipos de notificaciones (info, warning, error)
3. **Configuración de usuario**: Permitir activar/desactivar tipos de notificación
4. **Analytics**: Tracking de apertura y interacción con notificaciones
5. **Rich notifications**: Soporte para imágenes y acciones personalizadas
6. **Programación**: Notificaciones programadas localmente
7. **Geolocalización**: Notificaciones basadas en ubicación

### Integración con Backend
```typescript
// Ejemplo de envío de token al backend
async saveTokenToServer(token: string, userId: string) {
    await this.http.post('/api/fcm-tokens', { token, userId }).toPromise();
}
```

## Troubleshooting

### Problemas Comunes

1. **Service Worker no se registra**
   - Verificar que el archivo esté en `public/firebase-messaging-sw.js`
   - Comprobar errores en la consola del navegador

2. **No se reciben notificaciones**
   - Verificar permisos del navegador
   - Comprobar que el token sea válido
   - Revisar configuración de Firebase

3. **VAPID key inválida**
   - Generar nueva VAPID key en Firebase Console
   - Actualizar en `environment.ts`

4. **Notificaciones duplicadas**
   - Verificar que solo haya un service worker registrado
   - Limpiar cache del navegador

### Logs útiles
El servicio incluye logs detallados en la consola del navegador para facilitar el debugging.

## Seguridad

### Consideraciones Importantes
- Nunca exponer la VAPID key en el cliente (se puede hacer, es pública)
- Validar tokens en el backend antes de usarlos
- Implementar rate limiting para prevenir spam
- No enviar información sensible en las notificaciones
- Respetar las preferencias de notificación del usuario

## Performance

### Optimizaciones Implementadas
- Lazy loading del módulo de mensajería
- Debounce en animaciones
- Límite de 50 mensajes en memoria
- Uso de OnPush change detection strategy (recomendado)
- TrackBy functions en ngFor para optimizar renders