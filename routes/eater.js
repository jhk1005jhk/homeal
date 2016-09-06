var express = require('express');
var router = express.Router();
var Eater = require('../models/eater');
var formidable = require('formidable');
var path = require('path');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;

/* 잇터 정보 조회 */
router.get('/me', isSecure, isAuthenticated, function (req, res, next) {
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
        data.image = files.image.path;
        data.name = fields.name;
        data.gender = fields.gender;
        data.birth = parseInt(fields.birth, 10);
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
/* 잇터 후기 조회 */
router.get('/:id/reviews', isAuthenticated, function(req, res, next) {
    var id = req.params.id;
    var message = "잇터 후기 조회 완료";
    var data = {};
    data.id = id;
    Eater.showEaterReview(data, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message,
            result: results
        });
    });
});

module.exports = router;
