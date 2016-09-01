var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 메뉴 생성 */
function createMenu(data, callback) {
    var sql = 'insert into menu(cooker_user_id, name, image, price, introduce, currency, activation) ' +
               'values (?, ?, ?, ?, ?, ?, ?)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id, data.name, data.image, data.price, data.introduce, data.currency, data.activation],
            function(err, result) {
                if (err) {
                    return console.log(err);
                }
                callback(null);
            });
    });
}
/* 메뉴 수정 */
function updateMenu(data, callback) {
    var sql_selectDeleteFilePath = 'select image from menu where id = ?'; // 지울 사진 경로
    var sql_updateMenuInfo = 'update menu ' +
                             'set name = ?, image = ?, price = ?, introduce = ?, currency = ?, activation = ? ' +
                             'where id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([deleteFile, updateMenuInfo], function(err) {
                dbConn.release();
                if (err) {
                    return dbConn.rollback(function() {
                        callback(err);
                    });
                }
                dbConn.commit(function() {
                    callback(null, data);
                });
            });
            /* 사진 삭제 */
            function deleteFile(callback) {
                dbPool.query(sql_selectDeleteFilePath, [data.id], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    console.log('삭제할 사진: ' + results[0].image);
                    fs.unlink(results[0].image, function(err) {
                        if (err) {
                            return callback(err);
                        }
                    });
                    callback(null);
                });
            }
            function updateMenuInfo(callback) {
                dbConn.query(sql_updateMenuInfo, [data.name, data.image, data.price, data.introduce, data.currency, data.activation, data.id],
                    function(err, result) {
                        if (err) {
                            return console.log(err);
                        }
                        callback(null);
                    });
            }
        });
    });
}
/* 메뉴 삭제 */
function deleteMenu(data, callback) {
    var sql = 'delete from menu where id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, result) {
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
