/**
 *  Abb
 */
(function () {
  'use strict';

  var assert = require('assert')
    , agent = require('superagent')
    , _ = require('lodash')
    , Document = require('./document')
    , Context = require('./context')
    , Agenda = require('./agenda')
    , Outcome = require('./outcome')
    , Executor = require('./executor')
    , Random = require('./random');

  /**
   * @property {object} refSymbol
   * @property {string} refSymbol.start - Starting delimiter
   * @property {string} refSymbol.end - Ending delimiter
   * @property {boolean} failFast - Stop running if any assertions fail
   * @property {boolean} failDump - @todo Dump detailed failure information
   * @property {boolean} docMode - Whether to generate documents or not
   * @property {object} agent - Compatible object with SuperAgent
   * @property {object} assert - Compatible object with Node core module's Assert
   */
  var DEFAULT_CONFIG = {
    'refSymbol': { start: '__$', end: '__' }
    , 'failFast': false
    , 'failDump': false
    , 'docMode': true
    , 'agent': agent
    , 'assert': assert
  };

  function Abb(config) {
    this.config = _.defaults(config, DEFAULT_CONFIG);
    this.context = Context.create({
        config: this.config
        , agenda: Agenda.create()
        , outcome: Outcome.create()
      }
    );
    this.document = Document.create(this.config);
    return this;
  }

  Abb.prototype = {
    constructor: Abb
    , resource: resource
    , request: request
    , response: response
    , defaultRequest: defaultRequest
    , defaultResponse: defaultResponse
    , getDocument: getDocument
    , getAgenda: getAgenda
    , done: done
    , random: random
  };

  function resource(param) {
    this.document.setResource(param);
    return this;
  }

  function getDocument() {
    return this.document;
  }

  function getAgenda(key) {
    return this.context.getAgendaData(key);
  }

  function request() {
    this.context.queueRequest(_.toArray(arguments));
    return this;
  }

  function response(params) {
    this.context.queueResponse(params);
    return this;
  }

  function defaultRequest(params) {
    this.context.setDefault('request', params);
    return this;
  }

  function defaultResponse(params) {
    this.context.setDefault('response', params);
    return this;
  }

  function done(callback) {
    return Executor.create({
      'config': this.config
      , 'context': this.context
      , 'document': this.document
    }).execute(callback);
  }

  function random() {
    return Random.create(this.config);
  }

  exports = module.exports = Abb;

  exports.create = function(config) {
    return new Abb(config);
  };

  exports.configure = function(config) {
    _.extend(DEFAULT_CONFIG, config);
    return exports;
  };

}());
