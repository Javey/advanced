/**
 * 实现对文件的简单路由，如果找不到路由配置，则执行该规则
 * @example
 *  req.path = '/this/is/a/path'
 *  1. 是否存在/this/is/a/path/index.js@index
 *  2. 是否存在/this/is/a/path.js@index
 *  3. 是否存在/this/is/a.js@path
 *  4. 是否存在/this/is.js@a,传入参数path
 */
var Utils = require('../utils');

module.exports = function(req, res, next) {
    var reqPath = req.path.substring(1);
    reqPath = reqPath.replace(/\/+/g, '/').replace(/\/$/, '');

    var arr;
    if (!reqPath) {
        arr = [];
    } else {
        arr = reqPath.split('/');
    }
    arr.push(Utils.c('defaultController'));

    var action = 'index',
        param = undefined,
        path = arr.join('/');
    var iter = 0,
        count = Math.min(4, arr.length);
    while (iter < count && !Utils.runController(path, action, param, req, res, next)) {
        iter++;
        path = arr.slice(0, -iter).join('/');
        var _arr = arr.slice(-iter);
        action = _arr[0];
        if (_arr.length > 2) {
            param = _arr[1];
        }
    }
    if (iter === count) {
        // 如果没有找到
        next();
    }
};