var express = require('express');
var router = express.Router();

/* 쿠커 정보 조회 */
router.get('/me', function(req, res, next) {
    var message = '쿠커 나의 정보 조회 완료';
    var result = {};
    res.send({
        'message': message
    });
});
/* 쿠커 정보 수정 */
router.put('/me', function(req, res, next) {
    var message = '쿠커 정보 수정 완료';
    res.send({
        'message': message
    });
});

/* 쿠커 페이지 조회 & 검색 */
router.get('/stores/:id', function(req, res, next) {
    if (req.url.match(/\?name=\w*&location=\w*&date=\w*&minp=\w*&maxp=\w*&pageNo=\d+&rowCount=\d+/i)) {
        var message = "검색 완료";
        var name = req.query.name;
        var location = req.query.location;
        var date = req.query.date;
        var minp = req.query.minp;
        var maxp = req.query.maxp;
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        var search = {};
        search.name = name;
        search.location = location;
        search.date = date;
        search.minp = minp;
        search.maxp = maxp;
        res.send({
            'message': message,
            'search': search,
            'pageNo': pageNo,
            'rowCount': rowCount
        });
    } else {
        var message = "쿠커 페이지 조회 완료";
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        res.send({
            'message': message,
            'pageNo': pageNo,
            'rowCount': rowCount
        });
    }
});
/* 쿠커 페이지 목록 조회 */
router.get('/stores', function(req, res, next) {
    if (req.url.match(/\?pageNo=\d+&rowCount=\d+/i)) {
        var message = "쿠커 페이지 목록 조회 완료";
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        res.send({
            'message': message,
            'pageNo': pageNo,
            'rowCount': rowCount
        });
    }
});

/* 쿠커 메뉴 생성 */
router.post('/me/menus', function(req, res, next) {
    var message = '쿠커 메뉴 생성 완료';
    var name = req.body.name;
    var picture = req.body.picture;
    var price = req.body.price;
    var introduce = req.body.introduce;
    var activation = req.body.activation;

    res.send({
        'message': message
    });
});
/* 쿠커 메뉴 조회 */
router.get('/me/menus', function(req, res, next) {
    var message = '쿠커 메뉴 조회 완료';
    var result = {
        'id': 1,
        'name': '비빔밥',
        'image': 'imagePath',
        'price': 7000,
        'introduce': '전주 대표 음식',
        'activation': true
    };

    res.send({
        'message': message,
        'result': result
    });
});
/* 쿠커 메뉴 수정 */
router.put('/me/menus/:id', function(req, res, next) {
     var message = '쿠커 메뉴 수정 완료';
     var id = req.body.id;
     var name = req.body.name;
     var image = req.body.picture;
     var price = req.body.price;
     var introduce = req.body.introduce;
     var activation = req.body.activation;

     res.send({
         'message': message
     });
});
/* 쿠커 메뉴 삭제 */
router.delete('/me/menus/:id', function(req, res, next) {
    var message = '쿠커 메뉴 삭제 완료';
    res.send({
        'message': message
    });
});

/* 쿠커 일정 생성 */
router.post('/me/schedules', function(req, res, next) {
    var message = '쿠커 일정 생성 완료';
    var date = req.body.date;
    var people = req.body.people;
    var sharing = req.body.sharing;
    res.send({
        'message': message
    });
});
/* 쿠커 일정 조회 */
router.get('/me/schedules', function(req, res, next) {
    var message = '쿠커 일정 조회 완료';
    var list = [];
    list.push({
        'date': '2016/09/23',
        'people': 5,
        'sharing': false
    });

    var result = {
        "schedules": list
    };
    res.send({
        'message': message,
        'result': result
    });
});
/* 쿠커 일정 삭제 */
router.delete('/me/schedules/:id', function(req, res, next) {
    var message = '쿠커 일정 삭제 완료';
    res.send({
        'message': message
    });
});

module.exports = router;