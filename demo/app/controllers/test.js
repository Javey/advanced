var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    index: function() {
        this.res.send('Hello World!');
    },

    addTest: function() {
        this.res.send(this.req.params.id);
    },

    groupA: function() {
        this.request({
            data: '/test/api'
        }).then(function(data) {
            console.log(data);
        });
        this.res.send('groupA');
    },

    groupB: function() {
        this.res.send('groupB');
    },

    auth: function() {
        if (Math.random() > 0.5) {
            this.next();
        } else {
            this.res.send('Authorization failed!');
        }
    },

    api: function() {
        console.log(this.req.cookies);
        this.res.json({a: 1});
    }
});