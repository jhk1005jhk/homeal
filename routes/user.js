var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var isSecure = require('./common').isSecure;
var User = require('../models/user');
var formidable = require('formidable');
var path = require('path');

/* 로컬 정보 생성
router.post('/', function(req, res, next) {
    var message = '회원 정보 생성 완료';
    var data = {};

    var newCustomer = {};
    newCustomer.email = req.body.email;
    newCustomer.password = req.body.password;
    newCustomer.name = req.body.name;

    User.registerUser(newCustomer, function(err, customer) {
        if (err) {
            return next(err);
        }
        data.result = customer;
        res.send({
            message: message,
            data: data
        });
    })
});
 */

/* 회원 정보 생성 */
router.post('/', isAuthenticated, function(req, res, next) {
    var message = '회원 정보 생성 완료';
    var newUser = {};

    newUser.id = req.user.id;
    newUser.facebook_id = req.user.facebook_id;
    //newUser.image = req.body.image;
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
            message: message,
            result: result
        });
    });
});
/* 회원 정보 조회 */
router.get('/:id', isAuthenticated, function(req, res, next) {
    var message = '회원 정보 조회 완료';
    var showUser = {};
    showUser.id = req.params.id;

    User.showUser(showUser, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: results
        });
    });
});
/* 회원 정보 삭제 (보류) */
router.delete('/me', function(req, res, next) {
    var message = '회원 탈퇴 완료';
    var deleteUser = {};
    deleteUser.id = req.user.id;
    User.deleteUser(deleteUser, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});

module.exports = router;