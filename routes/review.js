var express = require('express');
var router = express.Router();
var Review = require('../models/review');
var Common = require('../models/common');
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../common/logger');
var FCM = require('fcm').FCM;

/* 후기 작성 */
router.post('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var fcm = new FCM(process.env.FCM_SERVER_KEY);
    var data = {};
    data.id = req.user.id;                        // 누가
    data.cooker = req.body.cooker;                // 쿠커에게
    data.content = req.body.content;              // 리뷰 내용
    data.taste = req.body.taste;                  // 맛
    data.price = req.body.price;                  // 가격
    data.cleanliness = req.body.cleanliness;      // 청결
    data.kindness = req.body.kindness;            // 친절
    // 후기 작성
    Review.createReview(data, function(err, result) {
        if (err) {
            return next(err);
        }
        var tokenData = {};
        tokenData.receiver = req.body.cooker;
        // 후기 알림 전송
        Common.selectRegistarionToken(tokenData, function(err, result) {
            console.log(result[0].registration_token);
            var msg = {
                to: result[0].registration_token,
                'data.key': '3',
                'data.code': '0'
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
                message: '후기 작성 완료'
            });
        });
    });
});

module.exports = router;