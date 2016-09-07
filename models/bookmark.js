var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 찜 생성 */
function createBookmark(data, callback) {
    var sql_createBookmark =
        'insert into bookmark (eater_user_id, cooker_user_id) ' +
        'values (?,?)';
    var sql_updateBookmarkCount =
        'update cooker ' +
        'set bookmarkCnt = bookmarkCnt + 1 ' +
        'where user_id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.parallel([createBookmark, updateBookmarkCount], function(err, results) {
            dbConn.release();
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });

        function createBookmark(callback) {
            dbConn.query(sql_createBookmark, [data.eater, data.cooker], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }

        function updateBookmarkCount(callback) {
            dbConn.query(sql_updateBookmarkCount, [data.cooker], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }
    });
}
/* 찜 조회 */
function showBookmark(data, callback) {
    var sql_showBookmark =
        'select u.id cid, p.image thumbnail, u.image, u.name name, c.address, u.introduce, accumulation, reviewCnt, bookmarkCnt, grade ' +
        'from cooker c join bookmark b on (c.user_id = b.cooker_user_id) ' +
        'join user u on (c.user_id = u.id) ' +
        'join photo p on (c.user_id = p.cooker_user_id) ' +
        'where b.eater_user_id = ? ' +
        'group by u.id';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql_showBookmark, [data.id], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            async.each(results, function (item, done) {
                var userFileName = path.basename(item.image);         // 유저 사진 이름
                var thumbnailFileName = path.basename(item.thumbnail); // 섬네일 사진 이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + userFileName);
                item.thumbnail = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + thumbnailFileName);
                item.isBookmark = 0;
                done(null);
            });
            callback(null, results);
        });
    });
}
/* 찜 삭제 */
function deleteBookmark(data, callback) {
    var sql_deleteBookmark =
        'delete from bookmark ' +
        'where eater_user_id = ? and cooker_user_id = ?';
    var sql_updateBookmarkCount =
        'update cooker ' +
        'set bookmarkCnt = bookmarkCnt - 1 ' +
        'where user_id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.parallel([deleteBookmark, updateBookmarkCount], function(err, results) {
            dbConn.release();
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
        function deleteBookmark(callback) {
            dbConn.query(sql_deleteBookmark, [data.eater, data.cooker], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }
        function updateBookmarkCount(callback) {
            dbConn.query(sql_updateBookmarkCount, [data.cooker], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }
    });
}

module.exports.createBookmark = createBookmark;
module.exports.showBookmark = showBookmark;
module.exports.deleteBookmark = deleteBookmark;