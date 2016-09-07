var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 쿠커 정보 조회 - 페이스북 사진인지 판단 */
function showCookerInfo(data, callback) {
    var sql =
        'select image, gender, birth, phone, address, country, introduce, name, type, grade ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'where user_id = ?';

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
            if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
            }
            callback(null, results[0]);
        });
    });
}
/* 쿠커 정보 수정 */
function updateCookerInfo(data, callback) {
    var sql_selectDeleteFilePath =
        'select image from user where id = ?'; // 지울 사진 경로
    var sql_updateUserInfo =
        'update user ' +
        'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
        'where id = ?';
    var sql_updateCookerInfo =
        'update cooker ' +
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
/* 쿠커 가게 페이지 조회 */
function showCookerStore(data, callback) {
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.parallel([showCookerPhoto, showCookerInfo, showCookerMenu, showCookerSchedule], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            } else {
                callback(null, results);
            }
        });
    });
    /* 쿠커 포토 조회*/
    function showCookerPhoto(callback) {
        var sql =
            'select image ' +
            'from cooker c join photo p on (c.user_id = p.cooker_user_id) ' +
            'where c.user_id = ?';
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
                    item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + filename);
                    done(null);
                });
                callback(null, results);
            });
        });
    }
    /* 쿠커 정보 조회 */
    function showCookerInfo(callback) {
        var sql =
            'select u.id uid, image, name, gender, birth, country, phone, introduce, address, longitude, latitude, accumulation, ' +
                    'round((avg(taste) + avg(price) + avg(cleanliness) + avg(kindness))/4, 1) grade, ' +
                    'round(avg(taste), 1) taste, round(avg(price), 1) price, ' +
                    'round(avg(cleanliness), 1) cleanliness, round(avg(kindness), 1) kindness ' +
            'from user u join cooker c on (u.id = c.user_id) ' +
                        'join cooker_review cr on (u.id = cr.cooker_user_id) ' +
            'where cooker_user_id = ?';

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
                callback(null, results[0]);
            });
        });
    }
    /* 쿠커 메뉴 목록 조회 */
    function showCookerMenu(callback) {
        var sql = 'select id, name, image, price, introduce, currency, activation ' +
                  'from menu ' +
                  'where cooker_user_id = ?';

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
                    callback(null, results);
                });
        });
    }
    /* 쿠커 일정 목록 조회 */
    function showCookerSchedule(callback) {
        var sql = 'select id, date_format(date, \'%Y/%m/%d %H:%i\') as date, pax, sharing ' +
                  'from schedule ' +
                  'where cooker_user_id = ?';
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
}
/* 쿠커 포토 조회*/
function showCookerPhoto(data, callback) {
    var sql =
        'select image ' +
        'from cooker c join photo p on (c.user_id = p.cooker_user_id) ' +
        'where c.user_id = ?';
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
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + filename);
                done(null);
            });
            callback(null, results);
        });
    });
}
/* 쿠커 메뉴 목록 조회 */
function showCookerMenu(data, callback) {
    var sql = 'select id, name, image, price, introduce, currency, activation ' +
              'from menu ' +
              'where cooker_user_id = ?';

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
            callback(null, results);
        });
    });
}
/* 쿠커 일정 목록 조회 */
function showCookerSchedule(data, callback) {
    var sql = 'select id, date_format(date, \'%Y/%m/%d %H:%i\') as date, pax, sharing ' +
              'from schedule ' +
              'where cooker_user_id = ?';
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
    // 내가 찜한 건지 아닌지 목록에 표시 (isBookmark)
    var sql_selectCookerInfo =
        'select u.id cid, p.image thumbnail, u.image image, u.name name, c.address address, u.introduce introduce, accumulation, reviewCnt, bookmarkCnt, grade, eater_user_id isBookmark ' +
        'from cooker c join user u on (u.id = c.user_id) ' +
        'join photo p on (c.user_id = p.cooker_user_id) ' +
        'left join bookmark b on (c.user_id = b.cooker_user_id) ' +
        'group by u.id ' +
        'limit ?, ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        data.pageNo = parseInt(data.rowCount * (data.pageNo - 1)); // 숫자로 변환
        data.rowCount = parseInt(data.rowCount); // 숫자로 변환

        dbConn.query(sql_selectCookerInfo, [data.pageNo, data.rowCount], function (err, results) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            dbConn.release();
            async.each(results, function (item, done) {
                var userFileName = path.basename(item.image);          // 유저 사진 이름
                var thumbnailFileName = path.basename(item.thumbnail); // 섬네일 사진 이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + userFileName);
                item.thumbnail = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + thumbnailFileName);
                if( item.isBookmark === null) {
                    item.isBookmark = 0;
                } else {
                    item.isBookmark = 1;
                }
                done(null);
            });
            callback(null, results);
        });
    });
}
/* 쿠커 섬네일 페이지 검색 */
function searchCookerStore(data, callback) {
    var sql = 'select * ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'join photo p on (u.id = p.cooker_user_id) ' +
        'where name like ? or address like ? ' +
        'group by u.id ' +
        'limit ?, ?';
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        data.keyword = "%" + data.keyword + "%";
        data.pageNo = parseInt(data.rowCount * (data.pageNo - 1)); // 숫자로 변환
        data.rowCount = parseInt(data.rowCount); // 숫자로 변환

        dbConn.query(sql, [data.keyword, data.keyword, data.pageNo, data.rowCount], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            async.each(results, function (item, done) {
                var filename = path.basename(item.image); // 사진이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                done(null);
            });
            callback(null, results);
        });
    });
}
/* 쿠커 후기 목록 조회 */
function showCookerReview(data, callback) {
    var sql_showCookerReview =
        'select cooker_user_id id, u.image, u.name, taste, price,cleanliness, kindness, review, date_format(date, \'%Y/%m/%d %H:%i\') as date ' +
        'from cooker_review cr join user u on (cr.cooker_user_id = u.id) ' +
        'where cooker_user_id = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql_showCookerReview, [data.id], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null, results);
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
module.exports.showCookerReview = showCookerReview;
module.exports.showCookerPhoto = showCookerPhoto;
