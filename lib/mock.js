/**
 * 访问假数据的middleware
 */
var fs = require('fs-extra'),
    Utils = require('./utils');

module.exports = function(req, res, next) {
    if (req.get('X-Powered-By') === 'Advanced') {
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