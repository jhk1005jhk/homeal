var DummyUser = {
    'name': '김준홍',
    'email': 'jhk1005jhk@gmail.com',
    'password': '1234'
};

var dbPool = require('../models/common').dbPool;

function findByEmail(email, callback) {
    var sql_find_by_email = 'select * from dummy where email = ?';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {

        }
    });
    if(DummyUser.email === email) {
        callback(null, DummyUser);
    }
}
function verifyPassword(inputPW, hashPW, callback) {
    if(inputPW === hashPW) {
        callback(null, true);
    }
}
function registerUser(newCustomer, callback) {
    var sql = 'insert into dummy (email, password, name) ' +
              'values (?, sha2(?, 512), ?)';

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
function findUser(userId, callback) {
    if (userId === 1) {
        callback(null, {
            id: 1,
            name: "홍길동",
            email: "gildong.hong@example.com"
        });
    } else {
        callback(null, {
            id: 2,
            name: "",
            email: "",
            facebookid: ""
        });
    }
}
function findOrCreate(profile, callback) {
    return callback(null, {
        id: 2,
        name: profile.displayName,
        email: profile.emails[0].value,
        facebookid: profile.id
    });
}
function FB_findOrCreate(profile, callback) {
    var sql_find_facebookid = 'select email, name, gender, birth, country, phone, introduce, type ' +
                              'from user ' +
                              'where facebook_id = ?';

    var sql_create_facebookid = 'insert into user(email, name, facebook_id) ' +
                                'values(?, ?, ?)';

    dbPool.getConnection(function(err, dbConn) {
        if (err)
            return callback(err);
        // homealdb에 페이스북 아이디(profile.id)가 있는지 확인
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
                user.facebookid = results[0].facebookid;
                return callback(null, user);
            }

            // profile.id 가 없다면 생성
            dbConn.query(sql_create_facebookid, [profile.emails[0].value, profile.displayName, profile.id], function (err, result) {
                dbConn.release();
                if (err)
                    return callback(err);
                var user = {};
                user.id = result.insertId;
                user.email = profile.emails[0].value;
                user.name = profile.displayName;
                user.facebookid = profile.id;
                callback(null, user);
            });
        })
    });
}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.registerCustomer = registerUser;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
module.exports.FB_findOrCreate = FB_findOrCreate;
