var Advanced = require('advanced'),
    swig = require('swig'),
    Path = require('path');

// Set root path. In order to start app in any path.
Advanced.Utils.c('root', __dirname);

var app = Advanced(function(app) {
    app.engine('swig', swig.renderFile);
    app.set('views', Path.join(__dirname, 'views'));
    app.set('view engine', 'swig');
    app.set('view cache', false);
    swig.setDefaults({cache: false});

    app.use('/static', Advanced.Express.static(Path.join(__dirname, 'static')));
});

app.listen(Advanced.Utils.c('port'), function() {
    console.log('App is listening on the port ' + Advanced.Utils.c('port'));
});