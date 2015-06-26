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
    , sinon = require('sinon')
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
      var server = sinon.fakeServer.create();
      server.autoRespond = true;
    }
  }

  describe('Abb module', function() {
    var path = require('path')
      , agent = require('superagent')
      , Abb = require('../lib/abb');
    var client;

    runDummyServer();

    beforeEach(function(){
      client = Abb.create({
        'agent': agent
        , 'assert': assert
        , 'docMode': true
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
      var createVersionHash32bitInt = function (version) {
          var hex32bitSafeDigit = 7
            , hash = require('crypto').createHash('sha1').update(version, 'utf8').digest('hex');
          return parseInt(hash.slice(0, hex32bitSafeDigit), 16);
        }
        , rNative1st = client.random({docMode: false})
        , rNative2nd = client.random({docMode: false})
        , rFixated1st = client.random({docMode: true})
        , rFixated2nd = client.random({docMode: true})
        , rSeed1st = client.random({docMode: true, randomSeed: createVersionHash32bitInt('v1.0')})
        , rSeed2nd = client.random({docMode: true, randomSeed: createVersionHash32bitInt('v1.1 beta')});

      assert.notEqual(
        rNative1st.uuid4(),
        rNative2nd.uuid4());

      assert.equal(
        rFixated1st.uuid4(),
        rFixated2nd.uuid4());

      assert.notEqual(
        rSeed1st.uuid4(),
        rSeed2nd.uuid4());
    });

  });
}());

