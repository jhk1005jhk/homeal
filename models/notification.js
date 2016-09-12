var dbPool = require('../models/common').dbPool;

function selectRegistrationToken(data, callback) {
    var sql_selectRegistrationToken =
        'select registration_token ' +
        'from user ' +
        'where id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_selectRegistrationToken, [data.receiver], function(err, results) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback(err);
            }
            dbConn.release();
            dbPool.logStatus();
            callback(null, results);
        })
    });
}

module.exports.selectRegistarionToken = selectRegistrationToken;