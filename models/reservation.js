var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 예약 생성 */
function createReservation(data, callback) {
    var sql_createReservation =
        'insert into reservation (eater_user_id, cooker_user_id, schedule_id, menu_id, pax, status) ' +
        'values (?, ?, ?, ?, ?, 1)';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        if (data.menus instanceof Array) {
            async.each(data.menus, function(menu, done) { // 메뉴 2개 이상 예약
                dbConn.query(sql_createReservation, [data.eater, data.cooker, data.schedule, menu, data.pax], function(err, result) {
                    if (err) {
                        return done(err);
                    }
                    done(null);
                });
            }, function (err) { // done callback
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}
/* 예약 조회 */
function showReservation(data, callback) {
    var sql_selectUserType =
        'select type from user where id = ?';
    var sql_reservationOfCooker =
        'select u.id uid, u.name uname, u.image, u.grade, r.id rid, date_format(s.date, \'%Y/%m/%d %H:%i\') date, r.pax, r.status, m.name mname ' +
        'from reservation r join schedule s on (r.schedule_id = s.id) ' +
                           'join menu m on (r.menu_id = m.id) ' +
                           'join user u on (r.eater_user_id = u.id) ' +
        'where r.cooker_user_id = ?';

    var sql_reservationOfEater =
        'select u.id uid, u.name uname, u.image, u.grade, r.id rid, date_format(s.date, \'%Y/%m/%d %H:%i\') date, r.pax, r.status, m.name mname ' +
        'from reservation r join schedule s on (r.schedule_id = s.id) ' +
                           'join menu m on (r.menu_id = m.id) ' +
                           'join user u on (r.cooker_user_id = u.id) ' +
        'where r.eater_user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
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
                        var filename = path.basename(item.image); // 사진이름
                        if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                            item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
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
                        var filename = path.basename(item.image); // 사진이름
                        if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                            item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                        }
                        done(null);
                    });
                    callback(null, results);
                });
            }
        }
    });
}
/* 예약 수정 */
function updateReservation(data, callback) {
    var sql_updateReservation =
        'update reservation ' +
        'set status = ? ' +
        'where id = ?';
    var sql_updateSchedule_DecreasePax =
        'update schedule ' +
        'set pax = pax - (select pax from reservation where id = ?)' +
        'where id = (select schedule_id from reservation where id = ?)';
    var sql_updateSchedule_IncreasePax =
        'update schedule ' +
        'set pax = pax + (select pax from reservation where id = ?)' +
        'where id = (select schedule_id from reservation where id = ?)';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        // 예약이 승인(2) 되었을 경우, 쿠커 일정 예약 가능 인원 감소
        // 예약이 취소(4,5) 되었을 경우, 쿠커 일정 예약 가능 인원 증가
        if (parseInt(data.status) === 2 || parseInt(data.status) === 4 || parseInt(data.status) === 5) {
            async.parallel([updateReservation, updateSchedulePax], function(err, result) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        } else { // (3)거절, (4)후기쓰기, (7)식사완료
            dbConn.query(sql_updateReservation, [data.status, data.reservation], function (err, result) {
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
            dbConn.query(sql_updateReservation, [data.status, data.reservation], function (err, result) {
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
                dbConn.query(sql_updateSchedule_DecreasePax, [data.reservation, data.reservation], function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
                // 쿠커 취소, 잇터 취소
            } else if (parseInt(data.status) === 4 || parseInt(data.status) === 5) {
                dbConn.query(sql_updateSchedule_IncreasePax, [data.reservation, data.reservation], function (err, result) {
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