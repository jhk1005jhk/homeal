var express = require('express');
var router = express.Router();

/* 예약 요청 */
router.post('/', function(req, res, next) {
    var message = '예약 요청 완료';
    res.send({
        'message': message
    });
});

/* 예약 목록 조회 */
router.get('/', function(req, res, next) {
    if (req.url.match(/\?pageNo=\d+&rowCount=\d+/i)) {
        var message = "예약 목록 조회 완료";
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        res.send({
            'message': message,
            'pageNo': pageNo,
            'rowCount': rowCount
        });
    }
});

/* 예약 승인(1)/거절(2)/취소(3,4) */
router.put('/', function(req, res, next) {
    var message = '예약 승인/거절/취 완료';
    res.send({
        'message': message
    });
});

module.exports = router;