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
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var filename = path.basename(results[0].image); // 사진이름
            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
            };
            var data = {};
            data.image = results[0].image;
            data.name = results[0].name;
            data.type = results[0].type;
            data.point = results[0].point;
            callback(null, data);
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