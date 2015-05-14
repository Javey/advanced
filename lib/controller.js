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
     * @returns {*}
     */
    request: function(apiObj) {
        var self = this;
        return Promise.reduce(_.keys(apiObj), function(ret, key) {
            var api = apiObj[key];
            return new Promise(function(resolve, reject) {
                request({
                    uri: api,
                    method: self.req.method,
                    json: true,
                    baseUrl: self._api,
                    headers: {
                        Cookie: stringifyCookies(self.req.cookies),
                        'X-Powered-By': 'Advanced'
                    }
                }, function(error, response, body) {
                    if (error) {
                        reject(error);
                    } else if (response.statusCode == 200) {
                        resolve(body);
                    } else {
                        reject(response);
                    }
                });
            }).then(function(data) {
                ret[key] = self._filterData(data);
                return ret;
            }).catch(function(err) {
                ret[key] = undefined;
                debug(err);
                return ret;
            });
        }, {});
    },

    _filterData: function(data) {
        return data;
    }
};

/**
 * 将obj转为cookie字符串
 * @param obj
 * @returns {string}
 */
function stringifyCookies(obj) {
    var ret = '';

    _.each(obj, function(value, key) {
        ret += key + '=' + value + '; ';
    });

    return ret;
}

Controller.extend = _.partial(Utils.inherit, Controller);

module.exports = Controller;