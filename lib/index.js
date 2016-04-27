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

    // access log
    if (!Utils.isDev()) {
        app.use(require('./middlewares/accessLog'));
    }

    // 传入一个函数，自定义app的行为
    _.isFunction(fn) && fn(app);

    app.use(function(req, res, next) {
        if (app.enabled('x-powered-by')) res.setHeader('X-Powered-By', 'Advanced');
        next();
    });

    // 开发环境使用假数据
    if (Utils.isDev() && Utils.c('isMock')) {
        app.use(require('./middlewares/mock')());
    }

    // custom router
    app.use(loadRoutes());
    // simple router
    app.use(require('./middlewares/simpleRouter'));
    // api proxy
    app.use(require('./middlewares/apiProxy')());
    // 404
    app.use(require('./middlewares/404'));
    // 500
    app.use(require('./middlewares/500'));

    return app;
}

/**
 * 加载自定义配置
 * @returns {*|Array|Object}
 */
function loadCustomConfig() {
    var configPath = Utils.c('root') + '/config';
    if (Utils.fs.existsSync(configPath)) {
        Utils.fs.readdirSync(configPath).map(function(file) {
            // only require file whose filename starts with `config`
            if (!_.startsWith(file, 'config')) return;
            // only require js file
            if (!_.endsWith(file, '.js')) return;
            var config = require(Path.join(configPath, file));
            // backward for 0.2.10
            if (config.hasOwnProperty('api') && !config.hasOwnProperty('apis')) {
                config.apis = {defaults: config.api};
            }
            Utils.c(config);
        });
    }
}

/**
 * 加载路由配置
 * @returns {*}
 */
function loadRoutes() {
    var router;
    if (Utils.fs.existsSync(Utils.c('routesPath'))) {
        router = require(Utils.c('routesPath'));
    } else {
        // 如果文件不存在，则加载默认路由
        router = require('./router')();
    }
    return router;
}

module.exports = createApp;
module.exports.Express = Express;
module.exports.Controller = require('./controller');
module.exports.Router = require('./router');
module.exports.Utils = Utils;
module.exports.Logger = require('./logger');
