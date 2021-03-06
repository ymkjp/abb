/**
 *  Agenda
 */

(function(){
  'use strict';

  var util = require('util')
    , _ = require('lodash')
    , AbbError = require('./abb-error');

  function Agenda() {
    this.data = [];

    this.defaultRequest = {
      'method': 'GET'
    };
    this.defaultResponse = {};
    this.lastKey = null;

    return this;
  }

  Agenda.prototype = {
    constructor: Agenda
    , hasAny: hasAny
    , pushRequest: pushRequest
    , pushResponse: pushResponse
    , setDefault: setDefault
    , getData: getData
  };

  function hasAny() {
    return !_.isNull(this.lastKey);
  }

  function pushRequest(params) {
    this.lastKey = this.data.push({'request': _.defaults(params, this.defaultRequest)}) - 1;
    return this.lastKey;
  }

  function pushResponse(params) {
    if (!_.isObject(params)) {
      throw new AbbError('Invalid arguments.');
    } else if (_.isNull(this.lastKey) || _.has(this.data[this.lastKey], 'response')) {
      throw new AbbError('Call "request" before "response".');
    } else {
      _.assign(this.data[this.lastKey], {'response': _.defaults(params, this.defaultResponse)});
    }
    return this;
  }

  function setDefault(key, params) {
    switch (key) {
      case 'request':
        _.assign(this.defaultRequest, params);
        break;
      case 'response':
        _.assign(this.defaultResponse, params);
        break;
      default:
        throw new AbbError(util.format('Invalid default parameter\'s key "%s"', key));
    }
    return this;
  }

  function getData(index) {
    return _.isUndefined(index) ? this.data : this.data[index];
  }

  exports.create = function() {
    return new Agenda();
  };

}());
