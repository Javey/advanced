var Express = require('express'),
    methods = require('methods'),
    debug = require('debug')('advanced:router:route'),
    Layer = require('express/lib/router/layer'),
    utils = require('express/lib/utils'),
    Utils = require('../utils');

var Route = Utils.inherit(Express.Route, {});

Route.prototype.all = function(){
    var callbacks = utils.flatten([].slice.call(arguments));
    callbacks.forEach(function(fn) {
        if (typeof fn === 'string') {
            fn = Utils.getFnByString(fn);
        }

        if (typeof fn !== 'function') {
            var type = {}.toString.call(fn);
            var msg = 'Route.all() requires callback functions but got a ' + type;
            throw new Error(msg);
        }

        var layer = Layer('/', {}, fn);
        layer.method = undefined;

        this.methods._all = true;
        this.stack.push(layer);
    }, this);

    return this;
};

methods.forEach(function(method) {
    Route.prototype[method] = function() {
        var callbacks = utils.flatten([].slice.call(arguments));

        callbacks.forEach(function(fn) {
            if (typeof fn === 'string') {
                fn = Utils.getFnByString(fn);
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

module.exports = Route;

