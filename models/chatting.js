var dbPool = require('../models/common').dbPool;
var async = require('async');

/* 레지스트레이션 토큰 가져오기 */
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
            callback(null, results[0]);
        })
    });
}
/* 채팅 메시지 저장 */
function insertChattingLog(data, callback) {
    var sql_insertChattingLog =
        'insert into chatting (sender, receiver, message) ' +
        'values (?, ?, ?)';

    console.log('남길: ' + data.sender); // 66
    console.log('준홍: ' + data.receiver); // 35
    console.log('메시지: ' + data.message);
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_insertChattingLog, [data.sender, data.receiver, data.message], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        })
    });
}
/* 채팅 메시지 수신 */
function getChattingLog(data, callback) {
    var sql_selectChattingLog =
        'select id, sender, receiver, message, date ' +
        'from chatting ' +
        'where date < CURRENT_TIMESTAMP and receiver = ? and receipt = 0';
    var sql_updateChattingLog =
        'update chatting ' +
        'set receipt = 1 ' +
        'where id = ? and receipt = 0';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            var log = [];
            dbConn.query(sql_selectChattingLog, [data.receiver], function(err, results) {
                if (err) {
                    dbConn.release();
                    dbPool.logStatus();
                    return callback(err);
                }
                async.each(results, function(item, done) {
                    log.push({
                        message: item.message,
                        date: item.date
                    });
                    dbConn.query(sql_updateChattingLog, [item.id], function(err, result) {
                        if (err) {
                            return callback(err);
                        }
                        done(null);
                    });
                }, function(err) {
                    if (err) {
                        return callback(err);
                    }
                    dbConn.commit(function() {
                        dbConn.release();
                        dbPool.logStatus();
                        callback(null, log);
                    });
                });
            });
        });
    });
}

module.exports.selectRegistarionToken = selectRegistrationToken;
module.exports.insertChattingLog = insertChattingLog;
module.exports.getChattingLog = getChattingLog;