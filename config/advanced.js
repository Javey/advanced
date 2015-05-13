module.exports = {
    root: process.cwd(),

    controllerPath: '{root}/app/controllers',
    routesPath: '{root}/app/routes.js',

    defaultController: 'index',
    defaultAction: 'index',

    port: '8586',

    api: 'http://127.0.0.1:{port}',

    mockDataPath: '{root}/mock',

    env: 'development'
};