var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');

//----------------------------------------------------------------------------------------------------------------------
// 로컬 관련
//----------------------------------------------------------------------------------------------------------------------
/* 로컬 로그인 */
function findByEmail(email, callback) {
    var sql_selectUserType = 'select type from user where email = ?';
    var sql_findCooker = 'select * from user u join cooker c on (u.id = c.user_id) where email = ?';
    var sql_findEater = 'select * from user u join eater e on (u.id = e.user_id) where email = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.waterfall([selectUserType, findUser], function(err, results) {
            dbConn.release();
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
        // 로그인 유저 타입 반환
        function selectUserType(callback) {
            dbConn.query(sql_selectUserType, [email], function(err, results) {
                if (err) {
                    return callback(err);
                }
                if (results.length === 0) {
                    return callback(null, null);
                }
                callback(null, results[0].type); // select의 결과는 배열이므로 results[0].type을 넘겨준다
            });
        }
        // 유저 타입에 따른 SQL문 실행
        function findUser(type, callback) {
            // 유저 타입이 쿠커일 경우
            if (type === 'cooker') {
                dbConn.query(sql_findCooker, [email], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, results[0]);
                });
            // 유저 타입이 잇터일 경우
            } else if (type === 'eater') {
                dbConn.query(sql_findEater, [email], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, results[0]);
                });
            }
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------
// 페이스북 관련
//----------------------------------------------------------------------------------------------------------------------
/* 회원 정보 생성 */
function registerUser(newUser, callback) {
    var sql_registerUser =
        'update user ' +
        'set gender = ?, birth = ?, country = ?, phone = ?, introduce = ?, type = ? ' +
        'where facebook_id = ?';
    var sql_registerCooker = 'insert into cooker (user_id) values (?)';
    var sql_registerEater = 'insert into eater (user_id) values (?)';

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
           // type 구분 처리
           if (newUser.type === 'cooker') { // 쿠커 회원가입
               async.series([registerUser, registerCooker], function(err) {
                   if (err) {
                       return dbConn.rollback(function () {
                           dbConn.release();
                           callback(err);
                       });
                   }
                   dbConn.commit(function () {
                       dbConn.release();
                       callback(null, newUser);
                   })
               });
           } else if (newUser.type === 'eater') { // 잇터 회원가입
               async.series([registerUser, registerEater], function(err) {
                   if (err) {
                       return dbConn.rollback(function() {
                           dbConn.release();
                           callback(err);
                       });
                   }
                   dbConn.commit(function() {
                       dbConn.release();
                       callback(null, newUser);
                   })
               });
           }
        });
        function registerUser(callback) {
            dbConn.query(sql_registerUser,
                [newUser.gender, newUser.birth, newUser.country,
                    newUser.phone, newUser.introduce, newUser.type, newUser.facebook_id], function(err, result) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
        }
        function registerCooker(callback) {
            dbConn.query(sql_registerCooker, [newUser.id], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
        function registerEater(callback) {
            dbConn.query(sql_registerEater, [newUser.id], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}
/* 회원 정보 조회 */
function showUser(showUser, callback) {
    var sql_selectUserType = 'select type from user where id = ?';
    var sql_findCooker =
        'select * ' +
        'from user u join cooker c on (u.id = c.user_id) ' +
        'where u.id = ?';
    var sql_findEater =
        'select * ' +
        'from user u join eater e on (u.id = e.user_id) ' +
        'where u.id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.waterfall([selectUserType, selectUser], function(err, results) {
            dbConn.release();
            if (err) {
                callback(err);
            } else {
                var data = {};
                data.image = results[0].image;
                data.name = results[0].name;
                data.birth = results[0].birth;
                data.gender = results[0].gender;
                data.country = results[0].country;
                data.phone = results[0].phone;
                data.introduce = results[0].introduce;
                data.type = results[0].type;
                if (results[0].address !== null) { // 잇터일 경우 주소가 없으므로 주소가 있는지 판단
                    data.address = results[0].address;
                }
                callback(null, data)
            }
        });
        // 유저 타입 반환
        function selectUserType(callback) {
            dbConn.query(sql_selectUserType, [showUser.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results[0].type); // 배열로 넘어오니까 [0]
            });
        }
        // 유저 타입에 따른 SQL문 실행
        function selectUser(type, callback) {
            // 쿠커 정보 가져오기
            if (type === 'cooker') {
                dbConn.query(sql_findCooker, [showUser.id], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    var filename = path.basename(results[0].image); // 사진이름
                    // 사진 URL 경로 생성
                    results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                    callback(null, results);
                });
            // 잇터 정보 가져오기
            } else if (type === 'eater') {
                dbConn.query(sql_findEater, [showUser.id], function(err, results) {
                    if (err) {
                        return callback(err);
                    }
                    var filename = path.basename(results[0].image); // 사진이름
                    // 사진 URL 경로 생성
                    results[0].image = url.resolve(process.env.HOST_ADDRESS + ':' + process.env.PORT, '/users/' + filename);
                    callback(null, results);
                });
            }
        }
    });
}
/* 페이스북 아이디 찾기 또는 생성 */
function FB_findOrCreate(profile, callback) {
    var sql_find_facebookid = 'select * from user where facebook_id = ?';
    var sql_create_facebookid = 'insert into user(email, image, name, facebook_id) values(?, ?, ?, ?)';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        // homealdb에 facebook_id(profile.id)가 있는지 확인
        dbConn.query(sql_find_facebookid, [profile.id], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(0);
            }
            // profile.id 가 있다면 반환
            if (results.length !== 0) {
                var user = {};
                user.id = results[0].id;
                user.name = results[0].name;
                user.email = results[0].email;
                user.facebook_id = results[0].facebook_id;
                return callback(null, user);
            }
            // profile.id 가 없다면 생성 (req.user 에 필요한 정보가 붙는다)
            dbConn.query(sql_create_facebookid, [profile.emails[0].value, profile.photos[0].value, profile.displayName, profile.id], function (err, result) {
                if (err)
                    return callback(err);
                var user = {};
                user.id = result.insertId; // 마지막 번호
                user.name = profile.displayName;
                user.email = profile.emails[0].value;
                user.facebook_id = profile.id;
                callback(null, user);
            });
        });
    });
}
/* 회원 정보 삭제 (보류)*/
function deleteUser(deleteUserId, callback) {
    var sql_selectUserType = 'select type from user where id = ?';
    var sql_deleteUser = 'delete from user where id = ?';
    var sql_deleteCooker = 'delete from cooker where user_id = ?';
    var sql_deleteEater = 'delete from eater where user_id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        async.waterfall([selectUserType, deleteUser], function(err, results) {
            dbConn.release();
            if (err) {
                callback(err);
            } else {
                callback(results);
            }
        });

        function selectUserType(callback) {
            dbConn.query(sql_selectUserType, [deleteUserId.id], function(err, results) {
                if (err) {
                    return callback(err);
                }
                callback(null, results[0].type); // 배열로 넘어오니까 [0]
            });
        }

        function deleteUser(type, callback) {
            if (type === 'cooker') {
                dbConn.beginTransaction(function(err) {
                    if (err) {
                        dbConn.release();
                        return callback(err);
                    }
                    async.series([deleteCooker, deleteUserCommon], function(err, result) {
                        if (err) {
                            return dbConn.rollback(function() {
                                dbConn.release();
                                callback(err);
                            });
                        }
                        dbConn.commit(function() {
                            dbConn.release();
                            callback(null);
                        });
                    })
                });
            } else if (type === 'eater') {
                dbConn.beginTransaction(function(err) {
                    if (err) {
                        dbConn.release();
                        return callback(err);
                    }
                    async.series([deleteEater, deleteUserCommon], function(err, result) {
                        if (err) {
                            return dbConn.rollback(function() {
                                dbConn.release();
                                callback(err);
                            });
                        }
                        dbConn.commit(function() {
                            dbConn.release();
                            callback(null);
                        });
                    });
                });
            }
        }

        function deleteCooker(callback) {
            dbConn.query(sql_deleteCooker, [deleteUserId.id], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
        function deleteEater(callback) {
            dbConn.query(sql_deleteEater, [deleteUserId.id], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }

        function deleteUserCommon(callback) {
            dbConn.query(sql_deleteUser, [deleteUserId.id], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------
// 로컬 관련
//----------------------------------------------------------------------------------------------------------------------
module.exports.findByEmail = findByEmail;
//----------------------------------------------------------------------------------------------------------------------
// 페이스북 관련
//----------------------------------------------------------------------------------------------------------------------
module.exports.registerUser = registerUser;
module.exports.showUser = showUser;
module.exports.deleteUser = deleteUser;
module.exports.FB_findOrCreate = FB_findOrCreate;
