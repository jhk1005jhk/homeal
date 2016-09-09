var dbPool = require('../models/common').dbPool;
var express = require('express');
var router = express.Router();
var Notification = require('../models/notification');
var logger = require('../common/logger');
var fcm = require('node-gcm');

/* 알림 전송 */
router.post('/', function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var data = {};
    data.receiver = req.body.receiver;
    if (req.url.match(/\?action=review/i)) { // 후기 알림 전송
        // 받을 사람 토큰 가져오기
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
            res.send({
                code: 1,
                message: '후기 알림 전송 성공'
            });
        });
    } else if (req.url.match(/\?action=reservation/i)) {
        // 받을 사람 토큰 가져오기
        Notification.selectRegistarionToken(data, function(err, token) {
            var msg = fcm.Message({
                data: {
                    key1: 'value',
                    key2: 'value'
                },
                notification: {
                    title: 'Homeal',
                    icon: 'ic_launcher',
                    body: 'We have new RESERVATION INFO of you :)'
                }
            });

            var sender = new fcm.Sender(process.env.FCM_SERVER_KEY); // sender 객체만들어서 보낸다
            sender.send(msg, {registrationTokens: token}, function(err, response) {
                if (err)
                    return next(err);
            });
            res.send({
                code: 1,
                message: '예약 알림 전송 성공'
            });
        });
    }
});

function selectRegistrationToken(data, callback) {
    var sql_selectRegistrationToken =
        'select registration_token ' +
        'from user ' +
        'where id = ?';

    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_selectRegistrationToken, [data.receiver], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        })
    });
}

module.exports.selectRegistarionToken = selectRegistrationToken;