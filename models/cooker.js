var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');

/* 쿠커 정보 조회(1) */
function showCookerInfo(data, callback) {
    var sql = 'select * ' +
              'from user u join cooker c on (u.id = c.user_id) ' +
              'where id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        var cooker = {};

        dbConn.query(sql, [data.id], function(err, results) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            callback(null, results);
        });
    });
}
/* 쿠커 정보 수정 */
function updateCookerInfo(data, callback) {
    var sql_updateUserInfo = 'update user ' +
                              'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
                              'where id = ?';
    var sql_updateCookerInfo = 'update cooker ' +
                               'set address = ? ' +
                               'where user_id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) {
            if (err) {
                return callback(err);
            }
            async.parallel([updateUserInfo, updateCookerInfo], function (err) {
                if (err) {
                    return dbConn.rollback(function () {
                        dbConn.release();
                        callback(err);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    callback(null, data);
                })
            });

            function updateUserInfo(callback) {
                dbConn.query(sql_updateUserInfo,
                    [data.image, data.name, data.gender, data.birth,data.country,
                        data.phone, data.introduce, data.id], function (err, result) {
                        if (err) {
                            return console.log(err);
                        }
                        callback(null);
                    });
            }

            function updateCookerInfo(callback) {
                dbConn.query(sql_updateCookerInfo, [data.address, data.id], function (err, result) {
                    if (err) {
                        return console.log(err);
                    }
                    callback(null);
                });
            }
        });
    });
}
/* 쿠커 가게 상세 페이지 조회 */
function showCookerStore(data, callback) {
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        async.parallel([showCookerInfo, showCookerMenu, showCookerSchedule], function (err, results) {
            if (err) {
                return callback(err);
            } else {
                callback(null, results);
            }
        });
    });
    /* 쿠커 정보 조회 */
    function showCookerInfo(callback) {
        var sql = 'select * ' +
            'from user u join cooker c on (u.id = c.user_id) ' +
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
    /* 쿠커 메뉴 목록 조회 */
    function showCookerMenu(callback) {
        var sql = 'select * from menu where cooker_user_id = ?';
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
    /* 쿠커 일정 목록 조회 */
    function showCookerSchedule(callback) {
        var sql = 'select * from schedule where cooker_user_id = ?';
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
}
/* 쿠커 메뉴 목록 조회(2) */
function showCookerMenu(data, callback) {
    var sql = 'select * from menu where cooker_user_id = ?';
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
/* 쿠커 일정 목록 조회(3) */
function showCookerSchedule(data, callback) {
    var sql = 'select * from schedule where cooker_user_id = ?';
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
/* 쿠커 섬네일 페이지 목록 조회 */
function showCookerStoreList(data, callback) {
    var sql = 'select * ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'join image i on (u.id = i.cooker_user_id) ' +
        'group by u.id';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function(err, results) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            callback(null, results);
        });
    });
}
/* 쿠커 섬네일 페이지 검색 */
function searchCookerStore(data, callback) {
    var sql = 'select * ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'join image i on (u.id = i.cooker_user_id) ' +
        'where name like ? or address like ? ' +
        'group by u.id';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        data.keyword = "%" + data.keyword + "%";
        dbConn.query(sql, [data.keyword, data.keyword], function(err, results) {
            if (err) {
                return callback(err);
            }
            dbConn.release();
            callback(null, results);
        })
    })
}
module.exports.showCookerInfo = showCookerInfo;
module.exports.updateCookerInfo = updateCookerInfo;
module.exports.showCookerStore = showCookerStore;
module.exports.showCookerMenu = showCookerMenu;
module.exports.showCookerSchedule = showCookerSchedule;
module.exports.showCookerStoreList = showCookerStoreList;
module.exports.searchCookerStore = searchCookerStore;
