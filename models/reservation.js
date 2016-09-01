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
        console.log(data.menu);
        console.log(data.menu instanceof Array);
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
    var sql = 'insert into reservation (eater_user_id, cooker_user_id, status) ' +
        'values (?, ?, 1)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.eater, data.cooker], function(err, result) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            callback(null, result);
        });
    });
}
module.exports.createReservation = createReservation;