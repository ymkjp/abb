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
    this.lastKey = null;

    return this;
  }

  Agenda.prototype = {
    constructor: Agenda,
    hasAgenda: hasAgenda,
    pushRequest: pushRequest,
    pushResponse: pushResponse,
    get: get
  };

  function hasAgenda() {
    var self = this;
    return !_.isNull(self.lastKey);
  }

  /**
   *
   * @param {Array} args [name, params] or [params]
   * @returns {Object} agenda
   */
  function pushRequest(args) {
    var self = this,
      name, params;
    if (args.length === 2 && _.isString(args[0]) && _.isObject(args[1])) {
      name = args[0];
      params = args[1];
    } else if (args.length === 1 && _.isObject(args[0])) {
      name = null;
      params = args[0];
    } else {
      throw new AbbError('Invalid arguments.');
    }
    if (_.has(self.agenda, name)) {
      throw new AbbError(util.format('Agenda key name "%s" is already taken.', name));
    } else {
      self.lastKey = self.agenda.push({'request': params}) - 1;
    }
    if (name) {
      self.named[name] = self.lastKey;
    }
    return self;
  }

  function pushResponse(params) {
    var self = this;
    if (_.isNull(self.lastKey) || _.has(self.agenda[self.lastKey], 'response')) {
      throw new AbbError('Call "request" before "response".');
    } else if (_.isObject(params)) {
      _.extend(self.agenda[self.lastKey], {'response': params});
    } else {
      throw new AbbError('Invalid arguments.');
    }
    return self;
  }

  function get(key) {
    var self = this;
    return _.isUndefined(key) ? self.agenda : self.agenda[self.named[key]];
  }

  exports.create = function() {
    return new Agenda();
  };

}());
