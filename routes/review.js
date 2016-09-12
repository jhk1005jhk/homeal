var express = require('express');
var router = express.Router();
var Review = require('../models/review');
var Notification = require('../models/notification');
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../common/logger');
var fcm = require('node-gcm');

/* 후기 작성 */
router.post('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    // 공통 ------------------------------------------------------------------------------------------------------------
    var message = '후기 작성 완료';
    var data = {};
    data.id = req.user.id;                                // 누가
    data.targetId = req.body.targetId;                    // 누구에 대해
    data.review = req.body.review;                        // 리뷰 내용
    // 쿠커 ------------------------------------------------------------------------------------------------------------
    data.taste = req.body.price || null;
    data.price = req.body.price || null;                  // 가격
    data.cleanliness = req.body.cleanliness || null;      // 청결
    data.kindness = req.body.kindness || null;            // 친절
    // 잇터 ------------------------------------------------------------------------------------------------------------
    data.time = req.body.time || null;                    // 시간
    data.manner = req.body.manner || null;                // 예절

    // 후기 작성
    Review.createReview(data, function(err, result) {
        if (err) {
            return next(err);
        }
        // 후기 알림 전송
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
        });
        res.send({
            code: 1,
            message: message
        });
    });
});

module.exports = router;