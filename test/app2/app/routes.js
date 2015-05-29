var Router = require('advanced').Router,
    router = Router();

router.all('/user', 'user@getUser');

module.exports = router;