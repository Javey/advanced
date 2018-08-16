Utils = require('../lib/utils')
should = require('should')
request = require('supertest')
Advanced = require('../lib/index')

describe 'Utils', ->
    describe '#c', ->
        beforeEach ->
            Utils.c('root', process.cwd())

        it 'should return a value correctly', ->
            Utils.c('root').should.be.eql(process.cwd())

        it 'should set a value correctly', ->
            Utils.c('root', 'test')
            Utils.c('a.b', 'test')
            Utils.c('root').should.be.eql('test')
            Utils.c('a.b').should.be.eql('test')

        it 'get a value nested', ->
            Utils.c('test', '{root}/test')
            Utils.c('a.c', '{a.b}/cc')
            Utils.c('test').should.be.eql(Utils.c('root') + '/test')
            Utils.c('a.c').should.be.eql(Utils.c('a.b') + '/cc')
            Utils.c('a').should.be.eql({b: 'test', c: 'test/cc'})

        it 'should return all value', ->
            Utils.c().should.have.property('root', process.cwd())

    describe '#getFnByString', ->
        it 'should return a function', ->
            Utils.getFnByString('test').should.be.a.Function

    describe '#runController', ->
        it 'should return false if does not exist controller', ->
            Utils.runController('controller', 'action').should.be.false

        it 'should return false if does not exist action', ->
            Utils.c('root', process.cwd() + '/test/app1')
            Utils.runController('index', 'action').should.be.false

        it 'should return true if exist controller and action', ->
            Utils.runController('index', 'test').should.be.true

    describe '#request', ->
        it 'request with object options', ->
            Utils.request
                uri: 'http://127.0.0.1:3022/user'
            .then (data) ->
                data.should.have.property('data').be.a.Array

        it 'request with string options', ->
            Utils.request('http://127.0.0.1:3022/user')
            .then (data) ->
                data.should.have.property('data').be.a.Array

        it 'request with relative uri', ->
            Utils.c('apis.defaults', 'http://127.0.0.1:3022')
            Utils.request('/user')
            .then (data) ->
                data.should.have.property('data').be.a.Array

        it 'request with qs and form data', ->
            Utils.request
                uri: '/user',
                qs:
                    test: 'qs',
                form:
                    test: 'form'
            .then (data) ->
                data.should.have.property('data').be.a.Array

    describe '#proxy', ->
        it 'proxy correctly', (done) ->
            app = Advanced.Express()
            app.use (req, res, next) ->
                Utils.proxy(req, res, next, 'http://127.0.0.1:3022' + req.path)

            request(app)
            .get('/user')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
                should.not.exist(err)
                res.body.should.have.property('data').be.a.Array
                done()
            true

        it 'proxy error', (done) ->
            app = Advanced.Express()
            app.use (req, res, next) ->
                Utils.proxy(req, res, next, 'http://127.0.0.1:2934')
            app.use (err, req, res, next) ->
                res.status(500).end()

            request(app).get('/user').expect(500, done)
            true

        it 'proxy use config without url', (done) ->
            app = Advanced.Express()
            app.use (req, res, next) ->
                Utils.c('apis.defaults', 'http://127.0.0.1:3022')
                Utils.proxy(req, res, next)

            request(app)
            .get('/user')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
                should.not.exist(err)
                res.body.should.have.property('data').be.a.Array
                done()
            true

        it 'proxy use config with url', (done) ->
            app = Advanced.Express()
            app.use (req, res, next) ->
                Utils.c('apis.defaults', 'http://127.0.0.1:3022')
                Utils.proxy(req, res, next, '/user')

            request(app)
            .get('/something')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
                should.not.exist(err)
                res.body.should.have.property('data').be.a.Array
                done()
            true

    describe '#fs', ->
        it 'should return true', ->
            Utils.fs.existsAsync('./README.md')
            .then (exists) ->
                exists.should.be.true
