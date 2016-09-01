var express = require('express');
var router = express.Router();
var Menu = require('../models/menu');
var formidable = require('formidable');
var path = require('path');

/* 메뉴 생성 */
router.post('/', function(req, res, next) {
    var form = new formidable.IncomingForm();
    // __dirname 프로젝트 수행하는 경로
    form.uploadDir = path.join(__dirname, '../uploads/images/menus');
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            return next(err);
        }
        var message = '쿠커 메뉴 생성 완료';
        var data = {};
        data.id = req.user.id;
        data.name = fields.name;
        data.image = files.image.path;
        data.price = parseInt(fields.price, 10);
        data.introduce = fields.introduce;
        data.currency = parseInt(fields.currency, 10);
        data.activation = parseInt(fields.activation, 10);
        // data.id = req.user.id;
        // data.name = req.body.name;
        // data.image = req.body.image;
        // data.price = req.body.price;
        // data.introduce = req.body.introduce;
        // data.currency = req.body.currency;
        // data.activation = req.body.activation;
        console.log(data);
        Menu.createMenu(data, function(err, result) {
            if (err) {
                return next(err);
            }
            res.send({
                message: message,
                result: result
            });
        });
    });
});
/* 메뉴 수정 */
router.put('/:id', function(req, res, next) {
    var message = '쿠커 메뉴 수정 완료';
    var data = {};
    data.id = req.params.id;
    data.name = req.body.name;
    data.image = req.body.image;
    data.price = req.body.price;
    data.introduce = req.body.introduce;
    data.currency = req.body.currency;
    data.activation = req.body.activation;
    Menu.updateMenu(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message,
            result: result
        });
    });
});
/* 메뉴 삭제 */
router.delete('/:id', function(req, res, next) {
    var message = '쿠커 메뉴 삭제 완료';
    var data = {};
    data.id = req.params.id;
    Menu.deleteMenu(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message: message
        });
    });
});

module.exports = router;