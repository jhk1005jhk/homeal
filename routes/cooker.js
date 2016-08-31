var express = require('express');
var router = express.Router();
var Cooker = require('../models/cooker');
/* 쿠커 정보 조회 */
router.get('/me', function(req, res, next) {
    var message = '쿠커 나의 정보 조회 완료';
    var data = {};
    data.id = req.user.id;
    Cooker.showCookerInfo(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});
/* 쿠커 정보 수정 */
router.put('/me', function(req, res, next) {
    var message = '쿠커 정보 수정 완료';
    var data = {};
    data.id = req.user.id;
    data.image = req.body.image;
    data.name = req.body.name;
    data.gender = req.body.gender;
    data.birth = req.body.birth;
    data.country = req.body.country;
    data.phone = req.body.phone;
    data.introduce = req.body.introduce;
    data.address = req.body.address;
    Cooker.updateCookerInfo(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});
/* 쿠커 페이지 조회 */
router.get('/:id', function(req, res, next) {
    var message = "쿠커 페이지 조회 완료";
    var data = {};
    data.id = req.params.id;

    Cooker.showCookerStore(data, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            cooker_info: results[0],
            cooker_menu: results[1],
            cooker_schedule: results[2]
        });
    });
});
/* 쿠커 섬네일 검색 & 목록 조회 */
router.get('/', function(req, res, next) {
    /* 쿠커 섬네일 페이지 검색 */
    ///\?name=\w*&address=\w*&date=\w*&minp=\w*&maxp=\w*&pageNo=\d+&rowCount=\d+/i)
    if (req.url.match(/\?keyword=\w*&pageNo=\d+&rowCount=\d+/i)) {
        var message = "쿠커 검색 완료";
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        var data = {};
        data.keyword = req.query.keyword;
        Cooker.searchCookerStore(data, function(err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                message: message,
                pageNo: pageNo,
                rowCount: rowCount,
                result: results
            });
        });

    /* 쿠커 섬네일 페이지 목록 조회 */
    } else if (req.url.match(/\?pageNo=\d+&rowCount=\d+/i)) {
        var message = "쿠커 페이지 목록 조회 완료";
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        Cooker.showCookerStoreList(null, function(err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                message: message,
                result: results
            });
        });
    }
});

/* 쿠커 메뉴 목록 조회 */
router.get('/:id/menus', function(req, res, next) {
    var message = '쿠커 메뉴 조회 완료';
    var data = {};
    data.id = req.params.id;
    Cooker.showCookerMenu(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});
/* 쿠커 일정 목록 조회 */
router.get('/:id/schedules', function(req, res, next) {
    var message = '쿠커 일정 목록 조회';
    var data = {};
    data.id = req.params.id;
    Cooker.showCookerSchedule(data, function(err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: results
        });
    });
});

module.exports = router;