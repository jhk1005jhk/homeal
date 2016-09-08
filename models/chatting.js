var dbPool = require('../models/common').dbPool;

function selectRegistrationToken(data, callback) {
    var sql_selectRegistrationToken =
        'select registration_token ' +
        'from user ' +
        'where id = ?';

    dbPool.getConnection(function(err, dbConn) {
       if (err) {
           return callback(err);
       }
       dbConn.query(sql_selectRegistrationToken, [data.target], function(err, results) {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
       })
    });

}

module.exports.selectRegistarionToken = selectRegistrationToken;