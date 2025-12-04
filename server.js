const {createServer} = require('http')
const {join} = require('path')
const {parse} = require('url')
const next = require('next')
const app = next({ dev: !!process.env.dev })
const handle = app.getRequestHandler()

app.prepare()
    .then(() => {
        createServer((req, res) => {
            const parsedUrl = parse(req.url, true)
            const {pathname} = parsedUrl

            // Отдаём service-worker.js с no-cache
            if (pathname === '/service-worker.js') {
                const filePath = join(__dirname, '.next', 'service-worker.js');
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
                return app.serveStatic(req, res, filePath);
            }

            // Отдаём push-listener с no-cache
            if (pathname === '/sw-push-listener.js') {
                const filePath = join(__dirname, 'public', 'sw-push-listener.js');
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
                return app.serveStatic(req, res, filePath);
            }

            return handle(req, res, parsedUrl);
        })
            .listen(process.env.URL==='azyk.store'?5000:80)
    })