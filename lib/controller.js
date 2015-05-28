var _ = require('lodash'),
    request = require('request'),
    Promise = require('bluebird'),
    debug = require('debug')('advanced:controller'),
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

        this._api = Utils.c('api');
    },

    /**
     * 渲染模板
     * @param file
     * @param data
     */
    render: function(file, data) {
        if (this.req.query.debug && Utils.isDev()) {
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
        var self = this;
        return Promise.reduce(_.keys(apiObj), function(ret, key) {
            var api = apiObj[key];
            if (_.isString(api)) {
                api = {uri: api}
            }

            api = _.extend({
                method: method || self.req.method,
                baseUrl: self._api
            }, api);

            return Utils.request(api, self.req).then(function(data) {
                ret[key] = self._filterData(data);
                return ret;
            }).catch(function(err) {
                ret[key] = undefined;
                debug(err);
                return ret;
            });
        }, {});
    },

    /**
     * 将请求直接转发到host
     * @param host
     */
    proxy: function(host) {
        Utils.proxy(this.req, this.res, host || Utils.c('api'))
    },

    _filterData: function(data) {
        return data;
    }
};

Controller.extend = _.partial(Utils.inherit, Controller);

module.exports = Controller;