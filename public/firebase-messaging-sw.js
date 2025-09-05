// Import the functions you need from the SDKs you need
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAky5dltJTCGjWhFEXV17BY-GEWZ8W32G8",
    authDomain: "proto-c51d8.firebaseapp.com",
    projectId: "proto-c51d8",
    storageBucket: "proto-c51d8.appspot.com",
    messagingSenderId: "1061232766933",
    appId: "1:1061232766933:web:b3c778c2aa1135067e975c",
    measurementId: "G-E53VHXMSPP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes un nuevo mensaje',
        icon: payload.notification?.icon || '/assets/images/logo/logo.svg',
        badge: '/assets/images/logo/logo.svg',
        tag: payload.data?.id || 'default',
        requireInteraction: false,
        actions: [
            {
                action: 'open',
                title: 'Abrir',
                icon: '/assets/images/icons/open.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/assets/images/icons/close.png'
            }
        ],
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification click received.');

    event.notification.close();

    if (event.action === 'open') {
        // Open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});