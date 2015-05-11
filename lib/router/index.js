var Express = require('express'),
    _ = require('lodash'),
    Route = require('./route'),
    Layer = require('express/lib/router/layer'),
    fs = require('fs'),
    Utils = require('../utils');

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
        var router = proto();
        fn(router);
        this.use(path, router);
    },

    /**
     * 实现对文件的简单路由，如果找不到路由配置，则执行该规则
     * @example
     *  req.path = '/this/is/a/path'
     *  1. 是否存在/this/is/a/path/index.js@index
     *  2. 是否存在/this/is/a/path.js@index
     *  3. 是否存在/this/is/a.js@path
     *  4. 是否存在/this/is.js@a,传入参数path
     */
    simpleRoute: function() {
        this.use(function(req, res, next) {
            var reqPath = req.path.substring(1);
            reqPath = reqPath.replace(/\/+/g, '/').replace(/\/$/, '');

            var arr;
            if (!reqPath) {
                arr = [];
            } else {
                arr = reqPath.split('/');
            }
            arr.push(Utils.c('defaultController'));

            var method = 'index',
                param = undefined,
                path = arr.join('/');
            var iter = 0,
                count = Math.min(4, arr.length);
            while (iter < count && !runController(path, method, param, req, res, next)) {
                iter++;
                path = arr.slice(0, -iter).join('/');
                var _arr = arr.slice(-iter);
                method = _arr[0];
                if (_arr.length > 2) {
                    param = _arr[1];
                }
            }
            if (iter === count) {
                next();
            }
        });
    }
});

function runController(path, method, param, req, res, next) {
    path = Utils.c('controllerPath') + '/' + path;
    if (fs.existsSync(path + '.js')) {
        var Ctrl = require(path),
            ctrl = new Ctrl(req, res, next);
        if (typeof ctrl[method] === 'function') {
            if (param != undefined) {
                req.params[0] = param;
            }
            ctrl[method]();
            return true;
        }
    }
    return false;
}