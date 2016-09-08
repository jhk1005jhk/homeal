var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var Chatting = require('../models/chatting');
var logger = require('../common/logger');
var fcm = require('node-gcm');

/* 채팅 메시지 송신 */
router.post('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '메시지 전송 성공';
    var data = {};
    data.target = req.body.target;

    // 받을 사람 토큰 가져오기
    Chatting.selectRegistarionToken(data, function(err, result) {
        var msg = fcm.Message({
            data: {
                key1: 'value'
            },
            notification: {
                title: 'Homeal',
                icon: 'ic_launcher',
                body: 'We have new MESSAGE for you :)'
            }
        });

        var sender = new fcm.Sender(process.env.FCM_SERVER_KEY); // sender 객체만들어서 보낸다
        sender.send(msg, {registrationTokens: result}, function(err, response) {
            if (err)
                return next(err);
            res.send({
                code: 1,
                message: message,
                result: result
            });
        });
    });
});
/* 채팅 메시지 수신 */
router.get('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '채팅 목록 조회 완료';
    if (req.url.match(/\/\?pageNo=\d+&rowCount=\d+/i)) {
        var pageNo = parseInt(req.query.pageNo, 10);
        var rowCount = parseInt(req.query.rowCount, 10);

        var result = {};
        result.pageNo = pageNo;
        result.rowCount = rowCount;

        var list = [];
        list.push({
            'eater_id': 1,
            'cooker_id': 1
        });
        list.push({
            'eater_id': 2,
            'cooker_id': 2
        });
        res.send({
            code: 1,
            message: message,
            result: result,
            list: list
        });
    }
});

module.exports = router;