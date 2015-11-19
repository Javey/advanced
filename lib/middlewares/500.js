/**
 * 500 error page
 */
var Utils = require('../utils'),
    errorLogger = require('../logger')('error');

module.exports = function(err, req, res, next) {
    errorLogger.error({message: 'Something broke when request ' + req.path, error: err});
    res.status(500);
    if (!Utils.runController('500', Utils.c('defaultAction'), err, req, res, next)) {
        res.send(Utils.isDev() ? '<pre>' + err.stack + '</pre>' : 'Something broke!');
    }
};