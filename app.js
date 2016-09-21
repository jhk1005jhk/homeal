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

/* 모듈 로딩 */
var auth = require('./routes/auth');
var chatting = require('./routes/chatting');
var user = require('./routes/user');
var cooker = require('./routes/cooker');
var eater = require('./routes/eater');
var notification = require('./routes/notification');
var reservation = require('./routes/reservation');
var review = require('./routes/review');
var menu = require('./routes/menu');
var schedule = require('./routes/schedule');
var bookmark = require('./routes/bookmark');
var photo = require('./routes/photo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new RedisStore({
    host: "127.0.0.1",
    port: 6379,
    client: redisClient
  }),
  resave: true, // 변경된게 없으면 세션을 저장하지 말아라
  saveUninitialized: true, // 저장된게 없으면 세션을 저장
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false, // 안전한 상태에서만 쿠키를 보내겠습니다. https 에서만 보내겠다.
    maxAge: 1000 * 60 * 60 * 24 * 30 // 밀리초, 초, 분, 시, 일
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/menus', express.static(path.join(__dirname, 'uploads/images/menus'))); // 메뉴 이미지 경로 맵핑
app.use('/thumbnails', express.static(path.join(__dirname, 'uploads/images/thumbnails'))); // 섬네일 이미지 경로 맵핑
app.use('/users', express.static(path.join(__dirname, 'uploads/images/users'))); // 사용자 이미지 경로 맵핑

/* 마운트 포인트 맵핑 */
app.use('/auth', auth);
app.use('/users', user);
app.use('/cookers', cooker);
app.use('/eaters', eater);
app.use('/chatting', chatting);
app.use('/notifications', notification);
app.use('/reservations', reservation);
app.use('/reviews', review);
app.use('/menus', menu);
app.use('/schedules', schedule);
app.use('/bookmarks', bookmark);
app.use('/photos', photo);

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
