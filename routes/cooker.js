var express = require('express');
var router = express.Router();
var Cooker = require('../models/cooker');
var formidable = require('formidable');
var path = require('path');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;

/* 쿠커 정보 조회 */
router.get('/me', isSecure, isAuthenticated, function(req, res, next) {
    var message = '쿠커 내 정보 조회 완료';
    var data = {};
    data.id = req.user.id;

    Cooker.showCookerInfo(data, function(err, result) {
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
/* 쿠커 정보 수정 */
router.put('/me', isSecure, isAuthenticated, function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads/images/users');
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            return next(err);
        }
        var message = '쿠커 정보 수정 완료';
        var data = {};
        data.id = req.user.id;
        data.image = files.image.path;
        data.name = fields.name;
        data.gender = fields.gender;
        data.birth = fields.birth;
        data.country = fields.country;
        data.phone = fields.phone;
        data.introduce = fields.introduce;
        data.address = fields.address;
        Cooker.updateCookerInfo(data, function(err) {
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
/* 쿠커 페이지 조회 */
router.get('/:id', isAuthenticated, function(req, res, next) {
    var message = "쿠커 페이지 조회 완료";
    var data = {};
    data.id = req.params.id;

    Cooker.showCookerStore(data, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message,
            cooker_thumbnail : results[0],
            cooker_info: results[1],
            cooker_menu: results[2],
            cooker_schedule: results[3]
        });
    });
});
/* 쿠커 섬네일 검색 & 쿠커 섬네일 목록 조회 */
router.get('/', isAuthenticated, function(req, res, next) {
    /* 쿠커 섬네일 페이지 검색 */
    if (req.url.match(/\?keyword=\w*&pageNo=\d+&rowCount=\d+/i)) {
        var message = "쿠커 검색 완료";
        var data = {};
        data.keyword = req.query.keyword;
        data.pageNo = req.query.pageNo;
        data.rowCount = req.query.rowCount;
        Cooker.searchCookerStore(data, function(err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: message,
                pageNo: data.pageNo,
                rowCount: data.rowCount,
                result: results
            });
        });
    /* 쿠커 섬네일 목록 조회 */
    } else if (req.url.match(/\?pageNo=\d+&rowCount=\d+/i)) {
        var message = "쿠커 섬네일 목록 조회 완료";
        data = {};
        data.pageNo = req.query.pageNo;
        data.rowCount = req.query.rowCount;

        Cooker.showCookerStoreList(data, function(err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: message,
                pageNo: data.pageNo,
                rowCount: data.rowCount,
                result: results
            });
        });
    }
});
/* 쿠커 메뉴 목록 조회 */
router.get('/:id/menus', isAuthenticated, function(req, res, next) {
    var message = '쿠커 메뉴 조회 완료';
    var data = {};
    data.id = req.params.id;
    Cooker.showCookerMenu(data, function(err, results) {
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
/* 쿠커 일정 목록 조회 */
router.get('/:id/schedules', isAuthenticated, function(req, res, next) {
    var message = '쿠커 일정 목록 조회';
    var data = {};
    data.id = req.params.id;
    Cooker.showCookerSchedule(data, function(err, results) {
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
/* 쿠커 후기 조회 */
router.get('/:id/reviews', isAuthenticated, function(req, res, next) {
    var id = req.params.id;
    var message = "쿠커 후기 조회 완료";
    var data = {};
    data.id = id;
    Cooker.showCookerReview(data, function(err, results) {
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