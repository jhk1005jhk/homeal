function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({
            'message': '로그인이 필요합니다(local or facebook login require)'
        });
    }
    next();
}
function isSecure(req, res, next) {
    if (!req.secure) {
        return res.status(426).send({
            'message': '인증이 필요합니다(https connection require)'
        });
    }
    next();
}

module.exports.isAuthenticated = isAuthenticated;
module.exports.isSecure = isSecure;