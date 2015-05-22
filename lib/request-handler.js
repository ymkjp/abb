/**
 * RequestHandler
 */

(function() {
  'use strict';

  var util = require('util')
    , _ = require('underscore')
    , AbbError = require('./abb-error');


  var hasOwnProperty = Object.prototype.hasOwnProperty
    , DEFAULT_PARAMS = {
      'method': 'GET'
    }
    , REQUIRED_PARAMS = [
      'url'
    ]
    , METHOD_TABLE = {
      'header': 'set',
      'headers': 'set',
      'sendData': 'send',
      'timeout': 'timeout',
      'redirects': 'redirects'
    }
    , EXECUTOR = 'end';

  function RequestHandler(arg) {
    this.agent = arg.agent;
    this.params = _.defaults(arg.params, DEFAULT_PARAMS);
    this.handler = null;

    this._validateParams();
    this._buildHandler();

    return this;
  }

  RequestHandler.prototype = {
    constructor: RequestHandler,
    request: request,
    _validateParams: _validateParams,
    _buildHandler: _buildHandler
  };

  function request(callback) {
    var self = this;
    return self.handler[EXECUTOR](callback);
  }

  function _validateParams() {
    var self = this
      , params = self.params;

    if (_.isFunction(params)) {
      return true;
    } else if (_.isObject(params)) {
      for (var i = 0; i < REQUIRED_PARAMS.length; ++i) {
        if (_.isEmpty(params[REQUIRED_PARAMS[i]])) {
          throw new AbbError(util.format('Invalid params. "%s" must be specified.', REQUIRED_PARAMS[i]));
        }
      }
    } else {
      throw new AbbError('Unexpected params.');
    }
  }

  function _buildHandler() {
    var self = this
      , params = self.params
      , handler;

    if (_.isFunction(params)) {
      handler = params;
    } else if (_.isObject(params)) {
      handler = self.agent(params.method, params.url);
      for (var key in params) {
        if (hasOwnProperty.call(params, key)) {
          _bind(key, params[key], handler);
        }
      }
    }
    self.handler = handler;
  }

  function _bind(key, value, handler) {
    if (_.has(METHOD_TABLE, key)) {
      if (_.isArray(value)) {
        for (var i = 0; i < value.length; ++i) {
          handler[METHOD_TABLE[key]](value[i]);
        }
      } else {
        handler[METHOD_TABLE[key]](value);
      }
    }
  }

  exports.create = function(arg) {
    return new RequestHandler(arg);
  };

}());
