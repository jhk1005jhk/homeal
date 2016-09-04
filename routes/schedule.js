var express = require('express');
var router = express.Router();
var Schedule = require('../models/schedule');
var isAuthenticated = require('./common').isAuthenticated;

/* 일정 생성 */
router.post('/', isAuthenticated, function(req, res, next) {
    var message = '일정 생성 완료';
    var data = {};
    data.id = req.user.id;
    data.date = req.body.date;
    data.pax = req.body.pax;
    data.sharing = req.body.sharing;

    Schedule.createSchedule(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message
        });
    });
});

/* 일정 삭제 */
router.delete('/:id', function(req, res, next) {
    var message = '일정 삭제 완료';
    var data = {};
    data.id = req.params.id;

    Schedule.deleteSchedule(data, function(err, result) {
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