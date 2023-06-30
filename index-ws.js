const express = require('express');
const { devNull } = require('os');
const server = require('http').createServer();
const app = express();

app.get('/', function(req, res){
    res.sendFile('index.html', {root: __dirname});
});



server.on('request', app);
server.listen(3000, function(){
    console.log('server started on port 3000');
});


process.on('SIGINT', () => {  
    console.log('sigint');

    wss.clients.forEach(function each(client) {
        client.close();
    });
    server.close(() => {
        shutdownDB();
    })
})

/* Begin Websocket */
// Now here firstly we will do `npm i ws`

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({server: server});

wss.on('connection', function connection(ws){
    const numClients = wss.clients.size;
    console.log('Clients connected', numClients);

    wss.broadcast(`Current Visitors: ${numClients}`);

    if(ws.readyState === ws.OPEN){
        ws.send('Welcome to my server');
    }

    db.run(`INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

    ws.on('close', function close(){
        wss.broadcast(`Current Vistors: ${numClients}`);
        console.log('A client has disconnected');
    });
})

wss.broadcast = function broadcast(data){
    wss.clients.forEach(function each(client){
        client.send(data);
    });
}

/** End WebSocket */

/** Begin Database */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');


// Here we will firstly set the table, Serialize commands ensures that the database is set up before we run.
db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

function shutdownDB() {
    getCounts();
    console.log('Shutting down db');
    db.close();
}
