/**
 * 访问假数据的middleware
 */
var fs = require('fs-extra'),
    Utils = require('../utils');

// 设置api地址为本地
Utils.c('api', 'http://127.0.0.1:' + Utils.c('port'));

module.exports = function(req, res, next) {
    if (req.get('X-Forwarded-By') === 'Advanced') {
        var path = Utils.c('mockDataPath') + req.path + '.json';
        if (fs.existsSync(path)) {
            res.json(fs.readJsonFileSync(path));
        } else {
            next();
        }
    } else {
        next();
    }
};