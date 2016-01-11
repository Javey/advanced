var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    index: function() {
        //this.res.redirect('/404')
        this.render('index', {test: 1});
    }
});
