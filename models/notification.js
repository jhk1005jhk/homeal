var express = require('express');
var router = express.Router();
var fcm = require('node-gcm');

router.post('/', function(req, res, next) {
    var id = req.body.id;

    // token을 select
    // message를 insert

    var token = [];
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
    sender.send(message, {registrationTokens: token}, function(err, res) {
        if (err) {
            return next(err);
        }
        res.send(res);
    });
});

module.exports = router;