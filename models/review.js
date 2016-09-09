var dbPool = require('../models/common').dbPool;
var async = require('async');
var url = require('url');
var fs = require('fs');

/* 리뷰 작성 */
function createReview(data, callback) {
    var sql_selectUserType =
        'select type from user where id = ?';
    var sql_createReviewOfCooker =
        'insert into cooker_review (cooker_user_id, eater_user_id, taste, price, cleanliness, kindness, review) ' +
        'values (?, ?, ?, ?, ?, ?, ?)';
    var sql_createReviewOfEater =
        'insert into eater_review (eater_user_id, cooker_user_id, time, manner, review) ' +
        'values (?, ?, ?, ?, ?)';
    var sql_updateReviewCount =
        'update cooker ' +
        'set reviewCnt = reviewCnt + 1 ' +
        'where user_id = ?';
    var sql_updateCookerGrade =
        'update user u ' +
        'set u.grade = (select round((avg(taste) + avg(price) + avg(cleanliness) + avg(kindness))/4, 1) grade ' +
                       'from cooker c join cooker_review cr on (c.user_id = cr.cooker_user_id) ' +
                       'where cooker_user_id = ?) ' +
        'where u.id = ?';
    var sql_updateEaterGrade =
        'update user u ' +
        'set u.grade = (select round((avg(time) + avg(manner))/2, 1) grade ' +
                       'from eater e join eater_review er on (e.user_id = er.eater_user_id) ' +
                       'where eater_user_id = ?) ' +
        'where u.id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        async.waterfall([selectUserType, createReview], function(err, result) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                callback(err);
            } else {
                callback(null, result)
            }
        });
        // 유저 타입 반환
        function selectUserType(callback) {
            dbConn.query(sql_selectUserType, [data.targetId], function(err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results[0].type); // 배열로 넘어오니까 [0]
            });
        }
        // 유저 타입에 따른 SQL문 실행
        function createReview(type, callback) {
            // 쿠커에 대한 리뷰 작성
            if (type === 'cooker') {
                async.parallel([createReviewOfCooker, updateReviewCount, updateUserGrade], function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            // 잇터에 대한 리뷰 작성
            } else if (type === 'eater') {
                async.parallel([createReviewOfEater, updateUserGrade], function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        }
        function createReviewOfCooker(callback) {
            dbConn.query(sql_createReviewOfCooker, [data.targetId, data.id, data.taste, data.price, data.cleanliness, data.kindness, data.review], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }

        function createReviewOfEater(callback) {
            dbConn.query(sql_createReviewOfEater, [data.targetId, data.id, data.time, data.manner, data.review], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }

        function updateReviewCount(callback) {
            dbConn.query(sql_updateReviewCount, [data.targetId], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }

        function updateUserGrade(callback) {
            async.waterfall([selectUserType, updateGrade], function(err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, result)
                }
            });
        }

        function updateGrade(type, callback) {
            if (type === 'cooker') {
                dbConn.query(sql_updateCookerGrade, [data.targetId, data.targetId], function(err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                })
            } else if (type === 'eater') {
                dbConn.query(sql_updateEaterGrade, [data.targetId, data.targetId], function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result);
                    }
                });
            }
        }
    });
}

module.exports.createReview = createReview;