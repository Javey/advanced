should = require('should')
Request = require('supertest')
Advanced = require('../lib/index')
Promise = require('bluebird')

handle = (router, url, method) ->
    method || (method = 'get')
    new Promise (resolve, reject) ->
        router.handle
            url: url
            method: method.toUpperCase()
        ,
            send: (data) ->
                resolve(data)
            render: (data) ->
                resolve(data)
            end: (data) ->
                resolve(data)

request = (app, url, method) ->
    method || (method = 'get')
    new Promise (resolve, reject) ->
        Request(app)[method](url).end (err, res) ->
            if err then reject(err) else resolve(res)

describe 'Advanced', ->
    beforeEach  ->
        Advanced.Utils.c('root', process.cwd() + '/test/app1')

    describe '#createApp', ->
        it 'should return a function with methods', ->
            app = Advanced()

            app.should.be.a.Function
            app.use.should.be.a.Function
            app.get.should.be.a.Function
            app.handle.should.be.a.Function

    describe '#Router', ->
        it 'should export Router', ->
            Advanced.Router.should.be.a.Function

        it 'should return a router with methods', ->
            router = Advanced.Router()
            router.should.be.a.Function

            router = new Advanced.Router()
            router.should.be.a.Function

            router.use.should.be.a.Function
            router.get.should.be.a.Function
            router.group.should.be.a.Function
            router.handle.should.be.a.Function

        it 'should support methods of express',  ->
            router = Advanced.Router()

            router.get '/test', (req, res, next) ->
                res.end()

            handle(router, '/test')

        it 'should support group method',  ->
            router = Advanced.Router()

            router.group '/group', (router) ->
                router.get '/a', (req, res, next) ->
                    res.end()

            handle(router, '/group/a')

        it 'should support string as callback', ->
            router = Advanced.Router()

            router.get('/test/test', 'test@test')
            router.get('/test/index', 'test')
            router.get('/test/empty', '')

            Promise.all [
                handle(router, '/test/test').then (data) -> data.should.be.eql('test')
                handle(router, '/test/index').then (data) -> data.should.be.eql('index')
                handle(router, '/test/empty').then (data) -> data.should.be.eql('index.swig')
            ]

        it '.all should support string as callback', ->
            router = Advanced.Router()

            router.all('/test', 'test')

            Promise.all [
                handle(router, '/test', 'get').then (data) -> data.should.be.eql('index')
                handle(router, '/test', 'post').then (data) -> data.should.be.eql('index')
                handle(router, '/test', 'put').then (data) -> data.should.be.eql('index')
                handle(router, '/test', 'delete').then (data) -> data.should.be.eql('index')
            ]

        it 'should use default routes',  ->
            app = Advanced (app) ->
                app.use (req, res, next) ->
                    res.render = (data) ->
                        res.send(data)
                    next()

                router = Advanced.Router()
                router.get('/test/good', 'test@test')
                app.use(router)

            Promise.all [
                request(app, '/test/test').then (res) -> res.text.should.be.eql('test')
                request(app, '/test').then (res) -> res.text.should.be.eql('index')
                request(app, '/', 'post').then (res) -> res.text.should.be.eql('index.swig')
                request(app, '/test/good').then (res) -> res.text.should.be.eql('test')
                request(app, '/test/good', 'post').then (->), (err) -> err.should.be.a.Error.with.property('status').be.eql(404)
            ]

    describe '#Mock', ->
        it 'should mock data if in development mode and isMock is true', ->
            Advanced.Utils.c('env', 'development')
            Advanced.Utils.c('isMock', true)
            app = Advanced()

            request(app, '/test/api')
            .then (res) -> res.body.should.be.eql({test: {a: 1}})

        it 'should return mock data if regard the last path as param', ->
            Advanced.Utils.c('env', 'development')
            Advanced.Utils.c('isMock', true)
            app = Advanced()

            request(app, '/test/last')
            .then (res) -> res.body.should.be.eql({test: {a: 1}})

        it 'should not mock data if not in development mode', ->
            Advanced.Utils.c('env', 'product')
            Advanced.Utils.c('isMock', true)
            app = Advanced()

            request(app, '/test/api')
            .then (res) -> res.body.should.be.eql({})

        it 'should not mock data if isMock is false', ->
            Advanced.Utils.c('env', 'development')
            Advanced.Utils.c('isMock', false)
            app = Advanced()

            request(app, '/test/api')
            .then (res) -> res.body.should.be.eql({})

        it 'should return empty if does not exist json file for mocking when use request', ->
            Advanced.Utils.c('env', 'development')
            Advanced.Utils.c('isMock', true)
            app = Advanced()

            request(app, '/test/nofile').then (res) -> res.body.should.be.eql({})

        it 'should return empty if does not exist json file for mocking when use proxy', ->
            Advanced.Utils.c('env', 'development')
            Advanced.Utils.c('isMock', true)
            app = Advanced()

            request(app, '/test/nofile').then (res) -> res.body.should.be.eql({})

    describe '#Proxy', ->
        beforeEach ->
            Advanced.Utils.c('apis.defaults', 'http://127.0.0.1:3022')

        it 'post request should be proxied correctly', ->
            Advanced.Utils.c('isMock', false)
            app = Advanced()

            request(app, '/user', 'post').then (res) -> res.body.should.have.property('data').be.a.Array

        it 'ajax request should be proxied correctly', (done) ->
            Advanced.Utils.c('isMock', false)
            app = Advanced()

            Request(app).get('/user').set('X-Requested-With', 'XMLHttpRequest').end (err, res) ->
                res.body.should.have.property('data').be.a.Array
                done()

        it 'should return 404 if the destination can not be reached to', ->
            Advanced.Utils.c('isMock', false)
            app = Advanced()

            request(app, '/user/no', 'post').then (->), (err) -> err.status.should.be.eql(404)

        it 'should return 500 if it is mocked and json file does not exist', ->
            Advanced.Utils.c('isMock', true)
            app = Advanced()

            request(app, '/user', 'post').then (->), (err) -> err.status.should.be.eql(500)
