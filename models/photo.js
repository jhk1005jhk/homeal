var dbPool = require('../models/common').dbPool;
var async = require('async');
var fs = require('fs');

function createPhoto(data, callback) {
    var sql_createPhoto =
        'insert into photo (cooker_user_id, image) ' +
        'values (?, ?)';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            dbConn.release();
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
                dbConn.release();
                return callback(err);
            }
            dbConn.release();
            callback(null);
        });
    });
}

/* 사진 삭제 */
function deletePhoto(data, callback) {
    var sql_deletePhotoPath =
        'select image from photo where cooker_user_id = ?';
    var sql_deletePhoto =
        'delete from photo where id = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
           if (err) {
               dbConn.release();
               return callback(err);
           }
           async.series([deletePhotoPath, deletePhoto], function(err) {
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
        });

        function deletePhotoPath(callback) {
                dbConn.query(sql_deletePhotoPath, [data.cooker], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    async.each(results, function(item, done) {
                        // 경로가 있는 사진만 지울 수 있음, 사진명만 있는건 경로를 찾을 수 없어서 못 지움
                        fs.unlink(item.image, function (err) {
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