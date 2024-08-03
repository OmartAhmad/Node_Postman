const http = require('http');
const url = require('url');
const sailor = require('./lib/sailor');
const boat = require('./lib/boat');
const reserves = require('./lib/reserves');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const path = parsedUrl.pathname.split('/');
    const query = parsedUrl.query;

    console.log(`Request received: ${method} ${parsedUrl.pathname}`);

    switch (path[1]) {
        case 'sailor':
            sailor.handleRequest(method, path[2], query, res);
            break;
        case 'boat':
            boat.handleRequest(method, path[2], query, res);
            break;
        case 'reserves':
            reserves.handleRequest(method, path[2], query, res);
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
