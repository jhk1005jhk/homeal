var express = require('express');
var router = express.Router();

/* 채팅 메시지 송신 */
router.post('/', function(req, res, next) {
    var message = '메시지 전송 성공';
    var result = {};
    result.id = req.body.id;
    result.message = req.body.message;
    result.date = req.body.date;
    result.read = req.body.read;
    result.registrationToken = req.body.registrationToken;
    res.send({
        'message': message,
        'result': result
    });
});
/* 채팅 목록 조회 */
router.get('/', function(req, res, next) {
    var message = '채팅 목록 조회 완료';
    if (req.url.match(/\/\?pageNo=\d+&rowCount=\d+/i)) {
        var pageNo = parseInt(req.query.pageNo, 10);
        var rowCount = parseInt(req.query.rowCount, 10);

        var result = {};
        result.pageNo = pageNo;
        result.rowCount = rowCount;

        var list = [];
        list.push({
            'eater_id': 1,
            'cooker_id': 1
        });
        list.push({
            'eater_id': 2,
            'cooker_id': 2
        });
        res.send({
            'message': message,
            'result': result,
            'list': list
        });
    }
});

module.exports = router;