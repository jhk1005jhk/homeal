var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 잇터 정보 조회 */
function showEaterInfo(data, callback) {
    var sql = 'select * ' +
        'from user u join eater e on (u.id = e.user_id) ' +
        'where id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, results) {
            if (err) {
                return callback(err);
            }
            var filename = path.basename(results[0].image); // 사진이름
            results[0].image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/users/' + filename);
            // results[0].image = url.resolve('http://localhost:' + process.env.PORT, '/users/' + filename);
            dbConn.release();
            callback(null, results);
        });
    });
}
/* 잇터 정보 수정 */
function updateEaterInfo(data, callback) {
    var sql_selectDeleteFilePath = 'select image from user where id = ?'; // 지울 사진 경로
    var sql_updateUserInfo = 'update user ' +
        'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
        'where id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([deleteFile, updateUserInfo], function (err) {
                dbConn.release();
                if (err) {
                    return dbConn.rollback(function () {
                        callback(err);
                    });
                }
                dbConn.commit(function () {
                    callback(null, data);
                });
            });
            /* 사진 삭제 */
            function deleteFile(callback) {
                dbPool.query(sql_selectDeleteFilePath, [data.id], function (err, results) {
                    if (err) {
                        return callback(err);
                    }
                    fs.unlink(results[0].image, function (err) {
                        if (err) {
                            return callback(err);
                        }
                    });
                    callback(null);
                });
            }

            /* 공통 정보 업데이트 (사진 경로 업데이트 포함) */
            function updateUserInfo(callback) {
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
    })
}
module.exports.showEaterInfo = showEaterInfo;
module.exports.updateEaterInfo = updateEaterInfo;