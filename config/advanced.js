module.exports = {
    root: global.__ROOT || process.cwd(),

    controllerPath: '{root}/app/controllers',
    routesPath: '{root}/app/routes.js',
    logPath: '{root}/log',

    defaultController: 'index',
    defaultAction: 'index',

    port: '8586',

    api: '', // @deprecated
    apis: {
        defaults: ''
    },

    isShowLog: true, // 是否打印日志到标准输出

    mockDataPath: '{root}/mock',

    env: 'development',

    // api超时
    timeout: 10000, //10s

    // 是否使用假数据
    isMock: false
};
