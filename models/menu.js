var dbPool = require('../models/common').dbPool;
var async = require('async');
var fs = require('fs');

/* 메뉴 생성 */
function createMenu(data, callback) {
    var sql_createMenu =
        'insert into menu(cooker_user_id, name, image, price, introduce, currency, activation) ' +
        'values (?, ?, ?, ?, ?, ?, ?)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql_createMenu, [data.id, data.name, data.image, data.price, data.introduce, data.currency, data.activation], function(err, result) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
    });
}
/* 메뉴 수정 */
function updateMenu(data, callback) {
    var sql_selectDeleteFilePath =
        'select image from menu where id = ?'; // 지울 사진 경로
    var sql_selectMenuInfo =
        'select name, image, price, introduce, currency, activation ' +
        'from menu ' +
        'where id = ?';
    var sql_updateMenuInfo =
        'update menu ' +
        'set name = ?, image = ?, price = ?, introduce = ?, currency = ?, activation = ? ' +
        'where id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            async.waterfall([selectMenuInfo, updateMenuInfo], function(err) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
        /* 원래 메뉴 정보 셀렉트 */
        function selectMenuInfo(callback) {
            dbConn.query(sql_selectMenuInfo, [data.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results[0]);
            });
        }
        // 메뉴 정보 업데이트
        function updateMenuInfo(originalData, callback) {
            data.name = data.name || originalData.name;
            data.price = data.price || originalData.price;
            data.introduce = data.introduce || originalData.introduce;
            data.currency = data.currency || originalData.currency;
            data.activation = data.activation || originalData.activation;

            if (data.image === undefined) { // 사진이 변경되지 않았을 때 (새로운 메뉴 정보로 업데이트)
                data.image = originalData.image;

                dbConn.query(sql_updateMenuInfo, [data.name, data.image, data.price, data.introduce, data.currency, data.activation, data.id], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            } else { // 사진이 변경 되었을 때
                data.image = data.image.path;

                async.series([deleteFile, newMenuInfo], function(err) { // 사진 파일을 지우고, 새로운 메뉴 정보로 업데이트
                    if (err) {
                        return dbConn.rollback(function() {
                            callback(err);
                        });
                    }
                    dbConn.commit(function() {
                        callback(null);
                    });
                });
            }
            // 사진이 변경되었을 때 기존 사진 삭제
            function deleteFile(callback) {
                dbPool.query(sql_selectDeleteFilePath, [data.id], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    console.log('지울 사진: ' + results[0].image);
                    // 경로가 있는 사진만 지울 수 있음, 사진명만 있는건 경로를 찾을 수 없어서 못 지움
                    fs.unlink(results[0].image, function(err) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    });
                });
            }
            // 새로운 메뉴 정보로 업데이트
            function newMenuInfo(callback) {
                dbConn.query(sql_updateMenuInfo, [data.name, data.image, data.price, data.introduce, data.currency, data.activation, data.id], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            }
        }
    });
}

/* 메뉴 삭제 */
function deleteMenu(data, callback) {
    var sql_deleteMenu = 'delete from menu where id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql_deleteMenu, [data.id], function(err, result) {
            dbConn.release();
            if (err) {
                return console.log(err);
            }
            callback(null);
        });
    });
}

module.exports.createMenu = createMenu;
module.exports.updateMenu = updateMenu;
module.exports.deleteMenu = deleteMenu;
