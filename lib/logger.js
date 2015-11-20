var _ = require('lodash'),
    Path = require('path'),
    Utils = require('./utils'),
    fs = Utils.fs;


var cache = {};
module.exports = function(file) {
    if (!cache[file]) {
        cache[file] = new Logger(file);
    }
    return cache[file];
};

function Logger(file) {
    // ensure log path exist
    var logDir = Utils.c('logPath');
    fs.existsSync(logDir) || fs.mkdirsSync(logDir);

    this.stream = createBufferStream(fs.createWriteStream(Path.join(Utils.c('logPath'), file + '.log'), {flags: 'a'}));
}

['log', 'error', 'warn'].forEach(function(type) {
    Logger.prototype[type] = function() {
        output(arguments, type, this.stream);
    };
    module.exports[type] = function() {
        output(arguments, type);
    }
});


function createBufferStream(stream, interval) {
    var buf = [],
        timer = null;

    // flush function
    function flush() {
        timer = null;
        stream.write(buf.join(''));
        buf.length = 0;
    }

    // write function
    function write(str) {
        if (timer === null) {
            timer = setTimeout(flush, interval)
        }

        buf.push(str);
    }

    // return a minimal "stream"
    return { write: write };
}

function output(args, type, stream) {
    if ((!stream || Utils.isDev()) && !Utils.c('isShowLog')) return;
    type || (type = 'log');
    var time = new Date().toLocaleString(),
        color = {
            'log': 2,
            'error': 1,
            'warn': 3
        };
    args = Array.prototype.slice.call(args);

    function formatColor(str, color) {
        return '[\u001b[3' + color + 'm' + str + '\u001b[0m]';
    }
    function format(str) {
        return '[' + str + ']';
    }

    var resultToConsole = [formatColor(type, color[type])],
        resultToFile = [format(type)];
    args.forEach(function(arg) {
        if (Object.prototype.toString.call(arg) === '[object Object]') {
            _.each(arg, function(value, key) {
                value = value === undefined ? 'undefined' : JSON.stringify(value);
                resultToConsole.push(formatColor(key, 4));
                resultToConsole.push(value);
                resultToFile.push(format(key));
                resultToFile.push(value);
            });
        } else {
            resultToConsole.push(arg);
            resultToFile.push(arg === undefined ? 'undefined' : JSON.stringify(arg));
        }
    });
    resultToConsole.unshift(formatColor(time, color[type]));
    resultToFile.unshift(format(time));

    Utils.c('isShowLog') && console[type].apply(console, resultToConsole);
    stream && !Utils.isDev() && stream.write(resultToFile.join(' ') + '\n');
}