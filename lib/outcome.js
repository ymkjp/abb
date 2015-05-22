/**
 *  Outcome
 */
(function(){
  'use strict';

  var _ = require('underscore');

  function Outcome() {
    this.resultList = [];

    return this;
  }

  Outcome.prototype = {
    constructor: Outcome,
    get: get,
    push: push
  };

  function push(result) {
    var self = this;
    self.resultList.push(result);
  }

  function get(key) {
    var self = this;
    return _.isUndefined(key) ? self.outcome : self.outcome[key];
  }

  exports.create = function() {
    return new Outcome();
  };

}());
