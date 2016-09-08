var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var User = require('../models/user');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../common/logger');

//----------------------------------------------------------------------------------------------------------------------
// 로컬 관련
//----------------------------------------------------------------------------------------------------------------------
/* 로컬 로그인 전략 */
passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, function(email, password, done) {
    User.findByEmail(email, function(err, user) {
        if (err) // 에러
            return done(err);
        if (!user) // req 객체가 반환 안되면
            return done(null, false); // 로그인 실패
        done(null, user); // user 객체 넘겨줌
    })
}));
/* 레디스 세션에 저장 */
passport.serializeUser(function(user, done) {
    done(null, user); // user 객체 넘김
});
/* 레디스 세션에서 불러오기 */
passport.deserializeUser(function(user, done) {
    done(null, user); // user 반환
});
/* 로컬 로그인 */
router.post('/local/login', function(req, res, next) {
    passport.authenticate('local', function(err, user) {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).send({
                code: 0,
                message: '로컬 로그인에 실패했습니다'
            });
        }
        req.login(user, function(err) { // req.user를 만들어 준다.
            if (err)
                return next(err);
            next();
        });
    })(req, res, next);
}, function(req, res, next) {
    res.send({
        code: 1,
        message: '로컬 로그인 성공'
    });
});
/* 로컬 로그아웃 */
router.get('/local/logout', isSecure, isAuthenticated, function(req, res, next) {
    req.logout();
    res.send({
        code: 1,
        message: '로컬 로그아웃 완료'
    });
});


//----------------------------------------------------------------------------------------------------------------------
// 페이스북 관련
//----------------------------------------------------------------------------------------------------------------------
// 페이스북 로그인 (토큰 얻기)
passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'name', 'emails', 'gender', 'profileUrl', 'photos']
    },
    function(accessToken, refreshToken, profile, done) {
        console.log('액세스 토큰: ' + accessToken);
        User.FB_findOrCreate(profile, function (err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
    }
));
// 페이스북 로그인 (로그인 성공 여부)
passport.use(new FacebookTokenStrategy({ // 클라이언트에서 받아옴
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
    }, function(accessToken, refreshToken, profile, done) {
        User.FB_findOrCreate(profile, function (err, user) {
            if (err) {
                return done(err);
            }
            return done(null, user);
        });
    }
));
/* access_token 받아오는 URL */
router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get('/facebook/callback', passport.authenticate('facebook'), function(req, res, next) { // Ok 하면, call URL 필요
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    res.send({ message: 'facebook callback' });
});
/* 페이스북 로그인 (access_token 매개변수로 넘겨줘야 함) */
router.post('/facebook/token', isSecure, passport.authenticate('facebook-token', {scope : ['email']}), function(req, res, next) { // 결과만 가지고
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    res.send({
        code: 1,
        message: req.user? '페이스북 로그인 성공' : '페이스북 로그인 실패'
    });
});
/* 페이스북 로그아웃 */
router.get('/logout', function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    req.logout();
    res.send({
        code: 1,
        message: '페이스북 로그아웃 완료'
    });
});

module.exports = router;