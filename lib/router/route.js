var Express = require('express'),
    methods = require('methods'),
    debug = require('debug')('advance:router:route'),
    Layer = require('express/lib/router/layer'),
    utils = require('express/lib/utils'),
    Utils = require('../utils');

var Route = Utils.inherit(Express.Route, {});

methods.forEach(function(method) {
    Route.prototype[method] = function() {
        var callbacks = utils.flatten([].slice.call(arguments));

        var controllerPath = Utils.c('controllerPath'),
            defaultAction = Utils.c('defaultAction');

        callbacks.forEach(function(fn) {
            if (typeof fn === 'string') {
                fn = (function(path) {
                    return function(req, res, next) {
                        var obj = analyzeController(path),
                            Controller = require(controllerPath + '/' + obj.path),
                            ctrl = new Controller(req, res, next);

                        return ctrl[obj.method || defaultAction]();
                    }
                })(fn);
            }

            if (typeof fn !== 'function') {
                var type = {}.toString.call(fn);
                var msg = 'Route.' + method + '() requires callback functions but got a ' + type;
                throw new Error(msg);
            }

            debug('%s %s', method, this.path);

            var layer = Layer('/', {}, fn);
            layer.method = method;

            this.methods[method] = true;
            this.stack.push(layer);
        }, this);
        return this;
    };
});

function analyzeController(controller) {
    var ret = {},
        obj = substringUntil(controller, '@');

    ret.path = obj.value;
    ret.method = obj.trail;

    return ret;
}

function substringUntil(str, char) {
    var ret = {};
    if (str) {
        var index = str.indexOf(char);
        ret.value = ~index ? str.substring(0, index) : str;
        ret.trail = str.substring(index + 1);
    }
    return ret;
}

module.exports = Route;

