var Path = require('path'),
    Utils = require('./utils');

module.exports = {
    newApp: function(appName) {
        var demo = Path.join(__dirname, '../demo'),
            app = Path.join(process.cwd(), appName);

        return Utils.fs.copyAsync(demo, app);
    }
};