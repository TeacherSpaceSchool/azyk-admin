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

            if(pathname === '/service-worker.js') {
                const filePath = join(__dirname, '.next', pathname)

                app.serveStatic(req, res, filePath)
            } else {
                handle(req, res, parsedUrl)
            }
        })
            .listen(process.env.URL==='azyk.store'?5000:80)
    })