var dbPool = require('../models/common').dbPool;

/* 레지스트레이션 토큰 추출 */
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
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            callback(null, results);
        })
    });
}

module.exports.selectRegistarionToken = selectRegistrationToken;