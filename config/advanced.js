module.exports = {
    root: process.cwd(),

    controllerPath: '{root}/app/controllers',
    routesPath: '{root}/app/routes.js',
    logPath: '{root}/log',

    defaultController: 'index',
    defaultAction: 'index',

    port: '8586',

    api: '',

    mockDataPath: '{root}/mock',

    env: 'development',

    // 是否使用假数据
    isMock: false
};