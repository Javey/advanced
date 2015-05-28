/**
 * 500 error page
 */
var Utils = require('../utils'),
    debug = require('debug')('advanced:middlewares:500');

module.exports = function(err, req, res, next) {
    debug('Something broke when request %s', req.path);
    debug(err.stack);
    res.status(500);
    if (!Utils.runController('500', Utils.c('defaultAction'), err, req, res, next)) {
        res.send(Utils.isDev() ? '<pre>' + err.stack + '</pre>' : 'Something broke!');
    }
};