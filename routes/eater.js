var express = require('express');
var router = express.Router();
var Eater = require('../models/eater');
var formidable = require('formidable');
var path = require('path');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../common/logger');

/* 잇터 정보 조회 */
router.get('/me', isSecure, isAuthenticated, function (req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var message = '잇터 내 정보 조회 완료';
    var data = {};
    data.id = req.user.id;
    Eater.showEaterInfo(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message,
            result: result
        });
    });
});
/* 잇터 정보 수정 */
router.put('/me', isSecure, isAuthenticated, function (req, res, next) {
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads/images/users');
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            return next(err);
        }
        var message = '잇터 개인정보 수정 완료';
        var data = {};
        data.id = req.user.id;
        data.image = files.image;
        data.name = fields.name;
        data.gender = fields.gender;
        data.birth = fields.birth;
        data.country = fields.country;
        data.phone = fields.phone;
        data.introduce = fields.introduce;
        Eater.updateEaterInfo(data, function(err, result) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: message
            });
        });
    });
});

module.exports = router;
