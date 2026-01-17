export const firebaseConfig = {
    apiKey: "",
    vapidKey: "",
    authDomain: "",
    projectId: "proto-c51d8",
    storageBucket: "proto-c51d8.appspot.com",
    messagingSenderId: "1061232766933",
    appId: "1:1061232766933:web:b3c778c2aa1135067e975c",
    measurementId: "G-E53VHXMSPP"
};

export const firebaseEmulatorConfig = {
    useEmulators: false,
    auth: {
        host: 'localhost',
        port: 9099
    },
    firestore: {
        host: 'localhost',
        port: 8080
    },
    storage: {
        host: 'localhost',
        port: 9199
    }
};