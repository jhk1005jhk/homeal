var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;
var Chatting = require('../models/chatting');
var Common = require('../models/common');
var logger = require('../common/logger');
var FCM = require('fcm').FCM;

/* 채팅 메시지 송신 */
router.post('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var fcm = new FCM(process.env.FCM_SERVER_KEY);
    var data = {};

    data.sender = req.user.id;
    data.receiver = req.body.receiver;
    data.message = req.body.message;
    // 받을 사람 토큰 가져오기
    Common.selectRegistarionToken(data, function(err, result) {
        var msg = {
            to: result[0].registration_token,
            'data.key': '1',
            'data.code': '0'
        };
        fcm.send(msg, function(err, messageId) {
            if (err) {
                console.log('Something has gone word!');
                console.log(err);
            } else {
                console.log('Sent with message ID: ', messageId);
                Chatting.insertChattingLog(data, function(err, result) {
                    if (err) {
                        return next(err);
                    }
                });
            }
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