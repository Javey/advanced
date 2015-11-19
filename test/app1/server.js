// define root path
global.__ROOT = __dirname;

var Advanced = require('advanced'),
    Utils = Advanced.Utils,
    swig = require('swig'),
    Path = require('path');

Utils.c('port', 3021);

var app = Advanced(function(app) {
    app.engine('swig', swig.renderFile);
    app.set('views', Path.join(__dirname, 'views'));
    app.set('view engine', 'swig');
    app.set('view cache', false);
    swig.setDefaults({cache: false});

    app.use('/static', Advanced.Express.static(Path.join(__dirname, 'static')));
});

app.listen(Utils.c('port'), function() {
    Advanced.Logger.log('App1 is listening on the port ' + Utils.c('port'));
});