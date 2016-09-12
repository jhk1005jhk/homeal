var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var isSecure = require('./common').isSecure;
var User = require('../models/user');
var logger = require('../common/logger');

/* 회원 정보 생성 */
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '회원 정보 생성 완료';
    var newUser = {};

    newUser.id = req.user.id;
    newUser.facebook_id = req.user.facebook_id;
    newUser.gender = req.body.gender;
    newUser.birth = req.body.birth;
    newUser.country = req.body.country;
    newUser.phone = req.body.phone;
    newUser.introduce = req.body.introduce;
    newUser.type = req.body.type;
    User.registerUser(newUser, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message
        });
    });
});
/* 회원 정보 조회 */
router.get('/:id', isSecure, isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '회원 정보 조회 완료';
    var showUser = {};
    showUser.id = req.params.id;

    User.showUser(showUser, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message,
            result: results
        });
    });
});
/* 회원 정보 삭제 (보류) */
router.delete('/me', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '회원 탈퇴 완료';
    var deleteUser = {};
    deleteUser.id = req.user.id;
    User.deleteUser(deleteUser, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message,
            result: result
        });
    });
});

module.exports = router;