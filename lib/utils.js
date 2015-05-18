var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
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
            return Utils.runController(obj.path, obj.action || defaultAction, null, req, res, next);
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