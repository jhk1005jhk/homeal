var dbPool = require('../models/common').dbPool;
var async = require('async');
var url = require('url');
var fs = require('fs');

/* 리뷰 작성 */
function createReview(data, callback) {
    var sql_createReviewOfCooker =
        'insert into cooker_review (cooker_user_id, eater_user_id, taste, price, cleanliness, kindness, review) ' +
        'values (?, ?, ?, ?, ?, ?, ?)';
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

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([createReviewOfCooker, updateReviewCount, updateGrade], function (err, results) {
                if (err) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        dbPool.logStatus();
                        callback(err);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    dbPool.logStatus();
                    callback(null, results);
                });
            });
        });
        function createReviewOfCooker(callback) {
            dbConn.query(sql_createReviewOfCooker, [data.cooker, data.id, data.taste, data.price, data.cleanliness, data.kindness, data.review], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }
        function updateReviewCount(callback) {
            dbConn.query(sql_updateReviewCount, [data.cooker], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }
        function updateGrade(callback) {
            dbConn.query(sql_updateCookerGrade, [data.cooker, data.cooker], function(err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, result);
                }
            })
        }
    });
}

module.exports.createReview = createReview;