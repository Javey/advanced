/**
 * 访问假数据的middleware
 */
var fs = require('fs-extra'),
    Path = require('path'),
    Utils = require('../utils'),
    _ = require('lodash');

module.exports = function(pathFilter, force) {
    return function(req, res, next) {
        // 设置所有api地址为本地
        var localApi = req.protocol + '://' + req.get('host');
        Utils.c('apis', _.mapValues(Utils.c('apis'), function() {
           return localApi;
        }));

        if (force || req.get('X-Forwarded-By') === 'Advanced') {
            var reqPath = req.path.substring(1);
            reqPath = reqPath.replace(/\/+/g, '/').replace(/\/$/, '');

            var path;
            if (_.isFunction(pathFilter)) {
                path = pathFilter(req, reqPath);
            } else {
                path = Path.join(Utils.c('mockDataPath'), (reqPath || 'index') + '.json');
            }
            if (fs.existsSync(path)) {
                res.json((fs.readJsonSync || fs.readJsonFileSync)(path));
            } else {
                // 将最后一个单元当做参数，再试一次
                var arr = reqPath.split('/');
                if (arr.length >= 2) {
                    arr.pop();

                    var path1 = arr.join('/');
                    path1 = Path.join(Utils.c('mockDataPath'), path1 + '.json');
                    if (fs.existsSync(path1)) {
                        res.json((fs.readJsonSync || fs.readJsonFileSync)(path1));
                    } else {
                        next(new Error('Mocking api ' + req.path + ', but does not exist data file ' + path + ' or ' + path1));
                    }
                } else {
                    next(new Error('Mocking api ' + req.path + ', but does not exist data file ' + path));
                }
            }
        } else {
            next();
        }
    };
};
