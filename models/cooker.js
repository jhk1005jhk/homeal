var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 쿠커 정보 조회 - 페이스북 사진인지 판단 */
function showCookerInfo(data, callback) {
    var sql = 'select * ' +
              'from user u join cooker c on (u.id = c.user_id) ' +
              'where id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var filename = path.basename(results[0].image); // 사진이름
            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
            };

            var data = {};
            data.image = results[0].image;
            data.name = results[0].name;
            data.type = results[0].type;
            data.grade = results[0].grade;
            callback(null, data);
        });
    });
}
/* 쿠커 정보 수정 */
function updateCookerInfo(data, callback) {
    var sql_selectDeleteFilePath = 'select image from user where id = ?'; // 지울 사진 경로
    var sql_updateUserInfo = 'update user ' +
                             'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
                             'where id = ?';
    var sql_updateCookerInfo = 'update cooker ' +
                               'set address = ? ' +
                               'where user_id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            async.series([deleteFile, updateUserInfo, updateCookerInfo], function(err) {
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
                    var filename = path.basename(results[0].image); // 사진이름
                    // 경로가 있는 사진만 지울 수 있음, 사진명만 있는건 경로를 찾을 수 없어서 못 지움
                    if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단, 페북 사진 아니면 실행
                        fs.unlink(results[0].image, function (err) {
                            if (err) {
                                return callback(err);
                            }
                        });
                    }
                    callback(null);
                });
            }
            /* 공통 정보 업데이트 (사진 경로 업데이트 포함) */
            function updateUserInfo(callback) {
                dbConn.query(sql_updateUserInfo,
                    [data.image, data.name, data.gender, data.birth, data.country,
                        data.phone, data.introduce, data.id], function (err, result) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null);
                });
            }
            /* 쿠커 정보 업데이트 */
            function updateCookerInfo(callback) {
                dbConn.query(sql_updateCookerInfo, [data.address, data.id], function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            }
        });
    })
}
/* 쿠커 가게 상세 페이지 조회 */
function showCookerStore(data, callback) {
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.parallel([showCookerInfo, showCookerMenu, showCookerSchedule], function (err, results) {
            dbConn.release();
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
                  'from user u join cooker c on (u.id = c.user_id) '  +
                  'join cooker_review cr on (u.id = cooker_user_id) ' +
                  'where id = ?';
        dbPool.getConnection(function(err, dbConn) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            dbConn.query(sql, [data.id], function(err, results) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                var filename = path.basename(results[0].image); // 사진이름
                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                var data = {};
                data.thumbnail = ['http://testUrl1.com','http://testUrl2.com','http://testUrl3.com'];
                data.image = results[0].image;
                data.name = results[0].name;
                data.address = results[0].address;
                data.longitude = results[0].longitude;
                data.latitude = results[0].latitude;
                data.grade = results[0].grade;
                data.taste = results[0].taste;
                data.cleanliness = results[0].cleanliness;
                data.kindness = results[0].kindness;
                data.review = results[0].review;
                callback(null, data);
            });
        });
    }
    /* 쿠커 메뉴 목록 조회 */
    function showCookerMenu(callback) {
        var sql = 'select * from menu where cooker_user_id = ?';
        dbPool.getConnection(function(err, dbConn) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            dbConn.query(sql, [data.id], function(err, results) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                async.each(results, function(item, done) {
                    var filename = path.basename(item.image); // 사진이름
                   item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/menus/' + filename);
                    done(null);
                });
                var data = {};
                data.id = results[0].id;
                data.name = results[0].name;
                data.image = results[0].image;
                data.price = results[0].price;
                data.introduce = results[0].introduce;
                data.currency = results[0].currency;
                data.activation = results[0].activation;
                callback(null, data);
            });
        });
    }
    /* 쿠커 일정 목록 조회 */
    function showCookerSchedule(callback) {
        var sql = 'select * from schedule where cooker_user_id = ?';
        dbPool.getConnection(function(err, dbConn) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            dbConn.query(sql, [data.id], function(err, results) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                var data = {};
                data.schedules = results;
                callback(null, data);
            });
        });
    }
}
/* 쿠커 메뉴 목록 조회 */
function showCookerMenu(data, callback) {
    var sql = 'select * from menu where cooker_user_id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
               item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/menus/' + filename);
                done(null);
            });
            var data = {};
            data.id = results[0].id;
            data.name = results[0].name;
            data.image = results[0].image;
            data.price = results[0].price;
            data.introduce = results[0].introduce;
            data.currency = results[0].currency;
            data.activation = results[0].activation;
            callback(null, results);
        });
    });
}
/* 쿠커 일정 목록 조회 */
function showCookerSchedule(data, callback) {
    var sql = 'select * from schedule where cooker_user_id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql, [data.id], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    });
}
/* 쿠커 섬네일 목록 조회 */
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
            dbConn.release();
            if (err) {
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                done(null);
            });
            // data.id = results[0].id;
            // data.image = results[0].image;
            // data.name = results[0].name;
            // data.address = results[0].address;
            // data.thumbnail = 'http://url.test';
            // data.grade = '1';
            // data.bookmarkCnt = '5';
            // data.reviewCnt = '5';
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
            dbConn.release();
            if (err) {
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                done(null);
            });
            var data = {};
            data.storeList = results;
            callback(null, data);
        });
    });
}
module.exports.showCookerInfo = showCookerInfo;
module.exports.updateCookerInfo = updateCookerInfo;
module.exports.showCookerStore = showCookerStore;
module.exports.showCookerMenu = showCookerMenu;
module.exports.showCookerSchedule = showCookerSchedule;
module.exports.showCookerStoreList = showCookerStoreList;
module.exports.searchCookerStore = searchCookerStore;
