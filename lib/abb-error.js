(function(){
  'use strict';

  var util = require('util');

  function AbbError(message) {
    Error.call(this);
    this.message = message;
  }

  util.inherits(AbbError, Error);

  module.exports = AbbError;
}());
