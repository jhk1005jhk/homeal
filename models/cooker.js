var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');
var fs = require('fs');

/* 쿠커 내 정보 조회 */
function showCookerInfo(data, callback) {
    var sql_showCookerInfo =
        'select image, gender, date_format(birth, \'%Y/%m/%d\') birth, phone, address, country, introduce, name, type, grade ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'where user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showCookerInfo, [data.id], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
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
    var sql_selectDeleteImageFilePath =
        'select image from user where id = ?'; // 지울 프로필 사진 경로
    var sql_selectDeleteMapFilePath =
        'select map from cooker where user_id = ?'; // 지울 지도 사진 경로
    var sql_selectCookerInfo =
        'select image, name, gender, birth, country, phone, introduce, address, map, longitude, latitude ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'where u.id = ?';
    var sql_updateUserInfo =
        'update user ' +
        'set image = ?, name = ?, gender = ?, birth = ?, country = ?, phone = ?, introduce = ? ' +
        'where id = ?';
    var sql_updateCookerInfo =
        'update cooker ' +
        'set address = ?, map = ?, latitude = ?, longitude = ? ' +
        'where user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) {
            if (err) {
                callback(err);
            }
            async.waterfall([selectCookerInfo, updateUserInfo], function (err) {
                if (err) {
                    return dbConn.rollback(function () {
                        callback(err);
                    });
                }
                dbConn.commit(function () {
                    dbConn.release();
                    dbPool.logStatus();
                    callback(null);
                });
            });
        });
        /* 쿠커 원래 정보 조회*/
        function selectCookerInfo(callback) {
            dbConn.query(sql_selectCookerInfo, [data.id], function (err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results[0]);
            });
        }
        /* 쿠커 정보 업데이트 */
        function updateUserInfo(originalData, callback) {
            data.name = data.name || originalData.name;
            data.gender = data.gender || originalData.gender;
            data.birth = data.birth || originalData.birth;
            data.country = data.country || originalData.country;
            data.phone = data.phone || originalData.name;
            data.introduce = data.introduce || originalData.introduce;
            data.address = data.address || originalData.address;
            data.latitude = data.latitude || originalData.latitude;
            data.longitude = data.longitude || originalData.longitude;

            // 프로필 사진, 지도 사진 둘다 변경이 없을 때
            if (data.image === undefined && data.map === undefined) {
                data.image = originalData.image;
                data.map = originalData.map;

                dbConn.beginTransaction(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.series([newUserInfo, newCookerInfo], function (err) {
                        if (err) {
                            return dbConn.rollback(function () {
                                callback(err);
                            });
                        }
                        dbConn.commit(function () {
                            callback(null);
                        });
                    });
                });
                // 프로필 사진만 변경됬을 때
            } else if (data.image !== undefined && data.map === undefined){
                data.image = data.image.path;
                data.map = originalData.map;

                dbConn.beginTransaction(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    async.series([selectDeleteImageFilePath, newUserInfo, newCookerInfo], function(err) {
                        if (err) {
                            return dbConn.rollback(function () {
                                callback(err);
                            });
                        }
                        dbConn.commit(function () {
                            callback(null);
                        });
                    });
                });
                // 지도 사진만 변경됬을 때
            } else if (data.image === undefined && data.map !== undefined) {
                data.image = originalData.image;
                data.map = data.map.path;

                dbConn.beginTransaction(function (err) {
                    if (err) {
                        return callback(err);
                    }
                    async.series([selectDeleteMapFilePath, newUserInfo, newCookerInfo], function(err) {
                        if (err) {
                            return dbConn.rollback(function () {
                                callback(err);
                            });
                        }
                        dbConn.commit(function () {
                            callback(null);
                        });
                    });
                });
            }
        }
        /* 사진 삭제 */
        function selectDeleteImageFilePath(callback) {
            dbPool.query(sql_selectDeleteImageFilePath, [data.id], function (err, results) {
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
        /* 지도 사진 파일 삭제 */
        function selectDeleteMapFilePath(callback) {
            dbPool.query(sql_selectDeleteMapFilePath, [data.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                if (results[0].map !== 0) {
                    fs.unlink(results[0].map, function (err) {
                        if (err) {
                            return callback(err);
                        }
                    });
                }
                callback(null);
            });
        }

        /* 공통 정보 업데이트 */
        function newUserInfo(callback) {
            dbConn.query(sql_updateUserInfo,
                [data.image, data.name, data.gender, data.birth, data.country, data.phone, data.introduce, data.id], function (err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
            });
        }
        /* 쿠커 주소 정보 업데이트 */
        function newCookerInfo(callback) {
            dbConn.query(sql_updateCookerInfo, [data.address, data.map, data.latitude, data.longitude, data.id], function (err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}
/* 쿠커 가게 페이지 조회 */
function showCookerStore(data, callback) {
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        async.parallel([showCookerPhoto, showCookerInfo, showCookerMenu, showCookerSchedule], function (err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            } else {
                callback(null, results);
            }
        });
        /* 쿠커 포토 조회*/
        function showCookerPhoto(callback) {
            var sql_showCookerPhoto =
                'select p.id pid, image ' +
                'from cooker c join photo p on (c.user_id = p.cooker_user_id) ' +
                'where c.user_id = ?';
            dbConn.query(sql_showCookerPhoto, [data.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                async.each(results, function(item, done) {
                    var filename = path.basename(item.image); // 사진이름
                    item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + filename);
                    done(null);
                }, function(err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, results);
                });
            });
        }
        /* 쿠커 정보 조회 */
        function showCookerInfo(callback) {
            var sql_showCookerInfo =
                'select u.id uid, image, name, gender, date_format(birth, \'%Y/%m/%d\') birth, country, phone, introduce, address, map, longitude, latitude, ' +
                        'round((avg(taste) + avg(price) + avg(cleanliness) + avg(kindness))/4, 1) grade, ' +
                        'round(avg(taste), 1) taste, round(avg(price), 1) price, ' +
                        'round(avg(cleanliness), 1) cleanliness, round(avg(kindness), 1) kindness, bookmarkCnt, reviewCnt ' +
                'from user u join cooker c on (u.id = c.user_id) ' +
                            'join review r on (u.id = r.cooker_user_id) ' +
                'where cooker_user_id = ?';

                dbConn.query(sql_showCookerInfo, [data.id], function(err, results) {
                    if (err) {
                        return callback(err);
                    }

                    var imageFileName = path.basename(results[0].image); // 사진이름
                    if (imageFileName.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                        results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + imageFileName);
                    }
                    var mapFileName = path.basename(results[0].map); // 사진이름
                    results[0].map = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + mapFileName);
                    callback(null, results[0]);
                });
        }
        /* 쿠커 메뉴 목록 조회 */
        function showCookerMenu(callback) {
            var sql_showCookerMenu =
                'select id, name, image, price, introduce, activation ' +
                'from menu ' +
                'where cooker_user_id = ?';

            dbConn.query(sql_showCookerMenu, [data.id], function(err, results) {
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
        }
        /* 쿠커 일정 목록 조회 */
        function showCookerSchedule(callback) {
            var sql_showCookerSchedule =
                'select id, date_format(date, \'%Y/%m/%d %H:%i\') date, pax, sharing ' +
                'from schedule ' +
                'where cooker_user_id = ?';

            dbConn.query(sql_showCookerSchedule, [data.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            });
        }
    });
}
/* 쿠커 포토 목록 조회*/
function showCookerPhoto(data, callback) {
    var sql_showCookerPhoto =
        'select p.id pid, image ' +
        'from cooker c join photo p on (c.user_id = p.cooker_user_id) ' +
        'where c.user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showCookerPhoto, [data.id], function(err, results) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + filename);
                done(null);
            }, function(err) {
                if (err) {
                    return callback(err);
                }
                dbConn.release();
                dbPool.logStatus();
                callback(null, results);
            });
        });
    });
}
/* 쿠커 메뉴 목록 조회 */
function showCookerMenu(data, callback) {
    var sql_showCookerMenu =
        'select id, name, image, price, introduce, activation ' +
        'from menu ' +
        'where cooker_user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showCookerMenu, [data.id], function(err, results) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback(err);
            }
            async.each(results, function(item, done) {
                var filename = path.basename(item.image); // 사진이름
                item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/menus/' + filename);
                done(null);
            }, function(err) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            });
        });
    });
}
/* 쿠커 일정 목록 조회 */
function showCookerSchedule(data, callback) {
    var sql_showCookerSchedule =
        'select id, date_format(date, \'%Y/%m/%d %H:%i\') date, pax, sharing ' +
        'from schedule ' +
        'where cooker_user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showCookerSchedule, [data.id], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
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
        'select * ' +
        'from (select u.id cid, p.image thumbnail, u.image, u.name name, c.address, u.introduce, reviewCnt, bookmarkCnt, grade ' +
        'from cooker c join user u on (c.user_id = u.id) ' +
        'join photo p on (c.user_id = p.cooker_user_id) ' +
        'group by u.id ) a left outer join (select cooker_user_id isBookmark from bookmark where eater_user_id = ?) b on (a.cid = b.isBookmark) ' +
        'limit ?, ?';

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        data.pageNo = parseInt(data.rowCount * (data.pageNo - 1)); // 숫자로 변환
        data.rowCount = parseInt(data.rowCount); // 숫자로 변환

        dbConn.query(sql_selectCookerInfo, [data.id, data.pageNo, data.rowCount], function (err, results) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback(err);
            }
            async.each(results, function (item, done) {
                console.log(item.isBookmark);
                var userFileName = path.basename(item.image);          // 유저 사진 이름
                var thumbnailFileName = path.basename(item.thumbnail); // 섬네일 사진 이름
                if (userFileName.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                    item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + userFileName);
                }
                item.thumbnail = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + thumbnailFileName);
                if( item.isBookmark === null) {
                    item.isBookmark = 0;
                } else {
                    item.isBookmark = 1;
                }
                done(null);
            }, function (err) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            });
        });
    });
}
/* 쿠커 섬네일 페이지 검색 */
function searchCookerStore(data, callback) {
    var sql_searchCookerStore =
        'select u.id cid, p.image thumbnail, u.image image, u.name name, c.address address, u.introduce introduce, reviewCnt, bookmarkCnt, grade, eater_user_id isBookmark ' +
        'from cooker c join user u on (u.id = c.user_id) ' +
                      'join photo p on (c.user_id = p.cooker_user_id) ' +
                      'left join bookmark b on (c.user_id = b.cooker_user_id) ' +
        'where name like ? or address like ? ' +
        'group by u.id ' +
        'limit ?, ?';

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        data.keyword = '%' + data.keyword + '%';
        data.pageNo = parseInt(data.rowCount * (data.pageNo - 1)); // 숫자로 변환
        data.rowCount = parseInt(data.rowCount); // 숫자로 변환

        dbConn.query(sql_searchCookerStore, [data.keyword, data.keyword, data.pageNo, data.rowCount], function (err, results) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback(err);
            }
            async.each(results, function (item, done) {
                var userFileName = path.basename(item.image);         // 유저 사진 이름
                var thumbnailFileName = path.basename(item.thumbnail); // 섬네일 사진 이름
                if (userFileName.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                    item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + userFileName);
                }
                item.thumbnail = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/thumbnails/' + thumbnailFileName);
                if( item.isBookmark === null) {
                    item.isBookmark = 0;
                } else {
                    item.isBookmark = 1;
                }
                done(null);
            }, function(err) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            });
        });
    });
}
/* 쿠커 후기 목록 조회 */
function showCookerReview(data, callback) {
    var sql_showCookerReview =
        'select r.eater_user_id eid, u.image, u.name, taste, price, cleanliness, kindness, content, date_format(date, \'%Y/%m/%d %H:%i\') date ' +
        'from review r join user u on (r.eater_user_id = u.id) ' +
        'where r.cooker_user_id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_showCookerReview, [data.id], function (err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                callback(null, results);
            } else {
                async.each(results, function (item, done) {
                    var filename = path.basename(item.image); // 사진이름
                    if (filename.toString() !== 'picture?type=large') { // 페이스북 사진인지 판단
                        item.image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                    }
                    done(null);
                });
                callback(null, results);
            }
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