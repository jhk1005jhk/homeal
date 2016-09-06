var dbPool = require('../models/common').dbPool;
var async = require('async');
var url = require('url');
var fs = require('fs');

/* 리뷰 작성 */
function createReview(data, callback) {
    var sql_selectUserType =
        'select type from user where id = ?';
    var sql_createReviewOfCooker =
        'insert into cooker_review (cooker_user_id, eater_user_id, price, cleanliness, kindness, review) ' +
        'values (?, ?, ?, ?, ?, ?)';
    var sql_createReviewOfEater =
        'insert into eater_review (eater_user_id, cooker_user_id, time, manner, review) ' +
        'values (?, ?, ?, ?, ?)';
    var sql_updateReviewCount =
        'update cooker ' +
        'set reviewCnt = reviewCnt + 1 ' +
        'where user_id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        async.waterfall([selectUserType, createReview], function(err, result) {
            dbConn.release();
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
                async.parallel([createReviewOfCooker, updateReviewCount], function (err, results) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            // 잇터에 대한 리뷰 작성
            } else if (type === 'eater') {
                dbConn.query(sql_createReviewOfEater, [data.targetId, data.id, data.time, data.manner, data.review], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, result);
                });
            }
        }
        function createReviewOfCooker(callback) {
            dbConn.query(sql_createReviewOfCooker, [data.targetId, data.id, data.price, data.cleanliness, data.kindness, data.review], function(err, result) {
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
    });
}

module.exports.createReview = createReview;