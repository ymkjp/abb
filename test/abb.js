/*eslint-env mocha */
/**
 * @todo
 * uniq property
 * default request or response params
 * Resolve ref by callback function
 */
(function() {
  'use strict';

  var assert = require('power-assert')
    , nock = require('nock')
    , sinon = require('sinon')
    , _ = require('underscore');

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
        .get('/').reply(200)
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
      });
    });

    it('creates instance', function() {
      assert(client instanceof Abb);
    });

    it('gets agenda by key', function() {
      var agenda = client
        .defaultRequest({header: {'Accept': 'application/json'}})
        .defaultResponse({header: {'content-type': 'application/json'}})
        .request('read', {url: 'https://api.example.com'})
        .response({status: 200})
        .getAgenda('read');
      assert.deepEqual(agenda.request, {
        header: {'Accept': 'application/json'}
        , url: 'https://api.example.com'
      });
      assert.deepEqual(agenda.response, {
        header: {'content-type': 'application/json'}
        , status: 200
      });
    });

    it('executes request and asserts response', function(done) {
      var executed = client
        .defaultRequest({header: {'Accept': 'application/json'}})
        .defaultResponse({header: {'content-type': 'application/json'}})
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
          , body: '__$create.response.body__'
        })
        .done(done);
      assert(executed);
    });

    it('sets document attributes', function() {
      var pageTitle = 'Page Title',
        pageDesc = 'Page description',
        doc = client
          .title(pageTitle)
          .description(pageDesc)
          .getDocument();
      assert.equal(doc.title, pageTitle);
      assert.equal(doc.description, pageDesc);
    });

    it('sets document attributes', function() {
      var pageTitle = 'Page Title',
        pageDesc = 'Page description',
        doc = client
          .title(pageTitle)
          .description(pageDesc)
          .getDocument();
      assert.equal(doc.title, pageTitle);
      assert.equal(doc.description, pageDesc);
    });

  });
}());

