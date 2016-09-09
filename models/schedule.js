var dbPool = require('../models/common').dbPool;

/* 일정 생성 */
function createSchedule(data, callback) {
    var sql_createSchedule =
        'insert into schedule(cooker_user_id, date, pax, sharing) ' +
        'values (?, ?, ?, ?)';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_createSchedule, [data.id, data.date, data.pax, data.sharing], function(err, result) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}
/* 일정 삭제 */
function deleteSchedule(data, callback) {
    var sql_deleteSchedule = 'delete from schedule where id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_deleteSchedule, [data.id], function(err, result) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}
module.exports.createSchedule = createSchedule;
module.exports.deleteSchedule = deleteSchedule;