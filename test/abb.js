/*eslint-env mocha */
/**
 * @todo Support unique property for unique constraints
 * @todo Resolve ref by callback function
 * @todo Document resolving $__ref__
 */
(function() {
  'use strict';

  var assert = require('power-assert')
    , nock = require('nock')
    , _ = require('lodash');

  var IS_COMMON_JS = !!(typeof module !== 'undefined' && module.exports)
    , NEW_USER = {
      'username': 'smith',
      'email': 'john.smith@example.com'
    },
    USER = {
      'id': '111848702235277',
      'username': 'smith',
      'email': 'john.smith@example.com',
      'created_at': '2012-01-01T12:00:00Z',
      'updated_at': '2012-01-01T12:00:00Z'
    }
    , USERS = [USER]
    , UPDATE_TARGET = {
      'username': 'foo'
    }
    , USER_UPDATED = _.defaults(UPDATE_TARGET, USER);

  function runDummyServer() {
    if (IS_COMMON_JS) {
      nock('https://api.example.com')
        .defaultReplyHeaders({'content-type': 'application/json'})
        .get('/').reply(200, 'Foo Bar', {'content-type': 'text/plain'})
        .post('/users', NEW_USER).reply(201, USER)
        .get('/users/111848702235277').reply(200, USER)
        .get('/users').reply(200, USERS)
        .patch('/users/111848702235277', UPDATE_TARGET).reply(200, USER_UPDATED)
        .delete('/users/111848702235277').reply(200, USER_UPDATED);
    } else {
      throw new Error('Abb only supports node environment');
    }
  }

  describe('Abb module', function() {
    var path = require('path')
      , Abb = require('../lib/abb');
    var client;

    runDummyServer();

    beforeEach(function(){
      client = Abb.create({
        docMode: true
        , docPath: path.join(__dirname, 'docs')
      });
    });

    it('creates instance', function() {
      assert(client instanceof Abb);
    });

    it('executes', function(done) {
      var executed = client
        .defaultRequest({header: {'Accept': 'application/json'}})
        .defaultResponse({header: {'content-type': 'application/json'}})
        .resource({
          name: 'User'
          , desc: 'Operates CRUD for User resource'
        })
        .request({
          url: 'https://api.example.com/'
          , header: {'Accept': 'text/plain'}
        })
        .response({
          status: /^20\d$/
          , text: /^FOO\s+\w{1,3}$/igm
          , header: {'content-type': /^text\/\w+$/}
        })
        .request('create', {
          url: 'https://api.example.com/users'
          , method: 'post'
          , send: NEW_USER
        })
        .response({
          status: 201
          , jsonSchema: path.join(__dirname, 'json_schema/users/111848702235277.json')
          , body: USER
        })
        .request('read', {
          url: 'https://api.example.com/users/__$create.response.body.id__'
          //url: function(context) {
          //  var id = context.response.body.id,
          //   url = 'https://api.example.com/users/' + id;
          //  console.log(url);
          //  return url;
          //}
        })
        .response({
          status: 200
          , body: USER
          //, body: '__$create.response.body__' // @todo Not yet supported in response
        })
        .exec(done);
      assert(executed);
    });

    it('provides fixable random values generator', function() {
      var native1st = client.random({docMode: false})
        , native2nd = client.random({docMode: false})
        , fixated1st = client.random({docMode: true})
        , fixated2nd = client.random({docMode: true})
        , seed1st = client.random({docMode: true, randomSeed: 0x12345987})
        , seed2nd = client.random({docMode: true, randomSeed: 0x12345987})
        , seed3rd = client.random({docMode: true, randomSeed: 0x90abcdef})
        , verPin1st = client.random({docMode: true, docVersion: 'v0.8'})
        , verPin2nd = client.random({docMode: true, docVersion: 'v0.8'})
        , verPin3rd = client.random({docMode: true, docVersion: 'v1.0 beta'});

      assert.equal(fixated1st.uuid4(), fixated2nd.uuid4());
      assert.equal(seed1st.uuid4(), seed2nd.uuid4());
      assert.equal(verPin1st.uuid4(), verPin2nd.uuid4());
      assert.notEqual(native1st.uuid4(), native2nd.uuid4());
      assert.notEqual(seed1st.uuid4(), seed3rd.uuid4());
      assert.notEqual(verPin1st.uuid4(), verPin3rd.uuid4());
    });

  });
}());

