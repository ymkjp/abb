/**
 *  ResponseHandler
 */
(function () {
  'use strict';

  var assert = require('assert')
    , agent = require('superagent')
    , _ = require('underscore')
    , DocData = require('./doc-data')
    , Agenda = require('./agenda')
    , Outcome = require('./outcome')
    , Executor = require('./executor')
    , Random = require('./random');

  var DEFAULT_CONFIG = {
    'fail-fast': false
    , 'fail-dump': false
    , 'agent': agent
    , 'assert': assert
  };

  function Abb(config) {
    this.config = _.defaults(config, DEFAULT_CONFIG);
    this.agenda = Agenda.create();
    this.outcome = Outcome.create();
    this.docData = DocData.create();
    return this;
  }

  Abb.prototype = {
    constructor: Abb,
    title: title,
    description: description,
    request: request,
    response: response,
    getDocData: getDocData,
    getAgenda: getAgenda,
    getOutcome: getOutcome,
    done: done
  };

  function title(text) {
    this.docData.setTitle(text);
    return this;
  }

  function description(text) {
    this.docData.setDescription(text);
    return this;
  }

  function getDocData() {
    return this.docData;
  }

  function getAgenda(key) {
    return this.agenda.get(key);
  }

  function getOutcome(key) {
    return this.outcome.get(key);
  }

  function request() {
    this.agenda.pushRequest(_.toArray(arguments));
    return this;
  }

  function response(params) {
    this.agenda.pushResponse(params);
    return this;
  }

  function done() {
    // Flush docs and run tests
    if (this.agenda.hasAgenda) {
      Executor.create({
        'config': this.config,
        'agenda': this.agenda,
        'outcome': this.outcome
      }).execute();
    }
    return this;
  }

  exports.create = function(config) {
    return new Abb(config);
  };

  exports.configure = function(config) {
    _.extend(DEFAULT_CONFIG, config);
    return exports;
  };

  exports.random = function(config) {
    return Random.create(config);
  };
}());
