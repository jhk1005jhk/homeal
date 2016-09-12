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

    dbPool.logStatus();
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
                if (err) {
                    dbConn.release();
                    dbPool.logStatus();
                    return callback(err);
                }
                dbConn.release();
                dbPool.logStatus();
                callback(null);
            });
        } else { // 메뉴 1개 예약
            dbConn.query(sql, [data.eater, data.cooker, data.schedule, data.menu, data.pax], function(err, result) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
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

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }
            async.waterfall([selectUserType, reservationOfUser], function (err, results) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    callback(err);
                } else {
                    callback(null, results);
                }
            });
            function selectUserType(callback) {
                dbConn.query(sql_selectUserType, [data.id], function (err, results) {
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
                            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                            }
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
                            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                            }
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
    var sql_updateReservation =
        'update reservation ' +
        'set status = ? ' +
        'where schedule_id = ?';
    var sql_updateSchedule_DecreasePax =
        'update schedule ' +
        'set pax = pax - (select pax from reservation where schedule_id = ?)' +
        'where id = ?';
    var sql_updateSchedule_IncreasePax =
        'update schedule ' +
        'set pax = pax + (select pax from reservation where schedule_id = ?)' +
        'where id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        // 예약이 승인 되었을 경우, 쿠커 일정 예약 가능 인원 감소
        if (parseInt(data.status) === 2) {
            async.parallel([updateReservation, updateSchedulePax], function(err, results) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        // 예약이 취소 될 경우, 쿠커 일정 예약 가능 인원 증가
        } else if (parseInt(data.status) === 4 || parseInt(data.status) === 5) {
            async.parallel([updateReservation, updateSchedulePax], function(err, results) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        } else {
            dbConn.query(sql_updateReservation, [data.status, data.schedule], function (err, result) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
        // 쿠커 예약 상태 변경
        function updateReservation(callback) {
            dbConn.query(sql_updateReservation, [data.status, data.schedule], function (err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
        // 일정 예약 가능인원 업데이트
        function updateSchedulePax(callback) {
            // 승인
            if (parseInt(data.status) === 2) {
                dbConn.query(sql_updateSchedule_DecreasePax, [data.schedule, data.schedule], function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            } else { // 쿠커 취소, 잇터 취소
                dbConn.query(sql_updateSchedule_IncreasePax, [data.schedule, data.schedule], function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            }
        }
    });
}

module.exports.createReservation = createReservation;
module.exports.showReservation = showReservation;
module.exports.updateReservation = updateReservation;