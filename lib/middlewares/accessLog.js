/**
 * access log
 */
var morgan = require('morgan'),
    Utils = require('../utils'),
    fs = Utils.fs;

var logDir = Utils.c('logPath');
fs.existsSync(logDir) || fs.mkdirsSync(logDir);

module.exports = morgan('combined', {
    stream: fs.createWriteStream(logDir + '/access.log', {
        flags: 'a'
    })
});