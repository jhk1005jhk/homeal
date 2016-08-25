var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var User = require('../models/user');
var isSecure = require('./common').isSecure;

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
    function(email, password, done) {
    User.findByEmail(email, function(err, user) {
        if (err)
            return done(err);
        if (!user)
            return done(null, false);
        User.verifyPassword(password, user.password, function(err, result) {
            if (err)
                return done(err);
            if (!result)
                return done(null, false);
            console.log('넘어간다');
            done(null, user);
        });
    });
}));

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'name', 'emails', 'gender', 'profileUrl', 'photos']
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(accessToken);
        User.findOrCreate(profile, function (err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
    }
));

passport.use(new FacebookTokenStrategy({ // 클라이언트에서 받아옴
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
    }, function(accessToken, refreshToken, profile, done) {
        User.findOrCreate(profile, function (err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.name);
});
passport.deserializeUser(function(name, done) {
    done(null, name);
});


/* 로컬 로그인 */
router.post('/local/login', isSecure, function(req, res, next) {
    passport.authenticate('local', function(err, user) {
        if (err)
            return next(err);
        if (!user)
            return res.status(401).send({
                message: '로그인 실패'
            });
        req.login(user, function(err) { // req.user를 만들어 준다.
            if (err)
                return next(err);
            next();
        });
    })(req, res, next);
}, function(req, res, next) {
    var user = {};
    user.email = req.user.email;
    user.name = req.user.name;
    res.send({
        'message': '로그인 성공',
        'user': user
    });
});
/* 로컬 로그아웃 */
router.get('/local/logout', function(req, res, next) {
    req.logout();
    res.send({
        message: 'local logout'
    });
});

/* 페이스북 로그인 */
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get('/facebook/callback', passport.authenticate('facebook'), function(req, res, next) { // Ok 하면, call URL 필요
    res.send({ message: 'facebook callback' });
});
router.post('/facebook/token', passport.authenticate('facebook-token', {scope : ['email']}), function(req, res, next) { // 결과만 가지고
    res.send(req.user? '성공' : '실패');
}); // access_token : 받은 토큰 값 (post)

module.exports = router;