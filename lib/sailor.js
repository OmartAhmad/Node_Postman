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
            if (id) {
                getSailor(id, (statusCode, statusMessage, responseMessage) => {
                    sendResponse(res, statusCode, statusMessage, responseMessage);
                });
            } else {
                getAllSailors((statusCode, statusMessage, responseMessage) => {
                    sendResponse(res, statusCode, statusMessage, responseMessage);
                });
            }
            break;
        case 'POST':
            addSailor(query, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        case 'PUT':
            updateSailor(id, query, (statusCode, statusMessage, responseMessage) => {
                sendResponse(res, statusCode, statusMessage, responseMessage);
            });
            break;
        case 'DELETE':
            deleteSailor(id, (statusCode, statusMessage, responseMessage) => {
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

const getAllSailors = (cb) => {
    db.query('SELECT * FROM Sailors', (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            const formattedResults = results.map(sailor => `${sailor.S_Id} ${sailor.S_name} ${sailor.Rate}`).join('\n');
            cb(200, 'OK', formattedResults);
        }
    });
};

const getSailor = (id, cb) => {
    db.query('SELECT * FROM Sailors WHERE S_Id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            cb(404, 'Not Found', 'Not Found');
        } else {
            const formattedResults = results.map(sailor => `${sailor.S_Id} ${sailor.S_name} ${sailor.Rate}`).join('\n');
            cb(200, 'OK', formattedResults);
        }
    });
};

const addSailor = (data, cb) => {
    const { S_name, B_date, Rate } = data;
    db.query('CALL InsertSailor(?, ?, ?, @message); SELECT @message AS message;', [S_name, B_date, Rate], (err, results) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            const message = results[1][0].message;
            cb(200, 'OK', message);
        }
    });
};

const updateSailor = (id, data, cb) => {
    const { S_name, B_date, Rate } = data;
    db.query('UPDATE Sailors SET S_name = ?, B_date = ?, Rate = ? WHERE S_Id = ?', [S_name, B_date, Rate, id], (err) => {
        if (err) {
            cb(500, 'Internal Server Error', 'Internal Server Error');
        } else {
            cb(200, 'OK', 'Sailor Updated');
        }
    });
};

const deleteSailor = (id, cb) => {
    db.query('DELETE FROM Sailors WHERE S_Id = ?', [id], (err) => {
        if (err) {
            cb(500, 'Internal Server Error', err.message);
        } else {
            cb(200, 'OK', 'Sailor Deleted');
        }
    });
};

module.exports = {
    handleRequest
};
