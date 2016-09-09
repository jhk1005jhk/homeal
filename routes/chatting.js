var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var Chatting = require('../models/chatting');
var logger = require('../common/logger');
var fcm = require('node-gcm');

/* 채팅 메시지 송신 */
router.post('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var data = {};
    data.sender = req.user.id;
    data.receiver = req.body.receiver;
    data.message = req.body.message;

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
            Chatting.insertChattingLog(data, function(err, result) {
                if (err) {
                    return next(err);
                }
            });
            res.send({
                code: 1,
                message: '메시지 전송 완료'
            });
        });
    });
});
/* 채팅 메시지 수신 */
router.get('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var data = {};
    data.receiver = req.user.id;
    Chatting.getChattingLog(data, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: '메시지 수신 완료',
            result: results
        });
    });
});

module.exports = router;