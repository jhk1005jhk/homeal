var dbPool = require('../models/common').dbPool;

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
    var sql = 'update menu ' +
               'set name = ?, image = ?, price = ?, introduce = ?, currency = ?, activation = ? ' +
               'where id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.name, data.image, data.price, data.introduce, data.currency, data.activation, data.id],
            function(err, result) {
                if (err) {
                    return console.log(err);
                }
                callback(null);
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
