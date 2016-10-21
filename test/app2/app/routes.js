var Router = require('advanced').Router,
    router = Router();

router.all('/user', 'user@getUser');
router.all('/test', function(req, res) {
    res.json({test: 1});
});

module.exports = router;
