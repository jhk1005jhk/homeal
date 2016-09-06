var express = require('express');
var router = express.Router();
var Menu = require('../models/menu');
var formidable = require('formidable');
var path = require('path');
var isAuthenticated = require('./common').isAuthenticated;

/* 메뉴 생성 */
router.post('/', isAuthenticated, function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads/images/menus'); // __dirname 프로젝트 수행하는 경로
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
        Menu.createMenu(data, function(err, result) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: message,
                result: result
            });
        });
    });
});
/* 메뉴 수정 */
router.put('/:id', isAuthenticated, function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../uploads/images/menus');
    form.keepExtensions = true;

    form.parse(req, function(err, fields, files) {
        if (err) {
            return next(err)
        }
        var message = '쿠커 메뉴 수정 완료';
        var data = {};
        data.id = req.params.id;
        data.name = fields.name;
        data.image = files.image.path;
        data.price = parseInt(fields.price, 10);
        data.introduce = fields.introduce;
        data.currency = parseInt(fields.currency, 10);
        data.activation = parseInt(fields.activation, 10);
        Menu.updateMenu(data, function(err) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: message
            });
        });
     });
});
/* 메뉴 삭제 */
router.delete('/:id', isAuthenticated, function(req, res, next) {
    var message = '쿠커 메뉴 삭제 완료';
    var data = {};
    data.id = req.params.id;
    Menu.deleteMenu(data, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: message
        });
    });
});

module.exports = router;