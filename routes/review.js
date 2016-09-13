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
    var message = '후기 작성 완료';
    var data = {};
    data.id = req.user.id;                        // 누가
    data.cooker = req.body.cooker;                // 쿠커에게
    data.review = req.body.review;                // 리뷰 내용
    data.taste = req.body.taste;                  // 맛
    data.price = req.body.price;                  // 가격
    data.cleanliness = req.body.cleanliness;      // 청결
    data.kindness = req.body.kindness;            // 친절

    // 후기 작성
    Review.createReview(data, function(err, result) {
        if (err) {
            return next(err);
        }
        // 후기 알림 전송
        // Notification.selectRegistarionToken(data, function(err, token) {
        //     var msg = fcm.Message({
        //         data: {
        //             key1: 'value',
        //             key2: 'value'
        //         },
        //         notification: {
        //             title: 'Homeal',
        //             icon: 'ic_launcher',
        //             body: 'We have new REVIEW INFO of you :)'
        //         }
        //     });
        //
        //     var sender = new fcm.Sender(process.env.FCM_SERVER_KEY); // sender 객체만들어서 보낸다
        //     sender.send(msg, {registrationTokens: token}, function(err, response) {
        //         if (err)
        //             return next(err);
        //     });
        // });
        res.send({
            code: 1,
            message: message
        });
    });
});

module.exports = router;