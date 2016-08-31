var express = require('express');
var router = express.Router();
var Eater = require('../models/eater');

/* 잇터 정보 조회 */
router.get('/me', function (req, res, next) {
    var message = '잇터 개인정보 조회 완료';
    var data = {};
    data.id = req.user.id;
    Eater.showEaterInfo(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});
/* 잇터 정보 수정 */
router.put('/me', function (req, res, next) {
    var message = '잇터 개인정보 수정 완료';
    var data = {};
    data.id = req.user.id;
    data.image = req.body.image;
    data.name = req.body.name;
    data.gender = req.body.gender;
    data.birth = req.body.birth;
    data.country = req.body.country;
    data.phone = req.body.phone;
    data.introduce = req.body.introduce;
    Eater.updateEaterInfo(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});
module.exports = router;
