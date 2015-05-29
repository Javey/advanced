var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    getUser: function() {
        console.log(this.req.query, this.req.body, this.req.cookies, this.req.method, this.req.headers)
        this.res.json({
            data: [
                {
                    id: 0,
                    name: 'Javey'
                }
            ]
        });
    }
});