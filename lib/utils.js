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

    getFnByString: function(path) {
        var controllerPath = Utils.c('controllerPath'),
            defaultAction = Utils.c('defaultAction');

        return function(req, res, next) {
            var obj = analyzeController(path),
                Controller = require(controllerPath + '/' + obj.path),
                ctrl = new Controller(req, res, next);

            return ctrl[obj.action || defaultAction]();
        }
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