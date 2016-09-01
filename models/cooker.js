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
                var filename = path.basename(results[0].image); // 사진이름
                //results[0].image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/users/' + filename);
                results[0].image = url.resolve('http://localhost:' + process.env.PORT, '/users/' + filename);
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
                async.each(results, function(item, done) {
                    var filename = path.basename(item.image); // 사진이름
                    //item.image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/menus/' + filename);
                    item.image = url.resolve('http://localhost:' + process.env.PORT, '/menus/' + filename);
                    done(null);
                });
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
            dbConn.release();
            if (err) {
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                //item.image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/menus/' + filename);
                item.image = url.resolve('http://localhost:' + process.env.PORT, '/menus/' + filename);
                done(null);
            });
            // menu.id = results[0].id;
            // menu.cooker_user_id = results[0].cooker_user_id;
            // menu.name = results[0].name;
            // var filename = path.basename(results[0].image); // 사진이름
            // results.image = url.resolve('http://localhost:' + process.env.PORT, '/menus/' + filename);
            // menu.price = results[0].price;
            // menu.introduce = results[0].introduce;
            // menu.currency = results[0].currency;
            // menu.activation = results[0].activation;
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
        'group by u.id ' +
        'limit ?, ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        data.pageNo = parseInt(data.rowCount * (data.pageNo - 1)); // 숫자로 변환
        data.rowCount = parseInt(data.rowCount); // 숫자로 변환

        dbConn.query(sql, [data.pageNo, data.rowCount], function(err, results) {
            if (err) {
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                //item.image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/users/' + filename);
                item.image = url.resolve('http://localhost:' + process.env.PORT, '/users/' + filename);
                done(null);
            });
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
        'group by u.id ' +
        'limit ?, ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        data.keyword = "%" + data.keyword + "%";
        data.pageNo = parseInt(data.rowCount * (data.pageNo - 1)); // 숫자로 변환
        data.rowCount = parseInt(data.rowCount); // 숫자로 변환

        dbConn.query(sql, [data.keyword, data.keyword, data.pageNo, data.rowCount], function(err, results) {
            if (err) {
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                //item.image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/users/' + filename);
                item.image = url.resolve('http://localhost:' + process.env.PORT, '/users/' + filename);
                done(null);
            });
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
