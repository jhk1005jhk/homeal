var dbPool = require('../models/common').dbPool;

/* 일정 생성 */
function createSchedule(data, callback) {
    var sql = 'insert into schedule(cooker_user_id, date, people, sharing) ' +
        'values (?, str_to_date(?, "%Y/%m/%d %h:%i:%s"), ?, ?)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id, data.date, data.people, data.sharing],
            function(err, result) {
            if (err) {
                return console.log(err);
            }
            callback(null, result);
        });
    });
}
/* 일정 삭제 */
function deleteSchedule(data, callback) {
    var sql = 'delete from schedule where id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, result) {
            if (err) {
                return console.log(err);
            }
            callback(null, result);
        });
    });
}
module.exports.createSchedule = createSchedule;
module.exports.deleteSchedule = deleteSchedule;