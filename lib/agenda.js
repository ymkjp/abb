/**
 *  Agenda
 */

(function(){
  'use strict';

  var util = require('util')
    , _ = require('underscore')
    , AbbError = require('./abb-error');

  function Agenda() {
    this.agenda = [];
    this.named = {};
    this.defaultRequestParams = {};
    this.defaultResponseParams = {};
    this.lastKey = null;

    return this;
  }

  Agenda.prototype = {
    constructor: Agenda
    , hasAgenda: hasAgenda
    , pushRequest: pushRequest
    , pushResponse: pushResponse
    , setDefaultRequest: setDefaultRequest
    , setDefaultResponse: setDefaultResponse
    , get: get
    , getNameIndex: getNameIndex
  };

  function hasAgenda() {
    return !_.isNull(this.lastKey);
  }

  /**
   * @param {Array} args [name, params] or [params]
   * @returns {Object} agenda
   */
  function pushRequest(args) {
    var name, params;
    if (args.length === 2 && _.isString(args[0]) && _.isObject(args[1])) {
      name = args[0];
      params = args[1];
    } else if (args.length === 1 && _.isObject(args[0])) {
      name = null;
      params = args[0];
    } else {
      throw new AbbError('Invalid arguments.');
    }
    if (_.has(this.agenda, name)) {
      throw new AbbError(util.format('Agenda key name "%s" is already taken.', name));
    } else {
      this.lastKey = this.agenda.push({'request': _.defaults(params, this.defaultRequestParams)}) - 1;
    }
    if (name) {
      this.named[name] = this.lastKey;
    }

    return this;
  }

  function pushResponse(params) {
    if (!_.isObject(params)) {
      throw new AbbError('Invalid arguments.');
    } else if (_.isNull(this.lastKey) || _.has(this.agenda[this.lastKey], 'response')) {
      throw new AbbError('Call "request" before "response".');
    } else {
      _.extend(this.agenda[this.lastKey], {'response': _.defaults(params, this.defaultResponseParams)});
    }
    return this;
  }

  function setDefaultRequest(params) {
    this.defaultRequestParams = params;
  }

  function setDefaultResponse(params) {
    this.defaultResponseParams = params;
  }

  function get(key) {
    return _.isUndefined(key) ? this.agenda : this.agenda[this.named[key]];
  }

  function getNameIndex(key) {
    return this.named[key];
  }

  exports.create = function() {
    return new Agenda();
  };

}());
