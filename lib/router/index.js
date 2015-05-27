var Express = require('express'),
    _ = require('lodash'),
    Route = require('./route'),
    Layer = require('express/lib/router/layer'),
    fs = require('fs'),
    Utils = require('../utils');

var slice = Array.prototype.slice;

var proto = module.exports = function(options) {
    var router = Express.Router(options);
    router.__proto__ = proto;
    return router;
};

_.extend(proto, Express.Router, {
    route: function(path) {
        var route = new Route(path);

        var layer = new Layer(path, {
            sensitive: this.caseSensitive,
            strict: this.strict,
            end: true
        }, route.dispatch.bind(route));

        layer.route = route;

        this.stack.push(layer);
        return route;
    },

    group: function(path, fn) {
        // the first argument is path
        // the last argument is router
        var middlewares = slice.call(arguments, 1),
            routerFn = middlewares.pop();
        middlewares = middlewares.map(function(fn) {
            if (typeof fn === 'string') {
                fn = Utils.getFnByString(fn);
            }
            return fn;
        });

        var router = proto();
        routerFn(router);
        middlewares.unshift(path);
        middlewares.push(router);

        return this.use.apply(this, middlewares);
    }
});