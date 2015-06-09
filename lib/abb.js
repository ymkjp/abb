/**
 *  Abb
 */
(function () {
  'use strict';

  var assert = require('assert')
    , agent = require('superagent')
    , _ = require('underscore')
    , Document = require('./document')
    , Agenda = require('./agenda')
    , Outcome = require('./outcome')
    , Executor = require('./executor')
    , Random = require('./random');

  /**
   * refSymbol: It might be versatile to use URL reserved character (RFC 3986)
   * @see {@link http://www.ietf.org/rfc/rfc3986.txt}
   *
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
    this.agenda = Agenda.create(this.config);
    this.document = Document.create(this.config);
    this.outcome = Outcome.create(this.config);
    return this;
  }

  Abb.prototype = {
    constructor: Abb
    , title: title
    , description: description
    , request: request
    , response: response
    , defaultRequest: defaultRequest
    , defaultResponse: defaultResponse
    , getDocument: getDocument
    , getAgenda: getAgenda
    , getOutcome: getOutcome
    , done: done
    , random: random
  };

  function title(text) {
    this.document.setTitle(text);
    return this;
  }

  function description(text) {
    this.document.setDescription(text);
    return this;
  }

  function getDocument() {
    return this.document;
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

  function defaultRequest(params) {
    this.agenda.setDefaultRequest(params);
    return this;
  }

  function defaultResponse(params) {
    this.agenda.setDefaultResponse(params);
    return this;
  }

  function done(callback) {
    if (!_.isUndefined(callback) && !_.isFunction(callback)) {
      throw new TypeError('Invalid type of Callback function "done"');
    }
    if (this.agenda.hasAgenda) {
      Executor.create({
        'config': this.config
        , 'agenda': this.agenda
        , 'outcome': this.outcome
        , 'document': this.document
      }).execute(callback);
    } else {
      callback();
    }
    return this;
  }

  function random() {
    return Random.create(this.config);
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
