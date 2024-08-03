const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sailing_adventure',
    multipleStatements: true
});

db.connect();

const handleRequest = (method, id, query, res) => {
    switch (method) {
        case 'GET':
            getAllReserves((statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        case 'POST':
            addReserve(query, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        case 'DELETE':
            deleteReserve(id, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        default:
            sendResponse(res, 405, 'Method Not Allowed', 'Method Not Allowed\n');
    }
};

const sendResponse = (res, statusCode, statusMessage, responseMessage) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(`${statusMessage}\n${responseMessage}`);
};

const getAllReserves = (cb) => {
    db.query('SELECT * FROM Reserves', (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            const formattedResults = results.map(reserve => `${reserve.S_id} ${reserve.B_id} ${reserve.Day}`).join('\n');
            cb(200, 'OK', formattedResults);
        }
    });
};

const addReserve = (data, cb) => {
    const { S_id, B_id, Day } = data;
    db.query('CALL InsertReservation(?, ?, ?, @message); SELECT @message AS message;', [S_id, B_id, Day], (err, results) => {
        if (err) {
            console.error('Error:', err); 
            cb(500, 'Internal Server Error', err.message);
        } else {
            const message = results[1][0].message; 
            cb(200, 'OK', message);
        }
    });
};

const deleteReserve = (id, cb) => {
    const { S_id, B_id, Day } = id;
    db.query('DELETE FROM Reserves WHERE S_id = ? AND B_id = ? AND Day = ?', [S_id, B_id, Day], (err) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            cb(200, 'OK', 'Reserve Deleted');
        }
    });
};

module.exports = {
    handleRequest
};
