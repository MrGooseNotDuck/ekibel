// Service Worker dla EKIBEL
const CACHE_NAME = 'ekibel-v1';

// Instalacja
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Aktywacja
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Obsługa powiadomień push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'Sprawdź status kolejki!',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚽</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚽</text></svg>',
        vibrate: [200, 100, 200],
        tag: 'ekibel',
        renotify: true,
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'Otwórz' },
            { action: 'close', title: 'Zamknij' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'EKIBEL', options)
    );
});

// Kliknięcie w powiadomienie
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Jeśli jest otwarte okno, skup na nim
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            // Jeśli nie, otwórz nowe
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Wiadomości z głównego wątku
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">' + (event.data.icon || '🚽') + '</text></svg>',
            vibrate: [200, 100, 200],
            tag: 'ekibel-' + Date.now(),
            renotify: true,
            requireInteraction: false
        });
    }
});
