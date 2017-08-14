/**
 * 404 not found
 */
var Utils = require('../utils');

module.exports = function(req, res, next) {
    res.status(404);
    if (!Utils.runController('404', Utils.c('defaultAction'), null, req, res, next)) {
        res.send('404 Not Found');
    }
};
