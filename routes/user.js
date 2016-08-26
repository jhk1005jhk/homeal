var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var isSecure = require('./common').isSecure;
var User = require('../models/user');

/* (HTTPS) 회원 정보 생성 */
router.post('/', isSecure, function(req, res, next) {
    var message = '회원 정보 생성 완료';
    var data = {};

    var newCustomer = {};
    newCustomer.email = req.body.email;
    newCustomer.password = req.body.password;
    newCustomer.name = req.body.name;

    User.registerCustomer(newCustomer, function(err, customer) {
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
/* (HTTPS) 회원 정보 조회 */
router.get('/:id', function(req, res, next) {
    var message = '회원 정보 조회 완료';
    var result = {};
    result.grade = 5;
    result.menus = [{
        'image': '이미지',
        'name': '비빔밥',
        'price': 7000,
        'introduce': '전주 대표 음식',
        'activation': true
    }];
    result.location = {
        'address': '서울시 관악구 낙성대 서울대 연구공원',
        'latitude': 34.123,
        'longitude': 37.123
    };
    result.accumulation = 10;
    res.send({
        'message': message,
        'reuslt': result
    });
});
/* (HTTPS) 회원 탈퇴 */
router.delete('/me', function(req, res, next) {
    if (req.url.match(/\?type=\w+/i)) {
        var message = '회원 탈퇴 완료';
    }
    /* 쿠커 일정 삭제 */
    if (req.url.match(/\?type=cooker\/schedules\/:id/i)) {
        var message = '쿠커 일정 삭제 완료';
    }
    res.send({
        'message': message
    });
});

module.exports = router;