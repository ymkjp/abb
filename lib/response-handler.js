/**
 *  ResponseHandler
 */
(function () {
  'use strict';

  var _ = require('underscore')
    , AbbError = require('./abb-error')
    , Assertion = require('./assertion');

  var DEFAULT_PARAMS = {}
    , TARGET_PROPERTIES = ['status', 'header', 'text', 'body'];

  function ResponseHandler(arg) {
    this.handler = null;
    this.params = _.defaults(arg.params, DEFAULT_PARAMS);
    this.outcome = arg.outcome;
    this.assert = arg.assert;
    this.rawResponse = null;

    this._validateParams();
    this._buildHandler();

    return this;
  }

  ResponseHandler.prototype = {
    constructor: ResponseHandler,
    getHandler: getHandler,
    _validateParams: _validateParams,
    _buildHandler: _buildHandler,
    _assertResult: _assertResult,
    _pushResult: _pushResult
  };

  function _validateParams() {
    var params = this.params;

    if (_.isFunction(params) || _.isObject(params)) {
      return true;
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
      handler = function (Error, response) {
        if (Error) {
          throw new Error();
        } else {
          self.rawResponse = response;
          self._assertResult();
          self._pushResult();
        }
      };
    }
    self.handler = handler;
  }

  function _assertResult() {
    var params = this.params
      , targetResults = _.pick(this.rawResponse, TARGET_PROPERTIES);
    Assertion.create({
      'assert': this.assert
      , 'actualResponses': targetResults
      , 'expectedResponses': params
    });
  }

  function _pushResult() {
    //this.outcome.push(self.result);
  }

  function getHandler() {
    return this.handler;
  }

  exports.create = function(arg) {
    return new ResponseHandler(arg);
  };
}());
