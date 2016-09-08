var winston = require('winston');
var DailyRotateFile = require('winston-daily-rotate-file');
var path = require('path');
var moment = require('moment-timezone');
var timeZone = "Asia/Seoul";

// 레벨에는 error, warn, info, debug 4가지가 있다. logger 에는 level 이 있다.
// info 라고 설정했으면 info 이상의 정보를 기술할 수 있다
// 개발할 때는 debug 쓰고, 운영할 때는 warn(->console), info(->file), debug(->dev)
// 서버 admin이 관리하는 화면에는 warn 정보 이상을 보도록 운영한다.
// file에는 운영시스템 디버그 정보 기록 필요없음, info부터 함
var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug', // 여기 설정에 따라 출력되는 것이 다르다
      silent: false,
      colorize: true,
      prettyPrint: true,
      timestamp: false
    }),
    new winston.transports.DailyRotateFile({
      level: 'debug',
      silent: false,
      colorize: false,
      prettyPrint: true,
      timestamp: function() {
        return moment().tz(timeZone).format();
      },
      dirname: path.join(__dirname, '../logs'),
      filename: 'debug_logs_',
      datePattern: 'yyyy-MM-ddTHH.log',
      maxsize: 1024 * 1024,
      json: false
    })
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      level: "debug",
      silent: false,
      colorize: false,
      prettyPrint: true,
      timestamp: function() {
        return moment().tz(timeZone).format();
      },
      dirname: path.join(__dirname, '../logs'),
      filename: 'exception_logs_',
      datePattern: 'yyyy-MM-ddTHH.log',
      maxsize: 1024,
      json: false,
      handleExceptions: true,
      humanReadableUnhandledException: true
    })
  ],
  exitOnError: false
});

module.exports = logger;