var _ = require('lodash'),
    request = require('request'),
    Promise = require('bluebird'),
    Utils = require('./utils');

var Controller = function() {
    this._init.apply(this, arguments);
};

Controller.prototype = {
    constructor: Controller,

    _init: function(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;

        this._api = Utils.c('apis.defaults');
    },

    /**
     * 渲染模板
     * @param file
     * @param data
     */
    render: function(file, data) {
        if (this.req.query && this.req.query.debug && Utils.isDev()) {
            // 开发模式下，启用debug数据功能
            this.res.json(data);
        } else {
            this.res.render(file, data);
        }
    },

    /**
     * 请求数据
     * @param apiObj
     * @param method {String} 请求方法
     * @returns {*}
     */
    request: function(apiObj, method) {
        var self = this,
            ret = {};
        return Promise.map(_.keys(apiObj), function(key) {
            var api = apiObj[key];
            if (_.isString(api)) {
                api = {uri: api};
            }

            api = _.extend({
                method: method || self.req.method,
                baseUrl: self._api
            }, api);

            return Utils.request(api, self.req, self.res).then(function(data) {
                ret[key] = self._filterData(data);
                return ret;
            }).catch(function(err) {
                ret[key] = err;
                return ret;
            });
        }).then(function() {
            return ret;
        });
    },

    /**
     * 将请求直接转发到host
     * @param url
     */
    proxy: function(options) {
        if (_.isString(options)) {
            options = {uri: options};
        }
        options = _.extend({
            baseUrl: this._api
        }, options);

        return Utils.proxy(this.req, this.res, this.next, options);
    },

    _filterData: function(data) {
        return data;
    }
};

Controller.extend = function(prototype) {
    return Utils.inherit(this, prototype);
};

module.exports = Controller;
