/**
 *  Context
 *  Manage agenda and outcome by name
 */
(function(){
  'use strict';

  var util = require('util')
    , _ = require('underscore')
    , AbbError = require('./abb-error');

  function Context(args) {
    this.config = args.config;
    this.agenda = args.agenda;
    this.outcome = args.outcome;

    this.named = {};

    return this;
  }

  Context.prototype = {
    constructor: Context
    , getNameIndex: getNameIndex
    , getAgendaData: getAgendaData
    , getOutcomeData: getOutcomeData
    , pushOutcome: pushOutcome
    , checkErrors: checkErrors
    , queueRequest: queueRequest
    , queueResponse: queueResponse
    , hasAgenda: hasAgenda
    , setDefault: setDefault
  };

  function getNameIndex(key) {
    return this.named[key];
  }

  function getAgendaData(key) {
    var index = _.isUndefined(key) ? undefined : this.named[key];
    return this.agenda.getData(index);
  }

  /**
   * @param {Array} args - [name, params] or [params]
   * @returns {integer} index
   */
  function queueRequest(args) {
    var name, index, params;
    if (args.length === 2 && _.isString(args[0]) && _.isObject(args[1])) {
      name = args[0];
      params = args[1];
    } else if (args.length === 1 && _.isObject(args[0])) {
      name = null;
      params = args[0];
    } else {
      throw new AbbError('Invalid arguments.');
    }
    if (_.has(this.named, name)) {
      throw new AbbError(util.format('Context key name "%s" is already taken.', name));
    } else {
      index = this.agenda.pushRequest(params);
    }
    if (name) {
      this.named[name] = index;
    }
    return index;
  }

  function queueResponse(params) {
    return this.agenda.pushResponse(params);
  }

  function hasAgenda() {
    return this.agenda.hasAny();
  }

  function setDefault(key, params) {
    return this.agenda.setDefault(key, params);
  }

  function pushOutcome(res) {
    return this.outcome.push(res);
  }

  function getOutcomeData(key) {
    return this.outcome.getData(key);
  }

  function checkErrors() {
    return this.outcome.checkErrors();
  }

  exports.create = function(args) {
    return new Context(args);
  };

}());
