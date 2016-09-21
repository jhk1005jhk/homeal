var mysql = require('mysql');
var logger = require('../common/logger');
var dbPoolConfig = require('../config/dbPoolConfig');
var dbPool = mysql.createPool(dbPoolConfig);

dbPool.logStatus = function() {
    logger.log('debug', 'dbpool : current free %d conns/ %d conns in a database pool',
        dbPool._freeConnections.length,
        dbPool._allConnections.length
    );
};

dbPool.on('connection', function(connection) {
    logger.log('debug', 'connection event : free %d conns/ %d conns in a database pool',
        dbPool._freeConnections.length,
        dbPool._allConnections.length
    );
});

dbPool.on("enqueue", function() {
    logger.log('debug', 'enque event : total %d waiting conns in a queue',
        dbPool._connectionQueue.length
    );
});
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
module.exports.dbPool = dbPool;