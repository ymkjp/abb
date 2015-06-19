/**
 * Reference
 */
(function() {
  'use strict';

  var util = require('util')
    , _ = require('lodash')
    , AbbError = require('./abb-error');

  function Reference(arg) {
    this.context = arg.context;
    this.accessor = '.';
    this.delimiterStart = _escapeRegExp(arg.config.refSymbol.start);
    this.delimiterEnd = _escapeRegExp(arg.config.refSymbol.end);

    return this;
  }

  Reference.prototype = {
    constructor: Reference
    , resolve: resolve
    , _replace: _replace
  };

  // @todo Refactor not to use JSON.stringify and JSON.parse
  function resolve(params) {
    //console.info(util.format('\n\nparams:\n%j', params));
    var result, string, pattern, regexp, matches;
    string = JSON.stringify(params);
    pattern = util.format('%s(.*?)%s', this.delimiterStart, this.delimiterEnd);
    regexp = new RegExp(pattern, 'g');
    matches = regexp.exec(string);
    if (_.isNull(matches)) {
      return params;
    }
    result = string.replace(regexp, _.bind(_replace, this));
    return JSON.parse(result);
  }

  /**
   * @example
   * 1. Given captured string "create.request.body.id"
   * 2. Split captured string by dot-accessor into ["create", "request", "body", "id"]
   * 3. Retrieve target by 1st criteria "create" in following 2 ways:
   *  3-1. If 2nd criteria is "request", from agenda
   *  3-2. If 2nd criteria is "response", from outcome
   * 4. Get attribute data from target's body.id
   */
  function _replace(matched, captured) {
    //console.log(arguments);
    var criteria, name, type, result;
    criteria = captured.split(this.accessor);
    name = criteria.shift();
    type = criteria.shift();
    if (_.isUndefined(this.context.getIndexByName(name))) {
      throw new AbbError(util.format('1st specifier "%s" of "%s" does not exist.', name, matched));
    }
    switch(type) {
      case 'request':
        result = this.context.getAgendaData(name).request;
        break;
      case 'response':
        result = this.context.getOutcomeData(name).passed;
        break;
      default:
        throw new AbbError(util.format(
          'Invalid 2nd specifier "%s" of "%s". It should be "request" or "response".', type, matched));
    }
    _.each(criteria, function(prop) {
      if (_.has(result, prop)) {
        result = result[prop];
      } else {
        throw new AbbError(util.format(
          'The specifier "%s" of "%s" can not find property from %j.', prop, matched, result));
      }
    });
    return result;
  }

  function _escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  }

  exports.create = function(arg) {
    return new Reference(arg);
  };

}());
