var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var Notification = require('../models/notification');
var logger = require('../common/logger');
var fcm = require('node-gcm');

/* 알림 전송 */
router.post('/', function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var data = {};
    data.receiver = req.body.receiver;
    if (req.url.match(/\?action=review/i)) { // 후기 알림 전송
        // 받을 사람 토큰 가져오기
        Notification.selectRegistarionToken(data, function(err, token) {
            var msg = fcm.Message({
                data: {
                    key1: 'value',
                    key2: 'value'
                },
                notification: {
                    title: 'Homeal',
                    icon: 'ic_launcher',
                    body: 'We have new REVIEW INFO of you :)'
                }
            });
            var sender = new fcm.Sender(process.env.FCM_SERVER_KEY); // sender 객체만들어서 보낸다
            sender.send(msg, {registrationTokens: token}, function(err, response) {
                if (err)
                    return next(err);
            });
            res.send({
                code: 1,
                message: '후기 알림 전송 성공'
            });
        });
    } else if (req.url.match(/\?action=reservation/i)) {
        // 받을 사람 토큰 가져오기
        Notification.selectRegistarionToken(data, function(err, token) {
            var msg = fcm.Message({
                data: {
                    key1: 'value',
                    key2: 'value'
                },
                notification: {
                    title: 'Homeal',
                    icon: 'ic_launcher',
                    body: 'We have new RESERVATION INFO of you :)'
                }
            });

            var sender = new fcm.Sender(process.env.FCM_SERVER_KEY); // sender 객체만들어서 보낸다
            sender.send(msg, {registrationTokens: token}, function(err, response) {
                if (err)
                    return next(err);
            });
            res.send({
                code: 1,
                message: '예약 알림 전송 성공'
            });
        });
    }
});

/* 알림 목록 조회 (보류) */
router.get('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '알림 목록 조회 완료';
    if (req.url.match(/\/\?pageNo=\d+&rowCount=\d+/i)) {
        var pageNo = parseInt(req.query.pageNo, 10);
        var rowCount = parseInt(req.query.rowCount, 10);

        var list = [];
        list.push({
            'image': 'imagePath',
            'message': '안녕하세요',
            'date':'2016/09/23',
            'read': false
        });
        list.push({
            'image': 'imagePath',
            'message': '안녕하세요',
            'date':'2016/09/23',
            'read':false
        });

        var result = {
            'list': list
        };
        result.pageNo = pageNo;
        result.rowCount = rowCount;
        res.send({
            code: 1,
            message: message,
            result: result
        });
    }
});
/* 알림 목록 삭제 (보류) */
router.delete('/', function (req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '알림 목록 삭제 완료';
    res.send({
        code: 1,
        message: message
    });
});

module.exports = router;