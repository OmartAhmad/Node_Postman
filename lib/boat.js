const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sailing_adventure'
});

db.connect();

const handleRequest = (method, id, query, res) => {
    switch (method) {
        case 'GET':
            if (id) {
                getBoat(id, (statusCode, statusMessage, responseMessage) => {
                    sendResponse(res, statusCode, statusMessage, responseMessage);
                });
            } else {
                getAllBoats((statusCode, statusMessage, responseMessage) => {
                    sendResponse(res, statusCode, statusMessage, responseMessage);
                });
            }
            break;
        case 'POST':
            addBoat(query, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        case 'PUT':
            updateBoat(id, query, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        case 'DELETE':
            deleteBoat(id, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        default:
            sendResponse(res, 405, 'Method Not Allowed', 'Method Not Allowed\n');
    }
};

const sendResponse = (res, statusCode, statusMessage, responseMessage) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(`${responseMessage}`);
};

const getAllBoats = (cb) => {
    db.query('SELECT * FROM Boats', (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            const formattedResults = results.map(boat => `${boat.B_Id} ${boat.B_name} ${boat.B_type}`).join('\n');
            cb(200, 'OK', formattedResults);
        }
    });
};

const getBoat = (id, cb) => {
    db.query('SELECT * FROM Boats WHERE B_Id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            cb(404, 'Not Found', 'Not Found');
        } else {
            const formattedResults = results.map(boat => `${boat.B_Id} ${boat.B_name} ${boat.B_type}`).join('\n');
            cb(200, 'OK', formattedResults);
        }
    });
};

const addBoat = (data, cb) => {
    const { B_name, B_type } = data;
    db.query('INSERT INTO Boats (B_name, B_type) VALUES (?, ?)', [B_name, B_type], (err) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            cb(200, 'OK', 'Boat Added');
        }
    });
};

const updateBoat = (id, data, cb) => {
    const { B_name, B_type } = data;
    db.query('UPDATE Boats SET B_name = ?, B_type = ? WHERE B_Id = ?', [B_name, B_type, id], (err) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            cb(200, 'OK', 'Boat Updated');
        }
    });
};

const deleteBoat = (id, cb) => {
    db.query('DELETE FROM Boats WHERE B_Id = ?', [id], (err) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            cb(200, 'OK', 'Boat Deleted');
        }
    });
};

module.exports = {
    handleRequest
};
