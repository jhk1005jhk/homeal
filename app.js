var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session'); // express-session 사용
var passport = require('passport'); // pass port 사용
var redis = require('redis'); // redis 사용
var redisClient = redis.createClient(); // 클라이언트 만들기
var RedisStore = require('connect-redis')(session); // 레디스 스토어 만들기

// 모듈 로딩 **
var auth = require('./routes/auth');
var chatting = require('./routes/chatting');
var user = require('./routes/user');
var cooker = require('./routes/cooker');
var eater = require('./routes/eater');
var notice = require('./routes/notice');
var reservation = require('./routes/reservation');
var review = require('./routes/review');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new RedisStore({
    host: "127.0.0.1",
    port: 6379,
    client: redisClient
  }),
  resave: true, // 변경된게 없으면 세션을 저장하지 말아라
  saveUninitialized: false // 저장된게 없으면 세션을 말아라
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// 마운트 포인트 맵핑 **
app.use('/auth', auth);
app.use('/users', user);
app.use('/cookers', cooker);
app.use('/eaters', eater);
app.use('/chattings', chatting);
app.use('/notices', notice);
app.use('/reservations', reservation);
app.use('/reviews', review);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});

module.exports = app;
