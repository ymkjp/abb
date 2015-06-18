/**
 *  Outcome
 */
(function(){
  'use strict';

  var util = require('util')
    , Promise = require('bluebird')
    , _ = require('underscore')
    , AbbError = require('./abb-error');

  function Outcome() {
    this.resultList = [];

    return this;
  }

  Outcome.prototype = {
    constructor: Outcome
    , getData: getData
    , push: push
    , checkErrors: checkErrors
  };

  function push(result) {
    var self = this;

    return new Promise(function (resolve, reject) {
      try {
        self.resultList.push(result);
        resolve(self.resultList);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Flash errors for "failFast" option is disabled
   */
  function checkErrors() {
    var self = this
      , errors;

    return new Promise(function (resolve, reject) {
      errors = _.chain(self.resultList)
        .map(function(result) {
          return (result.hasError()) ? _.values(result.getError()) : null;
        })
        .flatten()
        .compact()
        .value();
      if (_.any(errors)) {
        reject(new AbbError(util.format('\n%s', errors.join('\n'))));
      } else {
        resolve(self.resultList);
      }
    });
  }

  function getData(key) {
    return _.isUndefined(key) ? this.resultList : this.resultList[key];
  }

  exports.create = function() {
    return new Outcome();
  };

}());
