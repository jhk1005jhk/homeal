var express = require('express');
var router = express.Router();
var Reservation = require('../models/reservation');
var Common = require('../models/common');
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../common/logger');
var FCM = require('fcm').FCM;

/* 예약 생성 */
router.post('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var fcm = new FCM(process.env.FCM_SERVER_KEY);
    var data = {};
    data.eater = req.user.id;
    data.cooker = req.body.cooker;
    data.schedule = req.body.schedule;
    data.pax = req.body.pax;
    data.menus = [];
    if (req.body.menus instanceof Array) {
        data.menus = req.body.menus;
    } else {
        data.menus.push(req.body.menus);
    }
    // 예약 생성
    Reservation.createReservation(data, function(err, result) {
        if (err) {
            return next(err);
        }
        var tokenData = {};
        tokenData.receiver = req.body.cooker;
        // 예약 알림 전송
        Common.selectRegistarionToken(tokenData, function(err, result) {
            console.log(result[0].registration_token);
            var msg = {
                to: result[0].registration_token,
                'data.key': '2',
                'data.code': '1'
            };
            fcm.send(msg, function (err, messageId) {
                if (err) {
                    console.log('Something has gone word!');
                } else {
                    console.log('Sent with message ID: ', messageId);
                }
            });
            res.send({
                code: 1,
                message: '예약 요청 완료'
            });
        });
    });
});
/* 예약 목록 조회 */
router.get('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '예약 목록 조회 완료';
    var data = {};
    data.id = req.user.id;

    Reservation.showReservation(data, function (err, results) {
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
/* 예약 승인(2)/ 거절(3)/ 쿠커취소(4)/ 잇터취소(5)/ 후기쓰기(6)/ 식사 완료 (7) */
router.put('/:id', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message;
    var code;
    var fcm = new FCM(process.env.FCM_SERVER_KEY);
    var data = {};
    data.reservation = req.params.id;
    data.status = req.body.status;

    Reservation.updateReservation(data, function (err, result) {
        if (err) {
            return next(err);
        }
        switch (parseInt(data.status)) {
            case 2: message = '예약 승인 완료'; code = 2; break;             // 쿠커가 잇터의 예약을 승인
            case 3: message = '예약 거절 완료'; code = 3; break;             // 쿠커가 잇터의 예약을 거절
            case 4: message = '쿠커가 예약을 취소했습니다'; code = 4; break;  // 쿠커가 잇터의 예약을 취소
            case 5: message = '잇터가 예약을 취소했습니다'; code = 5; break;  // 잇터가 쿠커의 예약을 취소
            case 6: message = '후기를 작성해주세요'; code = 6; break;        // 쿠커가 잇터에게 후기 작성 요청
            case 7: message = '식사 완료'; code = 7; break;                 // 잇터가 후기를 작성하면 식사 완료 상태로 변경
        }
        var tokenData = {};
        tokenData.receiver = req.body.receiver;
        // 예약 알림 전송
        Common.selectRegistarionToken(tokenData, function(err, result) {
            console.log(result[0].registration_token);
            var msg = {
                to: result[0].registration_token,
                'data.key': '2',
                'data.code': code.toString()
            };
            fcm.send(msg, function (err, messageId) {
                if (err) {
                    console.log('Something has gone word!');
                } else {
                    console.log('Sent with message ID: ', messageId);
                }
            });
            res.send({
                code: code,
                message: message
            });
        });
    });
});

module.exports = router;