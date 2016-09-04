var dbPool = require('../models/common').dbPool;
var async = require('async');
/* 예약 생성 */
function createReservation(data, callback) {
    var sql = 'insert into reservation (eater_user_id, cooker_user_id, schedule_id, menu_id, pax, status) ' +
              'values (?, ?, ?, ?, ?, 1)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        if (data.menu instanceof Array) {
            async.each(data.menu, function(menu, done) { // 메뉴 2개 이상 예약
                dbConn.query(sql, [data.eater, data.cooker, data.schedule, menu, data.pax], function(err, result) {
                    if (err) {
                        return done(err);
                    }
                    done(null);
                });
            }, function (err) { // done callback
                dbConn.release();
                if (err) {
                    callback(err);
                }
                callback(null);
            });
        } else { // 메뉴 1개 예약
            dbConn.query(sql, [data.eater, data.cooker, data.schedule, data.menu, data.pax], function(err, result) {
                if (err) {
                    return callback(err);
                }
                dbConn.release();
                callback(null, result);
            });
        }
    });
}
/* 예약 조회 */
function showReservation(data, callback) {
    var sql_selectUserType = 'select type from user where id = ?';
    var sql_reservationOfCooker = 'select * from reservation where cooker_user_id = ?';
    var sql_reservationOfEater = 'select * from reservation where eater_user_id = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }
            async.waterfall([selectUserType, reservationOfUser], function (err, results) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, results);
                }
            });
            function selectUserType(callback) {
                dbConn.query(sql_selectUserType, [data.id], function (err, results) {
                    dbConn.release();
                    if (err) {
                        return callback(err);
                    }
                    if (results.length === 0) {
                        return callback(null, null);
                    }
                    callback(null, results[0].type); // 배열로 넘어오니까 [0]
                });
            }
            function reservationOfUser(type, callback) {
                if (type === 'cooker') {
                    dbConn.query(sql_reservationOfCooker, [data.id], function (err, results) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, results);
                    });
                } else if (type === 'eater') {
                    dbConn.query(sql_reservationOfEater, [data.id], function (err, results) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, results);
                    });
                }
            }
        });
    });
}
/* 예약 수정 */
function updateReservation(data, callback) {
    var sql = 'update reservation ' +
              'set status = ? ' +
              'where schedule_id = ?';
    dbPool.getConnection(function(err, dbConn) {
        dbConn.query(sql, [data.status, data.schedule], function (err, result) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}

module.exports.createReservation = createReservation;
module.exports.showReservation = showReservation;
module.exports.updateReservation = updateReservation;