var dbPool = require('../models/common').dbPool;
var async = require('async');
var fs = require('fs');
/* 대표사진 생성 */
function createPhoto(data, callback) {
    var sql_createPhoto =
        'insert into photo (cooker_user_id, image) ' +
        'values (?, ?)';

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        async.each(data.photos, function(item, done) {
            dbConn.query(sql_createPhoto, [data.id, item.path], function (err) { // item의 path 를 넣어야 한다
                if (err) {
                    return done(err);
                }
                done(null);
            });
        }, function(err) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            dbPool.logStatus();
            callback(null);
        });
    });
}
/* 대표 사진 삭제 */
function deletePhoto(data, callback) {
    var sql_selectDeleteFilePath = 'select image from photo where id = ?';
    var sql_deletePhoto = 'delete from photo where id = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.release();
        dbPool.logStatus();
        dbConn.beginTransaction(function(err) {
           if (err) {
               return callback(err);
           }
           async.series([deleteFile, deletePhoto], function(err) {
               if (err) {
                   return dbConn.rollback(function() {
                       callback(err);
                   });
               }
               dbConn.commit(function() {
                   callback(null, data);
               });
           });
        });

        function deleteFile(callback) {
            async.each(data.ids, function(item, done) {
                dbConn.query(sql_selectDeleteFilePath, [item], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    fs.unlink(results[0].image, function (err) {
                        if (err) {
                            return done(err);
                        }
                        done(null);
                    });
                });
            }, function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }

        function deletePhoto(callback) {
            async.each(data.ids, function(item, done) {
                dbConn.query(sql_deletePhoto, [item], function(err) { // item은 곧 id
                    if (err) {
                        return done(err);
                    }
                    done(null);
                });
            }, function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}

module.exports.createPhoto = createPhoto;
module.exports.deletePhoto = deletePhoto;