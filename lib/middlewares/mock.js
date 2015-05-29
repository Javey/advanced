/**
 * 访问假数据的middleware
 */
var fs = require('fs-extra'),
    Utils = require('../utils');

module.exports = function(req, res, next) {
    // 设置api地址为本地
    Utils.c('api', req.protocol + '://' + req.get('host'));

    if (req.get('X-Forwarded-By') === 'Advanced') {
        var path = Utils.c('mockDataPath') + req.path + '.json';
        if (fs.existsSync(path)) {
            res.json(fs.readJsonFileSync(path));
        } else {
            next(new Error('Mocking api ' + req.path + ', but does not exist data file ' + path));
        }
    } else {
        next();
    }
};