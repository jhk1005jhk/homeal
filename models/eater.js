var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 잇터 정보 조회 */
function showEaterInfo(data, callback) {
    var sql_showEaterInfo =
        'select image, gender, date_format(date, \'%Y/%m/%d %H:%i\'), phone, country, introduce, name, type, point, grade ' +
        'from user u join eater e on (u.id = e.user_id) ' +
        'where user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showEaterInfo, [data.id], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            var filename = path.basename(results[0].image); // 사진이름
            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
            }
            callback(null, results[0]);
        });
    });
}
/* 잇터 정보 수정 (connection 2개 생김) */
function updateEaterInfo(data, callback) {
    var sql_selectDeleteFilePath =
        'select image from user where id = ?'; // 지울 사진 경로
    var sql_selectEaterInfo =
        'select image, name, gender, birth, country, phone, introduce ' +
        'from user u join eater e on (u.id = e.user_id) ' +
        'where u.id = ?';
    var sql_updateUserInfo =
        'update user ' +
        'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
        'where id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback(err);
            }
            async.waterfall([selectEaterInfo, updateUserInfo], function (err) {
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
                    callback(null);
                });
            });
        });
        /* 잇터 원래 정보 조회*/
        function selectEaterInfo(callback) {
            dbConn.query(sql_selectEaterInfo, [data.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results[0]);
            });
        }
        /* 잇터 정보 업데이트 */
        function updateUserInfo(originalData, callback) {
            data.name = data.name || originalData.name;
            data.gender = data.gender || originalData.gender;
            data.birth = data.birth || originalData.birth;
            data.country = data.country || originalData.country;
            data.phone = data.phone || originalData.name;
            data.introduce = data.introduce || originalData.introduce;

            if (data.image === undefined) {
                data.image = originalData.image;

                dbConn.query(sql_updateUserInfo, [data.image, data.name, data.gender, data.birth, data.country, data.phone, data.introduce, data.id], function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            } else {
                data.image = data.image.path;

                dbConn.beginTransaction(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    async.series([deleteFile, newUserInfo], function (err) {
                        if (err) {
                            return dbConn.rollback(function () {
                                callback(err);
                            });
                        }
                        dbConn.commit(function () {
                            callback(null);
                        });
                    });
                });
            }
        }
        /* 사진 삭제 */
        function deleteFile(callback) {
            dbPool.query(sql_selectDeleteFilePath, [data.id], function (err, results) {
                if (err) {
                    return callback(err);
                }
                var filename = path.basename(results[0].image); // 사진이름
                // 경로가 있는 사진만 지울 수 있음, 사진명만 있는건 경로를 찾을 수 없어서 못 지움
                if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단, 페북 사진 아니면 실행
                    fs.unlink(results[0].image, function (err) {
                        if (err) {
                            return callback(err);
                        }
                    });
                }
                callback(null);
            });
        }
        /* 공통 정보 업데이트 (사진 경로 업데이트 포함) */
        function newUserInfo(callback) {
            dbConn.query(sql_updateUserInfo,
                [data.image, data.name, data.gender, data.birth, data.country,
                    data.phone, data.introduce, data.id], function (err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}
/* 잇터 후기 목록 조회 */
function showEaterReview(data, callback) {
    var sql_showEaterReview =
        'select er.cooker_user_id cid, u.image, u.name, time, manner, review, date_format(date, \'%Y/%m/%d %H:%i\') date ' +
        'from eater_review er join user u on (er.cooker_user_id = u.id) ' +
        'where eater_user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showEaterReview, [data.id], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            var filename = path.basename(results[0].image); // 사진이름
            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
            }
            callback(null, results);
        });
    });
}
module.exports.showEaterInfo = showEaterInfo;
module.exports.updateEaterInfo = updateEaterInfo;
module.exports.showEaterReview = showEaterReview;