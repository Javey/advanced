/**
 * api代理
 **/

var Utils = require('../utils');

module.exports = function(req, res, next) {
    if (
        (req.xhr || (req.method !== 'GET' && req.method !== 'HEAD')) &&
        (req.get('X-Forwarded-By') !== 'Advanced')
    ) {
        Utils.proxy(req, res, next, Utils.c('api') + req.path);
    } else {
        next();
    }
};