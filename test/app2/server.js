// define root path
global.__ROOT = __dirname;

var Advanced = require('advanced'),
    Utils = Advanced.Utils,
    Path = require('path');

Utils.c('port', 3022);

var app = Advanced();

app.listen(Utils.c('port'), function() {
    Advanced.Logger.log('App2 is listening on the port ' + Utils.c('port'));
});