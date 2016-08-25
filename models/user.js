var DummyUser = {
    'name': '김준홍',
    'email': 'jhk1005jhk@gmail.com',
    'password': '1234'
};

function findByEmail(email, callback) {
    if(DummyUser.email === email) {
        callback(null, DummyUser);
    }
}

function verifyPassword(inputPW, hashPW, callback) {
    if(inputPW === hashPW) {
        callback(null, true);
    }
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

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;