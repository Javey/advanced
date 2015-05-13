var Express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    Path = require('path'),
    _ = require('lodash'),
    Utils = require('./utils');

/**
 * 创建Express app
 * @param fn {Function}
 * @returns {*|exports}
 */
function createApp(fn) {
    var app = Express();

    loadCustomConfig();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());

    // 传入一个函数，自定义app的行为
    _.isFunction(fn) && fn(app);

    // 开发环境使用假数据
    if (Utils.c('env') === 'development') {
        app.use(require('./mock'));
    }

    var router = loadRoutes();
    router.simpleRoute();
    app.use('/', router);

    return app;
}

/**
 * 加载自定义配置
 * @returns {*|Array|Object}
 */
function loadCustomConfig() {
    var configPath = Utils.c('root') + '/config';
    Utils.fs.readdirSync(configPath).map(function(file) {
        var config = require(Path.join(configPath, file));
        Utils.c(config);
    });
}

/**
 * 加载路由配置
 * @returns {*}
 */
function loadRoutes() {
    var router;
    try {
        router = require(Utils.c('routesPath'));
        if (_.isEmpty(router)) {
            throw new Error('Empty file');
        }
    } catch (e) {
        router = require('./router')();
    }

    return router;
}

module.exports = createApp;
module.exports.Express = Express;
module.exports.Controller = require('./controller');
module.exports.Router = require('./router');
module.exports.Utils = Utils;
