var express = require('express');
var router = express.Router();

/* 후기 작성 */
router.post('/', function(req, res, next) {
    var message = '후기 작성 완료';
    res.send({
        'message': message
    });
});

/* 후기를.. 옮겨야 함 잇터/쿠커로 */

/* 후기 조회 */
router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    var message = "예약 목록 조회 완료";
    var pageNo = req.query.pageNo;
    var rowCount = req.query.rowCount;
    res.send({
        'id': id,
        'message': message,
        'pageNo': pageNo,
        'rowCount': rowCount
    });
});
module.exports = router;