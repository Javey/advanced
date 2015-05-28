/**
 * api代理
 **/

var Utils = require('../utils');

module.exports = function(req, res, next) {
    if (
        (req.get('X-Requested-With') === 'XMLHttpRequest' || (req.method !== 'GET' && req.method !== 'HEAD')) &&
        (req.get('X-Forwarded-By') !== 'Advanced')
    ) {
        Utils.proxy(req, res, Utils.c('api'))
            .on('error', function(err) {
                next(err);
            });
    } else {
        next();
    }
};