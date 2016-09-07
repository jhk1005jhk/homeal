var express = require('express');
var router = express.Router();
var Photo = require('../models/photo');
var formidable = require('formidable');
var path = require('path');
var isAuthenticated = require('./common').isAuthenticated;

/* 사진 생성 */
router.post('/', isAuthenticated, function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads/images/thumbnails'); // __dirname 프로젝트 수행하는 경로
    form.keepExtensions = true;
    form.multiples = true; // 사진 다중 업로드

    form.parse(req, function(err, fields, files) {
        if (err) {
            return next(err);
        }
        var message = '사진 생성 완료';
        var data = {};
        data.id = req.user.id;
        data.photos = []; // 배열로 받기 위한 준비

        if (files.photos instanceof Array) {
            data.photos = files.photos;
        } else if (files.photos instanceof Object) {
            data.photos.push(files.photos);
        }

        Photo.createPhoto(data, function(err, result) {
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

/* 사진 삭제 */
router.delete('/', isAuthenticated, function(req, res, next) {
    var message = '사진 삭제 완료';
    var data = {};
    data.cooker = req.user.id;
    data.ids = [];

    if (req.body.ids instanceof Array) {
        data.ids = req.body.ids; // 지울 사진 ID
    } else {
        data.ids.push(req.body.ids);
    }

    Photo.deletePhoto(data, function(err, result) {
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