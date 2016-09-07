var dbPool = require('../models/common').dbPool;

/* 일정 생성 */
function createSchedule(data, callback) {
    var sql =
        'insert into schedule(cooker_user_id, date, pax, sharing) ' +
        'values (?, str_to_date(?, "%Y/%m/%d %h:%i:%s"), ?, ?)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id, data.date, data.pax, data.sharing], function(err, result) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}
/* 일정 삭제 */
function deleteSchedule(data, callback) {
    var sql = 'delete from schedule where id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, result) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    });
}
module.exports.createSchedule = createSchedule;
module.exports.deleteSchedule = deleteSchedule;