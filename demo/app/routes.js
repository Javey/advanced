/**
 * routes config
 */

var Router = require('advanced').Router,
    router = Router();

router.get('/test/add/:id(\\d+)', 'test@addTest');
router.group('/group', /*'test@auth',*/ function(router) {
    router.get('/a', 'test@groupA');
    router.get('/b', 'test@groupB');
});

module.exports = router;