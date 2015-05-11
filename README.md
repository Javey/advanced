# Advanced

A simple MVC framework based on Express

# Install

```
npm install advanced -g
```

# Create an application

```shell
# create demo
advanced new app
# install app
cd app
npm install
# start app
node server.js
```

Visit [http://localhost:8586](http://localhost:8586)

# Create a controller

Controllers are placed in `app/controllers`.

For example `app/controllers/test.js`:

```javascript
var Controller = require('advanced').Controller;

module.exports = Controller.extend({
    index: function() {
        this.res.send('Hello World!');
    }
});
```

Visit [http://localhost:8586/test](http://localhost:8586/test)

# Router

Router inherits Router of Express. But there are some enhanced features.

## Custom router

You can use a string to specify a controller and a method. i.e. `controller@method`

In `app/routes.js`

```javascript
var Router = require('advanced').Router,
    router = Router();

// a string to specify a controller and a method. i.e. controller@method
router.get('/test/add/:id(\\d+)', 'test@addTest');

module.exports = router;
```

## Default router

A simple router based on file of controller is supported.

If doesn't match any custom router, it will go here.

For example:

```javascript
req.path = '/this/is/a/path'
```

1. is exists /this/is/a/path/index.js@index
2. is exists /this/is/a/path.js@index
3. is exists /this/is/a.js@path
4. is exists /this/is.js@a, `this.req.params[0] = 'path'`