var dbPool = require('../models/common').dbPool;
var async = require('async');

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
    var sql = 'select u.id, u.image, u.name name, c.address, u.introduce, i.image thumbnail ' +
              'from cooker c join bookmark b on (c.user_id = b.cooker_user_id) ' +
              'join user u on (c.user_id = c.user_id) ' +
              'join image i on (c.user_id = i.cooker_user_id) ' +
              'where b.eater_user_id = ? ' +
              'group by user_id';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, results) {
            if (err) {
                return callback(err);
            }
            var data = {};
            data.bookmarks = results;
            callback(null, data);
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