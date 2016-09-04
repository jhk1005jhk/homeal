var express = require('express');
var router = express.Router();
var isAuthenticated = require('./common').isAuthenticated;

/* 후기 작성 */
router.post('/', isAuthenticated, function(req, res, next) {
    var message = '후기 작성 완료';
    res.send({
        code: 1,
        message: message
    });
});

/* 후기 목록 조회 */


module.exports = router;