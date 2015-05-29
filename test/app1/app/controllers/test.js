var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    index: function() {
        this.res.send('index')
    },

    test: function() {
        this.res.send('test')
    },

    api: function() {
        this.request({
            test: '/test'
        }).then(function(data) {
            this.res.json(data);
        }.bind(this))
    },

    nofile: function() {
        this.request({
            test: '/test/nofile'
        }).then(function(data) {
            this.res.json(data);
        }.bind(this))
    }
});