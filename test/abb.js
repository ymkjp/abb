/*eslint-env mocha */

(function(){
  'use strict';

  var assert = require('power-assert');

  describe('Abb module', function() {
    var path = require('path')
      , agent = require('superagent')
      //, mock = require('superagent-mock')
      //, config = require('./superagent-mock-config')
      , Abb = require('../lib/abb');
    var client;

    beforeEach(function(){
      // @todo
      //mock(agent, config);
      client = Abb.create({
        'agent': agent
        , 'assert': assert
      });
    });

    it('creates instance', function() {
      assert(client);
    });

    it('generates docData', function() {
      var pageTitle = 'Page description',
        pageDesc = 'Page description',
        doc = client
          .title(pageTitle)
          .description(pageDesc)
          .getDocData();
      assert.equal(doc.title, pageTitle);
      assert.equal(doc.description, pageDesc);
    });

    it('gets agenda by key', function() {
      var key = 'read',
        requestParams = {
          url: 'https://graph.facebook.com/111848702235277'
        },
        responseParams = {
          status: 200
        },
        agenda = client
          .request(requestParams)
          .response(responseParams)
          .request(key, requestParams)
          .response(responseParams)
          .request(requestParams)
          .response(responseParams)
          .getAgenda(key);
      assert.equal(agenda.request, requestParams);
      assert.equal(agenda.response, responseParams);
    });

    it('gets outcome by key', function() {
      var key = 'read',
        requestParams = {
          header: {
            'Accept': 'application/json'
          }
          , url: 'https://graph.facebook.com/111848702235277'
          //, method: 'post'
        },
        responseParams = {
          status: 200,
          header: {'content-type': 'application/json'},
          jsonSchema: path.join(__dirname, 'json_schema/111848702235277.json'),
          body: {
            id: '111848702235277',
            website: 'http://brightb.it'
          }
        },
        result;

      result = client
        .request(key, requestParams)
        .response(responseParams)
        .done();
      console.log('DONE');
      assert(result.getOutcome(key));
    });

    it.skip('executes callback function', function() {});

  });
}());

