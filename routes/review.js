var express = require('express');
var router = express.Router();
var Review = require('../models/review');
var isAuthenticated = require('./common').isAuthenticated;

/* 후기 작성 */
router.post('/', isAuthenticated, function(req, res, next) {
    // 공통 ------------------------------------------------------------------------------------------------------------
    var message = '후기 작성 완료';
    var data = {};
    data.id = req.user.id;                                // 누가
    data.targetId = req.body.targetId;                    // 누구에 대해
    data.review = req.body.review;                        // 리뷰 내용
    // 쿠커 ------------------------------------------------------------------------------------------------------------
    data.price = req.body.price || null;                  // 가격
    data.cleanliness = req.body.cleanliness || null;      // 청결
    data.kindness = req.body.kindness || null;            // 친절
    // 잇터 ------------------------------------------------------------------------------------------------------------
    data.time = req.body.time || null;                    // 시간
    data.manner = req.body.manner || null;                // 예절

    Review.createReview(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message
        });
    });
});

module.exports = router;