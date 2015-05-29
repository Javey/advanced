var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    getUser: function() {
        this.proxy();
    }
});