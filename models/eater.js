var dbPool = require('../models/common').dbPool;

/* 잇터 정보 조회(1) */
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
            dbConn.release();
            callback(null, results);
        });
    });
}
/* 잇터 정보 수정 */
function updateEaterInfo(data, callback) {
    var sql_updateUserInfo = 'update user ' +
        'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
        'where id = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_updateUserInfo,
            [data.image, data.name, data.gender, data.birth, data.country,
                data.phone, data.introduce, data.id], function (err, result) {
                if (err) {
                    return console.log(err);
                }
                callback(null);
        });
    });
}
module.exports.showEaterInfo = showEaterInfo;
module.exports.updateEaterInfo = updateEaterInfo;