var express = require('express');
var router = express.Router();
var Reservation = require('../models/reservation');

/* 예약 요청 */
router.post('/', function(req, res, next) {
    var message = '예약 요청 완료';
    var data = {};
    data.eater = req.user.id;
    data.cooker = req.body.cooker;
    data.schedule = req.body.schedule;
    data.menu = req.body.menu;
    data.pax = req.body.pax;
    data.status = req.body.status;

    Reservation.createReservation(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message
        });
    });
});

/* 예약 조회 */
router.get('/', function(req, res, next) {
    var message = "예약 조회 완료";
    var data = {};
    data.id = req.user.id;
    res.send({
        message: message
    });
});

/* 예약 승인(1)/거절(2)/취소(3,4) */
router.put('/', function(req, res, next) {
    var message = '예약 승인/거절/취 완료';
    res.send({
        message: message
    });
});

module.exports = router;