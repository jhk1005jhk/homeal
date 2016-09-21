var dbPool = require('../models/common').dbPool;
var async = require('async');

/* 채팅 메시지 저장 */
function insertChattingLog(data, callback) {
    var sql_insertChattingLog =
        'insert into chatting (sender, receiver, message, date) ' +
        'values (?, ?, ?, convert_tz(now(), \'+00:00\', \'+09:00\'));'

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
        'select c.id, sender, receiver, message, date_format(date, \'%Y/%m/%d %H:%i\') date, image, name ' +
        'from chatting c join user u on (c.sender = u.id) ' +
        'where date < convert_tz(CURRENT_TIMESTAMP, \'+00:00\', \'+09:00\') and receiver = ? and receipt = 0';
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
                        sender: item.sender,
                        name: item.name,
                        image: item.image,
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
                    dbConn.release();
                    dbPool.logStatus();
                    if (err) {
                        return callback(err);
                    }
                    dbConn.commit(function() {
                        callback(null, log);
                    });
                });
            });
        });
    });
}

//module.exports.selectRegistarionToken = selectRegistrationToken;
module.exports.insertChattingLog = insertChattingLog;
module.exports.getChattingLog = getChattingLog;