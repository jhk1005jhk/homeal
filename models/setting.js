var dbPool = require('../models/common').dbPool;
var async = require('async');
var path = require('path');
var url = require('url');

/* 통화 변경 */
function changeCurrencyOption(data, callback) {
    var sql_changeCurrencyOption = 'update menu set currency = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            dbConn.release();
            return callback(err);
        }
        dbConn.query(sql_changeCurrencyOption, [data.option], function(err, result) {
            dbConn.release();
            if (err) {
                return callback(0);
            }
            callback(null, result);
        })
    });
}

module.exports.changeCurrencyOption = changeCurrencyOption;