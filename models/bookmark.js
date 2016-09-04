var dbPool = require('../models/common').dbPool;

/* 찜 생성 */
function createBookmark(data, callback) {
    var sql = 'insert into bookmark (eater_user_id, cooker_user_id) ' +
              'values (?,?)';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.eater, data.cooker], function(err, result) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            callback(null, result);
        });
    });
}
/* 찜 조회 */
function showBookmark(data, callback) {
    var sql = 'select * ' +
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
            data.id = '1';
            data.image = "http://image.test";
            data.name = '테스트';
            data.address = '서울';
            data.introduce = '소개';
            data.thumbnail = "http://thumbnail.test";
            data.grade = '1';
            data.bookmarkCnt = '10';
            data.reviewCnt = '5';
            callback(null, data);
        });
    });
}
/* 찜 삭제 */
function deleteBookmark(data, callback) {
    var sql = 'delete from bookmark ' +
              'where eater_user_id = ? and cooker_user_id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.eater, data.cooker], function(err, result) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            callback(null, result);
        });
    });
}

module.exports.createBookmark = createBookmark;
module.exports.showBookmark = showBookmark;
module.exports.deleteBookmark = deleteBookmark;