/* 인증된 사용자인지 확인 */
function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({
            code: 0,
            'message': '로그인이 필요합니다(local or facebook login require)'
        });
    }
    next();
}
/* HTTPS 접속인지 확인 */
function isSecure(req, res, next) {
    if (!req.secure) {
        return res.status(426).send({
            code: 0,
            'message': '인증이 필요합니다(https connection require)'
        });
    }
    next();
}

module.exports.isAuthenticated = isAuthenticated;
module.exports.isSecure = isSecure;