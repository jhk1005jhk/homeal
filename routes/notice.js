var express = require('express');
var router = express.Router();

/* 알림 전송 */
router.post('/', function(req, res, next) {
    var message = '알림 전송 완료';
    var result = {};
    result.id = req.body.id;
    result.type = req.body.type;
    result.image = req.body.image;
    result.message = req.body.message;
    result.date = req.body.date;
    result.read = req.body.read;
    result.registrationToken = req.body.registrationToken;
    res.send({
        'message': message,
        'result': result
    });
});
/* 알림 목록 조회 */
router.get('/', function(req, res, next) {
    var message = '알림 목록 조회 완료';
    if (req.url.match(/\/\?pageNo=\d+&rowCount=\d+/i)) {
        var pageNo = parseInt(req.query.pageNo, 10);
        var rowCount = parseInt(req.query.rowCount, 10);

        var list = [];
        list.push({
            'image': 'imagePath',
            'message': '안녕하세요',
            'date':'2016/09/23',
            'read': false
        });
        list.push({
            'image': 'imagePath',
            'message': '안녕하세요',
            'date':'2016/09/23',
            'read':false
        });

        var result = {
            'list': list
        };
        result.pageNo = pageNo;
        result.rowCount = rowCount;

        res.send({
            'message': message,
            'result': result
        });
    }
});
/* 알림 목록 삭제 */
router.delete('/', function (req, res, next) {
    var message = '알림 목록 삭제 완료';
    res.send({
        'message': message
    });
});
module.exports = router;