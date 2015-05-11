var program = require('commander'),
    _package = require('../package'),
    advance = require('../lib/cli');

program
    .version(_package.version);

program
    .command('new <appname>')
    .description('create an app')
    .action(function(appname) {
        console.log('Creating an application named "' + appname + '" in ' + process.cwd());
        advance.newApp(appname)
            .then(function() {
                console.log('Done!')
            })
            .catch(function(err) {
                console.log('Failed!', err);
            });
    });

program
    .parse(process.argv);