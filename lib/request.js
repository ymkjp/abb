/**
 * Request
 */

(function() {
  'use strict';

  var util = require('util')
    , Promise = require('bluebird')
    , _ = require('lodash')
    , AbbError = require('./abb-error');

  var REQUIRED_PARAMS = [
      'url'
    ],
    METHOD_TABLE = {
      'header': 'set'
      , 'send': 'send'
      , 'timeout': 'timeout'
      , 'redirects': 'redirects'
    },
    EXECUTOR = 'end';

  function Request(arg) {
    this.agent = arg.config.agent;
    this.params = arg.params;
    this.handler = null;

    this._validateParams();
    this._buildHandler();

    return this;
  }

  Request.prototype = {
    constructor: Request
    , execute: execute
    , _validateParams: _validateParams
    , _buildHandler: _buildHandler
  };

  function execute(callback) {
    return this.handler[EXECUTOR](callback);
  }

  function _validateParams() {
    var params = this.params;

    if (_.isFunction(params)) {
      return true;
    } else if (_.isObject(params)) {
      _.each(REQUIRED_PARAMS, function(required) {
        if (_.isEmpty(params[required])) {
          throw new AbbError(util.format('Invalid params. "%s" must be specified.', required));
        }
      });
    } else {
      throw new AbbError('Unexpected params.');
    }
  }

  function _buildHandler() {
    var params = this.params
      , handler;

    if (_.isFunction(params)) {
      handler = params;
    } else if (_.isObject(params)) {
      handler = this.agent(params.method, params.url);
      _.each(params, function(value, key) {
        _bind(key, value, handler);
      });
    }
    this.handler = handler;
  }

  function _bind(key, value, handler) {
    if (_.has(METHOD_TABLE, key)) {
      handler[METHOD_TABLE[key]](value);
    }
  }

  exports.task = function(arg) {
    return new Promise(function (resolve, reject) {
      try {
        return new Request(arg).execute(function(error, response) {
          if (error) {
            console.error(response);
            reject(error);
          } else {
            resolve(response);
          }
        });
      } catch (e) {
        reject(new AbbError(e));
      }
    });
  };

}());
