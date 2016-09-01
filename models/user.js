var DummyUser = {
    'name': '김준홍',
    'email': 'jhk1005jhk@gmail.com',
    'password': '1234'
};

var dbPool = require('../models/common').dbPool;
var async = require('async')
var path = require('path');
var url = require('url');

/* 로컬 관련 기능 */
function findByEmail(email, callback) {
    var sql = 'select * from dummy where email = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [email], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(null, null);
            }
            callback(null, results[0]);
        })
    });
    // if(DummyUser.email === email) {
    //     callback(null, DummyUser);
    // }
}
function verifyPassword(inputPassword, hashPassword, callback) {
    var sql = 'select ? password';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err)
        }
        dbConn.query(sql, [inputPassword], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            if (results[0].password !== hashPassword) {
                return callback(null, false);
            }
            callback(null, true);
        });
    });
    // if(inputPassword === hashPassword) {
    //     callback(null, true);
    // }
}
/* 로컬 유저 등록
function registerUser(newCustomer, callback) {
    var sql = 'insert into dummy (email, password, name) ' +
        'values (?, ?, ?)';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql,
            [newCustomer.email, newCustomer.password, newCustomer.name], function(err, results) {
                dbConn.release();
                if(err) {
                    return console.log(err);
                }
                callback(null, results.affectedRows);
            });
    });
}
 */ // 회원 정보 생성
/* 로컬 회원 정보 조회
 function showUser(userId, callback) {
 var sql = 'select * from user where id = ?';

 dbPool.getConnection(function(err, dbConn) {
 if (err) {
 return callback(err);
 }
 dbConn.query(sql, [userId], function(err, results) {
 dbConn.release();
 if (err) {
 return console.log(err);
 }
 callback(null, results[0]);
 })
 });
 // if (userId === 1) {
 //     callback(null, {
 //         id: 1,
 //         name: "홍길동",
 //         email: "gildong.hong@example.com"
 //     });
 // } else {
 //     callback(null, {
 //         id: 2,
 //         name: "",
 //         email: "",
 //         facebookid: ""
 //     });
 // }
 }
 */ // 회원 정보 조회
/* 로컬 회원 찾기*/
function findOrCreate(profile, callback) {
    return callback(null, {
        id: 2,
        name: profile.displayName,
        email: profile.emails[0].value,
        facebookid: profile.id
    });
}




/* 회원 정보 생성 */
function registerUser(newUser, callback) {
    var sql_registerUser = 'update user ' +
                            'set gender = ?, birth = ?, country = ?, phone = ?, introduce = ?, type = ? ' +
                            'where facebook_id = ?';
    var sql_registerCooker = 'insert into cooker (user_id) ' +
                              'values (?)';
    var sql_registerEater = 'insert into eater (user_id) ' +
                             'values (?)';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
           if (err) {
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
                        return console.log(err);
                    }
                    callback(null);
                });
        }
        function registerCooker(callback) {
            dbConn.query(sql_registerCooker, [newUser.id], function(err, result) {
                if (err) {
                    return console.log(err);
                }
                callback(null);
            });
        }
        function registerEater(callback) {
            dbConn.query(sql_registerEater, [newUser.id], function(err, result) {
                if (err) {
                    return console.log(err);
                }
                callback(null);
            });
        }
    });
}
/* 회원 정보 조회 */
function showUser(showUser, callback) {
    var sql_selectUserType = 'select type from user where id = ?';
    var sql_findCooker = 'select * ' +
                          'from user u join cooker c on (u.id = c.user_id) ' +
                          'where u.id = ?';
    var sql_findEater = 'select * ' +
                        'from user u join eater e on (u.id = e.user_id) ' +
                        'where u.id = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        async.waterfall([selectUserType, selectUser], function(err, results) {
            if (err) {
                console.log(err);
            } else {
                callback(null, results)
            }
        });

        function selectUserType(callback) {
            dbConn.query(sql_selectUserType, [showUser.id], function(err, results) {
                if (err) {
                    return console.log(err);
                }
                callback(null, results[0].type); // 배열로 넘어오니까 [0]
            });
        }

        function selectUser(type, callback) {
            if (type === 'cooker') {
                dbConn.query(sql_findCooker, [showUser.id], function(err, results) {
                    if (err) {
                        return console.log(err);
                    }
                    var filename = path.basename(results[0].image); // 사진이름
                    /* EC2 Image URL */
                    results[0].image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/users/' + filename);
                    /* Local Image URL */
                    // results[0].image = url.resolve('http://localhost:' + process.env.PORT, '/users/' + filename);
                    callback(null, results);
                });
            } else if (type === 'eater') {
                dbConn.query(sql_findEater, [showUser.id], function(err, results) {
                    if (err) {
                        return console.log(err);
                    }
                    var filename = path.basename(results[0].image); // 사진이름
                    /* EC2 Image URL */
                    results[0].image = url.resolve('http://ec2-52-78-131-245.ap-northeast-2.compute.amazonaws.com:' + process.env.PORT, '/users/' + filename);
                    /* Local Image URL */
                    // results[0].image = url.resolve('http://localhost:' + process.env.PORT, '/users/' + filename);
                    callback(null, results);
                });
            }
        }
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
            return callback(err);
        }
        async.waterfall([selectUserType, deleteUser], function(err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log(results);
            }
        });

        function selectUserType(callback) {
            dbConn.query(sql_selectUserType, [deleteUserId.id], function(err, results) {
                if (err) {
                    return console.log(err);
                }
                callback(null, results[0].type); // 배열로 넘어오니까 [0]
            });
        }

        function deleteUser(type, callback) {
            console.log(type);
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
/* 페이스북 아이디 찾기 또는 생성 */
function FB_findOrCreate(profile, callback) {
    var sql_find_facebookid = 'select * ' +
                              'from user ' +
                              'where facebook_id = ?';

    var sql_create_facebookid = 'insert into user(email, image, name, facebook_id) ' +
                                'values(?, ?, ?, ?)';
    dbPool.getConnection(function(err, dbConn) {
        if (err)
            return callback(err);
        // homealdb에 facebook_id(profile.id)가 있는지 확인
        dbConn.query(sql_find_facebookid, [profile.id], function(err, results) {
            if (err) {
                dbConn.release();
                return callback(err);
            }
            // profile.id 가 있다면 반환
            if (results.length !== 0) {
                dbConn.release();
                var user = {};
                user.id = results[0].id;
                user.name = results[0].name;
                user.email = results[0].email;
                user.facebook_id = results[0].facebook_id;
                return callback(null, user);
            }

            // profile.id 가 없다면 생성 (req.user 에 필요한 정보가 붙는다)
            dbConn.query(sql_create_facebookid, [profile.emails[0].value, profile.photos[0].value, profile.displayName, profile.id], function (err, result) {
                dbConn.release();
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

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findOrCreate = findOrCreate;

module.exports.registerUser = registerUser;
module.exports.showUser = showUser;
module.exports.deleteUser = deleteUser;
module.exports.FB_findOrCreate = FB_findOrCreate;
