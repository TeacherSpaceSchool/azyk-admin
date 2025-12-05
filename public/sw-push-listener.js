let notificationUrl = 'https://azyk.store';
// Полная очистка всех кэшей при активации
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            // eslint-disable-next-line no-undef
            Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
        )
    );

    self.clients.claim();
    self.skipWaiting();
});
//notification registered feature for getting update automatically from server api
self.addEventListener('push', function (event) {
    let _data = event.data ?
        event.data.json()
        :
        {title: 'AZYK.STORE', message: 'Не забудьте сделать свой заказ', tag: 'AZYK.STORE', url: 'https://azyk.store', icon: 'https://azyk.store/static/192x192.png'};
    event.waitUntil((async () => {
        if(_data.type === 'forceUpdate') {
            // Очистка всех кэшей
            const cacheNames = await caches.keys();
            // eslint-disable-next-line no-undef
            await Promise.all(cacheNames.map(name => caches.delete(name)));

            // Перезагрузка всех вкладок
            const clientList = await self.clients.matchAll({ type: 'window' });
            for (const client of clientList) {
                client.navigate(client.url);
            }
        }
        self.registration.showNotification(_data.title, {
            badge: 'https://azyk.store/static/192x192.png',
            body: _data.message,
            icon: _data.icon,
            tag: _data.tag,
            silent: false,
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            data: _data
        })
    })());
});

//notification url redirect event click
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    fetch('https://azyk.store:3000/push/clicknotification', {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `notification=${event.notification.data._id}`
    })

    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.matchAll({
            type: 'window'
        })
            .then(function (clientList) {
                for (let i = 0; i < clientList.length; i++) {
                    let client = clientList[i];
                    if(client.url == '/' && 'focus' in client)
                        return client.focus();
                }
                // eslint-disable-next-line no-undef
                if(clients.openWindow) {
                    // eslint-disable-next-line no-undef
                    return clients.openWindow(event.notification.data?event.notification.data.url:notificationUrl);
                }
            })
    );


});