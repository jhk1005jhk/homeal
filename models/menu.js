var dbPool = require('../models/common').dbPool;
var async = require('async');
var fs = require('fs');

/* 메뉴 생성 */
function createMenu(data, callback) {
    var sql_createMenu =
        'insert into menu(cooker_user_id, name, image, price, introduce, currency, activation) ' +
        'values (?, ?, ?, ?, ?, ?, ?)';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_createMenu, [data.id, data.name, data.image, data.price, data.introduce, data.currency, data.activation], function(err, result) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                dbConn.release();
                dbPool.logStatus();
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

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
       if (err) {
           return callback(err);
       }
       dbConn.beginTransaction(function(err) {
           if (err) {
               return callback(err);
           }
           async.waterfall([selectMenuInfo, updateMenuInfo], function(err) {
               if (err) {
                   dbConn.release();
                   dbPool.logStatus();
                   return callback(err);
               }
               dbConn.commit(function() {
                   dbConn.release();
                   dbPool.logStatus();
                   callback(null);
               });
           });
       });
        /* 메뉴 원래 정보 조회*/
        function selectMenuInfo(callback) {
            dbConn.query(sql_selectMenuInfo, [data.id], function(err, results) {
               if (err) {
                   return callback(err);
               }
               callback(null, results[0]);
            });
        }
        function updateMenuInfo(originalData, callback) {
            data.name = data.name || originalData.name;
            data.price = data.price || originalData.price;
            data.introduce = data.introduce || originalData.introduce;
            data.currency = data.currency || originalData.currency;
            data.activation = data.activation || originalData.activation;

            if (data.image === undefined) {
                data.image = originalData.image;

                dbConn.beginTransaction(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    dbConn.query(sql_updateMenuInfo, [data.name, data.image, data.price, data.introduce, data.currency, data.activation, data.id], function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                    });
                });
            } else {
                data.image = data.image.path;

                dbConn.beginTransaction(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    async.series([deleteFile, newMenuInfo], function(err) {
                        if (err) {
                            return dbConn.rollback(function () {
                                callback(err);
                            });
                        }
                        dbConn.commit(function() {
                            callback(null);
                        });
                    });
                });
            }
            function deleteFile(callback) {
                dbConn.query(sql_selectDeleteFilePath, [data.id], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    fs.unlink(results[0].image, function(err) {
                        if (err) {
                            return callback(err);
                        }
                    });
                    callback(null);
                });
            }
            function newMenuInfo(callback) {
                dbConn.query(sql_updateMenuInfo, [data.name, data.image, data.price, data.introduce, data.currency, data.activation, data.id], function (err, result) {
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
    var sql_selectDeleteFilePath = 'select image from menu where id = ?'; // 지울 사진 경로
    var sql_deleteMenu = 'delete from menu where id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([deleteFile, deleteMenu], function(err) {
                if (err) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        dbPool.logStatus();
                        callback(err);
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    dbPool.logStatus();
                    callback(null);
                });
            });
        });
        // 사진 파일 삭제
        function deleteFile(callback) {
            dbConn.query(sql_selectDeleteFilePath, [data.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                fs.unlink(results[0].image, function(err) {
                    if (err) {
                        return callback(err);
                    }
                });
                callback(null);
            });
        }
        // 사진 db 삭제
        function deleteMenu(callback) {
            dbConn.query(sql_deleteMenu, [data.id], function(err, result) {
                if (err) {
                    return callback(err)
                }
                callback(null);
            });
        }
    });
}

module.exports.createMenu = createMenu;
module.exports.updateMenu = updateMenu;
module.exports.deleteMenu = deleteMenu;
