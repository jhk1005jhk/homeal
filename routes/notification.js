var express = require('express');
var router = express.Router();
var fcm = require('node-gcm');
var isAuthenticated = require('./common').isAuthenticated;

/* 알림 전송 */
router.post('/', function(req, res, next) {
    var id = req.body.id;

    // token을 select
    // message를 insert

    var token = null;
    var message = fcm.Message({
        data: { // 실제 날라갈 데이터
            key1: 'value1',
            key2: 'value2'
        }, // 알림 창에 보일 것
        notification: {
            title: 'Homeal',
            icon: 'ic_launcher',
            body: 'We have new news for you :)'
        }
    });

    var sender = new fcm.Sender('AIzaSyBRahrJR-2z0ADAKsAfcAfYaAK1GzYrVNY');
    sender.send(message, {registrationTokens: token}, function(err, response) {
        if (err) {
            return next(err);
        }
        res.send(res);
    });
});

/* 알림 목록 조회 */
router.get('/', isAuthenticated, function(req, res, next) {
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

/* 알림 목록 삭제 */
router.delete('/', function (req, res, next) {
    var message = '알림 목록 삭제 완료';
    res.send({
        code: 1,
        message: message
    });
});

module.exports = router;