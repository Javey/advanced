var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    request = require('request'),
    config = require('../config/advanced');

fs.existsAsync = function(path) {
    return new Promise(function(resolve) {
        fs.exists(path, resolve);
    });
};

var Utils = module.exports = {
    /**
     * get/set config
     * @param key
     * @param value
     * @returns {*}
     */
    c: function(key, value) {
        if (value != undefined) {
            return config[key] = value
        } else if (key != undefined) {
            if (_.isString(key)) {
                if (_.isString(config[key])) {
                    return config[key].replace(/{(.*?)}/g, function (nouse, name) {
                        return Utils.c(name);
                    });
                } else {
                    return config[key];
                }
            } else if (_.isPlainObject(key)) {
                // set config
                return _.extend(config, key);
            }
        } else {
            return _.mapValues(config, function(value, key) {
                return Utils.c(key);
            });
        }
    },

    /**
     * 继承
     * @param Parent
     * @param prototype
     * @returns {Function}
     */
    inherit: function(Parent, prototype) {
        var Child = function() {
            Parent.apply(this, arguments);
        };

        Child.prototype = Object.create(Parent.prototype);
        _.each(prototype, function(proto, name) {
            if (!_.isFunction(proto)) {
                return Child.prototype[name] = proto;
            }
            Child.prototype[name] = (function() {
                var _super = function() {
                        return Parent.prototype[name].apply(this, arguments);
                    },
                    _superApply = function(args) {
                        return Parent.prototype[name].apply(this, args);
                    };
                return function() {
                    var __super = this._super,
                        __superApply = this.__superApply;
                
                    this._super = _super;
                    this.__superApply = __superApply;

                    var returnValue = proto.apply(this, arguments);

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                }
            })();
        });
        
        Child.__super = Parent.prototype;
        Child.prototype.constructor = Child;

        _.extend(Child, Parent);

        return Child;
    },

    fs: fs,

    /**
     * 用‘controller@method’形式的字符串，返回一个方法
     * @param path
     * @returns {Function}
     */
    getFnByString: function(path) {
        return function(req, res, next) {
            Utils.runControllerByString(path, req, res, next)
        }
    },

    /**
     * 执行一个controller的相应action
     * @param path
     * @param action
     * @param param
     * @param req
     * @param res
     * @param next
     * @returns {boolean}
     */
    runController: function(path, action, param, req, res, next) {
        path = Utils.c('controllerPath') + '/' + path;
        if (fs.existsSync(path + '.js')) {
            var Ctrl = require(path),
                ctrl = new Ctrl(req, res, next);
            if (typeof ctrl[action] === 'function') {
                if (param != undefined) {
                    req.params[0] = param;
                }
                ctrl[action]();
                return true;
            }
        }
        return false;
    },

    /**
     * 通过一个字符串的形式，调用action
     * @param str {String} 类似'controller@action'
     * @param req
     * @param res
     * @param next
     */
    runControllerByString: function(str, req, res, next) {
        var results = [];
        if (typeof str === 'string') {
            results = str.split('@')
        }
        results[0] || (results[0] = Utils.c('defaultController'));
        results[1] || (results[1] = Utils.c('defaultAction'));
        if (!Utils.runController(results[0], results[1], null, req, res, next)) {
            throw new Error('Run controller error: Controller => ' + results[0] + ', Acton => ' + results[1])
        }
    },

    /**
     * 是否是开发模式
     * @returns {boolean}
     */
    isDev: function() {
        return Utils.c('env') === 'development';
    },

    request: function(options, req) {
        if (_.isString(options)) {
            options = {uri: options}
        }

        req || (req = {});

        options.headers = _.extend({}, _.omit(req.headers, 'connection', 'content-length', 'host'), {
            'X-Forwarded-By': 'Advanced'
        }, options.headers);

        options = _.extend({
            uri: req.path,
            method: req.method,
            json: true,
            qs: req.query,
            form: req.body,
            timeout: Utils.c('timeout'),
            gzip: true
        }, options);

        if (options.uri.indexOf('://') < 0) {
            if (!options.baseUrl) {
                options.baseUrl = Utils.c('api');
            }
        } else {
            options.baseUrl = '';
        }

        return new Promise(function(resolve, reject) {
            request(options, function(error, response, body) {
                if (error) {
                    reject(error);
                } else if (response.statusCode >= 200 && response.statusCode < 300 || response.statusCode === 304) {
                    resolve(body);
                } else {
                    reject(response);
                }
            });
        });
    },

    proxy: function(req, res, next, url) {
        var headers = _.extend(_.omit(req.headers, 'connection', 'content-length', 'host'), {
            'X-Forwarded-By': 'Advanced'
        });

        if (!url) {
            url = Utils.c('api') + req.path
        } else if (!~url.indexOf('://')) {
            url = Utils.c('api') + url;
        }

        var data;
        if (req.is('application/x-www-form-urlencoded')) {
            data = {form: req.body}
        } else if (req.is('application/json')) {
            data = {body: req.body}
        } else if (req.is('multipart/form-data')) {
            data = {formData: req.body}
        } else {
            // warning
        }

        var _req = request(_.extend({
            uri: url,
            qs: req.query,
            headers: headers,
            method: req.method,
            json: true,
            timeout: Utils.c('timeout')
        }, data));
        // 去掉transfer-encoding头，在nginx代理中，会再加一次该头，导致浏览器解析错误
        _req.pipefilter = function(response, dest) {
            dest.removeHeader('Transfer-Encoding');
        };
        _req.on('error', function(err) {
            next(err);
        }).pipe(res);

        return _req;
    }
};
