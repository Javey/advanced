var Advanced = require('advanced'),
    Utils = Advanced.Utils,
    Path = require('path');

// Set root path. In order to start app in any path.
Utils.c('root', __dirname);
Utils.c('port', 3022);

var app = Advanced();

app.listen(Utils.c('port'), function() {
    console.log('App2 is listening on the port ' + Utils.c('port'));
});