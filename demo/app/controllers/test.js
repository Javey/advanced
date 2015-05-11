var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    index: function() {
        this.res.send('Hello World!');
    },

    addTest: function() {
        this.res.send(this.req.params.id);
    }
});