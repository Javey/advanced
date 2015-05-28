var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    request = require('request'),
    config = require('../config/advanced');

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
        _.extend(Child.prototype, prototype);
        Child.__super = Parent.prototype;
        Child.constructor = Child;

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
        var defaultAction = Utils.c('defaultAction');

        return function(req, res, next) {
            var obj = analyzeController(path);
            if (!Utils.runController(obj.path, obj.action || defaultAction, null, req, res, next)) {
                throw new Error('Run controller error: Controller => ' + obj.path + ', Acton => ' + obj.action || defaultAction)
            }
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

        options.headers = _.extend({}, _.omit(req.headers, 'connection', 'content-length'), {
            'X-Forwarded-By': 'Advanced'
        }, options.headers);

        options = _.extend({
            uri: req.path,
            method: req.method,
            json: true,
            qs: req.query,
            form: req.body
        }, options);

        if (options.uri.indexOf('http') < 0) {
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
                } else if (response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(response);
                }
            });
        });
    },

    proxy: function(req, res, host) {
        return request({
            uri: req.path,
            baseUrl: host,
            qs: req.query,
            headers: _.omit(req.headers, 'connection', 'content-length'),
            form: req.body,
            method: req.method
        }).pipe(res);
    }
};

function analyzeController(controller) {
    var ret = {},
        obj = substringUntil(controller, '@');

    ret.path = obj.value;
    ret.action = obj.trail;

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