/**
 * 访问假数据的middleware
 */
var fs = require('fs-extra'),
    Path = require('path'),
    Utils = require('../utils');

module.exports = function(req, res, next) {
    // 设置api地址为本地
    Utils.c('api', req.protocol + '://' + req.get('host'));

    if (req.get('X-Forwarded-By') === 'Advanced') {
        var reqPath = req.path.substring(1);
        reqPath = reqPath.replace(/\/+/g, '/').replace(/\/$/, '');

        var path = Path.join(Utils.c('mockDataPath'), (reqPath || 'index') + '.json');
        if (fs.existsSync(path)) {
            res.json(fs.readJsonFileSync(path));
        } else {
            // 将最后一个单元当做参数，再试一次
            var arr = reqPath.split('/');
            if (arr.length >= 2) {
                arr.pop();

                var path1 = arr.join('/');
                path1 = Path.join(Utils.c('mockDataPath'), path1 + '.json');
                if (fs.existsSync(path1)) {
                    res.json(fs.readJsonFileSync(path1));
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