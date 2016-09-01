var express = require('express');
var router = express.Router();
var Bookmark = require('../models/bookmark');

/* 잇터 찜 추가 */
router.post('/', function(req, res, next) {
    var message = '찜 추가 완료';
    var data = {};
    data.eater = req.user.id;
    data.cooker = req.body.cooker;
    Bookmark.createBookmark(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message
        });
    });
});

/* 잇터 찜 조회 */
router.get('/', function(req, res, next) {
    var message = "잇터 찜 조회 완료";
    var data = {};
    data.id = req.user.id;
    Bookmark.showBookmark(data, function(err, results) {
       if (err) {
           return next(err);
       }
       res.send({
           message: message,
           result: results
       });
    });
});
/* 잇터 찜 삭제 */
router.delete('/:id', function(req, res, next) {
    var message = '잇터 찜 삭제 완료';
    var data = {};
    data.eater = req.user.id;
    data.cooker = req.params.id;
    Bookmark.deleteBookmark(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message
        });
    });
});

module.exports = router;