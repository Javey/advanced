/**
 * routes config
 */

var Router = require('advanced').Router,
    router = Router();

router.get('/test/add/:id(\\d+)', 'test@addTest');

module.exports = router;