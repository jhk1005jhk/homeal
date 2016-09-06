var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 예약 생성 */
function createReservation(data, callback) {
    var sql =
        'insert into reservation (eater_user_id, cooker_user_id, schedule_id, menu_id, pax, status) ' +
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
    var sql_selectUserType =
        'select type from user where id = ?';
    var sql_reservationOfCooker =
        'select u.id uid, u.name uname, u.image uimage, u.grade, r.id rid, date_format(s.date, \'%Y/%m/%d %H:%i\') sdate, r.pax rpax, r.status rstatus, m.name mname ' +
        'from reservation r join schedule s on (r.schedule_id = s.id) ' +
                           'join menu m on (r.menu_id = m.id) ' +
                           'join user u on (r.cooker_user_id = u.id) ' +
                           'join cooker c on (u.id = c.user_id) ' +
        'where u.id = ?';
    var sql_reservationOfEater =
        'select u.id uid, u.name uname, u.image uimage, u.grade, r.id rid, date_format(s.date, \'%Y/%m/%d %H:%i\') sdate, r.pax rpax, r.status rstatus, m.name mname ' +
        'from reservation r join schedule s on (r.schedule_id = s.id) ' +
                           'join menu m on (r.menu_id = m.id) ' +
                           'join user u on (r.eater_user_id = u.id) ' +
                           'join eater e on (u.id = e.user_id) ' +
        'where u.id = ?';

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
                        async.each(results, function(item, done) {
                            var filename = path.basename(item.uimage); // 사진이름
                            item.uimage = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                            done(null);
                        });
                        callback(null, results);
                    });
                } else if (type === 'eater') {
                    dbConn.query(sql_reservationOfEater, [data.id], function (err, results) {
                        if (err) {
                            return callback(err);
                        }
                        async.each(results, function(item, done) {
                            var filename = path.basename(item.uimage); // 사진이름
                            item.uimage = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                            done(null);
                        });
                        callback(null, results);
                    });
                }
            }
        });
    });
}
/* 예약 수정 */
function updateReservation(data, callback) {
    var sql =
        'update reservation ' +
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