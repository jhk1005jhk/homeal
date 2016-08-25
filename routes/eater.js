var express = require('express');
var router = express.Router();

/* 잇터 정보 조회 */
router.get('/me', function (req, res, next) {
    var message = '잇터 개인정보 조회 완료';
    res.send({
        'result': message
    });
});
/* 잇터 정보 수정 */
router.put('/me', function (req, res, next) {
    var message = '잇터 개인정보 수정 완료';
    res.send({
        'result': message
    });
});

/* 잇터 찜 추가 */
router.post('/me/bookmarks', function(req, res, next) {
    var message = '잇터 찜 추가 완료';
    res.send({
        'message': message
    });
});
/* 잇터 찜 목록 조회 */
router.get('/me/bookmarks', function(req, res, next) {
    if (req.url.match(/\?pageNo=\d+&rowCount=\d+/i)) {
        var message = "잇터 찜 목록 조회 완료";
        var pageNo = req.query.pageNo;
        var rowCount = req.query.rowCount;
        res.send({
            'message': message,
            'pageNo': pageNo,
            'rowCount': rowCount
        });
    }
});
/* 잇터 찜 삭제 */
router.delete('/me/bookmarks/:id', function(req, res, next) {
    var id = req.params.id;
    var message = '잇터 찜 삭제 완료';
    res.send({
        'id': id,
        'message': message
    });
});
module.exports = router;
