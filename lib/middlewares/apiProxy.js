/**
 * api代理
 **/

var Utils = require('../utils');

module.exports = function(api) {
    api || (api = Utils.c('apis.defaults'));
    return function(req, res, next) {
        if (
            (req.xhr || (req.method !== 'GET' && req.method !== 'HEAD')) &&
            (req.get('X-Forwarded-By') !== 'Advanced')
        ) {
            Utils.proxy(req, res, next, {uri: req.path, baseUrl: api});
        } else {
            next();
        }
    };
};
