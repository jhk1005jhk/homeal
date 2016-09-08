var express = require('express');
var router = express.Router();
var Setting = require('../models/setting');
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../common/logger');

/* 통화 변경 */
router.put('/', isAuthenticated, function(req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    if (req.url.match(/\?action=currency/i)) {
        var message = '통화 변경 완료';
        var data = {};
        data.option = req.body.option;

        Setting.changeCurrencyOption(data, function(err, result) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: message
            });
        });
    }
});

module.exports = router;