let notificationUrl = 'https://azyk.store';
/*// При установке — активируем сразу (если мы вызвали skipWaiting)
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        await self.skipWaiting();
    })());
});
// Полная очистка всех кэшей при активации
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        // Очистка всех кэшей
        const cacheNames = await caches.keys();
        // eslint-disable-next-line no-undef
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        // Захват всех клиентов новым SW
        await self.clients.claim();
        // 🔥 Сообщаем всем вкладкам: "Я новый SW"
        const clients = await self.clients.matchAll({includeUncontrolled: true});
        for (const client of clients)
            client.postMessage({type: 'reload'});
    })());
});*/
//notification registered feature for getting update automatically from server api
self.addEventListener('push', function (event) {
    let _data = event.data ?
        event.data.json()
        :
        {title: 'AZYK.STORE', message: 'Не забудьте сделать свой заказ', tag: 'AZYK.STORE', url: 'https://azyk.store', icon: 'https://azyk.store/static/192x192.png'};
    event.waitUntil((async () => {
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